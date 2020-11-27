import { Component, OnInit, Input } from '@angular/core';
import { Observable, forkJoin, noop, of } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { map } from 'rxjs/operators';
import { TransportationRequestsService } from 'src/app/core/services/transportation-requests.service';

@Component({
  selector: 'app-other-requests',
  templateUrl: './other-requests.component.html',
  styleUrls: ['./other-requests.component.scss'],
})
export class OtherRequestsComponent implements OnInit {

  @Input() otherRequests;
  @Input() fgValues;

  isTransportationRequested$: Observable<any>;
  isHotelRequested$: Observable<any>;
  isAdvanceRequested$: Observable<any>;
  orgUserSettings$: Observable<any>;
  preferredCurrency$: Observable<any>;
  homeCurrency$: Observable<any>;
  currency: string;
  transportationMode$: Observable<any>;
  preferredTransportationTiming$: Observable<any>;

  otherDetailsForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private orgUserSettings: OrgUserSettingsService,
    private currencyService: CurrencyService,
    private transportationRequestsService: TransportationRequestsService
  ) { }

  goBack() {
    this.modalController.dismiss();
  }

  get hotelDetails() {
    return this.otherDetailsForm.get('hotelDetails') as FormArray;
  }

  get transportDetails() {
    return this.otherDetailsForm.get('transportDetails') as FormArray;
  }

  get advanceDetails() {
    return this.otherDetailsForm.get('advanceDetails') as FormArray;
  }

  debug(ans) {
    console.log('\n\n ans ->', ans);
  }

  addAdvance() {
    forkJoin({
      homeCurrency: this.homeCurrency$,
      preferredCurrency: this.preferredCurrency$
    }).pipe(
      map(res => {
        const details = this.formBuilder.group({
          amount: [null],
          currency: [res.preferredCurrency || res.homeCurrency],
          purpose: [null],
          custom_field_values: [],
          notes: [null]
        });
        this.advanceDetails.push(details);
      })
    ).subscribe(noop);
  }

  ngOnInit() {

    this.orgUserSettings$ = this.orgUserSettings.get();

    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(
      map(res => {
        return res;
      })
    );

    this.preferredCurrency$ = this.orgUserSettings$.pipe(
      map(res => {
        return  res.currency_settings.preferred_currency;
      })
    );

    this.transportationMode$ = of(this.transportationRequestsService.getTransportationModes());
    this.preferredTransportationTiming$ = of (this.transportationRequestsService.getTransportationPreferredTiming());

    const fork$ = forkJoin({
      homeCurrency: this.homeCurrency$,
      preferredCurrency: this.preferredCurrency$
    }).pipe(
      map(res => {
        if (this.otherRequests[0].hotel) {
          this.fgValues.cities.forEach((city, index) => {

            // tslint:disable-next-line: max-line-length
            const checkOutDate = this.fgValues.cities.length > 1 && this.fgValues.cities[index + 1] ? this.fgValues.cities[index + 1].departDate : null;

            const details = this.formBuilder.group({
              assignedAt: [new Date()],
              assignedTo: [this.fgValues.travelAgent],
              checkInDt: [city.departDate],
              checkOutDt: [checkOutDate],
              city: [city.toCity.city],
              currency: [res.preferredCurrency || res.homeCurrency],
              amount: [],
              customFieldValues: [], // TODO
              location: [],
              needBooking: [true],
              travellerDetails: [this.fgValues.travellerDetails],
              rooms: [1],
              notes: []
            });
            this.hotelDetails.push(details);
          });
        }

        if (this.otherRequests[2].transportation) {
          this.fgValues.cities.forEach((city, index) => {

            const onwardDt = this.fgValues.cities[index].departDate;

            const details = this.formBuilder.group({
              assignedAt: [new Date()],
              currency: [res.preferredCurrency || res.homeCurrency],
              amount: [],
              customFieldValues: [],
              fromCity: [city.fromCity],
              needBooking: [true],
              onwardDt: [onwardDt],
              toCity: [city.toCity],
              transportMode: [],
              transportTiming: [],
              travellerDetails: [this.fgValues.travellerDetails],
              notes: []
            });
            this.transportDetails.push(details);

            console.log('this.otherDetailsForm ---->', this.otherDetailsForm);

            if (this.fgValues.tripType === 'ROUND') {
              const roundTripDetails = this.formBuilder.group({
                assignedAt: [new Date()],
                currency: [res.preferredCurrency || res.homeCurrency],
                amount: [],
                customFieldValues: [],
                fromCity: [this.transportDetails.value[this.transportDetails.length - 1].toCity],
                needBooking: [true],
                onwardDt: [this.fgValues.cities[index].returnDate],
                toCity: [this.transportDetails.value[this.transportDetails.length - 1].fromCity],
                transportMode: [],
                transportTiming: [],
                travellerDetails: [this.fgValues.travellerDetails],
                notes: []
              });
              this.transportDetails.push(roundTripDetails);
            }

            console.log('this.transportDetails ->', this.transportDetails);

          });
        }

        if (this.otherRequests[1].advance) {
          const details = this.formBuilder.group({
            amount: [null],
            currency: [res.preferredCurrency || res.homeCurrency],
            purpose: [null],
            custom_field_values: [],
            notes: [null]
          });
          this.advanceDetails.push(details);
        }
      })
    );

    fork$.subscribe(noop);

    this.otherDetailsForm = new FormGroup({
      hotelDetails: new FormArray([]),
      transportDetails: new FormArray([]),
      advanceDetails: new FormArray([]),
    });
  }

}
