import { TestBed } from '@angular/core/testing';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
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
  apiAllReportsRes,
} from '../mock-data/api-reports.data';
import { apiAllApproverRes2, apiApproverRes, expectedApprovers } from '../mock-data/approver.data';
import { apiExpenseRes } from '../mock-data/expense.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { orgSettingsParams } from '../mock-data/org-settings.data';
import { apiReportActions } from '../mock-data/report-actions.data';
import { apiReportAutoSubmissionDetails } from '../mock-data/report-auto-submission-details.data';
import {
  apiErptReporDataParam,
  expectedErpt,
  expectedPendingReports,
  expectedSingleErpt,
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
} from '../mock-data/report.data';
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

describe('ReportService', () => {
  let reportService: ReportService;
  let dataTransformService: DataTransformService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let spenderPlatformV1BetaApiService: jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
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
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get', 'post']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'getRoles']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkSpy', ['isOnline']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['clearCache']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventServive', ['clearTaskCache', 'onLogout']);
    const spenderPlatformV1BetaApiServiceSpy = jasmine.createSpyObj('SpenderPlatformService', ['post']);
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionService', ['allowedActions']);

    TestBed.configureTestingModule({
      providers: [
        ReportService,
        DatePipe,
        DataTransformService,
        LaunchDarklyService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
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
          provide: SpenderPlatformV1BetaApiService,
          useValue: spenderPlatformV1BetaApiServiceSpy,
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
    dataTransformService = TestBed.inject(DataTransformService);
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    spenderPlatformV1BetaApiService = TestBed.inject(
      SpenderPlatformV1BetaApiService
    ) as jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
  });

  function mockExtendedOrgUser() {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
  }

  function mockReports() {
    apiv2Service.get.and.returnValue(of(apiReportRes));
  }

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
      expect(apiService.post).toHaveBeenCalledWith('/reports', reportParam);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('submit(): should submit a report', (done) => {
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));
    apiService.post.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';

    reportService.submit(reportID).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/submit`);
      expect(apiService.post).toHaveBeenCalledTimes(1);
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
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/txns/${txnID}/remove`, params);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getMyReports(): should get reports from API as specified by params', (done) => {
    mockExtendedOrgUser();
    mockReports();

    const params = {
      offset: 0,
      limit: 10,
      queryParams: {
        or: [],
      },
      order: 'rp_created_at.desc',
    };

    reportService.getMyReports(params).subscribe((res) => {
      expect(res).toEqual(res);
      expect(apiv2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getPaginatedERptc(): should get paginated extended-reports', (done) => {
    apiService.get.and.returnValue(of(apiExtendedReportRes));

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
      expect(apiService.get).toHaveBeenCalledWith('/erpts', apiParams);
      expect(apiService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getERpt(): should get an extended report', (done) => {
    apiService.get.and.returnValue(of(apiExtendedReportRes[0]));

    const reportID = 'rprAfNrce73O';

    reportService.getERpt(reportID).subscribe((res) => {
      expect(res).toEqual(expectedSingleErpt);
      expect(apiService.get).toHaveBeenCalledWith(`/erpts/${reportID}`);
      expect(apiService.get).toHaveBeenCalledTimes(1);
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
      expect(reportService.getMyReports).toHaveBeenCalledWith(param);
      expect(reportService.getMyReports).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getReport(): should get the report from API as per report ID given', (done) => {
    mockExtendedOrgUser();
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
      expect(reportService.getMyReports).toHaveBeenCalledWith(params);
      expect(reportService.getMyReports).toHaveBeenCalledTimes(1);
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
      expect(reportService.getTeamReports).toHaveBeenCalledWith(params);
      expect(reportService.getTeamReports).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getTeamReports(): should get all team reports', (done) => {
    mockExtendedOrgUser();
    apiv2Service.get.and.returnValue(of(apiTeamReportPaginated1));

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
      expect(apiv2Service.get).toHaveBeenCalledWith('/reports', {
        params: {
          offset: 0,
          limit: 10,
          approved_by: 'cs.{ouX8dwsbLCLv}',
          order: 'rp_submitted_at.desc,rp_id.desc',
          or: [],
        },
      });
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(apiv2Service.get).toHaveBeenCalledTimes(1);
      done();
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
      expect(reportService.getTeamReports).toHaveBeenCalledWith(params);
      expect(reportService.getTeamReports).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('addTransactions(): should add a transaction to a report', (done) => {
    apiService.post.and.returnValue(of(null));
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';
    const tnxs = ['txTQVBx7W8EO'];

    reportService.addTransactions(reportID, tnxs).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/txns`, { ids: tnxs });
      expect(apiService.post).toHaveBeenCalledTimes(1);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('actions(): should get report actions', (done) => {
    apiService.get.and.returnValue(of(apiReportActions));

    const reportID = 'rpxtbiLXQZUm';

    reportService.actions(reportID).subscribe((res) => {
      expect(res).toEqual(apiReportActions);
      expect(apiService.get).toHaveBeenCalledWith(`/reports/${reportID}/actions`);
      expect(apiService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getExports(): should get export actions for a report', (done) => {
    apiService.get.and.returnValue(of([]));

    const reportID = 'rphLXGFVbDaJ';

    reportService.getExports(reportID).subscribe(() => {
      expect(apiService.get).toHaveBeenCalledWith(`/reports/${reportID}/exports`);
      expect(apiService.get).toHaveBeenCalledTimes(1);
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
      expect(reportService.createDraft).toHaveBeenCalledWith(reportPurpose);
      expect(reportService.createDraft).toHaveBeenCalledTimes(1);
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/txns`, txnParam);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      expect(reportService.submit).toHaveBeenCalledWith(reportID);
      expect(reportService.submit).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('resubmit(): should resubmit a report', (done) => {
    apiService.post.and.returnValue(of(null));

    const reportID = 'rpShFuVCUIXk';
    reportService.resubmit(reportID).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/resubmit`);
      expect(apiService.post).toHaveBeenCalledTimes(1);
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
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/inquire`, statusPayloadParam);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getAutoSubmissionReportName(): should get auto submitted report name', (done) => {
    spyOn(reportService, 'getReportAutoSubmissionDetails').and.returnValue(of(apiReportAutoSubmissionDetails));

    reportService.getAutoSubmissionReportName().subscribe((res) => {
      expect(res).toEqual('(Automatic Submission On Feb 1)');
      expect(reportService.getReportAutoSubmissionDetails).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getAutoSubmissionReportName(): should report null', (done) => {
    spyOn(reportService, 'getReportAutoSubmissionDetails').and.returnValue(
      of({
        data: {
          next_at: null,
        },
      })
    );

    reportService.getAutoSubmissionReportName().subscribe((res) => {
      expect(res).toEqual(null);
      expect(reportService.getReportAutoSubmissionDetails).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getReportAutoSubmissionDetails(): should get submission details', (done) => {
    spenderPlatformV1BetaApiService.post.and.returnValue(of(apiReportAutoSubmissionDetails));

    reportService.getReportAutoSubmissionDetails().subscribe((res) => {
      expect(res).toEqual({
        data: {
          next_at: new Date('2023-02-01T00:00:00.000000'),
        },
      });
      expect(spenderPlatformV1BetaApiService.post).toHaveBeenCalledWith('/automations/report_submissions/next_at', {
        data: null,
      });
      expect(spenderPlatformV1BetaApiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getReportAutoSubmissionDetails(): should get submission details when no data is passed', (done) => {
    spenderPlatformV1BetaApiService.post.and.returnValue(
      of({
        data: {},
      })
    );

    reportService.getReportAutoSubmissionDetails().subscribe((res) => {
      expect(res).toEqual({
        data: {},
      });
      expect(spenderPlatformV1BetaApiService.post).toHaveBeenCalledWith('/automations/report_submissions/next_at', {
        data: null,
      });
      expect(spenderPlatformV1BetaApiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('approve(): should approve a report', (done) => {
    apiService.post.and.returnValue(of(null));

    const reportID = 'rpShFuVCUIXk';
    reportService.approve(reportID).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/approve`);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('addApprovers(): should add approver to a report', (done) => {
    apiService.post.and.returnValue(of(null));

    const reportID = 'rprj1zHHpW2W';
    const approverEmail = 'asilk@akls.in';
    const comment = 'comment';

    reportService.addApprover(reportID, approverEmail, comment).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/approvals`, {
        approver_email: approverEmail,
        comment,
      });
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('delete(): should delete a report', (done) => {
    apiService.delete.and.returnValue(of(null));
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));

    const reportID = 'rpShFuVCUIXk';
    reportService.delete(reportID).subscribe(() => {
      expect(apiService.delete).toHaveBeenCalledWith(`/reports/${reportID}`);
      expect(apiService.delete).toHaveBeenCalledTimes(1);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('updateReportDetails(): should update a report name', (done) => {
    apiService.post.and.returnValue(of(apiReportUpdatedDetails));
    spyOn(reportService, 'clearTransactionCache').and.returnValue(of(null));

    reportService.updateReportDetails(reportParam).subscribe((res) => {
      expect(res).toEqual(apiReportUpdatedDetails);
      expect(apiService.post).toHaveBeenCalledWith('/reports', apiErptReporDataParam.rp);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getReportPermissions(): should get report permissions', (done) => {
    permissionsService.allowedActions.and.returnValue(of(reportAllowedActionsResponse));

    reportService.getReportPermissions(orgSettingsParams).subscribe((res) => {
      expect(res).toEqual(reportAllowedActionsResponse);
      expect(permissionsService.allowedActions).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getApproversByReportId(): should get the approvers of a report', (done) => {
    apiService.get.and.returnValue(of(apiApproverRes));
    const reportID = 'rphNNUiCISkD';

    reportService.getApproversByReportId(reportID).subscribe((res) => {
      expect(res).toEqual(apiApproverRes);
      expect(apiService.get).toHaveBeenCalledWith(`/reports/${reportID}/approvers`);
      expect(apiService.get).toHaveBeenCalledTimes(1);
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
      expect(apiService.post).toHaveBeenCalledWith('/reports/summary/download', data);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getAllExtendedReports(): should get all reports', (done) => {
    spyOn(reportService, 'getMyReportsCount').and.returnValue(of(2));
    spyOn(reportService, 'getMyReports').and.returnValue(of(apiAllReportsRes));

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
      expect(reportService.getMyReports).toHaveBeenCalledWith(getMyReportsParam);
      expect(reportService.getMyReports).toHaveBeenCalledTimes(1);
      expect(reportService.getMyReportsCount).toHaveBeenCalledTimes(1);
      done();
    });
  });

  xit('getFilteredPendingReports(): should get all pending reports', (done) => {
    const apiErptcParam = {
      params: {
        offset: 0,
        limit: 4,
        state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
      },
    };

    const apiErptcCountParam = { state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'] };

    networkService.isOnline.and.returnValue(of(true));
    spyOn(reportService, 'getPaginatedERptcCount').and.returnValue(of({ count: 4 }));
    spyOn(reportService, 'getPaginatedERptc').and.returnValue(of(expectedErpt));
    spyOn(reportService, 'getApproversInBulk').and.returnValue(of(apiAllApproverRes2));

    reportService.getFilteredPendingReports({ state: 'edit' }).subscribe((res) => {
      expect(res).toEqual(expectedPendingReports);
      done();
    });
  });

  it('getReportPurpose(): should get the purpose of the report', (done) => {
    const reportName = ' #7:  Jan 2023';
    apiService.post.and.returnValue(of(apiEmptyReportRes));

    reportService.getReportPurpose({ ids: [] }).subscribe((res) => {
      expect(res).toEqual(reportName);
      expect(apiService.post).toHaveBeenCalledWith('/reports/purpose', { ids: [] });
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getApproversInBulk(): should get approvers in bulk for all report IDs speified', (done) => {
    apiService.get.and.returnValue(of(apiAllApproverRes2));

    reportService.getApproversInBulk(apiApproversParam).subscribe((res) => {
      expect(res).toEqual(expectedApprovers);
      expect(apiService.get).toHaveBeenCalledTimes(1);
      expect(apiService.get).toHaveBeenCalledWith('/reports/approvers', {
        params: { report_ids: apiApproversParam },
      });
      done();
    });
  });

  it('getApproversInBulk(): should return an empty list as report IDs are empty', (done) => {
    apiService.get.and.returnValue(of(apiAllApproverRes2));

    reportService.getApproversInBulk([]).subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });
  });

  it('getPaginatedERptcCount(): should get extended reports count', (done) => {
    networkService.isOnline.and.returnValue(of(true));
    apiService.get.and.returnValue(of({ count: 4 }));

    const apiParam = ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'];

    reportService.getPaginatedERptcCount({ state: apiParam }).subscribe((res) => {
      expect(res).toEqual({ count: 4 });
      expect(apiService.get).toHaveBeenCalledWith('/erpts/count', { params: { state: apiParam } });
      expect(apiService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('addOrderByParams(): return the params since no order is specified', () => {
    const params = { state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'] };

    const result = reportService.addOrderByParams(params);
    expect(result).toEqual(params);
  });

  it('addOrderByParams(): return the params when order is specified', () => {
    const params = {
      state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
      order_by: 'rp_created_at.desc,rp_id.desc',
    };

    const result = reportService.addOrderByParams(params, 'rp_created_at.desc,rp_id.desc');
    expect(result).toEqual(params);
  });

  it('getUserReportParams(): generate parameters as per state | edit', () => {
    const params = 'edit';

    const expectParam = {
      state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'],
    };

    const result = reportService.getUserReportParams(params);
    expect(result).toEqual(expectParam);
    expect(expectParam.state.length).toEqual(3);
  });

  it('getUserReportParams(): generate parameters as per state | draft', () => {
    const params = 'draft';

    const expectParam = {
      state: ['DRAFT', 'DRAFT_INQUIRY'],
    };

    const result = reportService.getUserReportParams(params);
    expect(result).toEqual(expectParam);
    expect(expectParam.state.length).toEqual(2);
  });

  it('getUserReportParams(): generate parameters as per state | pending', () => {
    const params = 'pending';

    const expectParam = {
      state: ['APPROVER_PENDING'],
    };

    const result = reportService.getUserReportParams(params);
    expect(result).toEqual(expectParam);
    expect(expectParam.state.length).toEqual(1);
  });

  it('getUserReportParams(): generate parameters as per state | inquiry', () => {
    const params = 'inquiry';

    const expectParam = {
      state: ['APPROVER_INQUIRY'],
    };

    const result = reportService.getUserReportParams(params);
    expect(result).toEqual(expectParam);
    expect(expectParam.state.length).toEqual(1);
  });

  it('getUserReportParams(): generate parameters as per state | approved', () => {
    const params = 'approved';

    const expectParam = {
      state: ['APPROVED'],
    };

    const result = reportService.getUserReportParams(params);
    expect(result).toEqual(expectParam);
    expect(expectParam.state.length).toEqual(1);
  });

  it('getUserReportParams(): generate parameters as per state | payment_queue', () => {
    const params = 'payment_queue';

    const expectParam = {
      state: ['PAYMENT_PENDING'],
    };

    const result = reportService.getUserReportParams(params);
    expect(result).toEqual(expectParam);
    expect(expectParam.state.length).toEqual(1);
  });

  it('getUserReportParams(): generate parameters as per state | paid', () => {
    const params = 'paid';

    const expectParam = {
      state: ['PAID'],
    };

    const result = reportService.getUserReportParams(params);
    expect(result).toEqual(expectParam);
    expect(expectParam.state.length).toEqual(1);
  });

  it('getUserReportParams(): generate parameters as per state | all', () => {
    const params = 'all';

    const expectParam = {
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
    expect(result).toEqual(expectParam);
    expect(expectParam.state.length).toEqual(10);
  });

  it('getReportETxnc(): should get report transactions', (done) => {
    apiService.get.and.returnValue(of(apiExpenseRes));
    const reportID = 'rp1xCiq5WA1R';
    const orgUserID = 'ouCI4UQ2G0K1';

    reportService.getReportETxnc(reportID, orgUserID).subscribe((res) => {
      expect(res).toEqual(apiExpenseRes);
      expect(apiService.get).toHaveBeenCalledWith(`/erpts/${reportID}/etxns`, {
        params: {
          approver_id: orgUserID,
        },
      });
      done();
    });
  });

  it('getReportStatsData(): should get report stats data', (done) => {
    mockExtendedOrgUser();
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

    reportService.getReportStatsData(apiReportStatsRawParam, true).subscribe((res) => {
      expect(res).toEqual(expectedReportRawStats);
      expect(apiv2Service.get).toHaveBeenCalledWith('/reports/stats', { params });
      expect(apiv2Service.get).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getReportStats(): should get report stats', (done) => {
    mockExtendedOrgUser();
    apiv2Service.get.and.returnValue(of(new StatsResponse(apiReportStatsRes)));

    reportService.getReportStats(apiReportStatParams).subscribe((res) => {
      expect(res).toEqual(new StatsResponse(apiReportStatsRes));
      expect(apiv2Service.get).toHaveBeenCalledWith('/reports/stats', {
        params: { rp_org_user_id: `eq.ouX8dwsbLCLv`, ...apiReportStatParams },
      });
      expect(apiv2Service.get).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
