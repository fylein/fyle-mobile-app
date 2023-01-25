import { TestBed } from '@angular/core/testing';

import { ReportService } from './report.service';
import { NetworkService } from './network.service';
import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { DateService } from './date.service';
import { DataTransformService } from './data-transform.service';
import { TransactionService } from './transaction.service';
import { StorageService } from './storage.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { DatePipe } from '@angular/common';
import { UserEventService } from './user-event.service';
import { PermissionsService } from './permissions.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { PAGINATION_SIZE } from 'src/app/constants';
import { of } from 'rxjs';

import { apiEouRes } from '../mock-data/extended-org-user.data';
import {
  apiReportRes1,
  apiReportRes2,
  apiReportRes,
  apiReportSingleRes,
  apiEmptyReportRes,
  expectedReportsSingle,
  apiTeamRptCountRes,
  apiTeamRptSingleRes,
} from '../mock-data/api-reports.data';
import { apiReportActions } from '../mock-data/report-actions.data';
import { apiExpenseRes } from '../mock-data/expense.data';
import { apiReportStatsRes, apiReportStatsRawRes } from '../../core/mock-data/stats-response.data';
import { expectedReportRawStats } from '../mock-data/stats-dimension-response.data';
import { apiApproverRes, apiAllApproverRes1, apiAllApproverRes2 } from '../mock-data/approver.data';
import { orgSettingsParams } from '../mock-data/org-settings.data';
import { apiAllowedActionRes } from '../mock-data/allowed-actions.data';
import { StatsResponse } from '../models/v2/stats-response.model';
import { apiErptcReportsRes, apiCreateDraftRes, apiCreateReportRes } from '../mock-data/report-response.data';
import { apiExtendedReportRes, expectedAllReports, reportParam } from '../mock-data/report.data';
import {
  apiErptReporDataParam,
  apiReportUpdatedDetails,
  expectedErpt,
  expectedSingleErpt,
  expectedUnflattenedReports,
  extendedReportParam,
} from '../mock-data/report-unflattened.data';
import { apiReportAutoSubmissionDetails } from '../mock-data/report-auto-submission-details.data';

