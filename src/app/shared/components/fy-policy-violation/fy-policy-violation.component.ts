import { Component, Input, OnInit, inject, input } from '@angular/core';
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
  private modalController = inject(ModalController);

  private policyService = inject(PolicyService);

  private utilityService = inject(UtilityService);

  private translocoService = inject(TranslocoService);

  readonly policyViolationMessages = input<string[]>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() policyAction: FinalExpensePolicyState;

  readonly showComment = input(true);

  readonly showCTA = input(true);

  readonly showHeader = input(true);

  readonly showDragBar = input(true);

  readonly showCloseIcon = input(false);

  form: UntypedFormGroup;

  isExpenseFlagged = false;

  isPrimaryApproverSkipped = false;

  needAdditionalApproval = false;

  isExpenseCapped = false;

  approverEmailsRequiredMsg: string;

  cappedAmountString: string;

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
