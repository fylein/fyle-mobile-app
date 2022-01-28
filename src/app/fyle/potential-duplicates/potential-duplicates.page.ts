import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-potential-duplicates',
  templateUrl: './potential-duplicates.page.html',
  styleUrls: ['./potential-duplicates.page.scss'],
})
export class PotentialDuplicatesPage implements OnInit {
  expense: any = {};

  constructor() {
    this.expense.txn_dt = '1643279100';
    this.expense.purpose = 'purpose';
    this.expense.vendor = 'vendor';
    this.expense.currency = 'USD';
    this.expense.amount = '100';
  }

  ngOnInit() {}
}
