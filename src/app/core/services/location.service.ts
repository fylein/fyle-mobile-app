import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map, timeout } from 'rxjs/operators';
import { from, Observable, of, Subject, OperatorFunction } from 'rxjs';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Cacheable } from 'ts-cacheable';

const currentLocationCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  @Cacheable()
  get(url, config = {}) {
    return this.httpClient.get(this.ROOT_ENDPOINT + '/location' + url, config);
  }

  @Cacheable({
    cacheBusterObserver: currentLocationCacheBuster$,
    maxAge: 10 * 60 * 1000, // 10 minutes
  })
  getCurrentLocation(config: { enableHighAccuracy: boolean } = { enableHighAccuracy: false }): Observable<Position> {
    return from(
      Geolocation.getCurrentPosition({
        timeout: 5000,
        enableHighAccuracy: config.enableHighAccuracy,
      })
    ).pipe(
      this.timeoutWhen(!config.enableHighAccuracy, 5000),
      catchError(() => of(null))
    );
  }

  timeoutWhen<T>(cond: boolean, value: number): OperatorFunction<T, T> {
    return (source) => (cond ? source.pipe(timeout(value)) : source);
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
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
