import { TestBed } from '@angular/core/testing';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import { apiReportStatsRawRes, apiReportStatsRes } from '../../core/mock-data/stats-response.data';
import { reportAllowedActionsResponse } from '../mock-data/allowed-actions.data';
import {
  apiReportRes,
  apiReportSingleRes,
  apiTeamRptCountRes,
  apiTeamRptSingleRes,
  apiTeamReportPaginated1,
  apiAllReportsRes1,
  apiAllReportsRes2,
} from '../mock-data/api-reports.data';
import {
  approversData1,
  apiAllApproverRes1,
  apiAllApproverRes2,
  apiApproverRes,
  expectedApprovers,
  approversData2,
  approversData3,
} from '../mock-data/approver.data';
import { apiExpenseRes } from '../mock-data/expense.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { orgSettingsRes } from '../mock-data/org-settings.data';
import { apiReportActions } from '../mock-data/report-actions.data';
import { apiReportAutoSubmissionDetails } from '../mock-data/report-auto-submission-details.data';
import {
  expectedErpt,
  expectedSingleErpt,
  unflattenedErptc,
  unflattenedErptcArrayItem1,
  unflattenedErptcArrayItem2,
  unflattenedErptcArrayItem3,
  unflattenedErptcArrayItem4,
  singleERptcFixDatesMock,
  addApproverERpts,
  expectedAddedApproverERpts,
} from '../mock-data/report-unflattened.data';
import {
  reportUnflattenedData,
  reportUnflattenedData2,
  apiEmptyReportRes,
  apiReportUpdatedDetails,
} from '../mock-data/report-v1.data';
import {
  apiExtendedReportRes,
  expectedAllReports,
  expectedReportSingleResponse,
  reportParam,
  expectedPaginatedReports,
  reportData1,
} from '../mock-data/report.data';
import { getMyReportsParam1, getMyReportsParam2 } from '../mock-data/api-params.data';
import { expectedReportRawStats } from '../mock-data/stats-dimension-response.data';
import { StatsResponse } from '../models/v2/stats-response.model';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { NetworkService } from './network.service';
import { PermissionsService } from './permissions.service';
import { ReportService } from './report.service';
import { StorageService } from './storage.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';
import { dataErtpTransformed, apiErptReporDataParam } from '../mock-data/data-transform.data';
import { platformReportData } from '../mock-data/platform-report.data';

