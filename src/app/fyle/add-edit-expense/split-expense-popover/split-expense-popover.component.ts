import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-split-expense-popover',
  templateUrl: './split-expense-popover.component.html',
  styleUrls: ['./split-expense-popover.component.scss'],
})
export class SplitExpensePopoverComponent implements OnInit {

  @Input() areProjectsAvailable;
  @Input() areCostCentersAvailable;

  constructor(
    private popoverController: PopoverController
  ) { }

  close() {
    this.popoverController.dismiss();
  }

  openSplitExpense(type) {
    this.popoverController.dismiss({
      type
    });
  }

  ngOnInit() {}

}
