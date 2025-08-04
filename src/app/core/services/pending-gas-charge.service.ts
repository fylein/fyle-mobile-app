import { Injectable } from '@angular/core';
import { Expense } from '../models/platform/v1/expense.model';

@Injectable({
  providedIn: 'root',
})
export class PendingGasChargeService {
  private isFuelExpense(expense: Expense): boolean {
    const fuelCategories = ['fuel', 'gas', 'gasoline', 'petrol'];
    const categoryName = expense?.category?.name?.toLowerCase() || '';
    return fuelCategories.some((fuel) => categoryName.includes(fuel));
  }

  private isOneDollarAmount(expense: Expense): boolean {
    return (
      (expense?.amount === 1 || expense?.amount === 1.0) && (expense?.currency === 'USD' || expense?.currency === 'CAD')
    );
  }

  private isPendingStatus(expense: Expense): boolean {
    return expense?.matched_corporate_card_transactions?.[0]?.status === 'PENDING';
  }

  private hasNoReceipt(expense: Expense): boolean {
    return !expense?.file_ids || expense.file_ids.length === 0;
  }

  private isCCMatchedExpense(expense: Expense): boolean {
    return expense?.matched_corporate_card_transaction_ids.length > 0;
  }

  isPendingGasCharge(expense: Expense): boolean {
    const isFuelExpense = this.isFuelExpense(expense);
    const isOneDollar = this.isOneDollarAmount(expense);
    const isPendingStatus = this.isPendingStatus(expense);
    const hasNoReceipt = this.hasNoReceipt(expense);
    const isCCMatchedExpense = this.isCCMatchedExpense(expense);

    return isCCMatchedExpense && isFuelExpense && isOneDollar && isPendingStatus && hasNoReceipt;
  }
}
