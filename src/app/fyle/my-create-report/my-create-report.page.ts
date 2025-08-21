import { Component, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, noop, of } from 'rxjs';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { StorageService } from '../../core/services/storage.service';
import { TrackingService } from '../../core/services/tracking.service';
import { Expense as PlatformExpense } from '../../core/models/platform/v1/expense.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { Report } from '../../core/models/platform/v1/report.model';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
@Component({
  selector: 'app-my-create-report',
  templateUrl: './my-create-report.page.html',
  styleUrls: ['./my-create-report.page.scss'],
  standalone: false,
})
export class MyCreateReportPage implements OnInit {
  readyToReportExpenses: PlatformExpense[];

  selectedElements: PlatformExpense[];

  reportTitle = '';

  homeCurrency$: Observable<string>;

  selectedTotalAmount = 0;

  selectedTotalTxns = 0;

  selectedExpenseIDs: string[];

  saveDraftReportLoading = false;

  saveReportLoading = false;

  showReportNameError = false;

  homeCurrency: string;

  isSelectedAll: boolean;

  emptyInput = false;

  isLoading = true;

  constructor(
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private currencyService: CurrencyService,
    private loaderService: LoaderService,
    private router: Router,
    private trackingService: TrackingService,
    private storageService: StorageService,
    private expensesService: ExpensesService,
    private orgSettingsService: OrgSettingsService,
    private spenderReportsService: SpenderReportsService,
  ) {}

  detectTitleChange(): void {
    if (!this.reportTitle && this.reportTitle === '') {
      this.emptyInput = true;
      this.showReportNameError = true;
    }
    if (this.reportTitle !== '') {
      this.emptyInput = false;
      this.showReportNameError = false;
    }
  }

