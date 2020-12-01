import { Component, OnInit, Input } from '@angular/core';
import { Observable, forkJoin, noop, of, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { map, concatMap, finalize, shareReplay } from 'rxjs/operators';
import { TransportationRequestsService } from 'src/app/core/services/transportation-requests.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { TripRequestCustomFieldsService } from 'src/app/core/services/trip-request-custom-fields.service';
import { LoaderService } from 'src/app/core/services/loader.service';

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
  transportRequestCustomFields$: Observable<any>;
  hotelRequestCustomFields$: Observable<any>;
  advanceRequestCustomFields$: Observable<any>;
  currencies$: Observable<any>;

  otherDetailsForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private orgUserSettings: OrgUserSettingsService,
    private currencyService: CurrencyService,
    private transportationRequestsService: TransportationRequestsService,
    private tripRequestCustomFieldsService: TripRequestCustomFieldsService,
    private advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService,
    private loaderService: LoaderService
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
          amount: [null, Validators.required],
          currency: [res.preferredCurrency || res.homeCurrency, Validators.required],
          purpose: [null, Validators.required],
          custom_field_values: new FormArray([]),
          notes: [null]
        });
        this.advanceDetails.push(details);
        this.addCustomFields('advance', this.advanceDetails.length - 1);
      })
    ).subscribe(noop);
  }

  addCustomFields(requestType, index) {
    if (this.otherRequests[2].transportation && requestType === 'transport') {
      this.transportRequestCustomFields$ = this.tripRequestCustomFieldsService.getAll().pipe(
        map((customFields: any[]) => {
          customFields = customFields.filter(field => {
            return field.request_type === 'TRANSPORTATION_REQUEST';
          });
          const customFieldsFormArray = this.transportDetails.controls[index]['controls'].custom_field_values as FormArray;
          customFieldsFormArray.clear();
          for (const customField of customFields) {
            customFieldsFormArray.push(
              this.formBuilder.group({
                id: customField.id,
                name: customField.input_name,
                value: [, customField.mandatory && Validators.required]
              })
            );
          }

          return customFields.map((customField, i) => {
            customField.control = customFieldsFormArray.at(i);

            if (customField.options) {
              customField.options = customField.options.map(option => {
                return { label: option, value: option };
              });
            }
            return customField;
          });
        })
      );
    }

    if (this.otherRequests[0].hotel && requestType === 'hotel') {
      this.hotelRequestCustomFields$ = this.tripRequestCustomFieldsService.getAll().pipe(
        map((customFields: any[]) => {
          customFields = customFields.filter(field => {
            return field.request_type === 'HOTEL_REQUEST';
          });
          const customFieldsFormArray = this.hotelDetails.controls[index]['controls'].custom_field_values as FormArray;
          customFieldsFormArray.clear();
          for (const customField of customFields) {
            customFieldsFormArray.push(
              this.formBuilder.group({
                id: customField.id,
                name: customField.input_name,
                value: [, customField.mandatory && Validators.required]
              })
            );
          }

          return customFields.map((customField, i) => {
            customField.control = customFieldsFormArray.at(i);

            if (customField.options) {
              customField.options = customField.options.map(option => {
                return { label: option, value: option };
              });
            }
            return customField;
          });
        })
      );
    }

    if (this.otherRequests[1].advance && requestType === 'advance') {
      this.advanceRequestCustomFields$ = this.advanceRequestsCustomFieldsService.getAll().pipe(
        map((customFields: any[]) => {
          const customFieldsFormArray = this.advanceDetails.controls[index]['controls'].custom_field_values as FormArray;
          customFieldsFormArray.clear();
          for (const customField of customFields) {
            customFieldsFormArray.push(
              this.formBuilder.group({
                id: customField.id,
                name: customField.name,
                value: [, customField.mandatory && Validators.required]
              })
            );
          }

          return customFields.map((customField, i) => {
            customField.control = customFieldsFormArray.at(i);

            if (customField.options) {
              customField.options = customField.options.map(option => {
                return { label: option, value: option };
              });
            }
            return customField;
          });
        })
      );
    }
  }

  removeAdvance(i) {
    this.advanceDetails.removeAt(i);
  }

  onSubmit() {
    if (this.otherDetailsForm.valid) {
      console.log('submitting other details form ->', this.otherDetailsForm);
    } else {
      this.otherDetailsForm.markAllAsTouched();
    }
  }

  saveDraft() {

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

    this.currencies$ = from(this.loaderService.showLoader()).pipe(
      concatMap(() => {
        return this.currencyService.getAll();
      }),
      map(currenciesObj => Object.keys(currenciesObj).map(shortCode => ({
        value: shortCode,
        label: shortCode,
        displayValue: shortCode + ' - ' + currenciesObj[shortCode]
      }))),
      finalize(() => {
        from(this.loaderService.hideLoader()).subscribe(noop);
      }),
      shareReplay()
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
              checkInDt: [city.departDate, Validators.required],
              checkOutDt: [checkOutDate, Validators.required],
              city: [city.toCity.city],
              currency: [res.preferredCurrency || res.homeCurrency],
              amount: [],
              custom_field_values: new FormArray([]),
              location: [],
              needBooking: [true],
              travellerDetails: [this.fgValues.travellerDetails],
              rooms: [1],
              notes: []
            });
            this.hotelDetails.push(details);
            this.addCustomFields('hotel', index);
          });
        }

        if (this.otherRequests[2].transportation) {
          this.fgValues.cities.forEach((city, index) => {

            const onwardDt = this.fgValues.cities[index].departDate;

            const details = this.formBuilder.group({
              assignedAt: [new Date()],
              currency: [res.preferredCurrency || res.homeCurrency],
              amount: [],
              custom_field_values: new FormArray([]),
              fromCity: [city.fromCity],
              needBooking: [true],
              onwardDt: [onwardDt],
              toCity: [city.toCity],
              transportMode: [, Validators.required],
              transportTiming: [],
              travellerDetails: [this.fgValues.travellerDetails],
              notes: []
            });
            this.transportDetails.push(details);
            this.addCustomFields('transport', index);

            if (this.fgValues.tripType === 'ROUND') {
              const roundTripDetails = this.formBuilder.group({
                assignedAt: [new Date()],
                currency: [res.preferredCurrency || res.homeCurrency],
                amount: [],
                custom_field_values: new FormArray([]),
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
          });
        }

        if (this.otherRequests[1].advance) {
          const details = this.formBuilder.group({
            amount: [null, Validators.required],
            currency: [res.preferredCurrency || res.homeCurrency, Validators.required],
            purpose: [null, Validators.required],
            custom_field_values: new FormArray([]),
            notes: [null]
          });
          this.advanceDetails.push(details);
          // passsing static index as this will execute only once, can also write -> this.advanceDetails.length
          this.addCustomFields('advance', 0);
        }
      })
    );

    fork$.subscribe(noop);

    this.otherDetailsForm = new FormGroup({
      hotelDetails: new FormArray([]),
      transportDetails: new FormArray([]),
      advanceDetails: new FormArray([]),
    });

    this.otherDetailsForm.valueChanges.subscribe(res => console.log('res ->', res));
  }

}
