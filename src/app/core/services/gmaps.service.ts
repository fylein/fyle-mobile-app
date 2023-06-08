import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapDirectionsService, MapGeocoder, MapGeocoderResponse } from '@angular/google-maps';
import { Cacheable } from 'ts-cacheable';

@Injectable({
  providedIn: 'root',
})
export class GmapsService {
  constructor(private geocoder: MapGeocoder, private mapDirectionsService: MapDirectionsService) {}

  @Cacheable()
  getGeocode(latitude: number, longitude: number): Observable<MapGeocoderResponse> {
    return this.geocoder.geocode({
      location: {
        lat: latitude,
        lng: longitude,
      },
    });
  }

  @Cacheable()
  getDirections(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    waypoints: google.maps.DirectionsWaypoint[]
  ): Observable<google.maps.DirectionsResult> {
    const request: google.maps.DirectionsRequest = {
      destination,
      origin,
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    };
    return this.mapDirectionsService.route(request).pipe(map((response) => response.result));
  }
}
