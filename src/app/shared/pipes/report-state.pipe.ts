import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'reportState',
  standalone: false,
})
export class ReportState implements PipeTransform {
  private translocoService = inject(TranslocoService);

  private stateKeyMap: Record<string, string> = {
    DRAFT: 'pipes.reportState.draft',
    APPROVER_PENDING: 'pipes.reportState.submitted',
    SUBMITTED: 'pipes.reportState.reported',
    APPROVER_INQUIRY: 'pipes.reportState.sentBack',
    POLICY_INQUIRY: 'pipes.reportState.autoFlagged',
    REJECTED: 'pipes.reportState.rejected',
    APPROVED: 'pipes.reportState.approved',
    PAYMENT_PENDING: 'pipes.reportState.paymentPending',
    PAYMENT_PROCESSING: 'pipes.reportState.processing',
    PAID: 'pipes.reportState.closed',
    CANCELLED: 'pipes.reportState.cancelled',
    APPROVAL_PENDING: 'pipes.reportState.submitted',
    APPROVAL_DONE: 'pipes.reportState.approved',
    APPROVAL_DISABLED: 'pipes.reportState.disabled',
    APPROVAL_REJECTED: 'pipes.reportState.rejected',
  };

  transform(val: string): string {
    if (!val) {
      return val;
    }

    const translationKey = this.stateKeyMap[val];
    return translationKey ? this.translocoService.translate(translationKey) : val;
  }
}
