import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { empty, from, Observable, Subject } from 'rxjs';
import { finalize, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-my-create-report',
  templateUrl: './my-create-report.page.html',
  styleUrls: ['./my-create-report.page.scss'],
})
export class MyCreateReportPage implements OnInit {

  readyToReportEtxns$: Observable<Expense[]>
  reportTitle$: Observable<any>;
  reportTitle: string;
  homeCurrency$: Observable<string>;
  selectedTotalAmount: number = 0;
  selectedTotalTxns: number = 0;

  constructor(
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private currencyService: CurrencyService,
    private loaderService: LoaderService

  ) { }

  toggleSelectAll(value: boolean) {
    this.readyToReportEtxns$.pipe(
      map(etxns => {
        etxns.forEach(res => {
          res.isSelected = value;
        })
      })
    ).subscribe();
    this.reportTitle$.subscribe();
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

  toggleTransaction (etxn) {
    // vm.resetReportTitle();
    //vm.selectedExpensesCount = vm.etxnc.filterSelected().size();

    // if (vm.selectedExpensesCount === 0) {
    //   vm.showClearAll = false;
    // }
    //debugger;
    etxn.isSelected = !etxn.isSelected;
    this.reportTitle$.subscribe();
  };

  ionViewWillEnter() {
    const selectedTxnIds = this.activatedRoute.snapshot.params.txn_ids? JSON.parse(this.activatedRoute.snapshot.params.txn_ids) : new Array();
    //debugger;
    const queryParams = {
      tx_report_id : 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc'
    }

    this.readyToReportEtxns$ = from(this.loaderService.showLoader()).pipe(
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

              if (selectedTxnIds.length > 0) {
                if (selectedTxnIds.indexOf(etxn.tx_id) === -1) {
                  etxn.isSelected = false;
                }
              }
            });
            return etxns as Expense[];
          }),
          shareReplay()
        );
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    )
    

    // this.readyToReportEtxns$.subscribe(res=> {
    //   debugger;
    // })

      //this.getReportTitle();

      this.reportTitle$ = this.readyToReportEtxns$.pipe(
        switchMap(res => {
          let txnIds = [];
          this.selectedTotalAmount = 0;
          res.filter(etxn => {
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
            )
          } else {
            return empty().pipe(startWith(7));
          }
  
        })
      );

      this.reportTitle$.subscribe();
      this.homeCurrency$ = this.currencyService.getHomeCurrency();

      
    



  }
  
  ngOnInit() {
  }

  

}
