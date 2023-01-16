import { TestBed } from '@angular/core/testing';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { expectedUnreportedExpStats, expectedIncompleteExpStats } from '../../core/mock-data/stats.data';
import { expectedReportStats } from '../../core/mock-data/report-stats.data';
import {
  apiTxnUnreportedStatsRes,
  apiTxnIncompleteStatsRes,
  apiIncompleteParams,
  apiUnreportedParams,
} from '../../core/mock-data/stats-dimension-response.data';
import { apiReportStatsRes, apiReportStatParams } from '../../core/mock-data/stats-response.data';
import { of } from 'rxjs';
import { StatsResponse } from 'src/app/core/models/v2/stats-response.model';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let reportService: jasmine.SpyObj<ReportService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let cccExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;

  beforeEach(() => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getReportStats']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getTransactionStats']);
    const cccExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getExpenseDetailsInCards',
      'getAssignedCards',
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DashboardService,
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: cccExpenseService,
          useValue: cccExpenseServiceSpy,
        },
      ],
    });
    dashboardService = TestBed.inject(DashboardService);
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
  });

  it('should be created', () => {
    expect(dashboardService).toBeTruthy();
  });

  it('getUnreportedExpensesStats(): should get UNREPORTED expense stats', (done) => {
    transactionService.getTransactionStats.and.returnValue(of(apiTxnUnreportedStatsRes));

    dashboardService.getUnreportedExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedUnreportedExpStats);
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
      expect(reportService.getReportStats).toHaveBeenCalledWith(apiReportStatParams);
      done();
    });
  });
});
