import { Injectable } from '@angular/core';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  getIsDraft(expense: Expense): boolean {
    return expense.state && expense.state === ExpenseState.DRAFT;
  }

  getIsCriticalPolicyViolated(expense: Expense): boolean {
    return typeof expense.policy_amount === 'number' && expense.policy_amount < 0.0001;
  }

  getVendorDetails(expense: Expense): string {
    const systemCategory = expense.category?.system_category?.toLocaleLowerCase();
    let vendorDisplayName = expense.merchant;

    if (systemCategory === 'mileage') {
      vendorDisplayName = (expense.distance || 0).toString();
      vendorDisplayName += ' ' + expense.distance_unit;
    } else if (systemCategory === 'per diem') {
      vendorDisplayName = expense.per_diem_num_days?.toString();
      if (expense.per_diem_num_days > 1) {
        vendorDisplayName += ' Days';
      } else {
        vendorDisplayName += ' Day';
      }
    }

    return vendorDisplayName;
  }

  getReportableExpenses(expenses: Expense[]): Expense[] {
    return expenses.filter(
      (expense) => !this.getIsCriticalPolicyViolated(expense) && !this.getIsDraft(expense) && expense.id
    );
  }

  excludeCCCExpenses(expenses: Expense[]): Expense[] {
    return expenses.filter((expense) => expense.matched_corporate_card_transaction_ids?.length > 0);
  }

  isMergeAllowed(expenses: Expense[]): boolean {
    if (expenses.length === 2) {
      const areSomeMileageOrPerDiemExpenses = expenses.some((expense) =>
        ['Mileage', 'Per Diem'].includes(expense.category?.system_category)
      );
      const areAllExpensesSubmitted = expenses.every((expense) =>
        [
          ExpenseState.APPROVER_PENDING,
          ExpenseState.APPROVED,
          ExpenseState.PAYMENT_PENDING,
          ExpenseState.PAYMENT_PROCESSING,
          ExpenseState.PAID,
        ].includes(expense.state)
      );
      const areAllCCCMatchedExpenses = expenses.every(
        (expense) => expense.matched_corporate_card_transactions.length > 0
      );
      return !areSomeMileageOrPerDiemExpenses && !areAllExpensesSubmitted && !areAllCCCMatchedExpenses;
    } else {
      return false;
    }
  }

  hasCriticalPolicyViolation(expense: Expense): boolean {
    return typeof expense.policy_amount === 'number' && expense.policy_amount < 0.0001;
  }

  getExpenseDeletionMessage(expensesToBeDeleted: Expense[]): string {
    return `You are about to permanently delete ${
      expensesToBeDeleted.length === 1 ? '1 selected expense.' : expensesToBeDeleted.length + ' selected expenses.'
    }`;
  }

  getCCCExpenseMessage(expensesToBeDeleted: Expense[], cccExpenses: number): string {
    return `There ${cccExpenses > 1 ? 'are' : 'is'} ${cccExpenses} corporate card ${
      cccExpenses > 1 ? 'expenses' : 'expense'
    } from the selection which can\'t be deleted. ${
      expensesToBeDeleted?.length > 0 ? 'However you can delete the other expenses from the selection.' : ''
    }`;
  }

  getDeleteDialogBody(
    expensesToBeDeleted: Expense[],
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
