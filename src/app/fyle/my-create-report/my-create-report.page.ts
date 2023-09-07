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

@Component({
  selector: 'app-my-create-report',
  templateUrl: './my-create-report.page.html',
  styleUrls: ['./my-create-report.page.scss'],
})
export class MyCreateReportPage implements OnInit {
  @ViewChild('reportTitleInput') reportTitleInput: NgModel;

  readyToReportEtxns: Expense[];

  selectedElements: Expense[];

  reportTitle = '';

  homeCurrency$: Observable<string>;

  selectedTotalAmount = 0;

  selectedTotalTxns = 0;

  selectedTxnIds: string[];

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
    if (this.selectedTxnIds.length > 0) {
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
          const etxns = this.readyToReportEtxns?.filter((etxn) => etxn.isSelected);
          const txnIds = etxns.map((etxn) => etxn.tx_id);
          const selectedTotalAmount = etxns.reduce(
            (acc, obj) => acc + (obj.tx_skip_reimbursement ? 0 : obj.tx_amount),
            0,
          );
          this.trackingService.createFirstReport({
            Expense_Count: txnIds.length,
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

      const txnIds = this.selectedElements?.map((expense) => expense.tx_id);

      if (reportActionType === 'create_draft_report') {
        this.saveDraftReportLoading = true;
        return this.reportService
          .createDraft(report)
          .pipe(
            tap(() =>
              this.trackingService.createReport({
                Expense_Count: txnIds.length,
                Report_Value: this.selectedTotalAmount,
              }),
            ),
            switchMap((report: ReportV1) => {
              if (txnIds.length > 0) {
                return this.reportService.addTransactions(report.id, txnIds).pipe(map(() => report));
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
        this.reportService
          .create(report, txnIds)
          .pipe(
            tap(() =>
              this.trackingService.createReport({
                Expense_Count: txnIds.length,
                Report_Value: this.selectedTotalAmount,
              }),
            ),
            finalize(() => {
              this.saveReportLoading = false;
              this.router.navigate(['/', 'enterprise', 'my_reports']);

              this.refinerService.startSurvey({ actionName: 'Submit Newly Created Report' });
            }),
          )
          .subscribe(noop);
      }
    }
  }

  selectExpense(expense: Expense): void {
    const isSelectedElementsIncludesExpense = this.selectedElements.some((txn) => expense.tx_id === txn.tx_id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter((txn) => txn.tx_id !== expense.tx_id);
    } else {
      this.selectedElements.push(expense);
    }
    this.getReportTitle();
    this.isSelectedAll = this.selectedElements.length === this.readyToReportEtxns.length;
  }

  toggleSelectAll(value: boolean): void {
    if (value) {
      this.selectedElements = this.readyToReportEtxns;
    } else {
      this.selectedElements = [];
    }
    this.getReportTitle();
  }

  getVendorDetails(expense: Expense): string {
    const category = expense.tx_org_category && expense.tx_org_category.toLowerCase();
    let vendorName: string | number = expense.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = expense.tx_distance.toString();
      vendorName += ' ' + expense.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = expense.tx_num_days.toString();
      vendorName += ' Days';
    }

    return vendorName;
  }

  getReportTitle(): Subscription {
    const txnIds = this.selectedElements.map((etxn) => etxn.tx_id);
    this.selectedTotalAmount = this.selectedElements.reduce(
      (acc, obj) => acc + (obj.tx_skip_reimbursement ? 0 : obj.tx_amount),
      0,
    );

    if (this.reportTitleInput && !this.reportTitleInput.dirty) {
      return this.reportService.getReportPurpose({ ids: txnIds }).subscribe((res) => {
        this.reportTitle = res;
      });
    }
  }

  toggleTransaction(etxn: Expense): void {
    etxn.isSelected = !etxn.isSelected;
    this.getReportTitle();
  }

  checkTxnIds(): void {
    const txn_ids = this.activatedRoute.snapshot.params.txn_ids as string;
    this.selectedTxnIds = (txn_ids ? JSON.parse(txn_ids) : []) as string[];
  }

  ionViewWillEnter(): void {
    this.isSelectedAll = true;

    this.checkTxnIds();

    const queryParams = {
      tx_report_id: 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc',
      or: ['(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)'],
    };

    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() =>
          this.transactionService.getAllExpenses({ queryParams }).pipe(
            map((etxns) => {
              etxns.forEach((etxn, i) => {
                etxn.vendorDetails = this.getVendorDetails(etxn);
                etxn.showDt = true;
                if (
                  i > 0 &&
                  etxn.tx_txn_dt &&
                  etxns[i - 1].tx_txn_dt &&
                  etxn.tx_txn_dt.toDateString() === etxns[i - 1].tx_txn_dt.toDateString()
                ) {
                  etxn.showDt = false;
                }
                etxn.isSelected = true;

                if (this.selectedTxnIds.length > 0) {
                  if (this.selectedTxnIds.indexOf(etxn.tx_id) === -1) {
                    etxn.isSelected = false;
                  }
                }
              });
              return etxns;
            }),
          ),
        ),
        finalize(() => from(this.loaderService.hideLoader())),
        shareReplay(1),
      )
      .subscribe((res) => {
        this.readyToReportEtxns = res;
        this.selectedElements = this.readyToReportEtxns;
        this.getReportTitle();
      });

    this.homeCurrency$ = this.currencyService.getHomeCurrency();
  }

  ngOnInit(): void {
    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
      this.homeCurrency = homeCurrency;
    });
  }
}
