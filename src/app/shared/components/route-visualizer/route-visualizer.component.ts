import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Observable, of } from 'rxjs';
import { GmapsService } from 'src/app/core/services/gmaps.service';
import { LocationService } from 'src/app/core/services/location.service';
import { MileageLocation } from './mileage-locations';
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

  constructor(private locationService: LocationService, private gmapsService: GmapsService) {}

  ngOnInit() {
    console.log('INside ngOnInit');
    this.locationService.getCurrentLocation().subscribe((geoLocationPosition) => {
      if (geoLocationPosition) {
        console.log('Got the geoLocationPosition', geoLocationPosition);
        this.currentLocation = {
          lat: geoLocationPosition.coords?.latitude,
          lng: geoLocationPosition.coords?.longitude,
        };
        console.log('So the current location is ', this.currentLocation);
      }
    });
  }

  ngOnChanges() {
    this.showEmptyMap = false;
    const transformedLocations = this.mileageLocations.map((mileageLocation) => ({
      lat: mileageLocation?.latitude,
      lng: mileageLocation?.longitude,
    }));
    console.log('transformedLocations', transformedLocations);

    this.directionsResults$ = of(null);

    if (transformedLocations.some((location) => !location.lat || !location.lng) || transformedLocations.length === 0) {
      this.origin = null;
      this.destination = null;
      this.waypoints = null;
      console.log('Origin, Destination and waypoints set to null');

      if (
        transformedLocations.every((location) => !location.lat || !location.lng) ||
        transformedLocations.length === 0
      ) {
        this.showEmptyMap = true;
        console.log('SHOW EMPTY MAP');
      }
    } else {
      if (transformedLocations?.length >= 2) {
        this.origin = transformedLocations[0];
        this.destination = transformedLocations[transformedLocations.length - 1];
        console.log('ORIGIN', this.origin);
        console.log('DESTINATION', this.destination);
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
      }
    }
  }

  mapClicked(event) {
    this.mapClick.emit();
  }
}
