import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { getCurrencySymbol } from '@angular/common';
import { PolicyService } from 'src/app/core/services/policy.service';
import { UtilityService } from 'src/app/core/services/utility.service';

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

  constructor(
    private modalController: ModalController,
    private policyService: PolicyService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    if (this.policyActionDescription) {
      this.isExpenseFlagged = this.policyService.isExpenseFlagged(this.policyActionDescription);
      this.isPrimaryApproverSkipped = this.policyService.isPrimaryApproverSkipped(this.policyActionDescription);
      this.needAdditionalApproval = this.policyService.needAdditionalApproval(this.policyActionDescription);
      this.isExpenseCapped = this.policyService.isExpenseCapped(this.policyActionDescription);

      if (this.needAdditionalApproval) {
        const emails = this.utilityService.getEmailsFromString(this.policyActionDescription);
        if (emails?.length > 0) {
          this.additionalApprovalString = this.getApprovalString(emails);
        }
      }

      if (this.isExpenseCapped) {
        const cappedAmountMatches = this.utilityService.getAmountWithCurrencyFromString(this.policyActionDescription);
        if (cappedAmountMatches?.length > 0) {
          const cappedAmount = cappedAmountMatches[1];
          if (cappedAmount) {
            const cappedAmountSplit = cappedAmount.split(' ');
            this.cappedAmountString =
              'Expense will be capped to ' +
              getCurrencySymbol(cappedAmountSplit[0], 'wide', 'en') +
              cappedAmountSplit[1];
          }
        }
      }
    }
  }

  getApprovalString(emails) {
    let additionalApprovalString = 'Expense will need additional approval from ';
    emails.forEach((email, index) => {
      additionalApprovalString += '<b>' + email + '</b>';
      if (index < emails.length - 1) {
        additionalApprovalString += ', ';
      }
    });
    return additionalApprovalString;
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
