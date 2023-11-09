import { Injectable } from '@angular/core';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

@Injectable({
  providedIn: 'root',
})
export class SharedExpenseService {
  getVendorDetails(expense: Expense): string {
    const fyleCategory = expense?.category?.system_category.toLowerCase();
    let vendorDisplayName = expense.merchant;

    if (fyleCategory === 'mileage') {
      vendorDisplayName = (expense.distance || 0).toString();
      vendorDisplayName += ' ' + expense.distance_unit;
    } else if (fyleCategory === 'per diem') {
      vendorDisplayName = expense.per_diem_num_days.toString();
      if (expense.per_diem_num_days > 1) {
        vendorDisplayName += ' Days';
      } else {
        vendorDisplayName += ' Day';
      }
    }

    return vendorDisplayName;
  }

  getIsCriticalPolicyViolated(expense: Partial<Expense>): boolean {
    return typeof expense.policy_amount === 'number' && expense.policy_amount < 0.0001;
  }

  getIsDraft(expense: Partial<Expense>): boolean {
    return expense.state && expense.state === 'DRAFT';
  }

  getReportableExpenses(expenses: Partial<Expense>[]): Partial<Expense>[] {
    return expenses.filter(
      (expense) => !this.getIsCriticalPolicyViolated(expense) && !this.getIsDraft(expense) && expense.id
    );
  }

  excludeCCCExpenses(expenses: Partial<Expense>[]): Partial<Expense>[] {
    return expenses.filter((expense) => expense && expense.matched_corporate_card_transaction_ids.length > 0);
  }

  isMergeAllowed(expenses: Partial<Expense>[]): boolean {
    if (expenses.length === 2) {
      const areSomeMileageOrPerDiemExpenses = expenses.some(
        (expense) => expense.category?.system_category === 'Mileage' || expense.category?.system_category === 'Per Diem'
      );
      const areAllExpensesSubmitted = expenses.every((expense) =>
        ['APPROVER_PENDING', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(expense.state)
      );
      const areAllCCCMatchedExpenses = expenses.every(
        (expense) => expense.matched_corporate_card_transactions.length > 0
      );
      return !areSomeMileageOrPerDiemExpenses && !areAllExpensesSubmitted && !areAllCCCMatchedExpenses;
    } else {
      return false;
    }
  }

  getExpenseDeletionMessage(expensesToBeDeleted: Partial<Expense>[]): string {
    return `You are about to permanently delete ${
      expensesToBeDeleted.length === 1 ? '1 selected expense.' : expensesToBeDeleted.length + ' selected expenses.'
    }`;
  }

  getCCCExpenseMessage(expensesToBeDeleted: Partial<Expense>[], cccExpenses: number): string {
    return `There ${cccExpenses > 1 ? 'are' : 'is'} ${cccExpenses} corporate card ${
      cccExpenses > 1 ? 'expenses' : 'expense'
    } from the selection which can\'t be deleted. ${
      expensesToBeDeleted?.length > 0 ? 'However you can delete the other expenses from the selection.' : ''
    }`;
  }

  getDeleteDialogBody(
    expensesToBeDeleted: Partial<Expense>[],
    cccExpenses: number,
    expenseDeletionMessage: string,
    cccExpensesMessage: string
  ): string {
    let dialogBody: string;

    if (expensesToBeDeleted.length > 0 && cccExpenses > 0) {
      dialogBody = `<ul class="text-left">
        <li>${cccExpensesMessage}</li>
        <li>Once deleted, the action can't be reversed.</li>
        </ul>
        <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`;
    } else if (expensesToBeDeleted.length > 0 && cccExpenses === 0) {
      dialogBody = `<ul class="text-left">
      <li>${expenseDeletionMessage}</li>
      <li>Once deleted, the action can't be reversed.</li>
      </ul>
      <p class="confirmation-message text-left">Are you sure to <b>permanently</b> delete the selected expenses?</p>`;
    } else if (expensesToBeDeleted.length === 0 && cccExpenses > 0) {
      dialogBody = `<ul class="text-left">
      <li>${cccExpensesMessage}</li>
      </ul>`;
    }

    return dialogBody;
  }
}
