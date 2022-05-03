import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reportState',
})
export class ReportState implements PipeTransform {
  transform(val) {
    if (!val) {
      return val;
    }

    const states = {
      DRAFT: 'draft',
      DRAFT_INQUIRY: 'incomplete',
      COMPLETE: 'unreported',
      APPROVER_PENDING: 'reported',
      SUBMITTED: 'reported',
      APPROVER_INQUIRY: 'sent_back',
      POLICY_INQUIRY: 'auto_flagged',
      REJECTED: 'rejected',
      APPROVED: 'approved',
      PAYMENT_PENDING: 'payment_pending',
      PAYMENT_PROCESSING: 'payment_processing',
      PAID: 'paid',
      CANCELLED: 'cancelled',
      APPROVAL_PENDING: 'reported',
      APPROVAL_DONE: 'approved',
      APPROVAL_DISABLED: 'disabled',
      APPROVAL_REJECTED: 'rejected',
    };

    return states[val];
  }
}