describe('ReportService', () => {
  let reportService: ReportService;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let permissionsService: jasmine.SpyObj<PermissionsService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let launchDarklyService: LaunchDarklyService;

  const apiReportStatParams: Partial<StatsResponse> = {
    scalar: false,
    dimension_1_1: 'rp_state',
    aggregates: 'sum(rp_amount),count(rp_id)',
  };

  const apiReportStatsRawParam: Partial<StatsResponse> = {
    approved_by: 'cs.{ouCI4UQ2G0K1}',
    rp_approval_state: ['in.(APPROVAL_PENDING)'],
    rp_state: ['in.(APPROVER_PENDING)'],
    sequential_approval_turn: ['in.(true)'],
    aggregates: 'count(rp_id),sum(rp_amount)',
    scalar: true,
  };

  const apiApproversParam = ['rpDyD26O3qpV', 'rpqzKD4bPXpW'];

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get', 'post', 'getStats']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'getRoles']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkSpy', ['isOnline']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['clearCache']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventServive', ['clearTaskCache', 'onLogout']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformService', ['post']);
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['allowedActions']);

    TestBed.configureTestingModule({
      providers: [
        ReportService,
        DatePipe,
        LaunchDarklyService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiv2ServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: PermissionsService,
          useValue: permissionsServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });

    reportService = TestBed.inject(ReportService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiv2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
  });

  it('should be created', () => {
    expect(reportService).toBeTruthy();
  });

  it('clearCache(): should clear cache', (done) => {
    reportService.clearCache().subscribe((res) => {
      expect(res).toBeNull();
      done();
    });
  });

  it('clearTransactionCache(): should clear transaction cache', (done) => {
    transactionService.clearCache.and.returnValue(of(null));

    reportService.clearTransactionCache().subscribe(() => {
      expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('createDraft(): should create a draft report and return the report', (done) => {
    apiService.post.and.returnValue(of(reportUnflattenedData));
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));

    const reportParam = {
      purpose: 'A draft Report',
      source: 'MOBILE',
    };

    reportService.createDraft(reportParam).subscribe((res) => {
      expect(res).toEqual(reportUnflattenedData);
      expect(apiService.post).toHaveBeenCalledOnceWith('/reports', reportParam);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('submit(): should submit a report', (done) => {
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));
    apiService.post.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';

    reportService.submit(reportID).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(`/reports/${reportID}/submit`);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('removeTransaction(): should remove a transaction from report', (done) => {
    apiService.post.and.returnValue(of(null));
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';
    const txnID = 'txTQVBx7W8EO';

    const params = {
      status: {
        comment: null,
      },
    };

    reportService.removeTransaction(reportID, txnID, null).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(`/reports/${reportID}/txns/${txnID}/remove`, params);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getMyReports()', () => {
    it('should get reports from API as specified by params', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(apiReportRes));
      spyOn(dateService, 'fixDates').and.returnValues(
        apiReportRes.data[0],
        apiReportRes.data[1],
        apiReportRes.data[2],
        apiReportRes.data[3]
      );

      const params = {
        offset: 0,
        limit: 10,
        queryParams: {
          or: [],
        },
        order: 'rp_created_at.desc',
      };

      const apiParams = {
        offset: 0,
        limit: 10,
        order: 'rp_created_at.desc,rp_id.desc',
        rp_org_user_id: 'eq.ouX8dwsbLCLv',
        or: [],
      };

      reportService.getMyReports(params).subscribe((res) => {
        expect(res).toEqual(apiReportRes);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/reports', { params: apiParams });
        done();
      });
    });

    it('should get reports from API when no order is specified', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(apiReportRes));
      spyOn(dateService, 'fixDates').and.returnValues(
        apiReportRes.data[0],
        apiReportRes.data[1],
        apiReportRes.data[2],
        apiReportRes.data[3]
      );

      const params = {
        offset: 0,
        limit: 10,
        queryParams: {
          or: [],
        },
      };

      const apiParams = {
        offset: 0,
        limit: 10,
        order: 'rp_created_at.desc,rp_id.desc',
        rp_org_user_id: 'eq.ouX8dwsbLCLv',
        or: [],
      };

      reportService.getMyReports(params).subscribe((res) => {
        expect(res).toEqual(apiReportRes);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/reports', { params: apiParams });
        done();
      });
    });
  });

  it('getPaginatedERptc(): should get paginated extended-reports', (done) => {
    apiService.get.and.returnValue(of(apiExtendedReportRes));
    dataTransformService.unflatten.and.returnValues(
      unflattenedErptcArrayItem1,
      unflattenedErptcArrayItem2,
      unflattenedErptcArrayItem3,
      unflattenedErptcArrayItem4
    );
    const params = {
      state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
    };

    const apiParams = {
      params: {
        offset: 0,
        limit: 4,
        state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
      },
    };

    reportService.getPaginatedERptc(0, apiExtendedReportRes.length, params).subscribe((res) => {
      expect(res).toEqual(expectedErpt);
      expect(apiService.get).toHaveBeenCalledOnceWith('/erpts', apiParams);
      expect(dataTransformService.unflatten).toHaveBeenCalledTimes(4);
      done();
    });
  });

  it('getERpt(): should get an extended report', (done) => {
    apiService.get.and.returnValue(of(apiExtendedReportRes[0]));
    dataTransformService.unflatten.and.returnValue(unflattenedErptc);
    spyOn(dateService, 'fixDates').and.returnValue(singleERptcFixDatesMock);
    spyOn(dateService, 'getLocalDate').and.returnValue(new Date('2023-01-21T07:29:01.958Z'));

    const reportID = 'rprAfNrce73O';

    reportService.getERpt(reportID).subscribe((res) => {
      expect(res).toEqual(expectedSingleErpt);
      expect(apiService.get).toHaveBeenCalledOnceWith(`/erpts/${reportID}`);
      expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(apiExtendedReportRes[0]);
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(unflattenedErptc.rp);
      expect(dateService.getLocalDate).toHaveBeenCalledOnceWith(unflattenedErptc.rp.created_at);
      done();
    });
  });

  it('getMyReportsCount(): should get reports count', (done) => {
    spyOn(reportService, 'getMyReports').and.returnValue(of(apiReportRes));

    const param = {
      offset: 0,
      limit: 1,
      queryParams: {},
    };

    reportService.getMyReportsCount().subscribe((res) => {
      expect(res).toEqual(4);
      expect(reportService.getMyReports).toHaveBeenCalledOnceWith(param);
      done();
    });
  });

  it('getReport(): should get the report from API as per report ID given', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    spyOn(reportService, 'getMyReports').and.returnValue(of(apiReportSingleRes));

    const reportID = 'rpfClhA1lglE';

    const params = {
      offset: 0,
      limit: 1,
      queryParams: {
        rp_id: `eq.${reportID}`,
      },
    };

    reportService.getReport(reportID).subscribe((res) => {
      expect(res).toEqual(expectedReportSingleResponse);
      expect(reportService.getMyReports).toHaveBeenCalledOnceWith(params);
      done();
    });
  });

  it('getTeamReportsCount(): should get a count of team reports', (done) => {
    spyOn(reportService, 'getTeamReports').and.returnValue(of(apiTeamRptCountRes));

    const params = {
      offset: 0,
      limit: 1,
      queryParams: {},
    };

    reportService.getTeamReportsCount().subscribe((res) => {
      expect(res).toEqual(25);
      expect(reportService.getTeamReports).toHaveBeenCalledOnceWith(params);
      done();
    });
  });

  describe('getTeamReports()', () => {
    it('should get all team reports', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(apiTeamReportPaginated1));
      spyOn(dateService, 'fixDates').and.returnValues(apiTeamReportPaginated1.data[0], apiTeamReportPaginated1.data[1]);

      const params = {
        offset: 0,
        limit: 10,
        queryParams: {
          or: [],
        },
        order: 'rp_submitted_at.desc',
      };

      reportService.getTeamReports(params).subscribe((res) => {
        expect(res).toEqual(apiTeamReportPaginated1);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/reports', {
          params: {
            offset: 0,
            limit: 10,
            approved_by: 'cs.{ouX8dwsbLCLv}',
            order: 'rp_submitted_at.desc,rp_id.desc',
            or: [],
          },
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should get all team reports when order is not specified', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(apiTeamReportPaginated1));
      spyOn(dateService, 'fixDates').and.returnValues(apiTeamReportPaginated1.data[0], apiTeamReportPaginated1.data[1]);

      const params = {
        offset: 0,
        limit: 10,
        queryParams: {
          or: [],
        },
      };

      reportService.getTeamReports(params).subscribe((res) => {
        expect(res).toEqual(apiTeamReportPaginated1);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/reports', {
          params: {
            offset: 0,
            limit: 10,
            approved_by: 'cs.{ouX8dwsbLCLv}',
            order: 'rp_created_at.desc,rp_id.desc',
            or: [],
          },
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('getTeamReport(): should get a team report', (done) => {
    spyOn(reportService, 'getTeamReports').and.returnValue(of(apiTeamRptSingleRes));

    const reportID = 'rphNNUiCISkD';

    const params = {
      offset: 0,
      limit: 1,
      queryParams: {
        rp_id: `eq.${reportID}`,
      },
    };

    reportService.getTeamReport(reportID).subscribe((res) => {
      expect(res).toEqual(apiTeamRptSingleRes.data[0]);
      expect(reportService.getTeamReports).toHaveBeenCalledOnceWith(params);
      done();
    });
  });

  it('addTransactions(): should add a transaction to a report', (done) => {
    apiService.post.and.returnValue(of(null));
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';
    const tnxs = ['txTQVBx7W8EO'];

    reportService.addTransactions(reportID, tnxs).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(`/reports/${reportID}/txns`, { ids: tnxs });
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('actions(): should get report actions', (done) => {
    apiService.get.and.returnValue(of(apiReportActions));

    const reportID = 'rpxtbiLXQZUm';

    reportService.actions(reportID).subscribe((res) => {
      expect(res).toEqual(apiReportActions);
      expect(apiService.get).toHaveBeenCalledOnceWith(`/reports/${reportID}/actions`);
      done();
    });
  });

  it('getExports(): should get export actions for a report', (done) => {
    apiService.get.and.returnValue(of([]));

    const reportID = 'rphLXGFVbDaJ';

    reportService.getExports(reportID).subscribe(() => {
      expect(apiService.get).toHaveBeenCalledOnceWith(`/reports/${reportID}/exports`);
      done();
    });
  });

  it('create(): should create a new report', (done) => {
    spyOn(reportService, 'createDraft').and.returnValue(of(reportUnflattenedData2));
    apiService.post.and.returnValue(of(null));
    spyOn(reportService, 'submit').and.returnValue(of(null));

    const reportPurpose = {
      purpose: 'A new report',
      source: 'MOBILE',
    };
    const txnIds = ['tx6Oe6FaYDZl'];
    const reportID = 'rp5eUkeNm9wB';
    const txnParam = {
      ids: txnIds,
    };

    reportService.create(reportPurpose, txnIds).subscribe((res) => {
      expect(res).toEqual(reportUnflattenedData2);
      expect(reportService.createDraft).toHaveBeenCalledOnceWith(reportPurpose);
      expect(apiService.post).toHaveBeenCalledOnceWith(`/reports/${reportID}/txns`, txnParam);
      expect(reportService.submit).toHaveBeenCalledOnceWith(reportID);
      done();
    });
  });

  it('resubmit(): should resubmit a report', (done) => {
    apiService.post.and.returnValue(of(null));

    const reportID = 'rpShFuVCUIXk';
    reportService.resubmit(reportID).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(`/reports/${reportID}/resubmit`);
      done();
    });
  });

  it('inquire(): should send back a report', (done) => {
    apiService.post.and.returnValue(of(null));
    const reportID = 'rpSECyvCyyc6';
    const statusPayloadParam = {
      status: {
        comment: 'Testing for code coverage',
      },
      notify: false,
    };

    reportService.inquire(reportID, statusPayloadParam).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(`/reports/${reportID}/inquire`, statusPayloadParam);
      done();
    });
  });

  describe('getAutoSubmissionReportName()', () => {
    it('should get auto submitted report name', (done) => {
      spyOn(reportService, 'getReportAutoSubmissionDetails').and.returnValue(of(apiReportAutoSubmissionDetails));

      reportService.getAutoSubmissionReportName().subscribe((res) => {
        expect(res).toEqual('(Automatic Submission On Feb 1)');
        expect(reportService.getReportAutoSubmissionDetails).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return null if auto submission is not scheduled', (done) => {
      spyOn(reportService, 'getReportAutoSubmissionDetails').and.returnValue(of({ data: null }));

      reportService.getAutoSubmissionReportName().subscribe((res) => {
        expect(res).toBeNull();
        expect(reportService.getReportAutoSubmissionDetails).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('getReportAutoSubmissionDetails():', () => {
    it('should get submission details', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of(apiReportAutoSubmissionDetails));

      reportService.getReportAutoSubmissionDetails().subscribe((res) => {
        expect(res).toEqual({
          data: {
            next_at: new Date('2023-02-01T00:00:00.000000'),
          },
        });
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/automations/report_submissions/next_at', {
          data: null,
        });
        done();
      });
    });
  });

  it('approve(): should approve a report', (done) => {
    apiService.post.and.returnValue(of(null));

    const reportID = 'rpShFuVCUIXk';
    reportService.approve(reportID).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(`/reports/${reportID}/approve`);
      done();
    });
  });

  it('addApprover(): should add approver to a report', (done) => {
    apiService.post.and.returnValue(of(null));

    const reportID = 'rprj1zHHpW2W';
    const approverEmail = 'asilk@akls.in';
    const comment = 'comment';

    reportService.addApprover(reportID, approverEmail, comment).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith(`/reports/${reportID}/approvals`, {
        approver_email: approverEmail,
        comment,
      });
      done();
    });
  });

  it('delete(): should delete a report', (done) => {
    apiService.delete.and.returnValue(of(null));
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));

    const reportID = 'rpShFuVCUIXk';
    reportService.delete(reportID).subscribe(() => {
      expect(apiService.delete).toHaveBeenCalledOnceWith(`/reports/${reportID}`);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('updateReportDetails(): should update a report name', (done) => {
    apiService.post.and.returnValue(of(apiReportUpdatedDetails));
    dataTransformService.unflatten.and.returnValue(dataErtpTransformed);
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));

    reportService.updateReportDetails(reportParam).subscribe((res) => {
      expect(res).toEqual(apiReportUpdatedDetails);
      expect(apiService.post).toHaveBeenCalledOnceWith('/reports', apiErptReporDataParam.rp);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(reportParam);
      done();
    });
  });

  it('updateReportPurpose(): should update the report purpose', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(platformReportData));
    reportService.updateReportPurpose(reportData1).subscribe((res) => {
      expect(res).toEqual(platformReportData);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports', {
        data: {
          id: 'rpMvN0P10l6F',
          source: 'WEBAPP',
          purpose: '#3:  Jul 2023 - Office expense',
        },
      });
      done();
    });
  });

  describe('getReportPermissions()', () => {
    it('should get report permissions', (done) => {
      permissionsService.allowedActions.and.returnValue(of(reportAllowedActionsResponse));
      reportService.getReportPermissions(orgSettingsRes).subscribe((res) => {
        expect(res).toEqual(reportAllowedActionsResponse);
        expect(permissionsService.allowedActions).toHaveBeenCalledOnceWith(
          'reports',
          ['approve', 'create', 'delete'],
          orgSettingsRes
        );
        done();
      });
    });
  });

  it('getApproversByReportId(): should get the approvers of a report', (done) => {
    apiService.get.and.returnValue(of(apiApproverRes));
    const reportID = 'rphNNUiCISkD';

    reportService.getApproversByReportId(reportID).subscribe((res) => {
      expect(res).toEqual(apiApproverRes);
      expect(apiService.get).toHaveBeenCalledOnceWith(`/reports/${reportID}/approvers`);
      done();
    });
  });

  it('downloadSummaryPdfUrl(): allow a user to share the report', (done) => {
    const data = {
      report_ids: ['rp5eUkeNm9wB'],
      email: 'jay.b@fyle.in',
    };

    const reportURL = {
      report_url:
        'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-01-22/orrjqbDbeP9p/reports/fiivx1vS2PR7.C_2023_01_R_42%2520-%25207%2520Jan%25202023%2520-%2520Abhishek%2520Jain.pdf?response-content-disposition=attachment%3B%20filename%3DC_2023_01_R_42%20-%207%20Jan%202023%20-%20Abhishek%20Jain.pdf&response-content-type=application%2Fpdf&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230122T080023Z&X-Amz-SignedHeaders=host&X-Amz-Expires=518400&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230122%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=118a187917956a158589462bbe3a2d4b3f7bc755fba7587ea67e119a15590a28',
    };

    apiService.post.and.returnValue(of(reportURL));

    reportService.downloadSummaryPdfUrl(data).subscribe((res) => {
      expect(res).toEqual(reportURL);
      expect(apiService.post).toHaveBeenCalledOnceWith('/reports/summary/download', data);
      done();
    });
  });

  describe('getAllExtendedReports():', () => {
    it('should get all reports, single page data', (done) => {
      spyOn(reportService, 'getMyReportsCount').and.returnValue(of(2));
      spyOn(reportService, 'getMyReports').and.returnValue(of(apiAllReportsRes1));

      const params = {
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      };

      const getMyReportsParam = {
        offset: 0,
        limit: 2,
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
        order: undefined,
      };

      reportService.getAllExtendedReports(params).subscribe((res) => {
        expect(res).toEqual(expectedAllReports);
        expect(reportService.getMyReports).toHaveBeenCalledOnceWith(getMyReportsParam);
        expect(reportService.getMyReportsCount).toHaveBeenCalledOnceWith(params.queryParams);
        done();
      });
    });

    it('should get all reports, multiple pages data', (done) => {
      const getMyReportsSpy = spyOn(reportService, 'getMyReports');
      const params = {
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      };

      spyOn(reportService, 'getMyReportsCount').and.returnValue(of(3));
      getMyReportsSpy.withArgs(getMyReportsParam1).and.returnValue(of(apiAllReportsRes1));
      getMyReportsSpy.withArgs(getMyReportsParam2).and.returnValue(of(apiAllReportsRes2));

      reportService.getAllExtendedReports(params).subscribe((res) => {
        expect(res).toEqual(expectedPaginatedReports);
        expect(reportService.getMyReports).toHaveBeenCalledWith(getMyReportsParam1);
        expect(reportService.getMyReports).toHaveBeenCalledWith(getMyReportsParam2);
        expect(reportService.getMyReports).toHaveBeenCalledTimes(2);
        expect(reportService.getMyReportsCount).toHaveBeenCalledOnceWith(params.queryParams);
        done();
      });
    });
  });

  it('searchParamsGenerator(): should generate search parameters', () => {
    const result = reportService.searchParamsGenerator({ state: 'edit' });

    expect(result).toEqual({
      state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
    });
  });

  it('getReportPurpose(): should get the purpose of the report', (done) => {
    const reportName = ' #7:  Jan 2023';
    apiService.post.and.returnValue(of(apiEmptyReportRes));

    reportService.getReportPurpose({ ids: [] }).subscribe((res) => {
      expect(res).toEqual(reportName);
      expect(apiService.post).toHaveBeenCalledOnceWith('/reports/purpose', { ids: [] });
      done();
    });
  });

  describe('getApproversInBulk()', () => {
    it('should get approvers in bulk for all report IDs | single page', (done) => {
      apiService.get.and.returnValue(of(apiAllApproverRes2));

      reportService.getApproversInBulk(apiApproversParam).subscribe((res) => {
        expect(res).toEqual(expectedApprovers);
        expect(apiService.get).toHaveBeenCalledOnceWith('/reports/approvers', {
          params: { report_ids: apiApproversParam },
        });
        done();
      });
    });

    it('should return an empty list as report IDs are empty', (done) => {
      apiService.get.and.returnValue(of(apiAllApproverRes2));

      reportService.getApproversInBulk([]).subscribe((res) => {
        expect(res).toEqual([]);
        done();
      });
    });

    it('should get approvers in bulk for all report IDs | multiple page', (done) => {
      const report_ids = ['rpvwqzb9Jqq0', 'rpvcIMRMyM3A', 'rpDyD26O3qpV', 'rpqzKD4bPXpW'];
      const param1 = { params: { report_ids: report_ids.slice(0, 2) } };
      const param2 = { params: { report_ids: report_ids.slice(2, 4) } };

      apiService.get.withArgs('/reports/approvers', param1).and.returnValue(of(apiAllApproverRes1));
      apiService.get.withArgs('/reports/approvers', param2).and.returnValue(of(apiAllApproverRes2));

      reportService.getApproversInBulk(report_ids).subscribe((res) => {
        expect(res).toEqual(approversData2);
        expect(apiService.get).toHaveBeenCalledWith('/reports/approvers', param1);
        expect(apiService.get).toHaveBeenCalledWith('/reports/approvers', param2);
        expect(apiService.get).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  describe('getPaginatedERptcCount()', () => {
    it('should get extended reports count', (done) => {
      networkService.isOnline.and.returnValue(of(true));
      apiService.get.and.returnValue(of({ count: 4 }));
      storageService.set.and.returnValue(Promise.resolve(null));

      const apiParam = ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'];

      reportService.getPaginatedERptcCount({ state: apiParam }).subscribe((res) => {
        expect(res).toEqual({ count: 4 });
        expect(apiService.get).toHaveBeenCalledOnceWith('/erpts/count', { params: { state: apiParam } });
        expect(storageService.set).toHaveBeenCalledOnceWith('erpts-count' + JSON.stringify({ state: apiParam }), {
          count: 4,
        });
        done();
      });
    });

    it('should return count when device is offline and use storage to give count', (done) => {
      networkService.isOnline.and.returnValue(of(false));
      storageService.get.and.returnValue(Promise.resolve({ count: 4 }));

      reportService.getPaginatedERptcCount({}).subscribe((res) => {
        expect(res).toEqual({ count: 4 });
        expect(networkService.isOnline).toHaveBeenCalledTimes(1);
        expect(storageService.get).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('addOrderByParams()', () => {
    it('return the params when no order is specified', () => {
      const params = { state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'] };

      const result = reportService.addOrderByParams(params);
      expect(result).toEqual(params);
    });

    it('return the params when order is specified', () => {
      const params = {
        state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
        order_by: 'rp_created_at.desc,rp_id.desc',
      };

      const result = reportService.addOrderByParams(params, 'rp_created_at.desc,rp_id.desc');
      expect(result).toEqual(params);
    });
  });

  describe('getUserReportParams():', () => {
    it('generate parameters as per state | edit', () => {
      const params = 'edit';

      const expectedRes = {
        state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(3);
    });

    it('generate parameters as per state | draft', () => {
      const params = 'draft';

      const expectedRes = {
        state: ['DRAFT', 'DRAFT_INQUIRY'],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(2);
    });

    it('generate parameters as per state | pending', () => {
      const params = 'pending';

      const expectedRes = {
        state: ['APPROVER_PENDING'],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(1);
    });

    it('generate parameters as per state | inquiry', () => {
      const params = 'inquiry';

      const expectedRes = {
        state: ['APPROVER_INQUIRY'],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(1);
    });

    it('generate parameters as per state | approved', () => {
      const params = 'approved';

      const expectedRes = {
        state: ['APPROVED'],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(1);
    });

    it('generate parameters as per state | payment_queue', () => {
      const params = 'payment_queue';

      const expectedRes = {
        state: ['PAYMENT_PENDING'],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(1);
    });

    it('generate parameters as per state | paid', () => {
      const params = 'paid';

      const expectedRes = {
        state: ['PAID'],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(1);
    });

    it('generate parameters as per state | all', () => {
      const params = 'all';

      const expectedRes = {
        state: [
          'DRAFT',
          'DRAFT_INQUIRY',
          'COMPLETE',
          'APPROVED',
          'APPROVER_PENDING',
          'APPROVER_INQUIRY',
          'PAYMENT_PENDING',
          'PAYMENT_PROCESSING',
          'PAID',
          'REJECTED',
        ],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(10);
    });
  });

  it('getReportETxnc(): should get report transactions', (done) => {
    apiService.get.and.returnValue(of(apiExpenseRes));
    const reportID = 'rp1xCiq5WA1R';
    const orgUserID = 'ouCI4UQ2G0K1';

    reportService.getReportETxnc(reportID, orgUserID).subscribe((res) => {
      expect(res).toEqual(apiExpenseRes);
      expect(apiService.get).toHaveBeenCalledOnceWith(`/erpts/${reportID}/etxns`, {
        params: {
          approver_id: orgUserID,
        },
      });
      done();
    });
  });

  it('addApprovers(): add approvers to reports', () => {
    const res = reportService.addApprovers(addApproverERpts, approversData1);

    expect(res).toEqual(expectedAddedApproverERpts);
  });

  it('getFilteredPendingReports(): should get filtered and pending reports', (done) => {
    spyOn(reportService, 'searchParamsGenerator').and.returnValue({
      state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
    });
    spyOn(reportService, 'getPaginatedERptcCount').and.returnValue(of({ count: 2 }));
    spyOn(reportService, 'getPaginatedERptc').and.returnValue(of(addApproverERpts));
    spyOn(reportService, 'getApproversInBulk').and.returnValue(of(approversData1));
    spyOn(reportService, 'addApprovers').and.returnValue(expectedAddedApproverERpts);

    reportService.getFilteredPendingReports({ state: 'edit' }).subscribe((res) => {
      expect(res).toEqual(expectedAddedApproverERpts);
      expect(reportService.searchParamsGenerator).toHaveBeenCalledOnceWith({ state: 'edit' });
      expect(reportService.getPaginatedERptcCount).toHaveBeenCalledOnceWith({
        state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
      });
      expect(reportService.getPaginatedERptc).toHaveBeenCalledOnceWith(0, 2, {
        state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
      });
      expect(reportService.getApproversInBulk).toHaveBeenCalledOnceWith(['rp35DK02IvMP', 'rppMWBOkXJeS']);
      expect(reportService.addApprovers).toHaveBeenCalledOnceWith(addApproverERpts, approversData3);
      done();
    });
  });

  describe('getReportStatsData()', () => {
    it('should get report stats data', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(apiReportStatsRawRes));

      const params = {
        rp_org_user_id: 'eq.ouX8dwsbLCLv',
        approved_by: 'cs.{ouCI4UQ2G0K1}',
        rp_approval_state: ['in.(APPROVAL_PENDING)'],
        rp_state: ['in.(APPROVER_PENDING)'],
        sequential_approval_turn: ['in.(true)'],
        aggregates: 'count(rp_id),sum(rp_amount)',
        scalar: true,
      };

      reportService.getReportStatsData(apiReportStatsRawParam).subscribe((res) => {
        expect(res).toEqual(expectedReportRawStats);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/reports/stats', { params });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should get report stats data when default stats has been set to false', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(new StatsResponse(apiReportStatsRawRes)));

      const params = {
        approved_by: 'cs.{ouCI4UQ2G0K1}',
        rp_approval_state: ['in.(APPROVAL_PENDING)'],
        rp_state: ['in.(APPROVER_PENDING)'],
        sequential_approval_turn: ['in.(true)'],
        aggregates: 'count(rp_id),sum(rp_amount)',
        scalar: true,
      };

      reportService.getReportStatsData(apiReportStatsRawParam, false).subscribe((res) => {
        expect(res).toEqual(expectedReportRawStats);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/reports/stats', { params });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('getReportStats(): should get report stats', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    apiv2Service.get.and.returnValue(of(new StatsResponse(apiReportStatsRes)));

    reportService.getReportStats(apiReportStatParams).subscribe((res) => {
      expect(res).toEqual(new StatsResponse(apiReportStatsRes));
      expect(apiv2Service.get).toHaveBeenCalledOnceWith('/reports/stats', {
        params: { rp_org_user_id: `eq.ouX8dwsbLCLv`, ...apiReportStatParams },
      });
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
