import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FormattedPolicyViolation } from 'src/app/core/models/formatted-policy-violation.model';
import { SplitExpenseService } from 'src/app/core/services/split-expense.service';

@Component({
  selector: 'app-split-expense-policy-violation',
  templateUrl: './split-expense-policy-violation.component.html',
  styleUrls: ['./split-expense-policy-violation.component.scss'],
})
export class SplitExpensePolicyViolationComponent implements OnInit {
  @Input() policyViolations: { [id: string]: FormattedPolicyViolation };

  @Input() missingFieldsViolations;

  transactionIDs: string[];

  form = this.fb.group({
    comments: this.fb.array([]),
  });

  isExpenseBlocked = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private splitExpenseService: SplitExpenseService
  ) {}

  get formComments() {
    return this.form.controls.comments as FormArray;
  }

  ngOnInit() {
    this.transactionIDs = [];
    Object.keys(this.policyViolations).forEach((transactionsID) => {
      const comment = this.fb.group({
        comment: [''],
      });
      this.formComments.push(comment);
      this.transactionIDs.push(transactionsID);
    });
  }

  toggleExpansion(currentTransactionID: string) {
    this.transactionIDs.forEach((transactionID) => {
      if (transactionID !== currentTransactionID) {
        this.policyViolations[transactionID].isExpanded = false;
      }
    });
    this.policyViolations[currentTransactionID].isExpanded = !this.policyViolations[currentTransactionID].isExpanded;
  }

  cancel() {
    this.modalController.dismiss({ action: 'cancel' });
  }

  continue() {
    const comments = {};
    this.transactionIDs.map((transaction, index) => {
      if (!this.policyViolations[transaction].isCriticalPolicyViolation) {
        comments[transaction] = this.form.value.comments[index].comment;
      }
    });

    this.modalController.dismiss({ action: 'continue', comments });
  }
}
