import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MapDirectionsResponse, MapDirectionsService, MapGeocoder, MapGeocoderResponse } from '@angular/google-maps';
import { Cacheable } from 'ts-cacheable';
import { MileageRoute } from 'src/app/shared/components/route-visualizer/mileage-route.interface';
import { MileageMarkerParams } from '../models/mileage-marker-params.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GmapsService {
  private staticMapsApi = 'https://maps.googleapis.com/maps/api/staticmap';

  private routeColor = '0x00BFFF';

  // Scale of the map image, which multiplies the resolution of the image
  private mapResolutionScale = '2';

  private markers = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

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
  getDirections(mileageRoute: MileageRoute): Observable<MapDirectionsResponse> {
    const { origin, destination, waypoints } = mileageRoute;

    // Convert waypoints to google maps waypoints
    const directionsWaypoints: google.maps.DirectionsWaypoint[] = waypoints.map((waypoint) => ({ location: waypoint }));

    const request: google.maps.DirectionsRequest = {
      destination,
      origin,
      waypoints: directionsWaypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    };
    return this.mapDirectionsService.route(request);
  }

  generateStaticLocationMapUrl(location: google.maps.LatLngLiteral, mapWidth: number, mapHeight: number) {
    const staticMapImageUrl = new URL(this.staticMapsApi);

    const size = `${mapWidth}x${mapHeight}`;
    staticMapImageUrl.searchParams.append('size', size);
    staticMapImageUrl.searchParams.append('scale', this.mapResolutionScale);
    staticMapImageUrl.searchParams.append('zoom', '15');

    const locationParams = `${location.lat},${location.lng}`;
    staticMapImageUrl.searchParams.append('center', locationParams);

    staticMapImageUrl.searchParams.append('key', environment.GOOGLE_MAPS_API_KEY);

    return staticMapImageUrl.href;
  }

  generateStaticRouteMapUrl(mileageRoute: MileageRoute, mapWidth: number, mapHeight: number): string {
    const staticMapImageUrl = new URL(this.staticMapsApi);

    const size = `${mapWidth}x${mapHeight}`;
    staticMapImageUrl.searchParams.append('size', size);

    staticMapImageUrl.searchParams.append('scale', this.mapResolutionScale);

    const routePolyline = mileageRoute.directions.overview_polyline;
    const path = `color:${this.routeColor}|enc:${routePolyline}`;
    staticMapImageUrl.searchParams.append('path', path);

    const { originParams, destinationParams, waypointsParams } = this.generateMarkerParams(mileageRoute);

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

  private generateMarkerParams(mileageRoute: MileageRoute): MileageMarkerParams {
    const { origin, destination, waypoints } = mileageRoute;

    const markerParams: MileageMarkerParams = {
      originParams: '',
      destinationParams: '',
      waypointsParams: [],
    };

    markerParams.originParams = `label:${this.markers[0]}|${origin.lat},${origin.lng}`;

    if (waypoints.length > 0) {
      for (const [index, waypoint] of waypoints.entries()) {
        const stop = `label:${this.markers[index + 1]}|${waypoint.lat},${waypoint.lng}`;
        markerParams.waypointsParams.push(stop);
      }
    }

    markerParams.destinationParams = `label:${this.markers[waypoints.length + 1]}|${destination.lat},${
      destination.lng
    }`;

    return markerParams;
  }
}
