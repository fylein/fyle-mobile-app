import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FyPolicyViolationComponent } from '../fy-policy-violation/fy-policy-violation.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FyCriticalPolicyViolationComponent } from '../fy-critical-policy-violation/fy-critical-policy-violation.component';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { UnflattenedTransaction } from 'src/app/core/models/unflattened-transaction.model';
import { PolicyDetail } from 'src/app/core/models/policy-detail.model';

@Component({
  selector: 'app-fy-policy-violation-info',
  templateUrl: './fy-policy-violation-info.component.html',
  styleUrls: ['./fy-policy-violation-info.component.scss'],
})
export class FyPolicyViolationInfoComponent implements OnInit {
  @Input() policyDetails: PolicyDetail[] | undefined;

  @Input() criticalPolicyViolated: boolean | undefined;

  @Input() expense: Expense | UnflattenedTransaction;

  policyViolations: string[] = [];

  showPolicyInfo = false;

  constructor(private modalController: ModalController, private modalProperties: ModalPropertiesService) {}

  ngOnInit(): void {
    this.policyViolations = [];
    this.policyViolations = this.policyDetails
      ?.filter((ids) => ids.run_status === 'VIOLATED_ACTION_SUCCESS')
      .map((ids) => ids.expense_policy_rule.description) || [];
    this.showPolicyInfo = this.policyViolations.length > 0 || !!this.criticalPolicyViolated;
  }

  async openPolicyViolationDetails(): Promise<void> {
    // Check if expense is unreportable based on different possible structures
    const isUnreportable =
      this.isExpenseWithUnreportable(this.expense) ||
      this.isUnflattenedTransactionWithUnreportableState(this.expense) ||
      this.isExpenseWithUnreportableState(this.expense) ||
      this.criticalPolicyViolated;

    const componentProperties = isUnreportable
      ? { criticalViolationMessages: this.policyViolations, showCTA: false, showDragBar: false, showCloseIcon: true }
      : {
          policyViolationMessages: this.policyViolations,
          showComment: false,
          showCTA: false,
          showDragBar: false,
          showCloseIcon: true,
        };
    const policyDetailsModal = await this.modalController.create({
      component: isUnreportable ? FyCriticalPolicyViolationComponent : FyPolicyViolationComponent,
      componentProps: componentProperties,
      ...this.modalProperties.getModalDefaultProperties('auto-height'),
    });

    await policyDetailsModal.present();
  }

  private isExpenseWithUnreportable(expense: Expense | UnflattenedTransaction): expense is Expense {
    return 'unreportable' in expense && expense.unreportable === true;
  }

  private isUnflattenedTransactionWithUnreportableState(expense: Expense | UnflattenedTransaction): expense is UnflattenedTransaction {
    return 'tx' in expense && expense.tx && 'state' in expense.tx && expense.tx.state === 'UNREPORTABLE';
  }

  private isExpenseWithUnreportableState(expense: Expense | UnflattenedTransaction): expense is Expense {
    return 'state' in expense && expense.state === 'UNREPORTABLE';
  }
}
