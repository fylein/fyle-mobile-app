import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { TransactionService } from 'src/app/core/services/transaction.service';

@Component({
  selector: 'app-my-create-report',
  templateUrl: './my-create-report.page.html',
  styleUrls: ['./my-create-report.page.scss'],
})
export class MyCreateReportPage implements OnInit {

  readyToReportEtxns$: Observable<Expense[]>

  constructor(
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute

  ) { }

  getReportTitle() {
    
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
  };

  ionViewWillEnter() {
    const selectedTxnIds = this.activatedRoute.snapshot.params.txn_ids? JSON.parse(this.activatedRoute.snapshot.params.txn_ids) : new Array();
    //debugger;
    const queryParams = {
      tx_report_id : 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc'
    }

    this.readyToReportEtxns$ = this.transactionService.getAllExpenses({queryParams}).pipe(
      map(etxns => {
        // if(selectedTxnIds.length > 0) {
        //   res.forEach(function (etxn) {
        //     if (selectedTxnIds.indexOf(etxn.tx_id) > -1 ) {
        //       etxn.isSelected = true;
        //     } else {
        //       etxn.isSelected = false;
        //     }
        //   });
        // } else {
        //   // select all
        // }
        etxns.forEach((etxn, i) => {
          etxn.vendorDetails = this.getVendorDetails(etxn);
          etxn.showDt = true;
          if (i > 0 && (etxn.tx_txn_dt === etxns[i-1].tx_txn_dt)) {
            etxn.showDt = false;
          }
          etxn.isSelected = true;

          if (selectedTxnIds.length > 0) {
            if (selectedTxnIds.indexOf(etxn.tx_id) === -1 ) {
              etxn.isSelected = false;
            }
          }

        })

        return etxns as Expense[]
      })

    )

    // this.readyToReportEtxns$.subscribe(res=> {
    //   debugger;
    // })

    // this.readyToReportEtxns$.pipe(
    //   map(res=> {
    //     debugger;
    //   })
    // )
    // .subscribe()



  }
  
  ngOnInit() {
  }

  

}
