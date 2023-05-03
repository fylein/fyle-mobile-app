import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit, ElementRef, Input } from '@angular/core';
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
import { ModalController } from '@ionic/angular';
import { Observable, fromEvent, of, from, forkJoin, noop, throwError } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Geolocation } from '@capacitor/geolocation';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { MapGeocoderResponse } from '@angular/google-maps';
import { GmapsService } from 'src/app/core/services/gmaps.service';

@Component({
  selector: 'app-fy-location-modal',
  templateUrl: './fy-location-modal.component.html',
  styleUrls: ['./fy-location-modal.component.scss'],
})
export class FyLocationModalComponent implements OnInit, AfterViewInit {
  @Input() currentSelection: any;

  @Input() header = '';

  @Input() recentLocations: string[];

  @Input() cacheName;

  @ViewChild('searchBar') searchBarRef: ElementRef;

  loader = false;

  value = '';

  lookupFailed = false;

  filteredList$: Observable<any[]>;

  recentItemsFilteredList$: Observable<any[]>;

  currentGeolocationPermissionGranted = false;

  constructor(
    private gmapsService: GmapsService,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private locationService: LocationService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) {}

  ngOnInit() {
    this.checkPermissionStatus();
  }

  getRecentlyUsedItems() {
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

  async checkPermissionStatus() {
    const permission = await Geolocation.checkPermissions();
    this.currentGeolocationPermissionGranted = permission.location === 'granted';
  }

  async askForCurrentLocationPermission() {
    await Geolocation.requestPermissions();
    await this.checkPermissionStatus();
  }

  clearValue() {
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

  ngAfterViewInit() {
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
      debounceTime(300),
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

  onDoneClick() {
    let value;
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

  close() {
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

  getCurrentLocation() {
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
  }
}
