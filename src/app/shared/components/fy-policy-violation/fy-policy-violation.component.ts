import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { getCurrencySymbol } from '@angular/common';

@Component({
  selector: 'app-fy-policy-violation',
  templateUrl: './fy-policy-violation.component.html',
  styleUrls: ['./fy-policy-violation.component.scss'],
})
export class FyPolicyViolationComponent implements OnInit {
  @Input() policyViolationMessages = [];

  @Input() policyActionDescription = '';

  @Input() comment = '';

  isExpenseFlagged: boolean;

  isPrimaryApproverSkipped: boolean;

  needAdditionalApproval: boolean;

  isExpenseCapped: boolean;

  additionalApprovalString: string;

  cappedAmountString: string;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.policyActionDescription =
      'The policy violation will trigger the following action(s): expense will be flagged for verification and approval, primary approver will be skipped, expense will need additional approval from dimple.kh@fyle.in, aiyush.dhar@fyle.in, expense will be capped to USD 100.3';

    if (this.policyActionDescription) {
      if (this.policyActionDescription.toLowerCase().includes('expense will be flagged')) {
        this.isExpenseFlagged = true;
      }
      if (this.policyActionDescription.toLowerCase().includes('primary approver will be skipped')) {
        this.isPrimaryApproverSkipped = true;
      }
      if (this.policyActionDescription.toLowerCase().includes('expense will need additional approval from')) {
        this.needAdditionalApproval = true;
        const emails = this.policyActionDescription.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
        if (emails?.length > 0) {
          this.additionalApprovalString = 'Expense will need additional approval from ';
          let index = 0;
          emails.forEach((email) => {
            this.additionalApprovalString += '<b>' + email + '</b>';
            if (index < emails.length - 1) {
              this.additionalApprovalString += ', ';
            }
            index += 1;
          });
        }
      }
      if (this.policyActionDescription.toLowerCase().includes('expense will be capped to')) {
        this.isExpenseCapped = true;
        const cappedAmount = this.policyActionDescription.match(/capped to ([a-zA-Z]{1,3} \d+)/i)[1];
        const cappedAmountSplit = cappedAmount.split(' ');
        this.cappedAmountString =
          'Expense will be capped to ' + getCurrencySymbol(cappedAmountSplit[0], 'wide', 'en') + cappedAmountSplit[1];
      }
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  continue() {
    this.modalController.dismiss({
      comment: this.comment,
    });
  }
}