  cancel(): void {
    if (this.selectedExpenseIDs.length > 0) {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  async sendFirstReportCreated(): Promise<void> {
    const isFirstReportCreated = await this.storageService.get('isFirstReportCreated');

    if (!isFirstReportCreated) {
      this.spenderReportsService.getReportsCount({}).subscribe(async (allReportsCount) => {
        if (allReportsCount === 0) {
          const expenses = this.readyToReportExpenses.filter((expense) => this.selectedElements.includes(expense));
          const expenesIDs = expenses.map((expense) => expense.id);
          const selectedTotalAmount = this.getTotalSelectedExpensesAmount(expenses);
          this.trackingService.createFirstReport({
            Expense_Count: expenesIDs.length,
            Report_Value: selectedTotalAmount,
          });
          await this.storageService.set('isFirstReportCreated', true);
        }
      });
    }
  }

  ctaClickedEvent(reportActionType: 'create_draft_report' | 'submit_report'): Subscription {
    this.showReportNameError = false;
    if (!this.reportTitle && this.reportTitle.trim().length <= 0 && this.emptyInput) {
      this.showReportNameError = true;
      return;
    }

    if (!this.emptyInput) {
      const report = {
        purpose: this.reportTitle,
        source: 'MOBILE',
      };

      this.sendFirstReportCreated();

      let expenseIDs: string[] = [];
      expenseIDs = this.selectedElements.map((expense) => expense.id);

      if (reportActionType === 'create_draft_report') {
        this.saveDraftReportLoading = true;
        return this.spenderReportsService
          .createDraft({ data: report })
          .pipe(
            tap(() =>
              this.trackingService.createReport({
                Expense_Count: expenseIDs.length,
                Report_Value: this.selectedTotalAmount,
              }),
            ),
            switchMap((report: Report) => {
              if (expenseIDs.length) {
                return this.spenderReportsService.addExpenses(report.id, expenseIDs).pipe(map(() => report));
              } else {
                return of(report);
              }
            }),
            finalize(() => {
              this.saveDraftReportLoading = false;
              this.router.navigate(['/', 'enterprise', 'my_reports']);
            }),
          )
          .subscribe(noop);
      } else {
        this.saveReportLoading = true;
        this.spenderReportsService
          .create(report, expenseIDs)
          .pipe(
            tap(() =>
              this.trackingService.createReport({
                Expense_Count: expenseIDs.length,
                Report_Value: this.selectedTotalAmount,
              }),
            ),
            finalize(() => {
              this.saveReportLoading = false;
              this.router.navigate(['/', 'enterprise', 'my_reports']);
            }),
          )
          .subscribe(noop);
      }
    }
  }

  selectExpense(expense: PlatformExpense): void {
    const isSelectedElementsIncludesExpense = this.selectedElements.some((exp) => exp.id === expense.id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter((exp) => exp.id !== expense.id);
    } else {
      this.selectedElements.push(expense);
    }
    this.getReportTitle();
    this.isSelectedAll = this.selectedElements.length === this.readyToReportExpenses.length;
  }

  toggleSelectAll(value: boolean): void {
    if (value) {
      this.selectedElements = this.readyToReportExpenses;
    } else {
      this.selectedElements = [];
    }
    this.getReportTitle();
  }

  getReportTitle(): Subscription {
    const expenseIDs = this.selectedElements.map((ele) => ele.id);
    this.selectedTotalAmount = this.getTotalSelectedExpensesAmount(this.selectedElements);

    if (!this.reportTitle) {
      return this.spenderReportsService.suggestPurpose(expenseIDs).subscribe((res) => {
        this.reportTitle = res;
      });
    }
  }

  toggleTransaction(etxn: Expense): void {
    etxn.isSelected = !etxn.isSelected;
    this.getReportTitle();
  }

  checkTxnIds(): void {
    const expenseIDs = this.activatedRoute.snapshot.params.txn_ids as string;
    this.selectedExpenseIDs = (expenseIDs ? JSON.parse(expenseIDs) : []) as string[];
  }

  ionViewWillEnter(): void {
    this.isSelectedAll = true;
    this.selectedElements = [];
    this.isLoading = true;

    this.checkTxnIds();

    const queryParams = {
      report_id: 'is.null',
      state: 'in.(COMPLETE)',
      order: 'spent_at.desc',
      or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
    };

    this.orgSettingsService
      .get()
      .pipe(
        map(
          (orgSetting) =>
            orgSetting?.corporate_credit_card_settings?.enabled && orgSetting?.pending_cct_expense_restriction?.enabled,
        ),
        switchMap((filterPendingTxn: boolean) =>
          this.expensesService.getAllExpenses({ queryParams }).pipe(
            map((expenses) => {
              if (filterPendingTxn) {
                return expenses.filter((expense) => {
                  if (filterPendingTxn && expense.matched_corporate_card_transaction_ids.length > 0) {
                    return expense.matched_corporate_card_transactions[0].status !== ExpenseTransactionStatus.PENDING;
                  } else {
                    return true;
                  }
                });
              }
              return expenses;
            }),
            map((expenses) => {
              this.selectedElements = expenses;
              expenses.forEach((expense) => {
                if (this.selectedExpenseIDs.length > 0) {
                  if (this.selectedExpenseIDs.indexOf(expense.id) === -1) {
                    this.selectedElements.filter((element) => element.id !== expense.id);
                  }
                }
              });
              return expenses;
            }),
          ),
        ),
        finalize(() => (this.isLoading = false)),
        shareReplay(1),
      )
      .subscribe((res) => {
        this.readyToReportExpenses = res;
        this.getReportTitle();
      });

    this.homeCurrency$ = this.currencyService.getHomeCurrency();
  }

  checkShowDt(expense: PlatformExpense, i: number): boolean {
    const spentAtDt = expense.spent_at;
    const prevExpenseSpentAtDt = this.readyToReportExpenses[i - 1]?.spent_at;
    if (
      i > 0 &&
      spentAtDt &&
      prevExpenseSpentAtDt &&
      spentAtDt.toDateString() === prevExpenseSpentAtDt.toDateString()
    ) {
      return false;
    }
    return true;
  }

  ngOnInit(): void {
    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
      this.homeCurrency = homeCurrency;
    });
  }

  getTotalSelectedExpensesAmount(expenses: PlatformExpense[]): number {
    return expenses.reduce((acc, obj) => acc + (!obj.is_reimbursable ? 0 : obj.amount), 0);
  }
}
