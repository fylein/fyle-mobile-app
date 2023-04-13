import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { GmapsService } from 'src/app/core/services/gmaps.service';
import { LocationService } from 'src/app/core/services/location.service';
import { RouteVisualizerComponent } from './route-visualizer.component';
import { Position } from '@capacitor/geolocation';
import { of } from 'rxjs';
import {
  mileageLocationData1,
  mileageLocationData2,
  mileageLocationData3,
} from 'src/app/core/mock-data/mileage-location.data';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// eslint-disable-next-line prefer-const
let positionData1: Position = {
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

describe('RouteVisualizerComponent', () => {
  let component: RouteVisualizerComponent;
  let fixture: ComponentFixture<RouteVisualizerComponent>;
  let locationService: jasmine.SpyObj<LocationService>;
  let gmapsService: jasmine.SpyObj<GmapsService>;

  beforeEach(waitForAsync(() => {
    const locationServiceSpy = jasmine.createSpyObj('LocationService', ['getCurrentLocation']);
    const gmapsServiceSpy = jasmine.createSpyObj('GmapsService', ['getDirections']);

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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show route on the map when ngOnChanges is triggered', () => {
    component.mileageLocations = mileageLocationData1;
    gmapsService.getDirections.and.returnValue(of(null));
    fixture.detectChanges();

    component.ngOnChanges();
    expect(gmapsService.getDirections).toHaveBeenCalledOnceWith(component.origin, component.destination, []);
  });

  it('should show empty map when any one of the lat on lng is missing', () => {
    component.mileageLocations = mileageLocationData2;
    gmapsService.getDirections.and.returnValue(of(null));
    component.ngOnChanges();
    fixture.detectChanges();

    expect(gmapsService.getDirections).not.toHaveBeenCalled();
    expect(component.showEmptyMap).toBeTrue();
  });

  it('should empty map when list of location is empty', () => {
    component.mileageLocations = [];
    gmapsService.getDirections.and.returnValue(of(null));
    component.ngOnChanges();
    fixture.detectChanges();

    expect(gmapsService.getDirections).not.toHaveBeenCalled();
    expect(component.showEmptyMap).toBeTrue();
  });

  it('should show route for multiple locations', () => {
    component.mileageLocations = mileageLocationData3;
    gmapsService.getDirections.and.returnValue(of(null));
    component.ngOnChanges();
    fixture.detectChanges();

    expect(gmapsService.getDirections).toHaveBeenCalledOnceWith(component.origin, component.destination, [
      {
        location: {
          location: {
            lat: 22.532432,
            lng: 88.3445775,
          },
        },
      },
    ]);
  });

  it('mapClicked(): should emit event when the map is clicked on', () => {
    spyOn(component.mapClick, 'emit');

    component.mapClicked(new Event('click'));
    expect(component.mapClick.emit).toHaveBeenCalledTimes(1);
  });
});
