import { TestBed } from '@angular/core/testing';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import { apiReportStatsRawRes, apiReportStatsRes } from '../../core/mock-data/stats-response.data';
import { reportAllowedActionsResponse } from '../mock-data/allowed-actions.data';
import { apiReportRes } from '../mock-data/api-reports.data';
import {
  approversData1,
  apiAllApproverRes1,
  apiAllApproverRes2,
  apiApproverRes,
  expectedApprovers,
  approversData2,
  approversData3,
} from '../mock-data/approver.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { orgSettingsRes } from '../mock-data/org-settings.data';
import { apiReportAutoSubmissionDetails } from '../mock-data/report-auto-submission-details.data';
import {
  expectedErpt,
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
import { expectedReportsSinglePage, platformReportData } from '../mock-data/platform-report.data';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { cloneDeep } from 'lodash';
import { SpenderReportsService } from './platform/v1/spender/reports.service';

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
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;
  let permissionsService: jasmine.SpyObj<PermissionsService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
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
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['post']);
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['allowedActions']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
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
          provide: ApproverPlatformApiService,
          useValue: approverPlatformApiServiceSpy,
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
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService
    ) as jasmine.SpyObj<ApproverPlatformApiService>;
    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
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

  it('getExports(): should get export actions for a report', (done) => {
    apiService.get.and.returnValue(of([]));

    const reportID = 'rphLXGFVbDaJ';

    reportService.getExports(reportID).subscribe(() => {
      expect(apiService.get).toHaveBeenCalledOnceWith(`/reports/${reportID}/exports`);
      done();
    });
  });

  it('create(): should create a new report', (done) => {
    spyOn(spenderReportsService, 'createDraft').and.returnValue(of(expectedReportsSinglePage[0]));
    spenderPlatformV1ApiService.post.and.returnValue(of(null));
    spyOn(reportService, 'submit').and.returnValue(of(null));

    const reportPurpose = {
      purpose: 'A new report',
      source: 'MOBILE',
    };
    const expenseIds = ['tx6Oe6FaYDZl'];
    const reportID = 'rprAfNrce73O';
    const payload = {
      data: {
        id: reportID,
        expense_ids: expenseIds,
      },
    };

    reportService.create(reportPurpose, expenseIds).subscribe((res) => {
      expect(res).toEqual(expectedReportsSinglePage[0]);
      expect(spenderReportsService.createDraft).toHaveBeenCalledOnceWith({ data: reportPurpose });
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/reports/add_expenses', payload);
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
      const mockApiReportAutoSubmissionDetails = cloneDeep(apiReportAutoSubmissionDetails);
      spenderPlatformV1ApiService.post.and.returnValue(of(mockApiReportAutoSubmissionDetails));

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
    reportService.updateReportPurpose(platformReportData).subscribe((res) => {
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

  it('approverUpdateReportPurpose(): should update the report purpose for approver', (done) => {
    approverPlatformApiService.post.and.returnValue(of(platformReportData));
    reportService.approverUpdateReportPurpose(platformReportData).subscribe((res) => {
      expect(res).toEqual(platformReportData);
      expect(approverPlatformApiService.post).toHaveBeenCalledOnceWith('/reports', {
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
        state: ['DRAFT'],
      };

      const result = reportService.getUserReportParams(params);
      expect(result).toEqual(expectedRes);
      expect(expectedRes.state.length).toEqual(1);
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
      expect(expectedRes.state.length).toEqual(9);
    });
  });

  it('addApprovers(): add approvers to reports', () => {
    const mockApproverData = cloneDeep(approversData1);
    const mockERpts = cloneDeep(addApproverERpts);
    const res = reportService.addApprovers(mockERpts, mockApproverData);

    expect(res).toEqual(expectedAddedApproverERpts);
  });
});
