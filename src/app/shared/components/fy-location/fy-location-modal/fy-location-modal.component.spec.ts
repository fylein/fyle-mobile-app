import { TestBed, ComponentFixture, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { FyLocationModalComponent } from './fy-location-modal.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, fromEvent, of, throwError } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Geolocation, Position } from '@capacitor/geolocation';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { GmapsService } from 'src/app/core/services/gmaps.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';

describe('FyLocationModalComponent', () => {
  let component: FyLocationModalComponent;
  let fixture: ComponentFixture<FyLocationModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let locationService: jasmine.SpyObj<LocationService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let gmapsService: jasmine.SpyObj<GmapsService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyLocationModalComponent],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
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
          provide: Geolocation,
          useValue: jasmine.createSpyObj('Geolocation', ['requestPermissions']),
        },
        {
          provide: GmapsService,
          useValue: jasmine.createSpyObj('GMapsService', ['getGeocode']),
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
    tick(1000);
    recentlyUsedItems.subscribe((res) => {
      expect(res).toEqual([{ display: 'location1' }, { display: 'location2' }]);
    });
  }));

  it('getRecentlyUsedItems(): should return array of display if recentLocations is undefined but cacheName is defined', fakeAsync(() => {
    component.recentLocations = undefined;
    recentLocalStorageItemsService.get.and.returnValue(Promise.resolve(['display1', 'display2']));
    component.cacheName = ['display1', 'display2'];
    fixture.detectChanges();
    tick(1000);
    const recentlyUsedItems = component.getRecentlyUsedItems();
    expect(recentLocalStorageItemsService.get).toHaveBeenCalledOnceWith(component.cacheName);
    recentlyUsedItems.subscribe((res) => {
      expect(res).toEqual([{ display: 'display1' }, { display: 'display2' }]);
    });
  }));

  it('getRecentlyUsedItems(): should return empty array if recentLocations is undefined and cacheName is undefined', fakeAsync(() => {
    component.recentLocations = undefined;
    component.cacheName = undefined;
    fixture.detectChanges();
    tick(1000);
    const recentlyUsedItems = component.getRecentlyUsedItems();
    recentlyUsedItems.subscribe((res) => {
      expect(res).toEqual([]);
    });
  }));

  it('ngAfterViewInit(): should call getRecentlyUsedItems and set recentItemsFilteredList$ on ngAfterViewInit', fakeAsync(() => {
    const recentLocations = ['Location 1', 'Location 2'];
    component.recentLocations = recentLocations;
    component.currentSelection = { display: 'Display1' };
    spyOn(component, 'checkPermissionStatus');
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    locationService.getCurrentLocation.and.returnValue(
      of({ coords: { latitude: '10.12', longitude: '89.67' } }) as any
    );

    const event = new Event('keyup');
    const searchBarRef = fixture.debugElement.query(By.css('input')).nativeElement;
    searchBarRef.value = 'location 1';
    searchBarRef.dispatchEvent(event);
    locationService.getAutocompletePredictions.and.returnValue(of(false));

    const mockRecentItemsFilteredList = [{ display: 'Location 1' }];

    const getRecentlyUsedItemsSpy = spyOn(component, 'getRecentlyUsedItems').and.returnValue(
      of(mockRecentItemsFilteredList)
    );

    component.ngAfterViewInit();
    fixture.detectChanges();

    expect(component.value).toEqual('Display1');

    expect(getRecentlyUsedItemsSpy).toHaveBeenCalledTimes(1);
    expect(component.recentItemsFilteredList$).toBeTruthy();
    tick(1000);
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(component.checkPermissionStatus).toHaveBeenCalledTimes(1);
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(
      'location 1',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(component.loader).toBeFalse();
  }));

  it('ngAfterViewInit(): should call getRecentlyUsedItems and set recentItemsFilteredList$ on ngAfterViewInit if display in undefined', fakeAsync(() => {
    const recentLocations = ['Location 1', 'Location 2'];
    component.recentLocations = recentLocations;
    component.currentSelection = { display: 'Display1' };
    spyOn(component, 'checkPermissionStatus');
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    locationService.getCurrentLocation.and.returnValue(
      of({ coords: { latitude: '10.12', longitude: '89.67' } }) as any
    );

    const event = new Event('keyup');
    const searchBarRef = fixture.debugElement.query(By.css('input')).nativeElement;
    searchBarRef.value = 'location 1';
    searchBarRef.dispatchEvent(event);
    locationService.getAutocompletePredictions.and.returnValue(of(false));

    const mockRecentItemsFilteredList = [{ display: undefined }];

    const getRecentlyUsedItemsSpy = spyOn(component, 'getRecentlyUsedItems').and.returnValue(
      of(mockRecentItemsFilteredList)
    );

    component.ngAfterViewInit();
    fixture.detectChanges();

    expect(component.value).toEqual('Display1');

    expect(getRecentlyUsedItemsSpy).toHaveBeenCalledTimes(1);
    expect(component.recentItemsFilteredList$).toBeTruthy();
    tick(1000);
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(locationService.getCurrentLocation).toHaveBeenCalledOnceWith({ enableHighAccuracy: false });
    expect(component.checkPermissionStatus).toHaveBeenCalledTimes(1);
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(
      'location 1',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(component.loader).toBeFalse();
  }));

  it('ngAfterViewInit(): should call getRecentlyUsedItems and throw error', fakeAsync(() => {
    const recentLocations = ['Location 1', 'Location 2'];
    component.recentLocations = recentLocations;
    component.currentSelection = { display: 'Display1' };
    spyOn(component, 'checkPermissionStatus');
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    locationService.getCurrentLocation.and.returnValue(
      of({ coords: { latitude: '10.12', longitude: '89.67' } }) as any
    );

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
    tick(1000);
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
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
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
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
    tick(1000);
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
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
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
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
    tick(1000);
    component.recentItemsFilteredList$.subscribe((list) => {
      expect(list).toEqual(mockRecentItemsFilteredList);
    });
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
    expect(searchBarRef.nativeElement.dispatchEvent).toHaveBeenCalledWith(new Event('keyup'));
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
      component.currentSelection = '';
      component.value = 'selection1';
      component.cacheName = 'cache1';
      fixture.detectChanges();
      component.onDoneClick();
      expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith('cache1', { display: 'selection1' });
      expect(modalController.dismiss).toHaveBeenCalledOnceWith({ selection: { display: 'selection1' } });
    });
  });

  it('close(): should dismiss the modal', () => {
    component.close();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('should call necessary services and dismiss the modal with location', fakeAsync(() => {
    const predictedLocations = [{ place_id: 'examplePlaceId', description: 'Example Location' }];
    const geocodedLocation = { display: 'Example Location' };

    loaderService.showLoader.and.returnValue(Promise.resolve());
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    locationService.getCurrentLocation.and.returnValue(of(null));
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocations));
    locationService.getGeocode.and.returnValue(of(geocodedLocation));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalled();
    expect(locationService.getCurrentLocation).toHaveBeenCalledWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledWith('Example Location', 'usvKA4X8Ugcr');
    expect(locationService.getGeocode).toHaveBeenCalledWith('examplePlaceId', 'Example Location');
    expect(modalController.dismiss).toHaveBeenCalledWith({ selection: geocodedLocation });
    expect(loaderService.hideLoader).toHaveBeenCalled();
  }));

  it('should handle error and dismiss the modal with the input location', fakeAsync(() => {
    loaderService.showLoader.and.returnValue(Promise.resolve());
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    locationService.getCurrentLocation.and.returnValue(of(null));
    locationService.getAutocompletePredictions.and.returnValue(of([]));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalled();
    expect(locationService.getCurrentLocation).toHaveBeenCalledWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledWith('Example Location', 'usvKA4X8Ugcr');
    expect(modalController.dismiss).toHaveBeenCalledWith({ selection: { display: 'Example Location' } });
    expect(loaderService.hideLoader).toHaveBeenCalled();
  }));

  it('should call necessary services and dismiss the modal if location is defined', fakeAsync(() => {
    const predictedLocations = [{ place_id: 'examplePlaceId', description: 'Example Location' }];
    const geocodedLocation = { display: 'Example Location' };

    loaderService.showLoader.and.returnValue(Promise.resolve());
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    locationService.getCurrentLocation.and.returnValue(
      of({ coords: { latitude: '10.12', longitude: '89.67' } }) as any
    );
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocations));
    locationService.getGeocode.and.returnValue(of(geocodedLocation));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalled();
    expect(locationService.getCurrentLocation).toHaveBeenCalledWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledWith(
      'Example Location',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(locationService.getGeocode).toHaveBeenCalledWith('examplePlaceId', 'Example Location');
    expect(modalController.dismiss).toHaveBeenCalledWith({ selection: geocodedLocation });
    expect(loaderService.hideLoader).toHaveBeenCalled();
  }));

  it('should call necessary services and dismiss the modal if locationService.getGeoCode returns null', fakeAsync(() => {
    const predictedLocations = [{ place_id: 'examplePlaceId', description: 'Example Location' }];

    loaderService.showLoader.and.returnValue(Promise.resolve());
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    locationService.getCurrentLocation.and.returnValue(
      of({ coords: { latitude: '10.12', longitude: '89.67' } }) as any
    );
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocations));
    locationService.getGeocode.and.returnValue(of(undefined));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalled();
    expect(locationService.getCurrentLocation).toHaveBeenCalledWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledWith(
      'Example Location',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(locationService.getGeocode).toHaveBeenCalledWith('examplePlaceId', 'Example Location');
    expect(modalController.dismiss).toHaveBeenCalled();
    expect(loaderService.hideLoader).toHaveBeenCalled();
  }));

  it('should catch errors if getGeoCode returns error', fakeAsync(() => {
    const predictedLocations = [{ place_id: 'examplePlaceId', description: 'Example Location' }];
    const geocodedLocation = { display: 'Example Location' };

    loaderService.showLoader.and.returnValue(Promise.resolve());
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    locationService.getCurrentLocation.and.returnValue(
      of({ coords: { latitude: '10.12', longitude: '89.67' } }) as any
    );
    locationService.getAutocompletePredictions.and.returnValue(of(predictedLocations));
    locationService.getGeocode.and.returnValue(throwError(() => new Error('error message')));

    component.onRecentItemSelect('Example Location');

    tick(5000);

    expect(loaderService.showLoader).toHaveBeenCalledWith('Loading location...', 5000);
    expect(authService.getEou).toHaveBeenCalled();
    expect(locationService.getCurrentLocation).toHaveBeenCalledWith({ enableHighAccuracy: false });
    expect(locationService.getAutocompletePredictions).toHaveBeenCalledWith(
      'Example Location',
      'usvKA4X8Ugcr',
      '10.12,89.67'
    );
    expect(locationService.getGeocode).toHaveBeenCalledWith('examplePlaceId', 'Example Location');
    expect(modalController.dismiss).toHaveBeenCalledWith({ selection: geocodedLocation });
    expect(loaderService.hideLoader).toHaveBeenCalled();
  }));

  it('onElementSelect(): should dismiss the modal', fakeAsync(() => {
    const location = { place_id: 'examplePlaceId', description: 'Example Location' };
    const geocodedLocation = { display: 'Example Location' };
    component.cacheName = 'cache1';

    locationService.getGeocode.and.returnValue(of(geocodedLocation));

    component.onElementSelect(location);
    tick(1000);

    expect(locationService.getGeocode).toHaveBeenCalledWith('examplePlaceId', 'Example Location');
    expect(recentLocalStorageItemsService.post).toHaveBeenCalledWith(component.cacheName, geocodedLocation);
    expect(modalController.dismiss).toHaveBeenCalledWith({ selection: geocodedLocation });
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

  it('should fetch current location and dismiss the modal with the formatted location', fakeAsync(() => {
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());
    locationService.getCurrentLocation.and.returnValue(of({ coords: { latitude: 12.345, longitude: 67.89 } }) as any);
    gmapsService.getGeocode.and.returnValue(of({ formatted_address: 'Example Address' }) as any);
    spyOn(component, 'formatGeocodeResponse').and.returnValue({ display: 'Example Address' });

    component.getCurrentLocation();

    tick(10000);

    expect(loaderService.showLoader).toHaveBeenCalledWith('Loading current location...', 10000);
    expect(locationService.getCurrentLocation).toHaveBeenCalledWith({ enableHighAccuracy: true });
    expect(gmapsService.getGeocode).toHaveBeenCalledWith(12.345, 67.89);
    expect(modalController.dismiss).toHaveBeenCalledWith({ selection: { display: 'Example Address' } });
    expect(loaderService.hideLoader).toHaveBeenCalled();
  }));

  it('should fetch current location and dismiss the modal with the formatted location', fakeAsync(() => {
    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());
    locationService.getCurrentLocation.and.returnValue(of(undefined));
    gmapsService.getGeocode.and.returnValue(of({ formatted_address: 'Example Address' }) as any);
    spyOn(component, 'formatGeocodeResponse').and.returnValue({ display: 'Example Address' });

    component.getCurrentLocation();

    tick(10000);

    expect(loaderService.showLoader).toHaveBeenCalledWith('Loading current location...', 10000);
    expect(locationService.getCurrentLocation).toHaveBeenCalledWith({ enableHighAccuracy: true });
    expect(gmapsService.getGeocode).toHaveBeenCalledTimes(1);
    expect(modalController.dismiss).toHaveBeenCalledWith({ selection: { display: 'Example Address' } });
    expect(loaderService.hideLoader).toHaveBeenCalled();
  }));

  it('should handle error and set lookupFailed to true', fakeAsync(() => {
    const error = new Error('Some error');

    loaderService.showLoader.and.returnValue(Promise.resolve());
    loaderService.hideLoader.and.returnValue(Promise.resolve());
    locationService.getCurrentLocation.and.returnValue(of(null));
    gmapsService.getGeocode.and.returnValue(throwError(() => error));

    try {
      component.getCurrentLocation();
      tick(10000);
    } catch (err) {
      expect(loaderService.showLoader).toHaveBeenCalledWith('Loading current location...', 10000);
      expect(locationService.getCurrentLocation).toHaveBeenCalledWith({ enableHighAccuracy: true });
      expect(gmapsService.getGeocode).toHaveBeenCalled();
      expect(modalController.dismiss).not.toHaveBeenCalled();
      expect(component.lookupFailed).toBeTrue();
      expect(loaderService.hideLoader).toHaveBeenCalled();
      expect(err).toBe(error);
    }
  }));
});
