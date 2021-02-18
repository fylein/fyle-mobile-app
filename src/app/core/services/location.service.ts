import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {map, switchMap} from 'rxjs/operators';
import {from, Observable} from 'rxjs';
import {Plugins} from '@capacitor/core';
import {AgmGeocoder} from '@agm/core';

const { Geolocation } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  ROOT_ENDPOINT: string;

  constructor(
    private httpClient: HttpClient,
    private agmGeocode: AgmGeocoder
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get(url, config = {}) {
    return this.httpClient.get(this.ROOT_ENDPOINT + '/location' + url, config);
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

  formatGeocodeResponse(geocodeResponse) {
    const currentLocation = geocodeResponse && geocodeResponse.length > 0 && geocodeResponse[0];
    if (!currentLocation) {
      return;
    }

    const formattedLocation: any = {
      display: currentLocation.formatted_address, // geocodeResponse doesn't return display
      formatted_address: currentLocation.formatted_address
    };

    if (currentLocation.geometry && currentLocation.geometry.location) {
      formattedLocation.latitude = currentLocation.geometry.location.lat();
      formattedLocation.longitude = currentLocation.geometry.location.lng();
    }

    currentLocation.address_components.forEach((component) => {
      if (component.types.indexOf('locality') > -1) {
        formattedLocation.city = component.long_name;
      }

      if (component.types.indexOf('administrative_area_level_1') > -1) {
        formattedLocation.state = component.long_name;
      }

      if (component.types.indexOf('country') > -1) {
        formattedLocation.country = component.long_name;
      }
    });
    return formattedLocation;
  }

  getCurrentLocation() {
    return from(Geolocation.getCurrentPosition({
      timeout: 1000,
      enableHighAccuracy: true
      })).pipe(
      switchMap((coordinates) => {
        return this.agmGeocode.geocode({
          location: {
            lat: coordinates.coords.latitude,
            lng: coordinates.coords.longitude
          }
        });
      }),
      map(this.formatGeocodeResponse)
    )
  }
}
