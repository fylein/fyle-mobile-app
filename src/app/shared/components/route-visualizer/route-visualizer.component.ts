import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
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
export class RouteVisualizerComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() mileageLocations: MileageLocation[];

  @Input() loadDynamicMap: boolean;

  @Output() mapClick = new EventEmitter<void>();

  dynamicMapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
  };

  showCurrentLocationMap = false;

  directionsResults$: Observable<google.maps.DirectionsResult>;

  routeMapImageUrl$: Observable<string>;

  currentLocation: google.maps.LatLngLiteral;

  currentLocationMapImageUrl: string;

  constructor(
    private locationService: LocationService,
    private gmapsService: GmapsService,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    const isMileageLocationsChanged = changes.mileageLocations && !changes.mileageLocations.firstChange;

    if (isMileageLocationsChanged) {
      this.reset();
    }
  }

  ngOnInit() {
    this.locationService.getCurrentLocation().subscribe((geoLocationPosition) => {
      if (geoLocationPosition) {
        this.currentLocation = {
          lat: geoLocationPosition.coords?.latitude,
          lng: geoLocationPosition.coords?.longitude,
        };
      }
    });
  }

  ngAfterViewInit() {
    if (this.currentLocation) {
      this.currentLocationMapImageUrl = this.gmapsService.generateStaticLocationMapUrl(
        this.currentLocation,
        this.elementRef.nativeElement.offsetWidth,
        266
      );
    }

    this.reset();
  }

  mapClicked(event) {
    this.mapClick.emit();
  }

  handleMapLoadError() {
    this.showCurrentLocationMap = true;
  }

  private reset() {
    this.showCurrentLocationMap = false;

    // Only render the map if there are at least two locations and all locations have a valid latitude and longitude value
    const hasValidLocations = this.mileageLocations.every((location) => location?.latitude && location?.longitude);

    if (hasValidLocations && this.mileageLocations.length >= 2) {
      const mileageRoute = this.locationService.getMileageRoute(this.mileageLocations);
      this.renderMap(mileageRoute);
    } else {
      const allLocationsInvalid = this.mileageLocations.every(
        (location) => !location?.latitude && !location?.longitude
      );
      if (allLocationsInvalid) {
        this.showCurrentLocationMap = true;
      }
    }
  }

  private renderMap(mileageRoute: MileageRoute) {
    this.directionsResults$ = this.gmapsService.getDirections(mileageRoute).pipe(
      map((response) => {
        if (response.status === google.maps.DirectionsStatus.OK) {
          return response.result;
        }

        throw new Error(response.status);
      }),
      catchError(() => {
        this.showCurrentLocationMap = true;
        return of(null);
      })
    );

    if (!this.loadDynamicMap) {
      // Setting the width and height of the map image to the size of the container element to avoid aspect ratio issues
      const containerWidth = this.elementRef.nativeElement.offsetWidth;
      // TODO: Figure out how to set the image dimensions
      const containerHeight = 266;

      this.routeMapImageUrl$ = this.directionsResults$.pipe(
        filter((directionsResults) => directionsResults !== null),
        map((directionsResults) => {
          mileageRoute.directions = directionsResults.routes[0];
          return mileageRoute;
        }),
        map((mileageRoute) =>
          this.gmapsService.generateStaticRouteMapUrl(mileageRoute, containerWidth, containerHeight)
        )
      );
    }
  }
}
