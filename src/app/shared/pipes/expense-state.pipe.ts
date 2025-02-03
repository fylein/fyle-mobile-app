import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expenseState',
})
export class ExpenseState implements PipeTransform {
  transform(val: string): string {
    if (!val) {
      return val;
    }

    const states: Record<string, string> = {
      DRAFT: 'incomplete',
      COMPLETE: 'complete',
      APPROVER_PENDING: 'submitted',
      APPROVED: 'approved',
      PAYMENT_PENDING: 'payment_pending',
      PAYMENT_PROCESSING: 'processing',
      PAID: 'closed',
    };

    return states[val];
  }
}
