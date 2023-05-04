import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { getCurrencySymbol } from '@angular/common';
import { PolicyService } from 'src/app/core/services/policy.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FormControl, FormGroup } from '@angular/forms';
import { FinalExpensePolicyState } from 'src/app/core/models/platform/platform-final-expense-policy-state.model';

@Component({
  selector: 'app-fy-policy-violation',
  templateUrl: './fy-policy-violation.component.html',
  styleUrls: ['./fy-policy-violation.component.scss'],
})
export class FyPolicyViolationComponent implements OnInit {
  @Input() policyViolationMessages: string[];

  @Input() policyAction: FinalExpensePolicyState;

  @Input() showComment = true;

  @Input() showCTA = true;

  @Input() showHeader = true;

  @Input() showDragBar = true;

  @Input() showCloseIcon = false;

  form: FormGroup;

  isExpenseFlagged = false;

  isPrimaryApproverSkipped = false;

  needAdditionalApproval = false;

  isExpenseCapped = false;

  approverEmailsRequiredMsg: string;

  cappedAmountString: string;

  constructor(
    private modalController: ModalController,
    private policyService: PolicyService,
    private utilityService: UtilityService
  ) {}

  constructAdditionalApproverAction() {
    if (this.needAdditionalApproval) {
      let emails = [];
      this.policyAction.run_summary.forEach((summary: string) => {
        if (summary.startsWith('expense will need approval from')) {
          emails = this.utilityService.getEmailsFromString(summary);
        }
      });

      if (emails && emails.length > 0) {
        this.approverEmailsRequiredMsg = this.policyService.getApprovalString(emails);
      }
    }
  }

  constructCappingAction() {
    if (this.isExpenseCapped) {
      let cappedAmountMatches = [];
      this.policyAction.run_summary.forEach((summary: string) => {
        if (summary.startsWith('expense will be capped to')) {
          cappedAmountMatches = this.utilityService.getAmountWithCurrencyFromString(summary);
        }
      });

      if (cappedAmountMatches && cappedAmountMatches.length > 0) {
        const cappedAmount = cappedAmountMatches[1];
        if (cappedAmount) {
          const cappedAmountSplit = cappedAmount.split(' ');
          this.cappedAmountString =
            'Expense will be capped to ' + getCurrencySymbol(cappedAmountSplit[0], 'wide', 'en') + cappedAmountSplit[1];
        }
      }
    }
  }

  ngOnInit() {
    this.form = new FormGroup({
      comment: new FormControl(''),
    });
    if (this.policyAction) {
      this.isExpenseFlagged = this.policyAction.flag;
      this.isPrimaryApproverSkipped = this.policyAction.remove_employee_approver1;
      this.needAdditionalApproval = this.policyAction.add_approver_user_ids.length > 0;
      this.isExpenseCapped = this.policyAction.amount !== null;

      this.constructAdditionalApproverAction();

      this.constructCappingAction();
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  continue() {
    this.modalController.dismiss({
      comment: this.form.value.comment,
    });
  }
}
