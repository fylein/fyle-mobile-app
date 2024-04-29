import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { completeStats, emptyStats, incompleteStats } from 'src/app/core/mock-data/platform/v1/expenses-stats.data';
import { StatsResponse } from 'src/app/core/models/v2/stats-response.model';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ReportService } from 'src/app/core/services/report.service';
import { expectedAssignedCCCStats } from '../../core/mock-data/ccc-expense.details.data';
import { expectedEmptyReportStats, expectedReportStats } from '../../core/mock-data/report-stats.data';
import { apiAssignedCardDetailsRes } from '../../core/mock-data/stats-response.data';
import {
  emptyStatsAgg,
  expectedIncompleteExpStats2,
  expectedUnreportedExpStats2,
} from '../../core/mock-data/stats.data';
import { DashboardService } from './dashboard.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';

fdescribe('DashboardService', () => {
  let dashboardService: DashboardService;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let authService: jasmine.SpyObj<AuthService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;

  beforeEach(() => {
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseStats']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get', 'getStats']);
    const spenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', ['getReportsStats']);
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
          provide: ApiV2Service,
          useValue: apiV2ServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: SpenderReportsService,
          useValue: spenderReportsServiceSpy,
        },
      ],
    });
    dashboardService = TestBed.inject(DashboardService);
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
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
    spenderReportsService.getReportsStats.and.returnValues(
      of(expectedReportStats.draft),
      of(expectedReportStats.report),
      of(expectedReportStats.approved),
      of(expectedReportStats.paymentPending),
      of(expectedReportStats.processing)
    );

    dashboardService.getReportsStats().subscribe((res) => {
      expect(res).toEqual(expectedReportStats);
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledTimes(5);
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.DRAFT',
      });
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.APPROVER_PENDING',
      });
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.APPROVED',
      });
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.PAYMENT_PENDING',
      });
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.PAYMENT_PROCESSING',
      });
      done();
    });
  });

  it('getReportsStats(): should return empty response as various report stats data is empty', (done) => {
    spenderReportsService.getReportsStats.and.returnValues(
      of(expectedEmptyReportStats.draft),
      of(expectedEmptyReportStats.report),
      of(expectedEmptyReportStats.approved),
      of(expectedEmptyReportStats.paymentPending),
      of(expectedEmptyReportStats.processing)
    );

    dashboardService.getReportsStats().subscribe((res) => {
      expect(res).toEqual(expectedEmptyReportStats);
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledTimes(5);
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.DRAFT',
      });
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.APPROVER_PENDING',
      });
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.APPROVED',
      });
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.PAYMENT_PENDING',
      });
      expect(spenderReportsService.getReportsStats).toHaveBeenCalledWith({
        state: 'eq.PAYMENT_PROCESSING',
      });
      done();
    });
  });

  it('getCCCDetails(): should get assigned card details', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    apiV2Service.getStats.and.returnValue(of(apiAssignedCardDetailsRes));

    const apiParams =
      '/expenses_and_ccce/stats?aggregates=count(tx_id),sum(tx_amount)&scalar=true&dimension_1_1=corporate_credit_card_bank_name,corporate_credit_card_account_number,tx_state&tx_state=' +
      'in.(COMPLETE,DRAFT)' +
      '&corporate_credit_card_account_number=not.is.null&debit=is.true&tx_org_user_id=eq.' +
      'ouX8dwsbLCLv';

    dashboardService.getCCCDetails().subscribe((res) => {
      expect(res).toEqual(expectedAssignedCCCStats);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(apiV2Service.getStats).toHaveBeenCalledOnceWith(apiParams, {});
      done();
    });
  });
});
