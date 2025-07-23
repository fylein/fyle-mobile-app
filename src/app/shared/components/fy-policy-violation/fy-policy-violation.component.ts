import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { getCurrencySymbol } from '@angular/common';
import { PolicyService } from 'src/app/core/services/policy.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinalExpensePolicyState } from 'src/app/core/models/platform/platform-final-expense-policy-state.model';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { PolicyViolationRuleComponent } from '../policy-violation-rule/policy-violation-rule.component';
import { PolicyViolationActionComponent } from './policy-violation-action/policy-violation-action.component';

@Component({
    selector: 'app-fy-policy-violation',
    templateUrl: './fy-policy-violation.component.html',
    styleUrls: ['./fy-policy-violation.component.scss'],
    imports: [
        MatIcon,
        PolicyViolationRuleComponent,
        PolicyViolationActionComponent,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        TranslocoPipe,
    ],
})
export class FyPolicyViolationComponent implements OnInit {
  @Input() policyViolationMessages: string[];

  @Input() policyAction: FinalExpensePolicyState;

  @Input() showComment = true;

  @Input() showCTA = true;

  @Input() showHeader = true;

  @Input() showDragBar = true;

  @Input() showCloseIcon = false;

  form: UntypedFormGroup;

  isExpenseFlagged = false;

  isPrimaryApproverSkipped = false;

  needAdditionalApproval = false;

  isExpenseCapped = false;

  approverEmailsRequiredMsg: string;

  cappedAmountString: string;

  constructor(
    private modalController: ModalController,
    private policyService: PolicyService,
    private utilityService: UtilityService,
    private translocoService: TranslocoService
  ) {}

  constructAdditionalApproverAction(): void {
    if (this.needAdditionalApproval) {
      let emails = [];
      this.policyAction.run_summary.forEach((summary: string) => {
        if (summary.startsWith('expense will need approval from')) {
          emails = this.utilityService.getEmailsFromString(summary);
        }
      });

      if (emails && emails.length > 0) {
        this.approverEmailsRequiredMsg = this.policyService.getApprovalString(emails as string[]);
      }
    }
  }

  constructCappingAction(): void {
    if (this.isExpenseCapped) {
      let cappedAmountMatches = [];
      this.policyAction.run_summary.forEach((summary: string) => {
        if (summary.startsWith('expense will be capped to')) {
          cappedAmountMatches = this.utilityService.getAmountWithCurrencyFromString(summary);
        }
      });

      if (cappedAmountMatches && cappedAmountMatches.length > 0) {
        const cappedAmount = cappedAmountMatches[1] as string;
        if (cappedAmount) {
          const cappedAmountSplit = cappedAmount.split(' ');
          this.cappedAmountString = this.translocoService.translate('fyPolicyViolation.cappedTo', {
            amount: getCurrencySymbol(cappedAmountSplit[0], 'wide', 'en') + cappedAmountSplit[1],
          });
        }
      }
    }
  }

  ngOnInit(): void {
    this.form = new UntypedFormGroup({
      comment: new UntypedFormControl(''),
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

  cancel(): void {
    this.modalController.dismiss();
  }

  continue(): void {
    this.modalController.dismiss({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      comment: this.form.value.comment,
    });
  }
}
