import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expenseState',
})
export class ExpenseState implements PipeTransform {
  transform(val, isNewReportsFlowEnabled) {
    if (!val) {
      return val;
    }

    const states = {
      DRAFT: 'incomplete',
      COMPLETE: 'unreported',
      APPROVER_PENDING: isNewReportsFlowEnabled ? 'submitted' : 'reported',
      APPROVED: 'approved',
      PAYMENT_PENDING: 'payment_pending',
      PAYMENT_PROCESSING: 'payment_processing',
      PAID: isNewReportsFlowEnabled ? 'closed' : 'paid',
    };

    return states[val];
  }
}
