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
}
