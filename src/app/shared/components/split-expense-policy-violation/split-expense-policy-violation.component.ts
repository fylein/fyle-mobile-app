/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, Input, OnInit, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { FilteredSplitPolicyViolations } from 'src/app/core/models/filtered-split-policy-violations.model';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { NgClass, CurrencyPipe, KeyValuePipe } from '@angular/common';
import { FyPolicyViolationComponent } from '../fy-policy-violation/fy-policy-violation.component';
import { FyCriticalPolicyViolationComponent } from '../fy-critical-policy-violation/fy-critical-policy-violation.component';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';

@Component({
  selector: 'app-split-expense-policy-violation',
  templateUrl: './split-expense-policy-violation.component.html',
  styleUrls: ['./split-expense-policy-violation.component.scss'],
  imports: [
    CurrencyPipe,
    FormsModule,
    FyCriticalPolicyViolationComponent,
    FyCurrencyPipe,
    FyPolicyViolationComponent,
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    KeyValuePipe,
    MatIcon,
    NgClass,
    ReactiveFormsModule,
    TranslocoPipe
  ],
})
export class SplitExpensePolicyViolationComponent implements OnInit {
  private modalController = inject(ModalController);

  private fb = inject(UntypedFormBuilder);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() policyViolations: { [id: number]: FilteredSplitPolicyViolations };

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isPartOfReport: boolean;

  transactionIDs: string[];

  form = this.fb.group({
    comments: this.fb.array([]),
  });

  isSplitBlocked = false;

  splitExpenseModalHeader: string;

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
      this.splitExpenseModalHeader = this.translocoService.translate(
        'splitExpensePolicyViolation.expenseCannotBeSplit',
      );
    }
  }

  ngOnInit(): void {
    this.splitExpenseModalHeader = this.translocoService.translate('splitExpensePolicyViolation.policyViolationFound');
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
