import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-split-expense',
  templateUrl: './split-expense.page.html',
  styleUrls: ['./split-expense.page.scss'],
})
export class SplitExpensePage implements OnInit {

  splitExpensesFormArray = new FormArray([]);
  fg: FormGroup;
  splitType: string;
  amount: number;
  currency: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    // this.fg = this.formBuilder.group({
    //   amount: [],
    //   currency: [],
    //   percentage: [],
    //   txn_dt: []
    // })
  }

  ionViewWillEnter() {
    const currencyObj = JSON.parse(this.activatedRoute.snapshot.params.currencyObj)
    this.splitType = this.activatedRoute.snapshot.params.splitType;


    this.amount = currencyObj && (currencyObj.orig_amount || currencyObj.amount);
    this.currency = currencyObj && (currencyObj.orig_currency || currencyObj.currency);


    let amount1 = this.amount > 0.0001 ? this.amount * 0.6 : null; // 60% split
    let amount2 = this.amount > 0.0001 ? this.amount * 0.4 : null; //40% split
    let percentage1 = this.amount ? 60 : null;
    let percentage2 = this.amount ? 40 : null;
    amount1 = amount1 ? parseFloat(amount1.toFixed(3)) : amount1;
    amount2 = amount2 ? parseFloat(amount2.toFixed(3)) : amount2;
    this.add(amount1, this.currency, percentage1, null);
    this.add(amount2, this.currency, percentage2, null);
  }

  add(amount?, currency?, percentage?, txn_dt?) {
    const fg = this.formBuilder.group({
      amount: [amount, ],
      currency: [currency, ],
      percentage: [percentage, ],
      txn_dt: [txn_dt, ]
    });

    this.splitExpensesFormArray.push(fg);
  }

  remove(index: number) {
    this.splitExpensesFormArray.removeAt(index);
  }




}
