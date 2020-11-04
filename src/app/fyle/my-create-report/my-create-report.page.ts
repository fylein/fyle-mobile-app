import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { BehaviorSubject, empty, from, Observable, Subject } from 'rxjs';
import { finalize, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ReportSummaryComponent } from './report-summary/report-summary.component';


@Component({
  selector: 'app-my-create-report',
  templateUrl: './my-create-report.page.html',
  styleUrls: ['./my-create-report.page.scss'],
})
export class MyCreateReportPage implements OnInit {

  readyToReportEtxns: Expense[];
  reportTitle: string;
  homeCurrency$: Observable<string>;
  selectedTotalAmount: number = 0;
  selectedTotalTxns: number = 0;
  selectedTxnIds: string[];

  constructor(
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private currencyService: CurrencyService,
    private loaderService: LoaderService,
    private router: Router,
    private popoverController: PopoverController

  ) { }

  cancel() {
    if (this.selectedTxnIds.length > 0) {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  };

  async showReportSummaryPopover(action) {
    const reportSummaryPopover = await this.popoverController.create({
      component: ReportSummaryComponent,
      componentProps: {
        selectedTotalAmount: this.selectedTotalAmount,
        selectedTotalTxns: this.selectedTotalTxns,
        homeCurrency$: this.homeCurrency$,
        purpose: this.reportTitle,
        action: action
      },
      cssClass: 'dialog-popover'
    });

    await reportSummaryPopover.present();

    const { data } = await reportSummaryPopover.onWillDismiss();

    if (data && data.saveReport) {
      let report = {
        purpose: this.reportTitle,
        source: 'MOBILE'
      }
      let txnIds = [];
      this.readyToReportEtxns.filter(etxn => {
        if (etxn.isSelected) {
          txnIds.push(etxn.tx_id);
          this.selectedTotalAmount = this.selectedTotalAmount + etxn.tx_amount;
        }
      });

      if (action === 'draft') {
        this.reportService.createDraft(report).pipe(
          map(res => {
            return this.reportService.addTransactions(res.id, txnIds).pipe(
              finalize(() => {
                this.router.navigate(['/', 'enterprise', 'my_reports']);
              })
            ).subscribe()
          }),
        ).subscribe()
      } else {
        this.reportService.create(report, txnIds).pipe(
          finalize(() => {
            this.router.navigate(['/', 'enterprise', 'my_reports']);
          })
        ).subscribe()
      }
      
    }
  }


  toggleSelectAll(value: boolean) {
    this.readyToReportEtxns.forEach(res => {
      res.isSelected = value;
    });
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
    let txnIds = [];
    this.selectedTotalAmount = 0;
    this.readyToReportEtxns.filter(etxn => {
      if (etxn.isSelected) {
        txnIds.push(etxn.tx_id);
        this.selectedTotalAmount = this.selectedTotalAmount + etxn.tx_amount;
      }
    });
    this.selectedTotalTxns = txnIds.length;

    if (txnIds.length > 0) {  
      return this.reportService.getReportPurpose({ids: txnIds}).pipe(
        map(res => {
          this.reportTitle = res;
          return this.reportTitle;
        })
      ).subscribe()
    } else {
      return empty().pipe(startWith('')).subscribe();
    }
  }

  toggleTransaction (etxn) {
    etxn.isSelected = !etxn.isSelected;
    this.getReportTitle();
  };

  ionViewWillEnter() {
    this.selectedTxnIds = this.activatedRoute.snapshot.params.txn_ids? JSON.parse(this.activatedRoute.snapshot.params.txn_ids) : new Array();
    const queryParams = {
      tx_report_id : 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc'
    }

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getAllExpenses({ queryParams }).pipe(
          map(etxns => {
            etxns.forEach((etxn, i) => {
              etxn.vendorDetails = this.getVendorDetails(etxn);
              etxn.showDt = true;
              if (i > 0 && (etxn.tx_txn_dt === etxns[i - 1].tx_txn_dt)) {
                etxn.showDt = false;
              }
              etxn.isSelected = true;

              if (this.selectedTxnIds.length > 0) {
                if (this.selectedTxnIds.indexOf(etxn.tx_id) === -1) {
                  etxn.isSelected = false;
                }
              }
            });
            this.readyToReportEtxns = etxns;
            this.getReportTitle();
          }),
        );
      }),finalize(() => from(this.loaderService.hideLoader())),
      shareReplay()
    ).subscribe()
    
    this.homeCurrency$ = this.currencyService.getHomeCurrency();
  }
  
  ngOnInit() {
    // Todo: Support for select trip request during create report
  }

  

}
