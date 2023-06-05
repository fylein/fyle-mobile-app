import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Position } from '@capacitor/geolocation';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { GmapsService } from 'src/app/core/services/gmaps.service';
import { LocationService } from 'src/app/core/services/location.service';
import { RouteVisualizerComponent } from './route-visualizer.component';
import {
  mileageLocationData1,
  mileageLocationData4,
  mileageLocationData5,
} from 'src/app/core/mock-data/mileage-location.data';
import { MileageRoute } from './mileage-route.interface';
import { directionsResults1, directionsResults2 } from 'src/app/core/mock-data/directions-response.data';

const positionData1: Position = {
  timestamp: Date.now(),
  coords: {
    latitude: 22.4860708,
    longitude: 88.3506995,
    accuracy: 13.147000312805176,
    altitudeAccuracy: 0,
    altitude: -26.39999,
    speed: 0.099,
    heading: 0,
  },
};

const mileageRoute1: MileageRoute = {
  origin: {
    lat: mileageLocationData1[0].latitude,
    lng: mileageLocationData1[0].longitude,
  },
  destination: {
    lat: mileageLocationData1[1].latitude,
    lng: mileageLocationData1[1].longitude,
  },
  waypoints: [],
};

const mockDirectionsMapUrl =
  'https://maps.googleapis.com/maps/api/staticmap?size=350x506&scale=2&path=color%3A0x00BFFF%7Cenc%3AoygtBwpx%7DLa%40LMHGPB%60%40AXNl%40BXC%5CWd%40k%40Y%5BQEIKg%40WwCKYt%40Wr%40Qb%40Ip%40%5Dv%40_%40h%40SIWOe%40XONK%40GE_%40Uq%40MOM%40&markers=label%3AA%7C19.2143774%2C73.20346099999999&markers=label%3AB%7C19.2142019%2C73.2053908&key=GOOGLE_MAPS_API_KEY';

const mockLocationMapUrl =
  'https://maps.googleapis.com/maps/api/staticmap?size=425x266&scale=2&zoom=15&center=19.2185231%2C73.1940418&key=GOOGLE_MAPS_API_KEY';

