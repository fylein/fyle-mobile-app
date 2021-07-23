import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-split-expense-status',
  templateUrl: './split-expense-status.component.html',
  styleUrls: ['./split-expense-status.component.scss'],
})
export class SplitExpenseStatusComponent implements OnInit {
  isSplitSuccessful = false;

  constructor(
    private router: Router,
    private popoverController: PopoverController
  ) { }

  goToMyExpenses() {
    this.popoverController.dismiss();
  }

  retry() {
    this.popoverController.dismiss();
  }

  ngOnInit() {}

}
