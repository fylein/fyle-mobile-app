import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TransportationRequestsService {
  constructor(private apiService: ApiService) {}

  getTransportationPreferredTiming() {
    return [
      { value: 'NO_PREFERENCE', label: 'Any time' },
      { value: 'MIDNIGHT_TO_SIX_AM', label: 'Before 6 am' },
      { value: 'SIX_AM_TO_NOON', label: '6 am to 12 pm' },
      { value: 'NOON_TO_SIX_PM', label: '12 pm to 6 pm' },
      { value: 'SIX_PM_TO_MIDNIGHT', label: 'After 6 pm' },
    ];
  }

  getTransportationModes() {
    return [
      { value: 'FLIGHT', label: 'FLIGHT' },
      { value: 'TRAIN', label: 'TRAIN' },
      { value: 'BUS', label: 'BUS' },
      { value: 'TAXI', label: 'TAXI' },
    ];
  }

  // TODO: Comlpex to break down. Do separately
  // eslint-disable-next-line complexity
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
      } else if (
        transportationRequest.tb.id &&
        transportationRequest.tb.cancellation_requested &&
        transportationRequest.tc.id &&
        transportationRequest.tb.num_boarding_pass_files > 0
      ) {
        transportationRequest.internalState = 'boardingPassAttached';
        transportationRequest.internalStateDisplayName = 'Boarding Pass Attached';
      } else if (
        transportationRequest.tb.id &&
        transportationRequest.tb.cancellation_requested &&
        transportationRequest.tc.id
      ) {
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

  upsert(transportationRequest) {
    // TripDatesService.convertToDateFormat(transportationRequest);
    return this.apiService.post('/transportation_requests', transportationRequest);
    // self.deleteCache();
    // return fixDates(req);
  }
}
