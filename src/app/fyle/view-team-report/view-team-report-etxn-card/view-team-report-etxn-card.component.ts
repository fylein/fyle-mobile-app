import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense } from 'src/app/core/models/expense.model';

@Component({
  selector: 'app-view-team-report-etxn-card',
  templateUrl: './view-team-report-etxn-card.component.html',
  styleUrls: ['./view-team-report-etxn-card.component.scss'],
})
export class ViewTeamReportEtxnCardComponent implements OnInit {

  @Input() etxn: Expense;
  @Input() prevDate: Date;

  @Output() goToTransaciton: EventEmitter<any> = new EventEmitter();

  showDate = true;
  violation: boolean;

  constructor() { }

  ngOnInit() {
    this.showDate =
      (this.etxn && (new Date(this.etxn.tx_txn_dt)).toDateString()) !== (this.prevDate && (new Date(this.prevDate)).toDateString());
    this.violation = this.etxn.tx_id &&(this.etxn.tx_manual_flag || this.etxn.tx_policy_flag) 
                    && !((typeof (this.etxn.tx_policy_amount) === 'number')
                    && this.etxn.tx_policy_amount < 0.0001);
  }

  goToTransactionClicked() {
    this.goToTransaciton.emit(this.etxn);
  }
}
