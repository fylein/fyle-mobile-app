import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reportState',
})
export class ReportState implements PipeTransform {
  transform(val: string, simplifyReportsEnabled = false): string {
    if (!val) {
      return val;
    }

    const states: Record<string, string> = {
      DRAFT: 'draft',
      APPROVER_PENDING: simplifyReportsEnabled ? 'submitted' : 'reported',
      SUBMITTED: 'reported',
      APPROVER_INQUIRY: 'sent_back',
      POLICY_INQUIRY: 'auto_flagged',
      REJECTED: 'rejected',
      APPROVED: 'approved',
      PAYMENT_PENDING: 'payment_pending',
      PAYMENT_PROCESSING: simplifyReportsEnabled ? 'processing' : 'payment_processing',
      PAID: simplifyReportsEnabled ? 'closed' : 'paid',
      CANCELLED: 'cancelled',
      APPROVAL_PENDING: simplifyReportsEnabled ? 'submitted' : 'reported',
      APPROVAL_DONE: 'approved',
      APPROVAL_DISABLED: 'disabled',
      APPROVAL_REJECTED: 'rejected',
    };

    return states[val];
  }
}
