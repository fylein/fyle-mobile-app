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

  readyToReportEtxnc: Observable<Expense[]>

  constructor(
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute

  ) { }

  ionViewWillEnter() {
    const selectedTxnIds = JSON.parse(this.activatedRoute.snapshot.params.txn_ids);
    //debugger;
    const queryParams = {
      tx_report_id : 'is.null',
      tx_state: 'in.(COMPLETE)'
    }

    this.transactionService.getAllExpenses({queryParams}).pipe(
      map(res => {
        if(selectedTxnIds.length > 0) {
          res.forEach(function (etxn) {
            if (selectedTxnIds.indexOf(etxn.tx_id) > -1 ) {
              etxn.isSelected = true;
            } else {
              etxn.isSelected = false;
            }
          });
        } else {
          // select all
        }
      })

    )
    // .subscribe(res=> {
    //   debugger;
    // })
  }
  
  ngOnInit() {
  }

  

}
