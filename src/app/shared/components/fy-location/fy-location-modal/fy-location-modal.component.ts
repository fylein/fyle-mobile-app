/* eslint-disable */
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  ElementRef,
  Input,
  inject,
  input,
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
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonSpinner, IonToolbar, ModalController, PopoverController } from '@ionic/angular/standalone';
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
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatFormField, MatInput, MatSuffix } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { FyAlertInfoComponent } from '../../fy-alert-info/fy-alert-info.component';
import { MatRipple } from '@angular/material/core';
import { AsyncPipe, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-fy-location-modal',
  templateUrl: './fy-location-modal.component.html',
  styleUrls: ['./fy-location-modal.component.scss'],
  imports: [
    AsyncPipe,
    FormsModule,
    FyAlertInfoComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonSpinner,
    IonToolbar,
    LowerCasePipe,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatRipple,
    MatSuffix,
    TranslocoPipe
  ],
})
export class FyLocationModalComponent implements OnInit, AfterViewInit {
  private gmapsService = inject(GmapsService);
  private modalController = inject(ModalController);
  private cdr = inject(ChangeDetectorRef);
  private locationService = inject(LocationService);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);
  private recentLocalStorageItemsService = inject(RecentLocalStorageItemsService);
  private popoverController = inject(PopoverController);
  private devicePlatform = inject(DEVICE_PLATFORM);
  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() currentSelection: any;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() header = '';

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() recentLocations: string[];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cacheName: any;

  readonly disableEnteringManualLocation = input(false);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('searchBar') searchBarRef: ElementRef;

  loader = false;

  value = '';

  lookupFailed = false;

  nativeSettings = NativeSettings;

  geoLocation = Geolocation;

  filteredList$: Observable<any[]>;

  recentItemsFilteredList$: Observable<any[]>;

  currentGeolocationPermissionGranted = false;

  isDeviceLocationEnabled: boolean = false;

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
          })),
        ),
      );
    } else {
      return of([]);
    }
  }

  async checkPermissionStatus(): Promise<void> {
    try {
      const permission = await this.geoLocation.checkPermissions();
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
        switchMap((enableLocationPopover) => enableLocationPopover.onWillDismiss<{ action: string }>()),
      )
      .subscribe(({ data }) => {
        if (data?.action === 'OPEN_SETTINGS') {
          this.nativeSettings.open({
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
                item.display?.toLocaleLowerCase().includes(searchTextLowerCase),
              );
            }
            return recentrecentlyUsedItems;
          }),
        ),
      ),
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
                  `${currentLocation?.coords.latitude},${currentLocation?.coords.longitude}`,
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
            }),
          );
        } else {
          return of(null);
        }
      }),
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
    from(this.loaderService.showLoader(this.translocoService.translate('fyLocationModal.loadingLocation'), 5000))
      .pipe(
        switchMap(() =>
          forkJoin({
            eou: this.authService.getEou(),
            currentLocation: this.locationService.getCurrentLocation({ enableHighAccuracy: false }),
          }),
        ),
        switchMap(({ eou, currentLocation }) => {
          if (currentLocation) {
            return this.locationService.getAutocompletePredictions(
              location,
              eou.us.id,
              `${currentLocation?.coords.latitude},${currentLocation?.coords.longitude}`,
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
                }),
              );
          } else {
            return of({ display: location });
          }
        }),
        catchError(() => of({ display: location })),
        finalize(() => from(this.loaderService.hideLoader())),
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
    let title = '';
    let message = '';
    if (isIos) {
      title = this.translocoService.translate('fyLocationModal.enableLocationServicesTitle');
      message = this.translocoService.translate('fyLocationModal.enableLocationServicesMessage');
    } else {
      title = this.translocoService.translate('fyLocationModal.enableLocationTitle');
      message = this.translocoService.translate('fyLocationModal.enableLocationMessage');
    }

    return this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta: {
          text: this.translocoService.translate('fyLocationModal.openSettings'),
          action: 'OPEN_SETTINGS',
        },
        secondaryCta: {
          text: this.translocoService.translate('fyLocationModal.cancel'),
          action: 'CANCEL',
        },
      },
      cssClass: 'pop-up-in-center',
      backdropDismiss: false,
    });
  }

  setupPermissionDeniedPopover(): Promise<HTMLIonPopoverElement> {
    const title = this.translocoService.translate('fyLocationModal.locationPermissionTitle');
    const message = this.translocoService.translate('fyLocationModal.locationPermissionMessage');

    return this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta: {
          text: this.translocoService.translate('fyLocationModal.openSettings'),
          action: 'OPEN_SETTINGS',
        },
        secondaryCta: {
          text: this.translocoService.translate('fyLocationModal.cancel'),
          action: 'CANCEL',
        },
      },
      cssClass: 'pop-up-in-center',
      backdropDismiss: false,
    });
  }

  async getCurrentLocation() {
    if (this.currentGeolocationPermissionGranted) {
      from(
        this.loaderService.showLoader(this.translocoService.translate('fyLocationModal.loadingCurrentLocation'), 10000),
      )
        .pipe(
          switchMap(() => this.locationService.getCurrentLocation({ enableHighAccuracy: true })),
          switchMap((coordinates) =>
            this.gmapsService.getGeocode(coordinates?.coords.latitude, coordinates?.coords.longitude),
          ),
          map(this.formatGeocodeResponse),
          catchError((err) => {
            this.lookupFailed = true;
            return throwError(err);
          }),
          finalize(() => from(this.loaderService.hideLoader())),
        )
        .subscribe((selection) => {
          this.modalController.dismiss({
            selection,
          });
        });
    } else {
      // edge case: need to bust this cache if location permission is denied to make getCurrentLocation work for the next time
      this.locationService.clearCurrentLocationCache();
      const permission = await this.geoLocation.requestPermissions();
      if (permission.location === 'denied' || permission.location === 'prompt-with-rationale') {
        from(this.setupPermissionDeniedPopover())
          .pipe(
            tap((permissionDeniedPopover) => permissionDeniedPopover.present()),
            switchMap((permissionDeniedPopover) => permissionDeniedPopover.onWillDismiss<{ action: string }>()),
          )
          .subscribe(({ data }) => {
            if (data?.action === 'OPEN_SETTINGS') {
              this.nativeSettings.open({
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
