import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-split-expense-policy-violation',
  templateUrl: './split-expense-policy-violation.component.html',
  styleUrls: ['./split-expense-policy-violation.component.scss'],
})
export class SplitExpensePolicyViolationComponent implements OnInit {
  @Input() policyViolations: any;

  transactionIDs = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    if (this.policyViolations) {
      Object.keys(this.policyViolations).forEach((transactionsID) => {
        this.transactionIDs.push(transactionsID);
      });
    }
  }

  toggleExpansion(transaction) {
    this.policyViolations[transaction].isExpanded = !this.policyViolations[transaction].isExpanded;
  }

  cancel() {
    this.modalController.dismiss();
  }

  continue() {
    this.modalController.dismiss();
  }
}
