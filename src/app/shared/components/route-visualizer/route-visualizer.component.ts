import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable, of } from 'rxjs';
import { GmapsService } from 'src/app/core/services/gmaps.service';
import { LocationService } from 'src/app/core/services/location.service';
import { MileageLocation } from './mileage-locations';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-route-visualizer',
  templateUrl: './route-visualizer.component.html',
  styleUrls: ['./route-visualizer.component.scss'],
})
export class RouteVisualizerComponent implements OnInit, OnChanges {
  @Input() mileageLocations: MileageLocation[];

  @Output() mapClick = new EventEmitter<void>();

  currentLocation: google.maps.LatLngLiteral;

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    clickable: false,
  };

  markerPositions: google.maps.LatLngLiteral[] = [];

  origin: google.maps.LatLngLiteral;

  destination: google.maps.LatLngLiteral;

  waypoints: { location: google.maps.LatLngLiteral }[];

  showEmptyMap = false;

  directionsResults$: Observable<google.maps.DirectionsResult>;

  directionsMapUrl: string;

  currentLocationMapUrl: string;

  loadingStaticMap: boolean;

  constructor(private locationService: LocationService, private gmapsService: GmapsService) {}

  ngOnInit() {
    this.locationService.getCurrentLocation().subscribe((geoLocationPosition) => {
      if (geoLocationPosition) {
        this.currentLocation = {
          lat: geoLocationPosition.coords?.latitude,
          lng: geoLocationPosition.coords?.longitude,
        };

        this.loadingStaticMap = true;
        this.currentLocationMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${this.currentLocation.lat},${this.currentLocation.lng}&zoom=15&size=640x640&scale=2&markers=color:blue|${this.currentLocation.lat},${this.currentLocation.lng}&key=${environment.GOOGLE_MAPS_API_KEY}`;
      }
    });
  }

  ngOnChanges() {
    this.showEmptyMap = false;
    const transformedLocations = this.mileageLocations.map((mileageLocation) => ({
      lat: mileageLocation?.latitude,
      lng: mileageLocation?.longitude,
    }));

    this.directionsResults$ = of(null);

    if (transformedLocations.some((location) => !location.lat || !location.lng) || transformedLocations.length === 0) {
      this.origin = null;
      this.destination = null;
      this.waypoints = null;
      this.directionsMapUrl = '';

      if (
        transformedLocations.every((location) => !location.lat || !location.lng) ||
        transformedLocations.length === 0
      ) {
        this.showEmptyMap = true;
      }
    } else {
      if (transformedLocations?.length >= 2) {
        this.origin = transformedLocations[0];
        this.destination = transformedLocations[transformedLocations.length - 1];
        this.directionsMapUrl = '';

        if (transformedLocations?.length > 2) {
          const copyOfMileageLocations = cloneDeep(transformedLocations);
          copyOfMileageLocations.shift();
          copyOfMileageLocations.pop();
          this.waypoints = copyOfMileageLocations.map((loc) => ({ location: { ...loc } }));
        } else {
          this.waypoints = [];
        }
        const directionWaypoints = this.waypoints.map((waypoint) => ({
          location: {
            ...waypoint,
          },
        }));
        this.directionsResults$ = this.gmapsService.getDirections(this.origin, this.destination, directionWaypoints);

        this.directionsResults$.subscribe((directionsResult) => {
          if (directionsResult) {
            this.loadingStaticMap = true;
            this.loadStaticMap(directionsResult.routes[0], this.origin, this.destination, this.waypoints);
          }
        });
      }
    }
  }

  mapClicked(event) {
    this.mapClick.emit();
  }

  private loadStaticMap(
    route: google.maps.DirectionsRoute,
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    waypoints: { location: google.maps.LatLngLiteral }[]
  ) {
    const staticMapsImageURL = 'https://maps.googleapis.com/maps/api/staticmap';

    const encodedPath = route.overview_polyline;

    const alphabets = [
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

    const mileageStart = `&markers=label:${alphabets[0]}|${origin.lat},${origin.lng}`;

    const mileageStops = waypoints.reduce((acc, mileageStop, index) => {
      const stop = `&markers=label:${alphabets[index + 1]}|${mileageStop.location.lat},${mileageStop.location.lng}`;
      if (index === 0) {
        return stop;
      }

      return `${acc}|${stop}`;
    }, '');

    const mileageEnd = `&markers=label:${alphabets[this.mileageLocations.length - 1]}|${destination.lat},${
      destination.lng
    }`;

    const markers = `${mileageStart}${mileageEnd}${mileageStops}`;

    const mapImageSize = '640x640';
    const mapImageScale = '2';

    const mapImagePath = `color:0x00BFFF|weight:8|enc:${encodedPath}`;

    this.directionsMapUrl = `${staticMapsImageURL}?size=${mapImageSize}&scale=${mapImageScale}&${markers}&path=${mapImagePath}&key=${environment.GOOGLE_MAPS_API_KEY}`;
  }
}
