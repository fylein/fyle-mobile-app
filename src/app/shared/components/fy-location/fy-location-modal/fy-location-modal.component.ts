import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit, ElementRef, Input } from '@angular/core';
import { AgmGeocoder } from '@agm/core';
import { map, startWith, distinctUntilChanged, switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import { ModalController } from '@ionic/angular';
import { Observable, fromEvent, of, from, forkJoin } from 'rxjs';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';

const { Geolocation } = Plugins;
@Component({
  selector: 'app-fy-location-modal',
  templateUrl: './fy-location-modal.component.html',
  styleUrls: ['./fy-location-modal.component.scss'],
})
export class FyLocationModalComponent implements OnInit, AfterViewInit {

  @Input() currentSelection: any;
  @Input() header = '';

  @ViewChild('searchBar') searchBarRef: ElementRef;

  filteredList$: Observable<any[]>;

  constructor(
    private agmGeocode: AgmGeocoder,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private locationService: LocationService,
    private authService: AuthService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.currentSelection && this.currentSelection.display) {
      const inputElement = this.searchBarRef.nativeElement as HTMLInputElement;
      inputElement.value = this.currentSelection.display;
    }

    this.filteredList$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchText) => {
        return forkJoin({
          eou: this.authService.getEou(),
          currentLocation: from(Geolocation.getCurrentPosition({
            timeout: 10000,
            enableHighAccuracy: true
          }))
        }).pipe(
          switchMap(({ eou, currentLocation }) => {
            return from(this.loaderService.showLoader()).pipe(
              switchMap(() => {
                return this.locationService.getAutocompletePredictions(searchText, eou.us.id, `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`);
              }),
              finalize(() => from(this.loaderService.hideLoader()))
            );
          })
        );
      })
    );

    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss({
      selection: this.currentSelection
    });
  }

  onElementSelect(location) {
    this.locationService.getGeocode(location.place_id, location.description).subscribe(selection => {
      this.modalController.dismiss({
        selection
      });
    });
  }


  formatGeocodeResponse(geocodeResponse) {
    const currentLocation = geocodeResponse && geocodeResponse.length > 0 && geocodeResponse[0];
    if (!currentLocation) {
      return;
    }

    const formattedLocation: any = {
      display: currentLocation.formatted_address, // geocodeResponse doesn't return display
      formatted_address: currentLocation.formatted_address
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
    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return Geolocation.getCurrentPosition();
      }),
      switchMap((coordinates) => {
        return this.agmGeocode.geocode({
          location: {
            lat: coordinates.coords.latitude,
            lng: coordinates.coords.longitude
          }
        });
      }),
      map(this.formatGeocodeResponse),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe((selection) => {
      this.modalController.dismiss({
        selection
      });
    });
  }

}
