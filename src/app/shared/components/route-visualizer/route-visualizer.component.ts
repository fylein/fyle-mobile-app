import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { LocationService } from 'src/app/core/services/location.service';
import { MileageLocation } from './mileage-locations';

type AgmDirectionLocation = {
  lat: number;
  lng: number;
};

@Component({
  selector: 'app-route-visualizer',
  templateUrl: './route-visualizer.component.html',
  styleUrls: ['./route-visualizer.component.scss'],
})
export class RouteVisualizerComponent implements OnInit, OnChanges {

  @Input() mileageLocations: MileageLocation[];

  currentLocation: AgmDirectionLocation;

  origin: AgmDirectionLocation;
  destination: AgmDirectionLocation;
  waypoints: { location: AgmDirectionLocation }[];

  renderOptions = {
    draggable: false,
    suppressInfoWindows: true
  };

  showEmptyMap = false;

  markerOptions = {
    origin: {
      infoWindow: null
    },
    destination: {
      infoWindow: null
    },
    waypoints: {
      infoWindow: null
    }
  };

  constructor(
    private locationService: LocationService
  ) { }

  ngOnInit() {
    this.locationService.getCurrentLocation().subscribe(geoLocationPosition => {
      if (geoLocationPosition) {
        this.currentLocation = {
          lat: geoLocationPosition.coords?.latitude,
          lng: geoLocationPosition.coords?.longitude
        };
      }
    });
  }

  ngOnChanges() {
    this.showEmptyMap = false;
    const transformedLocations = this.mileageLocations.map(mileageLocation => ({
      lat: mileageLocation?.latitude,
      lng: mileageLocation?.longitude
    }));

    if (transformedLocations.some(location => !location.lat || !location.lng)) {
      this.origin = null;
      this.destination = null;
      this.waypoints = null;

      if (transformedLocations.every(location => !location.lat || !location.lng)) {
        this.showEmptyMap = true;
      }

    } else {
      if (transformedLocations?.length >= 2) {
        this.origin = transformedLocations[0];
        this.destination = transformedLocations[transformedLocations.length - 1];
        if (transformedLocations?.length > 2) {
          const copyOfMileageLocations = cloneDeep(transformedLocations);
          copyOfMileageLocations.shift();
          copyOfMileageLocations.pop();
          this.waypoints = copyOfMileageLocations.map(loc => ({ location: { ...loc } }));
        } else {
          this.waypoints = [];
        }
      }
    }
  }

}
