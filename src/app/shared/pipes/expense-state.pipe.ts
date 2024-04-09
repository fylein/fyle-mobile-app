import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expenseState',
})
export class ExpenseState implements PipeTransform {
  transform(val: string, isNewReportsFlowEnabled = false): string {
    if (!val) {
      return val;
    }

    const states: Record<string, string> = {
      DRAFT: 'incomplete',
      COMPLETE: 'complete',
      APPROVER_PENDING: isNewReportsFlowEnabled ? 'submitted' : 'reported',
      APPROVED: 'approved',
      PAYMENT_PENDING: 'payment_pending',
      PAYMENT_PROCESSING: isNewReportsFlowEnabled ? 'processing' : 'payment_processing',
      PAID: isNewReportsFlowEnabled ? 'closed' : 'paid',
    };

    return states[val];
  }
}