describe('ReportService', () => {
  let reportService: ReportService;
  let dataTransformService: DataTransformService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let spenderPlatformApiService: jasmine.SpyObj<SpenderPlatformApiService>;
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

  const apiApproversParam = ['rpvwqzb9Jqq0', 'rpvcIMRMyM3A', 'rpDyD26O3qpV', 'rpqzKD4bPXpW'];

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get', 'post']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'getRoles']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkSpy', ['isOnline']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['clearCache']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventServive', ['clearTaskCache', 'onLogout']);
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformService', ['post']);
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionService', ['allowedActions', 'allowAccess']);

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
          provide: SpenderPlatformApiService,
          useValue: spenderPlatformApiServiceSpy,
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
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
  });

  function fixDates(res) {
    return {
      ...res,
      data: dateService.fixDates(res.data),
    };
  }

  function getExtendedOrgUser() {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
  }

  function getReports() {
    apiv2Service.get.and.returnValue(of(apiReportRes));
  }

  function getPaginatedReports() {
    const apiCountParam = {
      params: {
        offset: 0,
        limit: 1,
        order: 'rp_created_at.desc,rp_id.desc',
        rp_org_user_id: 'eq.ouX8dwsbLCLv',
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      },
    };

    const apiPage1Param = {
      params: {
        offset: 0,
        limit: 2,
        order: 'rp_created_at.desc,rp_id.desc',
        rp_org_user_id: 'eq.ouX8dwsbLCLv',
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      },
    };

    const apiPage2Param = {
      params: {
        offset: 2,
        limit: 2,
        order: 'rp_created_at.desc,rp_id.desc',
        rp_org_user_id: 'eq.ouX8dwsbLCLv',
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      },
    };

    apiv2Service.get.withArgs('/reports', apiCountParam).and.returnValue(of(apiReportRes));
    apiv2Service.get.withArgs('/reports', apiPage1Param).and.returnValue(of(apiReportRes1));
    apiv2Service.get.withArgs('/reports', apiPage2Param).and.returnValue(of(apiReportRes2));
  }

  it('should be created', () => {
    expect(reportService).toBeTruthy();
  });

  it('clearCache(): should clear cache', (done) => {
    reportService.clearCache().subscribe((res) => {
      expect(res).toBeFalsy();
      done();
    });
  });

  it('createDraft(): should create a draft report and return the report', (done) => {
    apiService.post.and.returnValue(of(apiCreateDraftRes));
    transactionService.clearCache.and.returnValue(of(null));

    const reportParam = {
      purpose: 'A draft Report',
      source: 'MOBILE',
    };

    reportService.createDraft(reportParam).subscribe((res) => {
      expect(res).toEqual(apiCreateDraftRes);
      expect(apiService.post).toHaveBeenCalledWith('/reports', reportParam);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('removeTransaction(): should remove a transaction from report', (done) => {
    apiService.post.and.returnValue(of(null));
    transactionService.clearCache.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';
    const txnID = 'txTQVBx7W8EO';

    const aspy = {
      status: {
        comment: null,
      },
    };

    reportService.removeTransaction(reportID, txnID, null).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/txns/${txnID}/remove`, aspy);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getMyReports(): should get reports from API as specified by params', (done) => {
    getExtendedOrgUser();
    getReports();

    const params = {
      offset: 0,
      limit: 10,
      queryParams: {
        or: [],
      },
      order: 'rp_created_at.desc',
    };

    reportService.getMyReports(params).subscribe((res) => {
      expect(res).toEqual(fixDates(res));
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
    getExtendedOrgUser();
    getReports();

    reportService.getMyReportsCount({}).subscribe((res) => {
      expect(res).toEqual(4);
      expect(apiv2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getReport(): should get the report from API as per report ID given', (done) => {
    getExtendedOrgUser();
    apiv2Service.get.and.returnValue(of(apiReportSingleRes));

    const reportID = 'rpfClhA1lglE';

    reportService.getReport(reportID).subscribe((res) => {
      expect(res).toEqual(dateService.fixDates(expectedReportsSingle));
      expect(apiv2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getTeamReportsCount(): should get a count of team reports', (done) => {
    getExtendedOrgUser();
    apiv2Service.get.and.returnValue(of(apiTeamRptCountRes));

    const apiParam = {
      params: { offset: 0, limit: 1, approved_by: 'cs.{ouX8dwsbLCLv}', order: 'rp_created_at.desc,rp_id.desc' },
    };

    reportService.getTeamReportsCount({}).subscribe((res) => {
      expect(res).toEqual(25);
      expect(apiv2Service.get).toHaveBeenCalledWith('/reports', apiParam);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(apiv2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getTeamReport(): should get a team report', (done) => {
    getExtendedOrgUser();
    apiv2Service.get.and.returnValue(of(apiTeamRptSingleRes));

    const reportID = 'rphNNUiCISkD';

    const apiParam = {
      params: {
        offset: 0,
        limit: 1,
        approved_by: 'cs.{ouX8dwsbLCLv}',
        order: 'rp_created_at.desc,rp_id.desc',
        rp_id: 'eq.rphNNUiCISkD',
      },
    };

    reportService.getTeamReport(reportID).subscribe((res) => {
      expect(res).toEqual(apiTeamRptSingleRes.data[0]);
      expect(apiv2Service.get).toHaveBeenCalledWith('/reports', apiParam);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(apiv2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('addTransactions(): should add a transaction to a report', (done) => {
    apiService.post.and.returnValue(of(null));
    transactionService.clearCache.and.returnValue(of(null));

    const reportID = 'rpvcIMRMyM3A';
    const tnxs = ['txTQVBx7W8EO'];

    reportService.addTransactions(reportID, tnxs).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/txns`, { ids: tnxs });
      expect(apiService.post).toHaveBeenCalledTimes(1);
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
    apiService.post.and.returnValue(of(apiCreateReportRes));
    transactionService.clearCache.and.returnValue(of(null));

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
      expect(res).toEqual(apiCreateReportRes);
      expect(apiService.post).toHaveBeenCalledWith('/reports', reportPurpose);
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/txns`, txnParam);
      expect(apiService.post).toHaveBeenCalledWith(`/reports/${reportID}/submit`);
      expect(apiService.post).toHaveBeenCalledTimes(3);
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
    spenderPlatformApiService.post.and.returnValue(of(apiReportAutoSubmissionDetails));

    reportService.getAutoSubmissionReportName().subscribe((res) => {
      expect(res).toEqual('(Automatic Submission On Feb 1)');
      expect(spenderPlatformApiService.post).toHaveBeenCalledWith('/automations/report_submissions/next_at', {
        data: null,
      });
      expect(spenderPlatformApiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  xit('getAutoSubmissionReportName(): should report null', (done) => {
    spenderPlatformApiService.post.and.returnValue(
      of({
        data: {
          next_at: null,
        },
      })
    );

    reportService.getAutoSubmissionReportName().subscribe((res) => {
      expect(res).toEqual(null);
      expect(spenderPlatformApiService.post).toHaveBeenCalledWith('/automations/report_submissions/next_at', {
        data: null,
      });
      expect(spenderPlatformApiService.post).toHaveBeenCalledTimes(1);
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
    transactionService.clearCache.and.returnValue(of(null));

    const reportID = 'rpShFuVCUIXk';
    reportService.delete(reportID).subscribe(() => {
      expect(apiService.delete).toHaveBeenCalledWith(`/reports/${reportID}`);
      expect(apiService.delete).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('updateReportDetails(): should update a report name', (done) => {
    apiService.post.and.returnValue(of(apiReportUpdatedDetails));
    transactionService.clearCache.and.returnValue(of(null));

    reportService.updateReportDetails(reportParam).subscribe((res) => {
      expect(res).toEqual(apiReportUpdatedDetails);
      expect(apiService.post).toHaveBeenCalledWith('/reports', apiErptReporDataParam.rp);
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getReportPermissions(): should get report permissions', (done) => {
    permissionsService.allowedActions.and.returnValue(of(apiAllowedActionRes));

    reportService.getReportPermissions(orgSettingsParams).subscribe((res) => {
      expect(res).toEqual(apiAllowedActionRes);
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

  it('getAllExtendedReports(): should all reports', (done) => {
    getExtendedOrgUser();
    getPaginatedReports();

    const params = {
      queryParams: {
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      },
    };

    reportService.getAllExtendedReports(params).subscribe((res) => {
      expect(res).toEqual(expectedAllReports);
      expect(authService.getEou).toHaveBeenCalledTimes(3);
      expect(apiv2Service.get).toHaveBeenCalledTimes(3);
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

    const apiErptcCountParam = { params: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'] };

    networkService.isOnline.and.returnValue(of(true));
    apiService.get.withArgs('/erpts/count', {}).and.returnValue(of({ count: 4 }));
    apiService.get.withArgs('/erpts', apiErptcParam).and.returnValue(of(apiErptcReportsRes));
    apiService.get.withArgs('/reports/approvers', { params: apiApproversParam }).and.returnValue(of(apiApproverRes));

    reportService
      .getFilteredPendingReports({ state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'] })
      .subscribe((res) => {
        console.log(res);
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

  xit('getApproversInBulk(): should get approvers in bulk for all report IDs speified', (done) => {
    apiService.get
      .withArgs('/reports/approvers', { params: { report_ids: apiApproversParam.slice(0, 1) } })
      .and.returnValue(of(apiAllApproverRes1));
    apiService.get
      .withArgs('/reports/approvers', { params: { report_ids: apiApproversParam.slice(2, 3) } })
      .and.returnValue(of(apiAllApproverRes2));

    reportService.getApproversInBulk(apiApproversParam).subscribe((res) => {
      console.log(res);
      expect(apiService.get).toHaveBeenCalledWith('/reports/approvers', {});
      done();
    });
  });

  xit('addApprovers(): add approvers to a report', () => {
    const result = reportService.addApprovers(extendedReportParam, apiApproverRes);

    expect(result).toEqual(expectedUnflattenedReports);
  });

  it('getPaginatedERptcCount(): should get extended reports count', (done) => {
    networkService.isOnline.and.returnValue(of(true));
    apiService.get.and.returnValue(of({ count: 4 }));

    const apiParam = ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'];

    reportService.getPaginatedERptcCount(apiParam).subscribe((res) => {
      expect(res).toEqual({ count: 4 });
      expect(apiService.get).toHaveBeenCalledWith('/erpts/count', { params: apiParam });
      expect(apiService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('addOrderByParams(): return the params since no order is specified', () => {
    const params = { state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY'] };

    const result = reportService.addOrderByParams(params);
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
      expect(apiService.get).toHaveBeenCalledTimes(1);
      expect(apiService.get).toHaveBeenCalledWith(`/erpts/${reportID}/etxns`, {
        params: {
          approver_id: orgUserID,
        },
      });
      done();
    });
  });

  it('getReportStatsData(): should get report stats data', (done) => {
    getExtendedOrgUser();
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

  it('getReportStats(): should get report stats to display on dashboard', (done) => {
    getExtendedOrgUser();
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
