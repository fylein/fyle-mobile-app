import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-my-view-report-etxn-card',
  templateUrl: './my-view-report-etxn-card.component.html',
  styleUrls: ['./my-view-report-etxn-card.component.scss'],
})
export class MyViewReportEtxnCardComponent implements OnInit {

  @Input() etxn: any;
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
