import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { forkJoin, from, noop, Observable, iif, of } from 'rxjs';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ReportSummaryComponent } from './report-summary/report-summary.component';
import { TrackingService } from '../../core/services/tracking.service';
import { StorageService } from '../../core/services/storage.service';
import { NgModel } from '@angular/forms';
import { getCurrencySymbol } from '@angular/common';
import { RefinerService } from 'src/app/core/services/refiner.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';

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

  constructor(
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private currencyService: CurrencyService,
    private loaderService: LoaderService,
    private router: Router,
    private popoverController: PopoverController,
    private offlineService: OfflineService,
    private orgUserSettingsService: OrgUserSettingsService,
    private trackingService: TrackingService,
    private storageService: StorageService,
    private refinerService: RefinerService,
    private orgSettingsService: OrgSettingsService
  ) {}

  cancel() {
    if (this.selectedTxnIds.length > 0) {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  async sendFirstReportCreated() {
    const isFirstReportCreated = await this.storageService.get('isFirstReportCreated');

    if (!isFirstReportCreated) {
      this.reportService.getMyReportsCount({}).subscribe(async (allReportsCount) => {
        if (allReportsCount === 0) {
          const etxns = this.readyToReportEtxns.filter((etxn) => etxn.isSelected);
          const txnIds = etxns.map((etxn) => etxn.tx_id);
          const selectedTotalAmount = etxns.reduce(
            (acc, obj) => acc + (obj.tx_skip_reimbursement ? 0 : obj.tx_amount),
            0
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

  ctaClickedEvent(reportActionType) {
    this.showReportNameError = false;
    if (this.reportTitle && this.reportTitle?.trim().length <= 0) {
      this.showReportNameError = true;
      return;
    }

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
            })
          ),
          switchMap((report) => {
            if (txnIds.length > 0) {
              return this.reportService.addTransactions(report.id, txnIds).pipe(map(() => report));
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
        .create(report, txnIds)
        .pipe(
          tap(() =>
            this.trackingService.createReport({
              Expense_Count: txnIds.length,
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

  async showReportSummaryPopover(action) {
    this.showReportNameError = false;
    if (this.reportTitle.trim().length <= 0) {
      this.showReportNameError = true;
      return;
    }
    const homeCurrency = await this.homeCurrency$.toPromise();

    const reportSummaryPopover = await this.popoverController.create({
      component: ReportSummaryComponent,
      componentProps: {
        selectedTotalAmount: this.selectedTotalAmount,
        selectedTotalTxns: this.selectedTotalTxns,
        homeCurrency,
        purpose: this.reportTitle,
        action,
      },
      cssClass: 'dialog-popover',
    });

    await reportSummaryPopover.present();

    const { data } = await reportSummaryPopover.onWillDismiss();

    if (data && data.saveReport) {
      this.sendFirstReportCreated();

      const report = {
        purpose: this.reportTitle,
        source: 'MOBILE',
        type: 'EXPENSE',
      };
      const etxns = this.readyToReportEtxns.filter((etxn) => etxn.isSelected);
      const txnIds = etxns.map((etxn) => etxn.tx_id);
      this.selectedTotalAmount = etxns.reduce((acc, obj) => acc + (obj.tx_skip_reimbursement ? 0 : obj.tx_amount), 0);

      if (action === 'draft') {
        this.saveDraftReportLoading = true;
        this.reportService
          .createDraft(report)
          .pipe(
            tap(() => {
              this.trackingService.createReport({
                Expense_Count: txnIds.length,
                Report_Value: this.selectedTotalAmount,
              });
            }),
            switchMap((res) =>
              iif(() => txnIds.length > 0, this.reportService.addTransactions(res.id, txnIds), of(null))
            ),
            finalize(() => {
              this.saveDraftReportLoading = false;
              this.router.navigate(['/', 'enterprise', 'my_reports']);
            })
          )
          .subscribe(noop);
      } else {
        this.saveReportLoading = true;
        this.selectedTotalAmount = etxns.reduce((acc, obj) => acc + (obj.tx_skip_reimbursement ? 0 : obj.tx_amount), 0);
        this.reportService
          .create(report, txnIds)
          .pipe(
            tap(() =>
              this.trackingService.createReport({
                Expense_Count: txnIds.length,
                Report_Value: this.selectedTotalAmount,
              })
            ),
            finalize(() => {
              this.saveReportLoading = false;
              this.router.navigate(['/', 'enterprise', 'my_reports']);
            })
          )
          .subscribe(noop);
      }
    }
  }

  selectExpense(expense: Expense) {
    const isSelectedElementsIncludesExpense = this.selectedElements.some((txn) => expense.tx_id === txn.tx_id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter((txn) => txn.tx_id !== expense.tx_id);
    } else {
      this.selectedElements.push(expense);
    }
    this.getReportTitle();
    this.isSelectedAll = this.selectedElements.length === this.readyToReportEtxns.length;
  }

  toggleSelectAll(value: boolean) {
    if (value) {
      this.selectedElements = this.readyToReportEtxns;
    } else {
      this.selectedElements = [];
    }
    this.getReportTitle();
  }

  getVendorDetails(expense) {
    const category = expense.tx_org_category && expense.tx_org_category.toLowerCase();
    let vendorName = expense.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = expense.tx_distance;
      vendorName += ' ' + expense.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = expense.tx_num_days;
      vendorName += ' Days';
    }

    return vendorName;
  }

  getReportTitle() {
    const txnIds = this.selectedElements.map((etxn) => etxn.tx_id);
    this.selectedTotalAmount = this.selectedElements.reduce(
      (acc, obj) => acc + (obj.tx_skip_reimbursement ? 0 : obj.tx_amount),
      0
    );

    if (this.reportTitleInput && !this.reportTitleInput.dirty && txnIds.length > 0) {
      return this.reportService.getReportPurpose({ ids: txnIds }).subscribe((res) => {
        this.reportTitle = res;
      });
    }
  }

  toggleTransaction(etxn) {
    etxn.isSelected = !etxn.isSelected;
    this.getReportTitle();
  }

  ionViewWillEnter() {
    this.isSelectedAll = true;
    this.selectedTxnIds = this.activatedRoute.snapshot.params.txn_ids
      ? JSON.parse(this.activatedRoute.snapshot.params.txn_ids)
      : [];
    const queryParams = {
      tx_report_id: 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc',
      or: ['(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)'],
    };

    const orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    const orgUserSettings$ = this.orgUserSettingsService.get();

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
            })
          )
        ),
        finalize(() => from(this.loaderService.hideLoader())),
        shareReplay(1)
      )
      .subscribe((res) => {
        this.readyToReportEtxns = res;
        this.selectedElements = this.readyToReportEtxns;
        this.getReportTitle();
      });

    this.homeCurrency$ = this.currencyService.getHomeCurrency();
  }

  addExpense() {
    this.router.navigate(['/', 'enterprise', 'add_edit_expense']);
  }

  ngOnInit() {
    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
      this.homeCurrency = homeCurrency;
    });
  }
}
