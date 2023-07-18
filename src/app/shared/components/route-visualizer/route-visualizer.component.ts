import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Observable, map } from 'rxjs';

import { GmapsService } from 'src/app/core/services/gmaps.service';
import { LocationService } from 'src/app/core/services/location.service';
import { MileageLocation } from './mileage-locations.interface';
import { MileageRoute } from './mileage-route.interface';
import { StaticMapPropertiesService } from 'src/app/core/services/static-map-properties.service';

@Component({
  selector: 'app-route-visualizer',
  templateUrl: './route-visualizer.component.html',
  styleUrls: ['./route-visualizer.component.scss'],
})
export class RouteVisualizerComponent implements OnChanges, OnInit {
  @Input() mileageLocations: MileageLocation[];

  @Output() mapClick = new EventEmitter<void>();

  dynamicMapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
  };

  showCurrentLocation = false;

  mapWidth: number;

  mapHeight: number;

  directionsPolyline$: Observable<string>;

  directionsMapUrl$: Observable<string>;

  currentLocation: google.maps.LatLngLiteral;

  currentLocationMapUrl: string;

  constructor(
    private locationService: LocationService,
    private gmapsService: GmapsService,
    private staticMapPropertiesService: StaticMapPropertiesService
  ) {}

  ngOnChanges() {
    this.showCurrentLocation = false;

    const validLocations = this.mileageLocations.filter(
      (location) => location && location.latitude && location.longitude
    );

    if (validLocations.length === this.mileageLocations.length && this.mileageLocations.length >= 2) {
      const mileageRoute = this.locationService.getMileageRoute(this.mileageLocations);
      this.renderMap(mileageRoute);
    } else {
      this.directionsPolyline$ = null;
      this.directionsMapUrl$ = null;

      if (validLocations.length === 0) {
        this.showCurrentLocation = true;
      }
    }
  }

  ngOnInit() {
    const mapProperties = this.staticMapPropertiesService.getProperties();

    this.mapWidth = mapProperties.width;
    this.mapHeight = mapProperties.height;

    this.locationService.getCurrentLocation().subscribe((geoLocationPosition) => {
      if (geoLocationPosition) {
        this.currentLocation = {
          lat: geoLocationPosition.coords.latitude,
          lng: geoLocationPosition.coords.longitude,
        };

        this.currentLocationMapUrl = this.gmapsService.generateLocationMapUrl(this.currentLocation);
      }
    });
  }

  mapClicked(event) {
    this.mapClick.emit();
  }

  handleMapLoadError(event) {
    this.showCurrentLocation = false;

    this.directionsPolyline$ = null;
    this.directionsMapUrl$ = null;
  }

  private renderMap(mileageRoute: MileageRoute) {
    this.directionsPolyline$ = this.locationService.getDirections(
      mileageRoute.origin,
      mileageRoute.destination,
      mileageRoute.waypoints
    );

    this.directionsMapUrl$ = this.directionsPolyline$.pipe(
      map((directionsPolyline) => ({
        ...mileageRoute,
        directionsPolyline,
      })),
      map((mileageRoute) => this.gmapsService.generateDirectionsMapUrl(mileageRoute))
    );
  }
}