describe('RouteVisualizerComponent', () => {
  let component: RouteVisualizerComponent;
  let fixture: ComponentFixture<RouteVisualizerComponent>;
  let locationService: jasmine.SpyObj<LocationService>;
  let gmapsService: jasmine.SpyObj<GmapsService>;

  beforeEach(waitForAsync(() => {
    const locationServiceSpy = jasmine.createSpyObj('LocationService', ['getCurrentLocation', 'getMileageRoute']);
    const gmapsServiceSpy = jasmine.createSpyObj('GmapsService', [
      'getDirections',
      'generateDirectionsMapUrl',
      'generateLocationMapUrl',
    ]);

    TestBed.configureTestingModule({
      declarations: [RouteVisualizerComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: LocationService,
          useValue: locationServiceSpy,
        },
        {
          provide: GmapsService,
          useValue: gmapsServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteVisualizerComponent);
    component = fixture.componentInstance;

    locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
    gmapsService = TestBed.inject(GmapsService) as jasmine.SpyObj<GmapsService>;

    locationService.getCurrentLocation.and.returnValue(of(positionData1));
    locationService.getMileageRoute.and.returnValue(mileageRoute1);

    gmapsService.generateLocationMapUrl.and.returnValue(mockLocationMapUrl);
    gmapsService.generateDirectionsMapUrl.and.returnValue(mockDirectionsMapUrl);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should set the current location', () => {
    expect(component.currentLocation).toBeDefined();
    expect(component.currentLocation).toEqual({
      lat: positionData1.coords.latitude,
      lng: positionData1.coords.longitude,
    });
  });

  it('ngOnInit(): should set the current location map image url', () => {
    expect(gmapsService.generateLocationMapUrl).toHaveBeenCalledTimes(1);
    expect(gmapsService.generateLocationMapUrl).toHaveBeenCalledWith(
      component.currentLocation,
      component.mapWidth,
      component.mapHeight
    );
    expect(component.currentLocationMapUrl).toEqual(mockLocationMapUrl);
  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      // @ts-ignore
      spyOn(component, 'renderMap');
    });

    it('should render the directions map when at least 2 mileage locations are provided and they contain valid coordinates', () => {
      gmapsService.getDirections.and.returnValue(of(directionsResults1));
      component.mileageLocations = mileageLocationData1;

      fixture.detectChanges();
      component.ngOnChanges();

      expect(locationService.getMileageRoute).toHaveBeenCalledTimes(1);
      expect(locationService.getMileageRoute).toHaveBeenCalledWith(component.mileageLocations);
      // @ts-ignore
      expect(component.renderMap).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(component.renderMap).toHaveBeenCalledWith(mileageRoute1);
    });

    it('should not render the directions map when any of the provided mileage locations do not contain valid coordinates', () => {
      component.mileageLocations = mileageLocationData5;

      fixture.detectChanges();
      component.ngOnChanges();

      expect(locationService.getMileageRoute).not.toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(component.renderMap).not.toHaveBeenCalled();
      expect(component.directions$).toBeNull();
      expect(component.directionsMapUrl$).toBeNull();
    });

    it('should not render the directions map when less than 2 mileage locations are provided', () => {
      component.mileageLocations = mileageLocationData4;

      fixture.detectChanges();
      component.ngOnChanges();

      expect(locationService.getMileageRoute).not.toHaveBeenCalled();
      // @ts-ignore
      expect(component.renderMap).not.toHaveBeenCalled();
      expect(component.directions$).toBeNull();
      expect(component.directionsMapUrl$).toBeNull();
    });

    it('should display a current location map when no valid mileage locations are present', () => {
      component.mileageLocations = [];

      fixture.detectChanges();
      component.ngOnChanges();

      expect(component.showCurrentLocation).toBe(true);
    });
  });

  describe('renderMap', () => {
    it('should set the map directions based on the route provided to render the map', () => {
      gmapsService.getDirections.and.returnValue(of(directionsResults1));
      component.mileageLocations = mileageLocationData1;

      fixture.detectChanges();
      component.ngOnChanges();

      expect(component.directions$).toBeDefined();
      expect(gmapsService.getDirections).toHaveBeenCalledTimes(1);
      expect(gmapsService.getDirections).toHaveBeenCalledWith(mileageRoute1);
    });

    it('should generate a map image url', () => {
      gmapsService.getDirections.and.returnValue(of(directionsResults1));
      component.mileageLocations = mileageLocationData1;

      fixture.detectChanges();
      component.ngOnChanges();
      fixture.detectChanges();

      expect(component.directionsMapUrl$).toBeDefined();
      expect(gmapsService.generateDirectionsMapUrl).toHaveBeenCalledTimes(1);

      const directionsResults: google.maps.DirectionsResult = directionsResults1;
      const updatedMileageRoute = {
        ...mileageRoute1,
        directions: directionsResults.routes[0],
      };

      expect(gmapsService.generateDirectionsMapUrl).toHaveBeenCalledWith(
        updatedMileageRoute,
        component.mapWidth,
        component.mapHeight
      );
    });

    it('should not generate a map image url if loading a dynamic map', () => {
      gmapsService.getDirections.and.returnValue(of(directionsResults1));
      component.mileageLocations = mileageLocationData1;
      component.loadDynamicMap = true;

      fixture.detectChanges();
      component.ngOnChanges();
      fixture.detectChanges();

      expect(component.directionsMapUrl$).toBeUndefined();
      expect(gmapsService.generateDirectionsMapUrl).not.toHaveBeenCalled();
    });

    it('should not generate a map image url if directions api didnt return any results', () => {
      gmapsService.getDirections.and.returnValue(of(directionsResults2));
      component.mileageLocations = mileageLocationData1;

      fixture.detectChanges();
      component.ngOnChanges();
      fixture.detectChanges();

      expect(gmapsService.generateDirectionsMapUrl).not.toHaveBeenCalled();
    });
  });

  it('handleMapLoadError(): should reset the map component', () => {
    component.handleMapLoadError(null);

    expect(component.showCurrentLocation).toBe(false);
    expect(component.directions$).toBeNull();
    expect(component.directionsMapUrl$).toBeNull();
  });

  it('mapClicked(): should emit event when the map is clicked on', () => {
    spyOn(component.mapClick, 'emit');

    component.mapClicked(new Event('click'));
    expect(component.mapClick.emit).toHaveBeenCalledTimes(1);
  });
});
