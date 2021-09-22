import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'advanceState',
})
export class AdvanceState implements PipeTransform {
  transform(value) {
    if (!value) {
      return value;
    }

    const states = {
      DRAFT: 'draft',
      SUBMITTED: 'pending',
      APPROVED: 'approved',
      INQUIRY: 'sent back',
      PAID: 'issued',
      APPROVAL_PENDING: 'pending',
      APPROVAL_DONE: 'approved',
      APPROVAL_DISABLED: 'disabled',
      APPROVAL_REJECTED: 'rejected',
      REJECTED: 'rejected',
    };

    return states[value];
  }
}
