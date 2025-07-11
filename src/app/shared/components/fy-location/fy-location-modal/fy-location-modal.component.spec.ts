import { TestBed, ComponentFixture, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { FyLocationModalComponent } from './fy-location-modal.component';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Geolocation } from '@capacitor/geolocation';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { GmapsService } from 'src/app/core/services/gmaps.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import {
  coordinatesData1,
  coordinatesData2,
  locationData1,
  predictedLocation1,
} from 'src/app/core/mock-data/location.data';
import { DEVICE_PLATFORM } from 'src/app/constants';

import * as NativeSettings from 'capacitor-native-settings';
import { AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';

describe('FyLocationModalComponent', () => {
  let component: FyLocationModalComponent;
  let fixture: ComponentFixture<FyLocationModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let locationService: jasmine.SpyObj<LocationService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let gmapsService: jasmine.SpyObj<GmapsService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [FyLocationModalComponent],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule, TranslocoModule],
      providers: [
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['dismiss']),
        },
        {
          provide: LocationService,
          useValue: jasmine.createSpyObj('LocationService', [
            'getCurrentLocation',
            'getAutocompletePredictions',
            'getGeocode',
            'clearCurrentLocationCache',
          ]),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['getEou']),
        },
        {
          provide: LoaderService,
          useValue: jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']),
        },
        {
          provide: RecentLocalStorageItemsService,
          useValue: jasmine.createSpyObj('RecentLocalStorageItemsService', ['get', 'post']),
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: Geolocation,
          useValue: jasmine.createSpyObj('Geolocation', ['requestPermissions', 'requestPermissions']),
        },
        {
          provide: GmapsService,
          useValue: jasmine.createSpyObj('GMapsService', ['getGeocode']),
        },
        {
          provide: DEVICE_PLATFORM,
          useValue: 'android',
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyLocationModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    gmapsService = TestBed.inject(GmapsService) as jasmine.SpyObj<GmapsService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyLocation.label': 'location',
        'fyLocation.selectLocation': 'Select {{label}}',
        'fyLocationModal.loadingLocation': 'Loading location...',
        'fyLocationModal.enableLocationServicesTitle': 'Enable Location Services',
        'fyLocationModal.enableLocationTitle': 'Enable Location',
        'fyLocationModal.enableLocationServicesMessage':
          "To fetch your current location, please enable Location Services. Click 'Open Settings',then go to Privacy & Security and turn on Location Services",
        'fyLocationModal.enableLocationMessage':
          "To fetch your current location, please enable Location. Click 'Open Settings' and turn on Location",
        'fyLocationModal.openSettings': 'Open settings',
        'fyLocationModal.cancel': 'Cancel',
        'fyLocationModal.locationPermissionTitle': 'Location permission',
        'fyLocationModal.locationPermissionMessage':
          "To fetch current location, please allow Fyle to access your Location. Click on 'Open Settings', then enable both 'Location' and 'Precise Location' to continue.",
        'fyLocationModal.loadingCurrentLocation': 'Loading current location...',
        'fyLocationModal.search': 'Search',
        'fyLocationModal.clear': 'Clear',
        'fyLocationModal.save': 'Save',
        'fyLocationModal.enableLocationFromSettings': 'Enable location from Settings to fetch current location',
        'fyLocationModal.enable': 'Enable',
        'fyLocationModal.locationError': "Couldn't get current location. Please enter manually.",
        'fyLocationModal.useCurrentLocation': 'Use current location',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call checkPermissionStatus on ngOnInit', () => {
    spyOn(component, 'checkPermissionStatus');
    component.ngOnInit();
    expect(component.checkPermissionStatus).toHaveBeenCalledTimes(1);
  });

  it('getRecentlyUsedItems(): should return array of display if recentLocations is defined', fakeAsync(() => {
    component.recentLocations = ['location1', 'location2'];
    fixture.detectChanges();
    const recentlyUsedItems = component.getRecentlyUsedItems();
    recentlyUsedItems.subscribe((res) => {
      expect(res).toEqual([{ display: 'location1' }, { display: 'location2' }]);
    });
    tick(1000);
  }));

  it('getRecentlyUsedItems(): should return array of display if recentLocations is undefined but cacheName is defined', fakeAsync(() => {
    component.recentLocations = undefined;
    recentLocalStorageItemsService.get.and.resolveTo(['display1', 'display2']);
    component.cacheName = ['display1', 'display2'];
    fixture.detectChanges();
    const recentlyUsedItems = component.getRecentlyUsedItems();
    expect(recentLocalStorageItemsService.get).toHaveBeenCalledOnceWith(component.cacheName);
    recentlyUsedItems.subscribe((res) => {
      expect(res).toEqual([{ display: 'display1' }, { display: 'display2' }]);
    });
    tick(1000);
  }));

  it('getRecentlyUsedItems(): should return empty array if recentLocations is undefined and cacheName is undefined', fakeAsync(() => {
    component.recentLocations = undefined;
    component.cacheName = undefined;
    fixture.detectChanges();
    const recentlyUsedItems = component.getRecentlyUsedItems();
    recentlyUsedItems.subscribe((res) => {
      expect(res).toEqual([]);
    });
    tick(1000);
  }));

  it('ngAfterViewInit(): should call getRecentlyUsedItems and set recentItemsFilteredList$ on ngAfterViewInit', fakeAsync(() => {
    const recentLocations = ['Location 1', 'Location 2'];
    component.recentLocations = recentLocations;
    component.currentSelection = { display: 'Display1' };
    spyOn(component, 'checkPermissionStatus');
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(coordinatesData2));

    const text = 'Ben';
    const userId = 'usvKA4X8Ugcr';
    const location = '19.0748,72.8856';

    const event = new Event('keyup');
    const searchBarRef = fixture.debugElement.query(By.css('input')).nativeElement;
    searchBarRef.value = 'Ben';
    searchBarRef.dispatchEvent(event);
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocation1));

    const mockRecentItemsFilteredList = [{ display: 'Bengaluru' }];

    const getRecentlyUsedItemsSpy = spyOn(component, 'getRecentlyUsedItems').and.returnValue(
      of(mockRecentItemsFilteredList)
    );

    component.ngAfterViewInit();
    fixture.detectChanges();

    expect(component.value).toEqual('Display1');

    expect(getRecentlyUsedItemsSpy).toHaveBeenCalledTimes(1);
    expect(component.recentItemsFilteredList$).toBeTruthy();
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
    tick(1000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(component.checkPermissionStatus).toHaveBeenCalledTimes(1);
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(text, userId, location);
    expect(component.loader).toBeFalse();
  }));

  it('ngAfterViewInit(): should call getRecentlyUsedItems and set recentItemsFilteredList$ on ngAfterViewInit if display in undefined', fakeAsync(() => {
    const recentLocations = ['Bengaluru', 'Bengal'];
    component.recentLocations = recentLocations;
    component.currentSelection = { display: 'Display1' };
    spyOn(component, 'checkPermissionStatus');
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(coordinatesData2));

    const text = 'Ben';
    const userId = 'usvKA4X8Ugcr';
    const location = '19.0748,72.8856';
    const event = new Event('keyup');
    const searchBarRef = fixture.debugElement.query(By.css('input')).nativeElement;
    searchBarRef.value = 'Ben';
    searchBarRef.dispatchEvent(event);
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocation1));

    const mockRecentItemsFilteredList = [{ display: undefined }];

    const getRecentlyUsedItemsSpy = spyOn(component, 'getRecentlyUsedItems').and.returnValue(
      of(mockRecentItemsFilteredList)
    );

    component.ngAfterViewInit();
    fixture.detectChanges();

    expect(component.value).toEqual('Display1');

    expect(getRecentlyUsedItemsSpy).toHaveBeenCalledTimes(1);
    expect(component.recentItemsFilteredList$).toBeTruthy();
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
    tick(1000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(component.checkPermissionStatus).toHaveBeenCalledTimes(1);
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(text, userId, location);
    expect(component.loader).toBeFalse();
  }));

  it('ngAfterViewInit(): should call getRecentlyUsedItems and throw error', fakeAsync(() => {
    const recentLocations = ['Location 1', 'Location 2'];
    component.recentLocations = recentLocations;
    component.currentSelection = { display: 'Display1' };
    spyOn(component, 'checkPermissionStatus');
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(coordinatesData1));

    const event = new Event('keyup');
    const searchBarRef = fixture.debugElement.query(By.css('input')).nativeElement;
    searchBarRef.value = 'location 1';
    searchBarRef.dispatchEvent(event);
    locationService.getAutocompletePredictions.and.returnValue(throwError(() => new Error('Error message')));

    const mockRecentItemsFilteredList = [{ display: 'Location 1' }];

    const getRecentlyUsedItemsSpy = spyOn(component, 'getRecentlyUsedItems').and.returnValue(
      of(mockRecentItemsFilteredList)
    );

    component.ngAfterViewInit();
    fixture.detectChanges();

    expect(component.value).toEqual('Display1');

    expect(getRecentlyUsedItemsSpy).toHaveBeenCalledTimes(1);
    expect(component.recentItemsFilteredList$).toBeTruthy();
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
    tick(1000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(component.checkPermissionStatus).toHaveBeenCalledTimes(1);
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(
      'location 1',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(component.loader).toBeFalse();
    expect(component.lookupFailed).toBeTrue();
  }));

  it('ngAfterViewInit(): should call getAutocompletePredictions if currentLocation is not given', fakeAsync(() => {
    const recentLocations = ['Location 1', 'Location 2'];
    component.recentLocations = recentLocations;
    component.currentSelection = { display: 'Display1' };
    spyOn(component, 'checkPermissionStatus');
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(undefined) as any);

    const event = new Event('keyup');
    const searchBarRef = fixture.debugElement.query(By.css('input')).nativeElement;
    searchBarRef.value = 'location 1';
    searchBarRef.dispatchEvent(event);

    const mockRecentItemsFilteredList = [{ display: 'Location 1' }];

    const getRecentlyUsedItemsSpy = spyOn(component, 'getRecentlyUsedItems').and.returnValue(
      of(mockRecentItemsFilteredList)
    );

    component.ngAfterViewInit();
    fixture.detectChanges();

    expect(component.value).toEqual('Display1');

    expect(getRecentlyUsedItemsSpy).toHaveBeenCalledTimes(1);
    expect(component.recentItemsFilteredList$).toBeTruthy();
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
    tick(1000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(component.checkPermissionStatus).toHaveBeenCalledTimes(1);
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith('location 1', 'usvKA4X8Ugcr');
    expect(component.loader).toBeFalse();
  }));

  it('ngAfterViewInit(): should just return null if searchText is not given', fakeAsync(() => {
    const recentLocations = ['Location 1', 'Location 2'];
    component.recentLocations = recentLocations;
    component.currentSelection = { display: 'Display1' };
    spyOn(component, 'checkPermissionStatus');
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(undefined) as any);

    const event = new Event('keyup');
    const searchBarRef = fixture.debugElement.query(By.css('input')).nativeElement;
    searchBarRef.value = '';
    searchBarRef.dispatchEvent(event);

    const mockRecentItemsFilteredList = [{ display: 'Location 1' }];

    const getRecentlyUsedItemsSpy = spyOn(component, 'getRecentlyUsedItems').and.returnValue(
      of(mockRecentItemsFilteredList)
    );

    component.ngAfterViewInit();
    fixture.detectChanges();

    expect(component.value).toEqual('Display1');

    expect(getRecentlyUsedItemsSpy).toHaveBeenCalledTimes(1);
    expect(component.recentItemsFilteredList$).toBeTruthy();
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
    tick(1000);
    expect(authService.getEou).not.toHaveBeenCalled();
    expect(locationService.getCurrentLocation).not.toHaveBeenCalled();
    expect(component.checkPermissionStatus).not.toHaveBeenCalled();
    expect(locationService.getAutocompletePredictions).not.toHaveBeenCalled();
  }));

  it('should call clearValue and reset search input', () => {
    const searchBarRef = { nativeElement: { value: 'search text', dispatchEvent: jasmine.createSpy() } };
    component.searchBarRef = searchBarRef;
    component.clearValue();

    expect(component.value).toBe('');
    expect(searchBarRef.nativeElement.value).toBe('');
    expect(searchBarRef.nativeElement.dispatchEvent).toHaveBeenCalledOnceWith(new Event('keyup'));
  });

  describe('onDoneClick(): ', () => {
    it('should call dismiss modal with selection equals to currentSelection', () => {
      component.currentSelection = 'selection1';
      component.value = 'selection1';
      fixture.detectChanges();
      component.onDoneClick();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: 'selection1' });
    });

    it('should call dismiss modal if currentSelection is undefined but value is defined', () => {
      component.currentSelection = '';
      component.value = 'selection1';
      fixture.detectChanges();
      component.onDoneClick();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: { display: 'selection1' } });
    });

    it('should call dismiss modal with selection equals to currentSelection', () => {
      component.currentSelection = '';
      component.value = '';
      fixture.detectChanges();
      component.onDoneClick();
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: null });
    });

    it('should call recentLocalStorageItemsService and dismiss modal with currentSelection undefined and value is undefined', () => {
      component.currentSelection = undefined;
      component.value = undefined;
      component.cacheName = 'cache1';
      fixture.detectChanges();
      component.onDoneClick();

      expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: null });
    });
  });

  it('close(): should dismiss the modal', () => {
    component.close();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should call necessary services and dismiss the modal with location', fakeAsync(() => {
    const placeId = 'ChIJbU60yXAWrjsR4E9-UejD3_g';
    const displayName = 'Bengaluru, Karnataka, India';

    const text = 'Example Location';
    const userId = 'usvKA4X8Ugcr';

    loaderService.showLoader.and.resolveTo();
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(null));
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocation1));
    locationService.getGeocode.and.returnValue(of(locationData1));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(text, userId);
    expect(locationService.getGeocode).toHaveBeenCalledOnceWith(placeId, displayName);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: locationData1 });
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
  }));

  it('should handle error and dismiss the modal with the input location', fakeAsync(() => {
    loaderService.showLoader.and.resolveTo();
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(null));
    locationService.getAutocompletePredictions.and.returnValue(of([]));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith('Example Location', 'usvKA4X8Ugcr');
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: { display: 'Example Location' } });
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
  }));

  it('should call necessary services and dismiss the modal if location is defined', fakeAsync(() => {
    loaderService.showLoader.and.resolveTo();
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(coordinatesData1));
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocation1));
    locationService.getGeocode.and.returnValue(of(locationData1));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(
      'Example Location',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(locationService.getGeocode).toHaveBeenCalledOnceWith(
      'ChIJbU60yXAWrjsR4E9-UejD3_g',
      'Bengaluru, Karnataka, India'
    );
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: locationData1 });
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
  }));

  it('should call necessary services and dismiss the modal if locationService.getGeoCode returns null', fakeAsync(() => {
    loaderService.showLoader.and.resolveTo();
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(coordinatesData1));
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocation1));
    locationService.getGeocode.and.returnValue(of(undefined));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(
      'Example Location',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(locationService.getGeocode).toHaveBeenCalledOnceWith(
      'ChIJbU60yXAWrjsR4E9-UejD3_g',
      'Bengaluru, Karnataka, India'
    );
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
  }));

  it('should catch errors if getGeoCode returns error', fakeAsync(() => {
    const geocodedLocation = { display: 'Example Location' };

    loaderService.showLoader.and.resolveTo();
    authService.getEou.and.resolveTo(apiEouRes);
    locationService.getCurrentLocation.and.returnValue(of(coordinatesData1));
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocation1));
    locationService.getGeocode.and.returnValue(throwError(() => new Error('error message')));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(
      'Example Location',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(locationService.getGeocode).toHaveBeenCalledOnceWith(
      'ChIJbU60yXAWrjsR4E9-UejD3_g',
      'Bengaluru, Karnataka, India'
    );
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: geocodedLocation });
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
  }));

  it('onElementSelect(): should dismiss the modal', fakeAsync(() => {
    const location = { place_id: 'examplePlaceId', description: 'Tollygunge, Kolkata, West Bengal, India' };

    component.cacheName = 'cache1';

    locationService.getGeocode.and.returnValue(of(locationData1));

    component.onElementSelect(location);
    tick(1000);

    expect(locationService.getGeocode).toHaveBeenCalledOnceWith(
      'examplePlaceId',
      'Tollygunge, Kolkata, West Bengal, India'
    );
    expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith(component.cacheName, locationData1);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: locationData1 });
  }));

  it('deleteLocation(): should dismiss the modal', () => {
    component.deleteLocation();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: null });
  });

  it('should return formatted location object', () => {
    const geocodeResponse = {
      results: [
        {
          formatted_address: 'Example Address',
          geometry: {
            location: {
              lat: () => 12.345,
              lng: () => 67.89,
            },
          },
          address_components: [
            {
              types: ['locality'],
              long_name: 'City',
            },
            {
              types: ['administrative_area_level_1'],
              long_name: 'State',
            },
            {
              types: ['country'],
              long_name: 'Country',
            },
          ],
        },
      ],
    };

    const formattedLocation = component.formatGeocodeResponse(geocodeResponse as any);

    expect(formattedLocation).toEqual({
      display: 'Example Address',
      formatted_address: 'Example Address',
      latitude: 12.345,
      longitude: 67.89,
      city: 'City',
      state: 'State',
      country: 'Country',
    });
  });

  it('should return undefined when geocodeResponse is undefined', () => {
    const geocodeResponse = undefined;

    const formattedLocation = component.formatGeocodeResponse(geocodeResponse);

    expect(formattedLocation).toBeUndefined();
  });

  it('should return undefined when geocodeResponse is undefined', () => {
    const geocodeResponse = { results: [null] };

    const formattedLocation = component.formatGeocodeResponse(geocodeResponse as any);

    expect(formattedLocation).toBeUndefined();
  });

  describe('getCurrentLocation()', () => {
    it('should fetch current location and dismiss the modal with the formatted location', fakeAsync(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      locationService.getCurrentLocation.and.returnValue(of({ coords: { latitude: 12.345, longitude: 67.89 } }) as any);
      gmapsService.getGeocode.and.returnValue(of({ formatted_address: 'Example Address' }) as any);
      spyOn(component, 'formatGeocodeResponse').and.returnValue({ display: 'Example Address' });
      component.currentGeolocationPermissionGranted = true;

      component.getCurrentLocation();

      tick(10000);

      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading current location...', 10000);
      expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: true });
      expect(gmapsService.getGeocode).toHaveBeenCalledOnceWith(12.345, 67.89);
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: { display: 'Example Address' } });
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));

    it('should fetch current location and dismiss the modal with the formatted location', fakeAsync(() => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      locationService.getCurrentLocation.and.returnValue(of(undefined));
      gmapsService.getGeocode.and.returnValue(of({ formatted_address: 'Example Address' }) as any);
      spyOn(component, 'formatGeocodeResponse').and.returnValue({ display: 'Example Address' });
      component.currentGeolocationPermissionGranted = true;
      component.getCurrentLocation();

      tick(10000);

      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading current location...', 10000);
      expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: true });
      expect(gmapsService.getGeocode).toHaveBeenCalledTimes(1);
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: { display: 'Example Address' } });
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    }));

    it('should handle error and set lookupFailed to true', fakeAsync(() => {
      const error = new Error('Some error');

      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
      locationService.getCurrentLocation.and.returnValue(of(null));
      gmapsService.getGeocode.and.returnValue(throwError(() => error));
      component.currentGeolocationPermissionGranted = true;

      try {
        component.getCurrentLocation();
        tick(10000);
      } catch (err) {
        expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Loading current location...', 10000);
        expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: true });
        expect(gmapsService.getGeocode).toHaveBeenCalledTimes(1);
        expect(modalController.dismiss).not.toHaveBeenCalled();
        expect(component.lookupFailed).toBeTrue();
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(err).toBe(error);
      }
    }));

    it('should bust cache, show permission denied popover and open native settings when permission is denied', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'OPEN_SETTINGS' } });

      const closeSpy = spyOn(component, 'close');
      spyOn(component, 'setupPermissionDeniedPopover').and.resolveTo(popoverSpy);
      component.nativeSettings = jasmine.createSpyObj('NativeSettings', ['open']);

      locationService.clearCurrentLocationCache = jasmine.createSpy('clearCurrentLocationCache');
      const geoLocationSpy = jasmine.createSpyObj('Geolocation', ['requestPermissions']);
      geoLocationSpy.requestPermissions.and.resolveTo({ location: 'denied' });
      component.geoLocation = geoLocationSpy;

      component.currentGeolocationPermissionGranted = false;

      // Act
      component.getCurrentLocation();
      tick();

      // Assert
      expect(locationService.clearCurrentLocationCache).toHaveBeenCalledTimes(1);
      expect(component.setupPermissionDeniedPopover).toHaveBeenCalledTimes(1);
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(component.nativeSettings.open).toHaveBeenCalledOnceWith({
        optionAndroid: AndroidSettings.ApplicationDetails,
        optionIOS: IOSSettings.App,
      });
      expect(closeSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('askForEnableLocationSettings()', () => {
    it('should bust cache, show popover, open native settings and close modal on OPEN_SETTINGS action', fakeAsync(() => {
      // Arrange
      const closeSpy = spyOn(component, 'close');
      component.nativeSettings = jasmine.createSpyObj('NativeSettings', ['open']);
      const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'OPEN_SETTINGS',
        },
      });

      spyOn(component, 'setupEnableLocationPopover').and.resolveTo(popoverSpy);

      // Act
      component.askForEnableLocationSettings();
      tick(); // flush async

      // Assert
      expect(locationService.clearCurrentLocationCache).toHaveBeenCalledTimes(1);
      expect(component.setupEnableLocationPopover).toHaveBeenCalledTimes(1);
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(component.nativeSettings.open).toHaveBeenCalledOnceWith({
        optionAndroid: AndroidSettings.Location,
        optionIOS: IOSSettings.LocationServices,
      });
      expect(closeSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('checkPermissionStatus()', () => {
    let geoLocationSpy;
    beforeEach(() => {
      geoLocationSpy = jasmine.createSpyObj('Geolocation', ['checkPermissions']);
    });

    it('should set currentGeolocationPermissionGranted to true and isDeviceLocationEnabled to true when permission is granted', fakeAsync(async () => {
      geoLocationSpy.checkPermissions.and.resolveTo({ location: 'granted' });
      component.geoLocation = geoLocationSpy;

      await component.checkPermissionStatus();

      expect(component.geoLocation.checkPermissions).toHaveBeenCalledTimes(1);
      expect(component.currentGeolocationPermissionGranted).toBeTrue();
      expect(component.isDeviceLocationEnabled).toBeTrue();
    }));

    it('should set currentGeolocationPermissionGranted to false and isDeviceLocationEnabled to true when permission is denied', fakeAsync(async () => {
      geoLocationSpy.checkPermissions.and.resolveTo({ location: 'denied' });
      component.geoLocation = geoLocationSpy;

      await component.checkPermissionStatus();

      expect(component.geoLocation.checkPermissions).toHaveBeenCalledTimes(1);
      expect(component.currentGeolocationPermissionGranted).toBeFalse();
      expect(component.isDeviceLocationEnabled).toBeTrue();
    }));

    it('should set isDeviceLocationEnabled to false when checkPermissions throws error', fakeAsync(async () => {
      geoLocationSpy.checkPermissions.and.rejectWith(new Error('Permission check failed'));
      component.geoLocation = geoLocationSpy;

      await component.checkPermissionStatus();

      expect(component.geoLocation.checkPermissions).toHaveBeenCalledTimes(1);
      expect(component.isDeviceLocationEnabled).toBeFalse();
    }));
  });

  describe('Popover Setup Methods', () => {
    describe('setupEnableLocationPopover()', () => {
      it('should create popover with iOS-specific title and message', async () => {
        //@ts-ignore
        component.devicePlatform = 'ios';

        popoverController.create.and.resolveTo({} as HTMLIonPopoverElement);

        await component.setupEnableLocationPopover();

        expect(popoverController.create).toHaveBeenCalledOnceWith({
          component: PopupAlertComponent,
          componentProps: {
            title: 'Enable Location Services',
            message:
              "To fetch your current location, please enable Location Services. Click 'Open Settings',then go to Privacy & Security and turn on Location Services",
            primaryCta: {
              text: 'Open settings',
              action: 'OPEN_SETTINGS',
            },
            secondaryCta: {
              text: 'Cancel',
              action: 'CANCEL',
            },
          },
          cssClass: 'pop-up-in-center',
          backdropDismiss: false,
        });
      });

      it('should create popover with Android-specific title and message', async () => {
        //@ts-ignore
        component.devicePlatform = 'android';

        popoverController.create.and.resolveTo({} as HTMLIonPopoverElement);

        await component.setupEnableLocationPopover();

        expect(popoverController.create).toHaveBeenCalledOnceWith({
          component: PopupAlertComponent,
          componentProps: {
            title: 'Enable Location',
            message:
              "To fetch your current location, please enable Location. Click 'Open Settings' and turn on Location",
            primaryCta: {
              text: 'Open settings',
              action: 'OPEN_SETTINGS',
            },
            secondaryCta: {
              text: 'Cancel',
              action: 'CANCEL',
            },
          },
          cssClass: 'pop-up-in-center',
          backdropDismiss: false,
        });
      });
    });

    describe('setupPermissionDeniedPopover()', () => {
      it('should create permission denied popover with expected content', async () => {
        popoverController.create.and.resolveTo({} as HTMLIonPopoverElement);

        await component.setupPermissionDeniedPopover();

        expect(popoverController.create).toHaveBeenCalledOnceWith({
          component: PopupAlertComponent,
          componentProps: {
            title: 'Location permission',
            message:
              "To fetch current location, please allow Fyle to access your Location. Click on 'Open Settings', then enable both 'Location' and 'Precise Location' to continue.",
            primaryCta: {
              text: 'Open settings',
              action: 'OPEN_SETTINGS',
            },
            secondaryCta: {
              text: 'Cancel',
              action: 'CANCEL',
            },
          },
          cssClass: 'pop-up-in-center',
          backdropDismiss: false,
        });
      });
    });
  });
});
