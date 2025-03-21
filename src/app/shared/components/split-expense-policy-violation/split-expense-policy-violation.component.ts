/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FilteredSplitPolicyViolations } from 'src/app/core/models/filtered-split-policy-violations.model';

@Component({
  selector: 'app-split-expense-policy-violation',
  templateUrl: './split-expense-policy-violation.component.html',
  styleUrls: ['./split-expense-policy-violation.component.scss'],
})
export class SplitExpensePolicyViolationComponent implements OnInit {
  @Input() policyViolations: { [id: number]: FilteredSplitPolicyViolations };

  @Input() isPartOfReport: boolean;

  transactionIDs: string[];

  form = this.fb.group({
    comments: this.fb.array([]),
  });

  isSplitBlocked = false;

  splitExpenseModalHeader = 'Policy Violation Found';

  constructor(private modalController: ModalController, private fb: UntypedFormBuilder) {}

  get formComments(): UntypedFormArray {
    return this.form.controls.comments as UntypedFormArray;
  }

  checkIfSplitBlocked(): void {
    this.transactionIDs.forEach((transactionID) => {
      if (this.policyViolations[transactionID]?.isCriticalPolicyViolation && this.isPartOfReport) {
        this.isSplitBlocked = true;
      }
    });

    if (this.isSplitBlocked) {
      this.splitExpenseModalHeader = 'Expense cannot be split';
    }
  }

  ngOnInit(): void {
    this.transactionIDs = [];
    Object.keys(this.policyViolations).forEach((transactionsID) => {
      const comment = this.fb.group({
        comment: [''],
      });
      this.formComments.push(comment);
      this.transactionIDs.push(transactionsID);
    });

    this.checkIfSplitBlocked();
  }

  toggleExpansion(currentTransactionID: string): void {
    this.transactionIDs.forEach((transactionID) => {
      if (transactionID !== currentTransactionID && this.policyViolations[transactionID]) {
        this.policyViolations[transactionID].isExpanded = false;
      }
    });

    this.policyViolations[currentTransactionID].isExpanded = !this.policyViolations[currentTransactionID].isExpanded;
  }

  cancel(): void {
    this.modalController.dismiss({ action: 'cancel' });
  }

  continue(): void {
    const comments = {};
    this.transactionIDs.map((transaction, index) => {
      if (
        !this.policyViolations[transaction].isCriticalPolicyViolation &&
        this.policyViolations[transaction].rules?.length > 0
      ) {
        comments[transaction] = this.form.value.comments[index].comment;
      }
    });

    this.modalController.dismiss({ action: 'continue', comments });
  }
}
