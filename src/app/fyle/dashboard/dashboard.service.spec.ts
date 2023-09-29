import { TestBed } from '@angular/core/testing';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { DashboardService } from './dashboard.service';
import {
  expectedUnreportedExpStats,
  expectedIncompleteExpStats,
  expectedEmptyStats,
} from '../../core/mock-data/stats.data';
import { expectedReportStats, expectedEmptyReportStats } from '../../core/mock-data/report-stats.data';
import {
  apiTxnUnreportedStatsRes,
  apiTxnIncompleteStatsRes,
  apiTxnUnreportedStatsEmptyRes,
  apiTxnIncompleteStatsEmptyRes,
  apiIncompleteParams,
  apiUnreportedParams,
} from '../../core/mock-data/stats-dimension-response.data';
import {
  apiReportStatsRes,
  apiReportStatsEmptyRes,
  apiAssignedCardDetailsRes,
} from '../../core/mock-data/stats-response.data';
import { expectedAssignedCCCStats } from '../../core/mock-data/ccc-expense.details.data';
import { of } from 'rxjs';
import { StatsResponse } from 'src/app/core/models/v2/stats-response.model';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let reportService: jasmine.SpyObj<ReportService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let cccExpenseService: CorporateCreditCardExpenseService;
  let authService: jasmine.SpyObj<AuthService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;

  const apiReportStatParams: Partial<StatsResponse> = {
    scalar: false,
    dimension_1_1: 'rp_state',
    aggregates: 'sum(rp_amount),count(rp_id)',
  };

  beforeEach(() => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getReportStats']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getTransactionStats']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get', 'getStats']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DashboardService,
        CorporateCreditCardExpenseService,
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiV2ServiceSpy,
        },
      ],
    });
    dashboardService = TestBed.inject(DashboardService);
    cccExpenseService = TestBed.inject(CorporateCreditCardExpenseService);
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
  });

  it('should be created', () => {
    expect(dashboardService).toBeTruthy();
  });

  it('getUnreportedExpensesStats(): should get UNREPORTED expense stats', (done) => {
    transactionService.getTransactionStats.and.returnValue(of(apiTxnUnreportedStatsRes));

    dashboardService.getUnreportedExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedUnreportedExpStats);
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(1);
      expect(transactionService.getTransactionStats).toHaveBeenCalledWith(
        'count(tx_id),sum(tx_amount)',
        apiUnreportedParams
      );
      done();
    });
  });

  it('getUnreportedExpensesStats(): should return empty or undefined for UNREPORTED expense stats as api sends empty list for aggregates', (done) => {
    transactionService.getTransactionStats.and.returnValue(of(apiTxnUnreportedStatsEmptyRes));

    dashboardService.getUnreportedExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedEmptyStats);
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(1);
      expect(transactionService.getTransactionStats).toHaveBeenCalledWith(
        'count(tx_id),sum(tx_amount)',
        apiUnreportedParams
      );
      done();
    });
  });

  it('getUnreportedExpensesStats(): should return empty or undefined for UNREPORTED expense stats as api sends empty values as response', (done) => {
    transactionService.getTransactionStats.and.returnValue(of([]));

    dashboardService.getUnreportedExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedEmptyStats);
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(1);
      expect(transactionService.getTransactionStats).toHaveBeenCalledWith(
        'count(tx_id),sum(tx_amount)',
        apiUnreportedParams
      );
      done();
    });
  });

  it('getIncompleteExpenseStats(): should get INCOMPLETE expense stats', (done) => {
    transactionService.getTransactionStats.and.returnValue(of(apiTxnIncompleteStatsRes));

    dashboardService.getIncompleteExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedIncompleteExpStats);
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(1);
      expect(transactionService.getTransactionStats).toHaveBeenCalledWith(
        'count(tx_id),sum(tx_amount)',
        apiIncompleteParams
      );
      done();
    });
  });

  it('getIncompleteExpenseStats(): should return empty or undefined for INCOMPLETE expense stats as api sends empty list for aggregates', (done) => {
    transactionService.getTransactionStats.and.returnValue(of(apiTxnIncompleteStatsEmptyRes));

    dashboardService.getIncompleteExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedEmptyStats);
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(1);
      expect(transactionService.getTransactionStats).toHaveBeenCalledWith(
        'count(tx_id),sum(tx_amount)',
        apiIncompleteParams
      );
      done();
    });
  });

  it('getIncompleteExpenseStats(): should return empty or undefined for INCOMPLETE expense stats as api sends empty values as response', (done) => {
    transactionService.getTransactionStats.and.returnValue(of([]));

    dashboardService.getIncompleteExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedEmptyStats);
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(1);
      expect(transactionService.getTransactionStats).toHaveBeenCalledWith(
        'count(tx_id),sum(tx_amount)',
        apiIncompleteParams
      );
      done();
    });
  });

  it('getReportStats(): should get Report stats', (done) => {
    reportService.getReportStats.and.returnValue(of(new StatsResponse(apiReportStatsRes)));

    dashboardService.getReportsStats().subscribe((res) => {
      expect(res).toEqual(expectedReportStats);
      expect(reportService.getReportStats).toHaveBeenCalledTimes(1);
      expect(reportService.getReportStats).toHaveBeenCalledWith(apiReportStatParams);
      done();
    });
  });

  it('getReportStats(): should return empty response as various report stats data is empty', (done) => {
    reportService.getReportStats.and.returnValue(of(new StatsResponse(apiReportStatsEmptyRes)));

    dashboardService.getReportsStats().subscribe((res) => {
      expect(res).toEqual(expectedEmptyReportStats);
      expect(reportService.getReportStats).toHaveBeenCalledTimes(1);
      expect(reportService.getReportStats).toHaveBeenCalledWith(apiReportStatParams);
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
