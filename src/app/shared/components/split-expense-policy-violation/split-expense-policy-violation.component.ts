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

  @Input() isPartOfReport;

  transactionIDs: string[];

  missingFieldsIDs: string[];

  form = this.fb.group({
    comments: this.fb.array([]),
  });

  isSplitBlocked = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private splitExpenseService: SplitExpenseService
  ) {}

  get formComments() {
    return this.form.controls.comments as FormArray;
  }

  hidePolicyViolations() {
    this.transactionIDs.forEach((transactionID) => {
      if (this.missingFieldsViolations && this.missingFieldsViolations[transactionID]?.isMissingFields) {
        delete this.policyViolations[transactionID];
        this.isSplitBlocked = true;
      }
    });
  }

  checkIfSplitBlocked() {
    this.transactionIDs.forEach((transactionID) => {
      if (this.policyViolations[transactionID]?.isCriticalPolicyViolation && this.isPartOfReport) {
        this.isSplitBlocked = true;
      }
    });

    this.missingFieldsIDs.forEach((fieldID) => {
      if (this.missingFieldsViolations[fieldID]?.isMissingFields) {
        this.isSplitBlocked = true;
      }
    });
  }

  ngOnInit() {
    this.transactionIDs = [];
    this.missingFieldsIDs = [];
    Object.keys(this.policyViolations).forEach((transactionsID) => {
      const comment = this.fb.group({
        comment: [''],
      });
      this.formComments.push(comment);
      this.transactionIDs.push(transactionsID);
    });

    if (this.missingFieldsViolations) {
      Object.keys(this.missingFieldsViolations).forEach((missingFieldID) => {
        this.missingFieldsIDs.push(missingFieldID);
      });
    }

    this.hidePolicyViolations();
    this.checkIfSplitBlocked();
  }

  toggleExpansion(currentTransactionID: string) {
    this.transactionIDs.forEach((transactionID) => {
      if (transactionID !== currentTransactionID && this.policyViolations[transactionID]) {
        this.policyViolations[transactionID].isExpanded = false;
      }
    });

    // toggle all missing fields to false if any policy violation is expanded
    this.missingFieldsIDs.forEach((fieldID) => {
      this.missingFieldsViolations[fieldID].isExpanded = false;
    });

    this.policyViolations[currentTransactionID].isExpanded = !this.policyViolations[currentTransactionID].isExpanded;
  }

  toggleMissingFieldsExpansion(currentFieldID: string) {
    this.missingFieldsIDs.forEach((fieldID) => {
      if (fieldID !== currentFieldID) {
        this.missingFieldsViolations[fieldID].isExpanded = false;
      }
    });

    // toggle all policy violations to false if any missing field is expanded
    this.transactionIDs.forEach((transactionID) => {
      if (this.policyViolations[transactionID]) {
        this.policyViolations[transactionID].isExpanded = false;
      }
    });

    this.missingFieldsViolations[currentFieldID].isExpanded = !this.missingFieldsViolations[currentFieldID].isExpanded;
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
