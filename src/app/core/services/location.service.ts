import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { from, Observable, of, Subject } from 'rxjs';
import { GeolocationPosition, Plugins } from '@capacitor/core';
import { Cacheable } from 'ts-cacheable';
const { Geolocation } = Plugins;

const currentLocationCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  @Cacheable({
    cacheBusterObserver: currentLocationCacheBuster$,
    maxAge: 10 * 60 * 1000, // 10 minutes
  })
  getCurrentLocation(
    config: { enableHighAccuracy: boolean } = { enableHighAccuracy: false }
  ): Observable<GeolocationPosition> {
    console.log(
      'Using geolocation plugin, location is ',
      Geolocation.getCurrentPosition({
        timeout: 5000,
        enableHighAccuracy: config.enableHighAccuracy,
      })
    );
    return from(
      Geolocation.getCurrentPosition({
        timeout: 5000,
        enableHighAccuracy: config.enableHighAccuracy,
      })
    ).pipe(
      timeout(5000),
      tap(() => console.log('GEtting current location inside location service')),
      catchError((err) => {
        console.log('ERror in getting current location', err);
        return of(null);
      })
    );
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  get(url, config = {}) {
    return this.httpClient.get(this.ROOT_ENDPOINT + '/location' + url, config);
  }

  getAutocompletePredictions(text, userId, currentLocation?, types?) {
    const data: any = {
      params: {
        text,
        user_id: userId,
      },
    };

    if (currentLocation) {
      data.params.location = currentLocation;
    }
    if (types) {
      data.params.types = types;
    }

    return this.get('/autocomplete', data).pipe(map((res: any) => res.predictions));
  }

  getDistance(fromLocation, toLocation): Observable<number> {
    const data = {
      params: {
        origin_lat: fromLocation.latitude,
        origin_long: fromLocation.longitude,
        destination_lat: toLocation.latitude,
        destination_long: toLocation.longitude,
        mode: 'driving',
      },
    };

    return this.get('/distance', data).pipe(map((res) => res as number));
  }

  getPlace(placeId) {
    const data = {
      params: {
        place_id: placeId,
      },
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
