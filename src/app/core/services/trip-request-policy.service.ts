import { Injectable } from '@angular/core';
import { TripDatesService } from './trip-dates.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, concatMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TripRequestPolicyService {
  ROOT_ENDPOINT: string;

  constructor(
    private tripDateService: TripDatesService,
    private httpClient: HttpClient,
    private authService: AuthService
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get(url: string, config = {}) {
    return this.httpClient.get<any>(this.ROOT_ENDPOINT + '/v2' + url, config);
  }

  postCall(url, data, config?) {
    return this.httpClient.post(this.ROOT_ENDPOINT + '/policy/trip_requests' + url, data, config);
  }

  testTripRequest(tripRequestObject) {
    return from(this.authService.getEou()).pipe(
      map((eou) => (tripRequestObject.trip_request.org_user_id = eou.ou.id)),
      concatMap(() => this.postCall('/policy_check/test', tripRequestObject, { timeout: 5000 }))
    );
  }

  getPolicyPopupRules(result) {
    const popupRules = [];

    if (result) {
      result.trip_request_policy_rule_desired_states.forEach((desiredState) => {
        if (desiredState.popup) {
          popupRules.push(desiredState.description);
        }
      });
    }

    return popupRules;
  }
}
