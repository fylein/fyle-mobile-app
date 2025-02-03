import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reportState',
})
export class ReportState implements PipeTransform {
  transform(val: string): string {
    if (!val) {
      return val;
    }

    const states: Record<string, string> = {
      DRAFT: 'draft',
      APPROVER_PENDING: 'submitted',
      SUBMITTED: 'reported',
      APPROVER_INQUIRY: 'sent_back',
      POLICY_INQUIRY: 'auto_flagged',
      REJECTED: 'rejected',
      APPROVED: 'approved',
      PAYMENT_PENDING: 'payment_pending',
      PAYMENT_PROCESSING: 'processing',
      PAID: 'closed',
      CANCELLED: 'cancelled',
      APPROVAL_PENDING: 'submitted',
      APPROVAL_DONE: 'approved',
      APPROVAL_DISABLED: 'disabled',
      APPROVAL_REJECTED: 'rejected',
    };

    return states[val];
  }
}
