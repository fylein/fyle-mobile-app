import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { completeStats, emptyStats, incompleteStats } from 'src/app/core/mock-data/platform/v1/expenses-stats.data';
import { SpenderPlatformV1ApiService } from 'src/app/core/services/spender-platform-v1-api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { expectedAssignedCCCStats } from '../../core/mock-data/ccc-expense.details.data';
import { expectedReportStats, expectedGroupedReportStats } from '../../core/mock-data/report-stats.data';
import { apiAssignedCardDetailsRes } from '../../core/mock-data/stats-response.data';
import {
  emptyStatsAgg,
  expectedIncompleteExpStats2,
  expectedUnreportedExpStats2,
} from '../../core/mock-data/stats.data';
import { DashboardService } from './dashboard.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ReportStates } from './stat-badge/report-states.enum';
import { ApproverReportsService } from 'src/app/core/services/platform/v1/approver/reports.service';
import { expectedSentBackResponse } from '../../core/mock-data/report-stats.data';
import { TranslocoService } from '@jsverse/transloco';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let authService: jasmine.SpyObj<AuthService>;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
  let approverReportService: jasmine.SpyObj<ApproverReportsService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseStats']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const spenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', ['getGroupedReportsStats']);
    const approverReportServiceSpy = jasmine.createSpyObj('ApproverReportsService', ['getReportsStats']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['post']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.dashboard.draft': 'Draft',
        'services.dashboard.reported': 'Reported',
        'services.dashboard.approved': 'Approved',
        'services.dashboard.paymentPending': 'Payment Pending',
        'services.dashboard.processing': 'Processing',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DashboardService,
        CorporateCreditCardExpenseService,
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: SpenderReportsService,
          useValue: spenderReportsServiceSpy,
        },
        {
          provide: ApproverReportsService,
          useValue: approverReportServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    dashboardService = TestBed.inject(DashboardService);
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
    approverReportService = TestBed.inject(ApproverReportsService) as jasmine.SpyObj<ApproverReportsService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(dashboardService).toBeTruthy();
  });

  it('getUnreportedExpensesStats(): should get UNREPORTED expense stats', (done) => {
    expensesService.getExpenseStats.and.returnValue(of(completeStats));

    dashboardService.getUnreportedExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedUnreportedExpStats2);
      expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
        state: 'in.(COMPLETE)',
        report_id: 'is.null',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
      });
      done();
    });
  });

  it('getUnreportedExpensesStats(): should return empty or undefined for UNREPORTED expense stats as api sends empty list for aggregates', (done) => {
    expensesService.getExpenseStats.and.returnValue(of(emptyStats));

    dashboardService.getUnreportedExpensesStats().subscribe((res) => {
      expect(res).toEqual(emptyStatsAgg);
      expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
        state: 'in.(COMPLETE)',
        report_id: 'is.null',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
      });
      done();
    });
  });

  it('getIncompleteExpenseStats(): should get INCOMPLETE expense stats', (done) => {
    expensesService.getExpenseStats.and.returnValue(of(incompleteStats));

    dashboardService.getIncompleteExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedIncompleteExpStats2);
      expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
        state: 'in.(DRAFT)',
        report_id: 'is.null',
      });
      done();
    });
  });

  it('getIncompleteExpenseStats(): should return empty or undefined for INCOMPLETE expense stats as api sends empty list for aggregates', (done) => {
    expensesService.getExpenseStats.and.returnValue(of(emptyStats));

    dashboardService.getIncompleteExpensesStats().subscribe((res) => {
      expect(res).toEqual(emptyStatsAgg);
      expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
        state: 'in.(DRAFT)',
        report_id: 'is.null',
      });
      done();
    });
  });

  it('getReportsStats(): should get Report stats', (done) => {
    spenderReportsService.getGroupedReportsStats.and.returnValue(of(expectedGroupedReportStats));

    dashboardService.getReportsStats().subscribe((res) => {
      expect(res).toEqual(expectedReportStats);
      expect(spenderReportsService.getGroupedReportsStats).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getCCCDetails(): should get assigned card details', (done) => {
    const config = {
      data: {
        query_params:
          'or=(matched_expenses.cs.[{"state":"DRAFT"}],matched_expenses.cs.[{"state":"COMPLETE"}])&amount=gt.0',
      },
    };
    spenderPlatformV1ApiService.post.and.returnValue(of(apiAssignedCardDetailsRes));

    dashboardService.getCCCDetails().subscribe((res) => {
      expect(res).toEqual(expectedAssignedCCCStats);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith(
        '/corporate_card_transactions/expenses/stats',
        config
      );
      done();
    });
  });

  it('should get unapproved team reports stats if user is an approver', (done) => {
    authService.getEou.and.resolveTo(apiEouRes);
    approverReportService.getReportsStats.and.returnValue(of(expectedSentBackResponse));

    dashboardService.getUnapprovedTeamReportsStats().subscribe((res) => {
      expect(res).toEqual(expectedSentBackResponse);
      expect(approverReportService.getReportsStats).toHaveBeenCalledOnceWith({
        next_approver_user_ids: `cs.[${apiEouRes.us.id}]`,
        state: `eq.${ReportStates.APPROVER_PENDING}`,
      });
      done();
    });
  });

  describe('getReportStateMapping():', () => {
    it('should return "Approved" if report state is APPROVED', () => {
      expect(dashboardService.getReportStateMapping(ReportStates.APPROVED)).toEqual('Approved');
    });

    it('should return "Draft" if report state is DRAFT', () => {
      expect(dashboardService.getReportStateMapping(ReportStates.DRAFT)).toEqual('Draft');
    });

    it('should return "Payment Pending" if report state is PAYMENT_PENDING', () => {
      expect(dashboardService.getReportStateMapping(ReportStates.PAYMENT_PENDING)).toEqual('Payment Pending');
    });

    it('should return "Processing" if report state is PAYMENT_PROCESSING', () => {
      expect(dashboardService.getReportStateMapping(ReportStates.PAYMENT_PROCESSING)).toEqual('Processing');
    });

    it('should return "Reported" if report state is APPROVER_PENDING', () => {
      expect(dashboardService.getReportStateMapping(ReportStates.APPROVER_PENDING)).toEqual('Reported');
    });
  });
});
