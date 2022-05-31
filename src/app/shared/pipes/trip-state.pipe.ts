import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tripState',
})
export class TripState implements PipeTransform {
  transform(val) {
    const states = {
      SUBMITTED: 'submitted',
      APPROVER_INQUIRY: 'inquiry',
      REJECTED: 'rejected',
      APPROVED: 'approved',
      CANCEL_SUBMITTED: 'cancel_requested',
      CANCELLED: 'cancelled',
      APPROVAL_PENDING: 'pending',
      APPROVAL_DONE: 'approved',
      APPROVAL_DISABLED: 'disabled',
      APPROVAL_REJECTED: 'rejected',
      BOOKING_PENDING: 'booking_pending',
      BOOKED: 'booked',
      ON_HOLD: 'on_hold',
      CANCEL_PENDING: 'cancellation_pending',
    };

    return states[val];
  }
}
