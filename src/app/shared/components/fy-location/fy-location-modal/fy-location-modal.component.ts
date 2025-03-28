/* eslint-disable */
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  ElementRef,
  Input,
  Inject,
} from '@angular/core';
import {
  map,
  startWith,
  distinctUntilChanged,
  switchMap,
  debounceTime,
  tap,
  finalize,
  catchError,
} from 'rxjs/operators';
import { ModalController, PopoverController } from '@ionic/angular';
import { Observable, fromEvent, of, from, forkJoin, noop, throwError } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Geolocation } from '@capacitor/geolocation';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { MapGeocoderResponse } from '@angular/google-maps';
import { GmapsService } from 'src/app/core/services/gmaps.service';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';
import { DEVICE_PLATFORM } from 'src/app/constants';

@Component({
  selector: 'app-fy-location-modal',
  templateUrl: './fy-location-modal.component.html',
  styleUrls: ['./fy-location-modal.component.scss'],
})
export class FyLocationModalComponent implements OnInit, AfterViewInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() currentSelection: any;

  @Input() header = '';

  @Input() recentLocations: string[];

  @Input() cacheName: any;

  @Input() disableEnteringManualLocation = false;

  @ViewChild('searchBar') searchBarRef: ElementRef;

  loader = false;

  value = '';

  lookupFailed = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filteredList$: Observable<any[]>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentItemsFilteredList$: Observable<any[]>;

  currentGeolocationPermissionGranted = false;

  isDeviceLocationEnabled: boolean = false;

  constructor(
    private gmapsService: GmapsService,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private locationService: LocationService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private popoverController: PopoverController,
    @Inject(DEVICE_PLATFORM) private devicePlatform: 'android' | 'ios' | 'web'
  ) {}

  ngOnInit(): void {
    this.checkPermissionStatus();
  }

  getRecentlyUsedItems(): Observable<{ display: string }[] | []> {
    // Check if recently items exists from api and set, else, set the recent items from the localStorage
    if (this.recentLocations) {
      return of(this.recentLocations.map((recentLocation) => ({ display: recentLocation })));
    } else if (this.cacheName) {
      return from(this.recentLocalStorageItemsService.get(this.cacheName)).pipe(
        map((options: string[]) =>
          options.map((option) => ({
            display: option,
          }))
        )
      );
    } else {
      return of([]);
    }
  }

  async checkPermissionStatus(): Promise<void> {
    try {
      const permission = await Geolocation.checkPermissions();
      this.currentGeolocationPermissionGranted = permission.location === 'granted';
      this.isDeviceLocationEnabled = true;
    } catch (err) {
      // Throws an error when system location permission is disabled (https://capacitorjs.com/docs/apis/geolocation#checkpermissions)
      this.isDeviceLocationEnabled = false;
    }
  }

  async askForEnableLocationSettings(): Promise<void> {
    // edge case: need to bust this cache if location is disabled to make getCurrentLocation work for the next time
    this.locationService.clearCurrentLocationCache();
    from(this.setupEnableLocationPopover())
      .pipe(
        tap((enableLocationPopover) => enableLocationPopover.present()),
        switchMap((enableLocationPopover) => enableLocationPopover.onWillDismiss<{ action: string }>())
      )
      .subscribe(({ data }) => {
        if (data?.action === 'OPEN_SETTINGS') {
          NativeSettings.open({
            optionAndroid: AndroidSettings.Location,
            optionIOS: IOSSettings.LocationServices,
          });
          this.close();
        }
      });
  }

  clearValue(): void {
    /**
     * this.value is ng-model of search field. On click of clear button, clearValue() method will be called
     * this.value is set to empty string
     */
    this.value = '';
    // get search input element
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    // set value shown on UI to empty string
    searchInput.value = '';
    // manually dispatch `keyup` event to filter the list again because filter logic runs on keyup event of search input element
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngAfterViewInit(): void {
    const that = this;
    if (that.currentSelection && that.currentSelection.display) {
      this.value = that.currentSelection.display;
    }

    this.recentItemsFilteredList$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) =>
        this.getRecentlyUsedItems().pipe(
          // filtering of recently used items wrt searchText is taken care in service method
          map((recentrecentlyUsedItems: { display: string }[]) => {
            if (searchText && searchText.length > 0) {
              const searchTextLowerCase = searchText.toLowerCase();
              return recentrecentlyUsedItems.filter((item) =>
                item.display?.toLocaleLowerCase().includes(searchTextLowerCase)
              );
            }
            return recentrecentlyUsedItems;
          })
        )
      )
    );

    that.filteredList$ = fromEvent(that.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((searchText) => {
        if (searchText && searchText.length > 0) {
          that.loader = true;
          return forkJoin({
            eou: that.authService.getEou(),
            currentLocation: that.locationService.getCurrentLocation({ enableHighAccuracy: false }),
          }).pipe(
            tap(() => this.checkPermissionStatus()),
            switchMap(({ eou, currentLocation }) => {
              if (currentLocation) {
                return that.locationService.getAutocompletePredictions(
                  searchText,
                  eou.us.id,
                  `${currentLocation?.coords.latitude},${currentLocation?.coords.longitude}`
                );
              } else {
                return that.locationService.getAutocompletePredictions(searchText, eou.us.id);
              }
            }),
            map((res) => {
              that.loader = false;
              return res;
            }),
            catchError(() => {
              that.loader = false;
              that.lookupFailed = true;
              return of([]);
            })
          );
        } else {
          return of(null);
        }
      })
    );

    that.filteredList$.subscribe(noop);

    that.cdr.detectChanges();
  }

  onDoneClick(): void {
    let value: { display: string };
    if (this.currentSelection && this.value === this.currentSelection) {
      value = this.currentSelection;
    } else if (this.value && this.value !== '') {
      value = { display: this.value };
    } else {
      value = null;
    }

    if (this.cacheName && value) {
      this.recentLocalStorageItemsService.post(this.cacheName, value);
    }

    this.modalController.dismiss({
      selection: value,
    });
  }

  close(): void {
    this.modalController.dismiss();
  }

  onRecentItemSelect(location: string) {
    from(this.loaderService.showLoader('Loading location...', 5000))
      .pipe(
        switchMap(() =>
          forkJoin({
            eou: this.authService.getEou(),
            currentLocation: this.locationService.getCurrentLocation({ enableHighAccuracy: false }),
          })
        ),
        switchMap(({ eou, currentLocation }) => {
          if (currentLocation) {
            return this.locationService.getAutocompletePredictions(
              location,
              eou.us.id,
              `${currentLocation?.coords.latitude},${currentLocation?.coords.longitude}`
            );
          } else {
            return this.locationService.getAutocompletePredictions(location, eou.us.id);
          }
        }),
        switchMap((predictedLocations) => {
          if (predictedLocations && predictedLocations.length > 0) {
            return this.locationService
              .getGeocode(predictedLocations[0].place_id, predictedLocations[0].description)
              .pipe(
                map((location) => {
                  if (location) {
                    return location;
                  } else {
                    return of({ display: location });
                  }
                })
              );
          } else {
            return of({ display: location });
          }
        }),
        catchError(() => of({ display: location })),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe((location) => {
        this.modalController.dismiss({
          selection: location,
        });
      });
  }

  onElementSelect(location) {
    this.locationService.getGeocode(location.place_id, location.description).subscribe((selection) => {
      if (this.cacheName) {
        this.recentLocalStorageItemsService.post(this.cacheName, selection);
      }
      this.modalController.dismiss({
        selection,
      });
    });
  }

  deleteLocation() {
    this.modalController.dismiss({
      selection: null,
    });
  }

  formatGeocodeResponse(geocodeResponse: MapGeocoderResponse) {
    const currentLocation = geocodeResponse?.results?.length && geocodeResponse?.results[0];
    if (!currentLocation) {
      return;
    }

    const formattedLocation: any = {
      display: currentLocation.formatted_address, // geocodeResponse doesn't return display
      formatted_address: currentLocation.formatted_address,
    };

    if (currentLocation.geometry && currentLocation.geometry.location) {
      formattedLocation.latitude = currentLocation.geometry.location.lat();
      formattedLocation.longitude = currentLocation.geometry.location.lng();
    }

    currentLocation.address_components.forEach((component) => {
      if (component.types.indexOf('locality') > -1) {
        formattedLocation.city = component.long_name;
      }

      if (component.types.indexOf('administrative_area_level_1') > -1) {
        formattedLocation.state = component.long_name;
      }

      if (component.types.indexOf('country') > -1) {
        formattedLocation.country = component.long_name;
      }
    });
    return formattedLocation;
  }

  setupEnableLocationPopover(): Promise<HTMLIonPopoverElement> {
    const isIos = this.devicePlatform === 'ios';
    const locationServiceName = isIos ? 'Location Services' : 'Location';
    let title = `Enable ${locationServiceName}`;
    const message = `To fetch current location, please enable ${locationServiceName}. Click Open Settings${
      isIos ? ', go to Privacy & Security' : ''
    } and enable ${locationServiceName}`;

    return this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
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
  }

  setupPermissionDeniedPopover(): Promise<HTMLIonPopoverElement> {
    let title = 'Location permission';
    const message = `To fetch current location, please allow Fyle to access your location. Click Open Settings and allow access to Location and Precise Location`;

    return this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
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
  }

  async getCurrentLocation() {
    if (this.currentGeolocationPermissionGranted) {
      from(this.loaderService.showLoader('Loading current location...', 10000))
        .pipe(
          switchMap(() => this.locationService.getCurrentLocation({ enableHighAccuracy: true })),
          switchMap((coordinates) =>
            this.gmapsService.getGeocode(coordinates?.coords.latitude, coordinates?.coords.longitude)
          ),
          map(this.formatGeocodeResponse),
          catchError((err) => {
            this.lookupFailed = true;
            return throwError(err);
          }),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe((selection) => {
          this.modalController.dismiss({
            selection,
          });
        });
    } else {
      // edge case: need to bust this cache if location permission is denied to make getCurrentLocation work for the next time
      this.locationService.clearCurrentLocationCache();
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'denied' || permission.location === 'prompt-with-rationale') {
        from(this.setupPermissionDeniedPopover())
          .pipe(
            tap((permissionDeniedPopover) => permissionDeniedPopover.present()),
            switchMap((permissionDeniedPopover) => permissionDeniedPopover.onWillDismiss<{ action: string }>())
          )
          .subscribe(({ data }) => {
            if (data?.action === 'OPEN_SETTINGS') {
              NativeSettings.open({
                optionAndroid: AndroidSettings.ApplicationDetails,
                optionIOS: IOSSettings.App,
              });
              this.close();
            }
          });
      }
    }
  }
}
