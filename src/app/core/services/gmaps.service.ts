import { Injectable } from '@angular/core';
import { Observable, forkJoin, from, ignoreElements, map } from 'rxjs';
import { MapDirectionsResponse, MapDirectionsService, MapGeocoder, MapGeocoderResponse } from '@angular/google-maps';
import { Cacheable } from 'ts-cacheable';
import { MileageRoute } from 'src/app/shared/components/route-visualizer/mileage-route.interface';
import { MileageMarkerParams } from '../models/mileage-marker-params.interface';
import { environment } from 'src/environments/environment';
import { StaticMapPropertiesService } from './static-map-properties.service';
import { Loader } from '@googlemaps/js-api-loader';

@Injectable({
  providedIn: 'root',
})
export class GmapsService {
  private staticMapsApi = 'https://maps.googleapis.com/maps/api/staticmap';

  constructor(
    private geocoder: MapGeocoder,
    private mapDirectionsService: MapDirectionsService,
    private staticMapPropertiesService: StaticMapPropertiesService
  ) {}

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
  getDirections(mileageRoute: MileageRoute): Observable<google.maps.DirectionsResult> {
    const { origin, destination, waypoints } = mileageRoute;

    // Convert waypoints to google maps waypoints
    const directionsWaypoints: google.maps.DirectionsWaypoint[] = waypoints.map((waypoint) => ({ location: waypoint }));

    const request: google.maps.DirectionsRequest = {
      destination,
      origin,
      waypoints: directionsWaypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    return this.mapDirectionsService.route(request).pipe(map((response: MapDirectionsResponse) => response.result));
  }

  initializeLibrary(): Observable<void> {
    const loader = new Loader({
      apiKey: environment.GOOGLE_MAPS_API_KEY,
    });

    return forkJoin([
      from(loader.importLibrary('core')),
      from(loader.importLibrary('maps')),
      from(loader.importLibrary('routes')),
      from(loader.importLibrary('geocoding')),
    ]).pipe(ignoreElements());
  }

  // Used to generate static map image urls, for single location
  generateLocationMapUrl(location: google.maps.LatLngLiteral): string {
    const staticMapImageUrl = new URL(this.staticMapsApi);

    const properties = this.staticMapPropertiesService.getProperties();

    staticMapImageUrl.searchParams.append('size', `${properties.width}x${properties.height}`);
    staticMapImageUrl.searchParams.append('scale', properties.resolutionScale.toString());
    staticMapImageUrl.searchParams.append('zoom', properties.zoom.toString());
    staticMapImageUrl.searchParams.append('center', `${location.lat},${location.lng}`);
    staticMapImageUrl.searchParams.append('key', environment.GOOGLE_MAPS_API_KEY);

    return staticMapImageUrl.href;
  }

  // Used to generate static map image urls, for routes
  generateDirectionsMapUrl(mileageRoute: MileageRoute): string {
    const staticMapImageUrl = new URL(this.staticMapsApi);

    const properties = this.staticMapPropertiesService.getProperties();

    staticMapImageUrl.searchParams.append('size', `${properties.width}x${properties.height}`);
    staticMapImageUrl.searchParams.append('scale', properties.resolutionScale.toString());

    const encodedPolyline = mileageRoute.directions.overview_polyline;
    staticMapImageUrl.searchParams.append('path', `color:${properties.routeColor}|enc:${encodedPolyline}`);

    const { originParams, destinationParams, waypointsParams } = this.generateMarkerParams(
      mileageRoute,
      properties.markers
    );

    staticMapImageUrl.searchParams.append('markers', originParams);
    staticMapImageUrl.searchParams.append('markers', destinationParams);

    if (waypointsParams.length > 0) {
      for (const waypointParams of waypointsParams) {
        staticMapImageUrl.searchParams.append('markers', waypointParams);
      }
    }

    staticMapImageUrl.searchParams.append('key', environment.GOOGLE_MAPS_API_KEY);

    return staticMapImageUrl.href;
  }

  private generateMarkerParams(mileageRoute: MileageRoute, markers: string[]): MileageMarkerParams {
    const { origin, destination, waypoints } = mileageRoute;

    const markerParams: MileageMarkerParams = {
      originParams: '',
      destinationParams: '',
      waypointsParams: [],
    };

    markerParams.originParams = `label:${markers[0]}|${origin.lat},${origin.lng}`;

    if (waypoints.length > 0) {
      for (const [index, waypoint] of waypoints.entries()) {
        const stop = `label:${markers[index + 1]}|${waypoint.lat},${waypoint.lng}`;
        markerParams.waypointsParams.push(stop);
      }
    }

    markerParams.destinationParams = `label:${markers[waypoints.length + 1]}|${destination.lat},${destination.lng}`;

    return markerParams;
  }
}
