import { TestBed } from '@angular/core/testing';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import {
  apiTransactionUnreportedStatsRes,
  apiTransactionIncompleteStatsRes,
  apiReportStatsRes,
  expectedUnreportedExpStats,
  expectedIncompleteExpStats,
  expectedReportStats,
} from '../../core/test-data/dashboard.service.spec.data';
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

  it('should get UNREPORTED expense stats', (done) => {
    transactionService.getTransactionStats.and.returnValue(of(apiTransactionUnreportedStatsRes));

    const apiParams = {
      scalar: true,
      tx_state: 'in.(COMPLETE)',
      or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
      tx_report_id: 'is.null',
    };

    dashboardService.getUnreportedExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedUnreportedExpStats);
      expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', apiParams);
      done();
    });
  });

  it('should get INCOMPLETE expense stats', (done) => {
    transactionService.getTransactionStats.and.returnValue(of(apiTransactionIncompleteStatsRes));

    const apiParams = {
      scalar: true,
      tx_state: 'in.(DRAFT)',
      tx_report_id: 'is.null',
    };

    dashboardService.getIncompleteExpensesStats().subscribe((res) => {
      expect(res).toEqual(expectedIncompleteExpStats);
      expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', apiParams);
      done();
    });
  });

  it('should get Report stats', (done) => {
    reportService.getReportStats.and.returnValue(of(new StatsResponse(apiReportStatsRes)));
    const apiParams = {
      scalar: false,
      dimension_1_1: 'rp_state',
      aggregates: 'sum(rp_amount),count(rp_id)',
    };

    dashboardService.getReportsStats().subscribe((res) => {
      expect(res).toEqual(expectedReportStats);
      done();
    });
  });
});
