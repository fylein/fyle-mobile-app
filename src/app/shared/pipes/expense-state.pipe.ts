import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expenseState',
})
export class ExpenseState implements PipeTransform {
  transform(val) {
    if (!val) {
      return val;
    }

    const states = {
      DRAFT: 'incomplete',
      COMPLETE: 'fyled',
      APPROVER_PENDING: 'reported',
      APPROVED: 'approved',
      PAYMENT_PENDING: 'payment_pending',
      PAYMENT_PROCESSING: 'payment_processing',
      PAID: 'paid',
    };

    return states[val];
  }
}
