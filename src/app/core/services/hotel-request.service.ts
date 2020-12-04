import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class HotelRequestService {

  constructor(
    private apiService: ApiService
  ) { }

  upsert(hotelRequest) {
    // TripDatesService.convertToDateFormat(hotelRequest);
    return this.apiService.post('/hotel_requests', hotelRequest);
      // self.deleteCache();
      // return fixDates(req);
  }
}
