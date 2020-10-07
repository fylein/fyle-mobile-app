import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransportationRequestsService {

  constructor() { }

  getTransportationPreferredTiming() {
    return [
      { id: 'NO_PREFERENCE', name: 'Any time' },
      { id: 'MIDNIGHT_TO_SIX_AM', name: 'Before 6 am' },
      { id: 'SIX_AM_TO_NOON', name: '6 am to 12 pm' },
      { id: 'NOON_TO_SIX_PM', name: '12 pm to 6 pm' },
      { id: 'SIX_PM_TO_MIDNIGHT', name: 'After 6 pm' }
    ];
  }

  setInternalStateAndDisplayName(transportationRequest) {
    if (transportationRequest.tr.need_booking) {
      if (!transportationRequest.tb.id) {
        if (!transportationRequest.tr.assigned_to) {
          transportationRequest.internalState = 'unassigned';
          transportationRequest.internalStateDisplayName = 'Unassigned';
        } else {
          transportationRequest.internalState = 'pendingBooking';
          transportationRequest.internalStateDisplayName = 'Pending Booking';
        }
      } else if (transportationRequest.tb.id && !transportationRequest.tb.cancellation_requested) {
        transportationRequest.internalState = 'booked';
        transportationRequest.internalStateDisplayName = 'Booked';
      } else if (transportationRequest.tb.id
        && transportationRequest.tb.cancellation_requested
        && transportationRequest.tc.id && transportationRequest.tb.num_boarding_pass_files > 0) {
        transportationRequest.internalState = 'boardingPassAttached';
        transportationRequest.internalStateDisplayName = 'Boarding Pass Attached';
      } else if (transportationRequest.tb.id && transportationRequest.tb.cancellation_requested && transportationRequest.tc.id) {
        transportationRequest.internalState = 'cancelled';
        transportationRequest.internalStateDisplayName = 'Cancelled';
      } else if (transportationRequest.tb.id && transportationRequest.tb.cancellation_requested) {
        transportationRequest.internalState = 'pendingCancellation';
        transportationRequest.internalStateDisplayName = 'Pending Cancellation';
      }
    } else {
      transportationRequest.internalState = 'noBookingNeeded';
      transportationRequest.internalStateDisplayName = 'No Booking Needed';
    }
    return transportationRequest;
  }
}
