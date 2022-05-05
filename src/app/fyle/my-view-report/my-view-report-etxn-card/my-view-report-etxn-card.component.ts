import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-my-view-report-etxn-card',
  templateUrl: './my-view-report-etxn-card.component.html',
  styleUrls: ['./my-view-report-etxn-card.component.scss'],
})
export class MyViewReportEtxnCardComponent implements OnInit {
  @Input() etxn: any;

  @Input() prevDate: Date;

  @Input() etxnIndex: number;

  @Output() goToTransaciton: EventEmitter<any> = new EventEmitter();

  showDate = true;

  constructor() {}

  ngOnInit() {
    this.showDate =
      (this.etxn && new Date(this.etxn.tx_txn_dt).toDateString()) !==
      (this.prevDate && new Date(this.prevDate).toDateString());
  }

  goToTransactionClicked() {
    this.goToTransaciton.emit({ etxn: this.etxn, etxnIndex: this.etxnIndex });
  }
}
