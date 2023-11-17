import { Component, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, from, noop, of } from 'rxjs';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { ReportV1 } from 'src/app/core/models/report-v1.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { StorageService } from '../../core/services/storage.service';
import { TrackingService } from '../../core/services/tracking.service';
import { Expense as PlatformExpense } from '../../core/models/platform/v1/expense.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
@Component({
  selector: 'app-my-create-report',
  templateUrl: './my-create-report.page.html',
  styleUrls: ['./my-create-report.page.scss'],
})
export class MyCreateReportPage implements OnInit {
  @ViewChild('reportTitleInput') reportTitleInput: NgModel;

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

  constructor(
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private currencyService: CurrencyService,
    private loaderService: LoaderService,
    private router: Router,
    private trackingService: TrackingService,
    private storageService: StorageService,
    private refinerService: RefinerService,
    private expensesService: ExpensesService
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
      this.reportService.getMyReportsCount({}).subscribe(async (allReportsCount) => {
        if (allReportsCount === 0) {
          const expenses = this.readyToReportExpenses?.filter((etxn) => this.selectedElements.includes(etxn));
          const expenesIDs = expenses.map((expense) => expense.id);
          const selectedTotalAmount = expenses.reduce((acc, obj) => acc + (!obj.is_reimbursable ? 0 : obj.amount), 0);
          this.trackingService.createFirstReport({
            Expense_Count: expenesIDs.length,
            Report_Value: selectedTotalAmount,
          });
          await this.storageService.set('isFirstReportCreated', true);
        }
      });
    }
  }

  ctaClickedEvent(reportActionType): Subscription {
    this.showReportNameError = false;
    if (!this.reportTitle && this.reportTitle?.trim().length <= 0 && this.emptyInput) {
      this.showReportNameError = true;
      return;
    }

    if (!this.emptyInput) {
      const report = {
        purpose: this.reportTitle,
        source: 'MOBILE',
      };

      this.sendFirstReportCreated();

      const expenseIDs = this.selectedElements?.map((expense) => expense.id);

      if (reportActionType === 'create_draft_report') {
        this.saveDraftReportLoading = true;
        return this.reportService
          .createDraft(report)
          .pipe(
            tap(() =>
              this.trackingService.createReport({
                Expense_Count: expenseIDs.length,
                Report_Value: this.selectedTotalAmount,
              })
            ),
            switchMap((report: ReportV1) => {
              if (expenseIDs.length > 0) {
                return this.reportService.addTransactions(report.id, expenseIDs).pipe(map(() => report));
              } else {
                return of(report);
              }
            }),
            finalize(() => {
              this.saveDraftReportLoading = false;
              this.router.navigate(['/', 'enterprise', 'my_reports']);
            })
          )
          .subscribe(noop);
      } else {
        this.saveReportLoading = true;
        this.reportService
          .create(report, expenseIDs)
          .pipe(
            tap(() =>
              this.trackingService.createReport({
                Expense_Count: expenseIDs.length,
                Report_Value: this.selectedTotalAmount,
              })
            ),
            finalize(() => {
              this.saveReportLoading = false;
              this.router.navigate(['/', 'enterprise', 'my_reports']);

              this.refinerService.startSurvey({ actionName: 'Submit Newly Created Report' });
            })
          )
          .subscribe(noop);
      }
    }
  }

  selectExpense(expense: PlatformExpense): void {
    const isSelectedElementsIncludesExpense = this.selectedElements.some((ele) => expense.id === ele.id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter((ele) => ele.id !== expense.id);
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
    this.selectedTotalAmount = this.selectedElements.reduce(
      (acc, obj) => acc + (!obj.is_reimbursable ? 0 : obj.amount),
      0
    );

    if (this.reportTitleInput && !this.reportTitleInput.dirty) {
      return this.reportService.getReportPurpose({ ids: expenseIDs }).subscribe((res) => {
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

    this.checkTxnIds();

    const queryParams = {
      report_id: 'is.null',
      state: 'in.(COMPLETE)',
      order: 'spent_at.desc',
      or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
    };

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          this.expensesService.getAllExpenses({ queryParams }).pipe(
            map((etxns) => {
              etxns.forEach((etxn) => {
                if (this.selectedExpenseIDs.length > 0) {
                  if (this.selectedExpenseIDs.indexOf(etxn.id) === -1) {
                    this.selectedElements.filter((element) => element.id !== etxn.id);
                  }
                }
              });
              return etxns;
            })
          )
        ),
        finalize(() => from(this.loaderService.hideLoader())),
        shareReplay(1)
      )
      .subscribe((res) => {
        this.readyToReportExpenses = res;
        this.selectedElements = this.readyToReportExpenses;
        this.getReportTitle();
      });

    this.homeCurrency$ = this.currencyService.getHomeCurrency();
  }

  checkShowDt(expense: PlatformExpense, i: number): boolean {
    if (
      i > 0 &&
      expense.spent_at &&
      this.readyToReportExpenses[i - 1].spent_at &&
      expense.spent_at.toDateString() === this.readyToReportExpenses[i - 1].spent_at.toDateString()
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
}
