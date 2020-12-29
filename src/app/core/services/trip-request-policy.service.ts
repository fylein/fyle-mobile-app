import { Injectable } from '@angular/core';
import { TripDatesService } from './trip-dates.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TripRequestPolicyService {

  ROOT_ENDPOINT: string;

  constructor(
    private tripDateService: TripDatesService,
    private httpClient: HttpClient
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
   }

  postCall(url, data, config) {
    return this.httpClient.post(this.ROOT_ENDPOINT + '/policy/trip_requests' + url, data, config).pipe(
      map((resp: any) => {
        return resp.data;
      })
    );
  }

  testTripRequest(tripRequestObject) {

    this.tripDateService.convertToDateFormat(tripRequestObject.trip_request);

    if (tripRequestObject.transportation_requests) {
      tripRequestObject.transportation_requests.forEach(transportationRequest => {
        this.tripDateService.convertToDateFormat(transportationRequest);
      });
    }

    if (tripRequestObject.hotel_requests) {
      tripRequestObject.hotel_requests.forEach(hotelRequest => {
        this.tripDateService.convertToDateFormat(hotelRequest);
      });
    }

    return this.postCall('/policy_check/test', tripRequestObject, {timeout: 5000});
  }

  getPolicyPopupRules(result) {
    const popupRules = [];

    result.trip_request_policy_rule_desired_states.forEach(desiredState => {
      if (desiredState.popup) {
        popupRules.push(desiredState.description);
      }
    });
    return popupRules;
  }
}
