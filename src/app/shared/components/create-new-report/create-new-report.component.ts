import { getCurrencySymbol } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { noop, Observable, of } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { ExpenseFieldsMap } from 'src/app/core/models/v1/expense-fields-map.model';
import { OfflineService } from 'src/app/core/services/offline.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-create-new-report',
  templateUrl: './create-new-report.component.html',
  styleUrls: ['./create-new-report.component.scss'],
})
export class CreateNewReportComponent implements OnInit {

  @Input() selectedExpensesToReport: Expense[];
  expenseFields$: Observable<Partial<ExpenseFieldsMap>>;
  selectedElements: Expense[];
  selectedTotalAmount = 0;
  @ViewChild('reportTitleInput') reportTitleInput: NgModel;
  reportTitle: string;
  submitReportLoader = false;
  saveDraftReportLoader = false;
  homeCurrency: string;
  homeCurrencySymbol: string;

  constructor(
    private offlineService: OfflineService,
    private modalController: ModalController,
    private reportService: ReportService,
    private trackingService: TrackingService
  ) {
    
  }

  getReportTitle() {
    const txnIds = this.selectedElements.map(etxn => etxn.tx_id);
    this.selectedTotalAmount = this.selectedElements.reduce((acc, obj) => acc + (obj.tx_skip_reimbursement ? 0 : obj.tx_amount), 0);

    if (this.reportTitleInput && !this.reportTitleInput.dirty && txnIds.length > 0) {
      return this.reportService.getReportPurpose({ids: txnIds}).subscribe(res => {
        this.reportTitle = res;
      });
    }
  }

  ngOnInit() {
    this.expenseFields$ = this.offlineService.getExpenseFieldsMap();
    this.selectedElements = this.selectedExpensesToReport;
    this.offlineService.getHomeCurrency().subscribe((homeCurrency) => {
      this.homeCurrency = homeCurrency;
      this.homeCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
    });
  }

  ionViewWillEnter() {
    this.getReportTitle();
  }

  selectExpense(expense: Expense) {
    const isSelectedElementsIncludesExpense = this.selectedElements.some(txn => expense.tx_id === txn.tx_id);
    if (isSelectedElementsIncludesExpense) {
      this.selectedElements = this.selectedElements.filter(txn => txn.tx_id !== expense.tx_id);
    } else {
      this.selectedElements.push(expense);
    }
    this.getReportTitle();
  }

  toggleSelectAll(value) {
    if (value) {
      this.selectedElements =  this.selectedExpensesToReport;
    } else {
      this.selectedElements = [];
    }
    this.getReportTitle();
  }

  closeEvent() {
    this.modalController.dismiss();
  }

  ctaClickedEvent(reportActionType) {
    const report = {
      purpose: this.reportTitle,
      source: 'MOBILE',
    };

    const txnIds = this.selectedElements.map(expense => expense.tx_id);
    if (reportActionType === 'create_draft_report') {
      this.saveDraftReportLoader = true;
      return this.reportService.createDraft(report).pipe(
        tap(() => this.trackingService.createReport({Asset: 'Mobile', Expense_Count: txnIds.length, Report_Value: this.selectedTotalAmount})),
        switchMap((report) => {
          if (txnIds.length > 0) {
            return this.reportService.addTransactions(report.id, txnIds).pipe(map(() => report));
          } else {
            return of(report);
          }
        }),
        finalize(() => {
         this.saveDraftReportLoader = false;
        })
      ).subscribe((report => {
        this.modalController.dismiss({
          report,
          message: 'Expenses added to a new report'
        });
      }));
    } else {
      this.submitReportLoader = true;
      this.reportService.create(report, txnIds).pipe(
        tap(() => this.trackingService.createReport({Asset: 'Mobile', Expense_Count: txnIds.length, Report_Value: this.selectedTotalAmount})),
        finalize(() => {
          this.submitReportLoader = false;
        })
      ).subscribe((report) => {
        this.modalController.dismiss({
          report,
          message: 'Expenses submitted for approval'
        });
      });
    }
  }
}
