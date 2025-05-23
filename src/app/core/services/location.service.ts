import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map, timeout } from 'rxjs/operators';
import { from, Observable, of, Subject, OperatorFunction } from 'rxjs';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Cacheable } from 'ts-cacheable';
import { PredictedLocation } from '../models/predicted-location.model';
import { PredictedLocations } from '../models/location.model';
import { Location } from '../models/location.model';
import { MileageLocation } from 'src/app/shared/components/route-visualizer/mileage-locations.interface';
import { MileageRoute } from 'src/app/shared/components/route-visualizer/mileage-route.interface';

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
  getCurrentLocation(config: { enableHighAccuracy: boolean } = { enableHighAccuracy: false }): Observable<Position | null> {
    return from(
      Geolocation.getCurrentPosition({
        timeout: 5000,
        enableHighAccuracy: config.enableHighAccuracy,
      }).catch((err: { message?: string; errorMessage?: string }) => {
        if (
          err?.message === "Location permission request was denied." ||
          err?.errorMessage === "Location permission request was denied."
        ) {
          // Swallow this specific error by returning null
          return null;
        }
        // Re-throw all other errors
        throw err;
      }) as Promise<Position | null>
    ).pipe(
      this.timeoutWhen(!config.enableHighAccuracy, 5000),
      catchError(() => of(null))
    );
  }

  @Cacheable()
  get<T>(url: string, config = {}): Observable<T> {
    return this.httpClient.get<T>(this.ROOT_ENDPOINT + '/location' + url, config);
  }

  /**
   * Busts the cache for the getCurrentLocation method.
   */
  clearCurrentLocationCache(): void {
    currentLocationCacheBuster$.next();
  }

  timeoutWhen<T>(cond: boolean, value: number): OperatorFunction<T, T> {
    return (source) => (cond ? source.pipe(timeout(value)) : source);
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  getDirections(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    waypoints?: google.maps.LatLngLiteral[]
  ): Observable<string> {
    const config = {
      params: {
        origin_lat: origin.lat,
        origin_long: origin.lng,
        destination_lat: destination.lat,
        destination_long: destination.lng,
        waypoints: waypoints.reduce(
          (acc, waypoint, i) =>
            i === 0 ? `${waypoint.lat},${waypoint.lng}` : `${acc}|${waypoint.lat},${waypoint.lng}`,
          ''
        ),
        mode: 'driving',
      },
    };

    return this.get<string>('/directions', config);
  }

  getAutocompletePredictions(
    text: string,
    userId: string,
    currentLocation?: string,
    types?: string
  ): Observable<PredictedLocation[]> {
    const data: Record<string, Record<string, string>> = {
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
    return this.get('/autocomplete', data).pipe(map((res: PredictedLocations) => res.predictions));
  }

  getDistance(fromLocation: Location, toLocation: Location): Observable<number> {
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
  getGeocode(placeId: string, displayName: string): Observable<Location> {
    return this.get('/geocode/' + placeId).pipe(
      map((locationDetails: Location) => {
        // locationDetails does not contain the `display` key
        if (displayName) {
          locationDetails.display = displayName;
        }
        return locationDetails;
      })
    );
  }

  getMileageRoute(mileageLocations: MileageLocation[]): MileageRoute {
    const locations: google.maps.LatLngLiteral[] = mileageLocations.map((location) => ({
      lat: location.latitude,
      lng: location.longitude,
    }));

    const mileageRoute = {
      origin: locations[0],
      destination: locations[locations.length - 1],
      waypoints: locations.slice(1, -1),
    };

    return mileageRoute;
  }
}
