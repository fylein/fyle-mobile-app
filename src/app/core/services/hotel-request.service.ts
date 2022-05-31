import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { TripDatesService } from './trip-dates.service';

@Injectable({
  providedIn: 'root',
})
export class HotelRequestService {
  constructor(private apiService: ApiService, private tripDatesService: TripDatesService) {}

  upsert(hotelRequest) {
    return this.apiService.post('/hotel_requests', hotelRequest);
  }
}
