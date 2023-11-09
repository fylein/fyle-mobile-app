import { Injectable } from '@angular/core';
import { ExpenseState } from 'src/app/core/models/expense-state.enum';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  constructor() {}

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
}
