import { TestBed } from '@angular/core/testing';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

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
});
