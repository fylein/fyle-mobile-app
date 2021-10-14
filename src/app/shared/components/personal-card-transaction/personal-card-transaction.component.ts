import { getCurrencySymbol } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-personal-card-transaction',
  templateUrl: './personal-card-transaction.component.html',
  styleUrls: ['./personal-card-transaction.component.scss'],
})
export class PersonalCardTransactionComponent implements OnInit {
  @Input() description;

  @Input() amount;

  @Input() currency;

  @Input() type;

  @Input() txnDate;

  @Input() previousTxnDate;

  showDt = true;

  constructor() {}

  ngOnInit(): void {
    this.currency = getCurrencySymbol(this.currency, 'wide');
    const currentDate = new Date(this.txnDate).toDateString();
    const previousDate = new Date(this.previousTxnDate).toDateString();
    this.showDt = currentDate !== previousDate;
  }
}
