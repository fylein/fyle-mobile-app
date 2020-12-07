import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private httpClient: HttpClient
  ) { }

  get(url, config = {}) {
    return this.httpClient.get(environment.ROOT_URL + '/location' + url, config);
  }

  getAutocompletePredictions(text, userId, currentLocation, types?) {
    const data: any = {
      params: {
        text,
        user_id: userId
      }
    };

    if (currentLocation) {
      data.params.location = currentLocation;
    }
    if (types) {
      data.params.types = types;
    }

    return this.get('/autocomplete', data).pipe(
      map((res: any) => res.predictions)
    );
  }

  getDistance(fromLocation, toLocation): Observable<number> {
    const data = {
      params: {
        origin_lat: fromLocation.latitude,
        origin_long: fromLocation.longitude,
        destination_lat: toLocation.latitude,
        destination_long: toLocation.longitude,
        mode: 'driving'
      }
    };

    return this.get('/distance', data).pipe(
      map(res => res as number)
    );
  }

  getPlace(placeId) {
    const data = {
      params: {
        place_id: placeId
      }
    };

    return this.get('/place_details', data);
  }

  /**
   * This method gets details from /location/geocode and
   * adds the param displayName to details.display
   *
   * @params {string} placeId
   * @params {string} displayName
   * @return locationDetails
   * locationDetails -
   * {"city": "Thane", "state": "Maharashtra", "country": "India", "display": "Thane, Maharashtra, India", 
   * "formatted_address": "Thane, Maharashtra, India", "latitude": 19.2183307, "longitude": 72.9780897}
   */
  getGeocode(placeId, displayName) {
    return this.get('/geocode/' + placeId).pipe(
      map((locationDetails: any) => {
        // locationDetails does not contain the `display` key
        if (displayName) {
          locationDetails.display = displayName;
        }
        return locationDetails;
      })
    );
  }
}
