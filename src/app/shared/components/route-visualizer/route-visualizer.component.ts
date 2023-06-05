import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Observable, catchError, of, map, filter } from 'rxjs';

import { GmapsService } from 'src/app/core/services/gmaps.service';
import { LocationService } from 'src/app/core/services/location.service';
import { MileageLocation } from './mileage-locations.interface';
import { MileageRoute } from './mileage-route.interface';

@Component({
  selector: 'app-route-visualizer',
  templateUrl: './route-visualizer.component.html',
  styleUrls: ['./route-visualizer.component.scss'],
})
export class RouteVisualizerComponent implements OnChanges, OnInit {
  @Input() mileageLocations: MileageLocation[];

  @Input() loadDynamicMap: boolean;

  @Output() mapClick = new EventEmitter<void>();

  dynamicMapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
  };

  showCurrentLocation = false;

  mapWidth = window.innerWidth;

  mapHeight = 266;

  directions$: Observable<google.maps.DirectionsResult>;

  directionsMapUrl$: Observable<string>;

  currentLocation: google.maps.LatLngLiteral;

  currentLocationMapUrl: string;

  constructor(private locationService: LocationService, private gmapsService: GmapsService) {}

  ngOnChanges() {
    this.showCurrentLocation = false;

    const allLocationsValid = this.mileageLocations.every(
      (location) => location && location.latitude && location.longitude
    );

    if (allLocationsValid && this.mileageLocations.length >= 2) {
      const mileageRoute = this.locationService.getMileageRoute(this.mileageLocations);
      this.renderMap(mileageRoute);
    } else {
      this.directions$ = null;
      this.directionsMapUrl$ = null;

      const allLocationsInvalid = this.mileageLocations.every(
        (location) => !(location && location.latitude && location.longitude)
      );

      if (allLocationsInvalid) {
        this.showCurrentLocation = true;
      }
    }
  }

  ngOnInit() {
    this.locationService.getCurrentLocation().subscribe((geoLocationPosition) => {
      if (geoLocationPosition) {
        this.currentLocation = {
          lat: geoLocationPosition.coords.latitude,
          lng: geoLocationPosition.coords.longitude,
        };

        this.currentLocationMapUrl = this.gmapsService.generateLocationMapUrl(
          this.currentLocation,
          this.mapWidth,
          this.mapHeight
        );
      }
    });
  }

  mapClicked(event) {
    this.mapClick.emit();
  }

  handleMapLoadError(event) {
    this.showCurrentLocation = false;

    this.directions$ = null;
    this.directionsMapUrl$ = null;
  }

  private renderMap(mileageRoute: MileageRoute) {
    this.directions$ = this.gmapsService.getDirections(mileageRoute);

    if (!this.loadDynamicMap) {
      this.directionsMapUrl$ = this.directions$.pipe(
        filter((directionsResults) => directionsResults.routes?.length > 0),
        map((directionsResults) => {
          mileageRoute.directions = directionsResults.routes[0];
          return mileageRoute;
        }),
        map((mileageRoute) => this.gmapsService.generateDirectionsMapUrl(mileageRoute, this.mapWidth, this.mapHeight))
      );
    }
  }
}
