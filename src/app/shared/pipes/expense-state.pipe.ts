import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expenseState'
})
export class ExpenseState implements PipeTransform {
  transform(val) {
    const states = {
      DRAFT: 'draft',
      COMPLETE: 'fyled',
      APPROVER_PENDING: 'reported',
      APPROVED: 'approved',
      PAYMENT_PENDING: 'payment_pending',
      PAYMENT_PROCESSING: 'payment_processing',
      PAID: 'paid'
    };

    return states[val];
  }
}