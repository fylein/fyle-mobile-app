import { Component, OnInit, Input } from '@angular/core';
import { Observable, forkJoin, noop, of, from, zip, combineLatest } from 'rxjs';
import { ModalController, PopoverController } from '@ionic/angular';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { map, concatMap, finalize, shareReplay, switchMap, tap } from 'rxjs/operators';
import { TransportationRequestsService } from 'src/app/core/services/transportation-requests.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { TripRequestCustomFieldsService } from 'src/app/core/services/trip-request-custom-fields.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { Router } from '@angular/router';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { HotelRequestService } from 'src/app/core/services/hotel-request.service';
import { SavePopoverComponent } from '../save-popover/save-popover.component';

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
  minDate;
  maxDate;

  otherDetailsForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private orgUserSettings: OrgUserSettingsService,
    private currencyService: CurrencyService,
    private transportationRequestsService: TransportationRequestsService,
    private tripRequestCustomFieldsService: TripRequestCustomFieldsService,
    private advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService,
    private loaderService: LoaderService,
    private tripRequestsService: TripRequestsService,
    private router: Router,
    private advanceRequestService: AdvanceRequestService,
    private hotelRequestService: HotelRequestService,
    private popoverController: PopoverController
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

  addAdvance() {
    forkJoin({
      homeCurrency: this.homeCurrency$,
      preferredCurrency: this.preferredCurrency$
    }).subscribe(res => {
      const details = this.formBuilder.group({
        amount: [null, Validators.required],
        currency: [res.preferredCurrency || res.homeCurrency, Validators.required],
        purpose: [null, Validators.required],
        custom_field_values: new FormArray([]),
        notes: [null]
      });
      this.advanceDetails.push(details);
      this.addCustomFields('advance', this.advanceDetails.length - 1);
    });
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

  async onSubmit() {
    const addExpensePopover = await this.popoverController.create({
      component: SavePopoverComponent,
      componentProps: {
        saveMode: 'SUBMIT',
        otherRequests: [
          { hotel: this.fgValues.hotelRequest },
          { transportation: this.fgValues.transportationRequest }
        ]
      },
      cssClass: 'dialog-popover'
    });

    if (this.otherDetailsForm.valid) {
      await addExpensePopover.present();
      const { data } = await addExpensePopover.onDidDismiss();
      if (data && data.continue) {
        this.submitOtherRequests(this.otherDetailsForm.value, 'SUBMIT');
      }
    } else {
      this.otherDetailsForm.markAllAsTouched();
    }
  }

  submitOtherRequests(formValue, mode) {
    let trpId;
    from(this.loaderService.showLoader('Saving as draft')).pipe(
      map(() => {
        return this.makeTripRequestFromForm(this.fgValues);
      }),
      switchMap(res => {
        if (mode === 'SUBMIT') {
          return this.tripRequestsService.submit(res);
        }
        if (mode === 'DRAFT') {
          return this.tripRequestsService.saveDraft(res);
        }
      }),
      switchMap(res => {
        trpId = res.id;
        // create other request and post
        return this.createOtherRequestFormAndPost(formValue, trpId);
      }),
      switchMap(res => {
        return this.tripRequestsService.triggerPolicyCheck(trpId);
      }),
      finalize(() => {
        this.loaderService.hideLoader();
        this.otherDetailsForm.reset();
        this.modalController.dismiss();
        this.router.navigate(['/', 'enterprise', 'my_trips']);
      })
    ).subscribe(noop);
  }

  makeTripRequestFromForm(fgValues) {
    const trp = {
      custom_field_values: fgValues.custom_field_values,
      end_dt: fgValues.endDate,
      notes: fgValues.notes,
      project_id: fgValues.project.project_id,
      purpose: fgValues.purpose,
      source: 'MOBILE',
      start_dt: fgValues.startDate,
      traveller_details: fgValues.travellerDetails,
      trip_cities: fgValues.cities,
      trip_type: fgValues.tripType
    };
    return trp;
  }

  createOtherRequestFormAndPost(formValue, trpId) {

    let arr = [];

    if (formValue.advanceDetails.length > 0) {
      formValue.advanceDetails.forEach(advanceDetail => {
        arr.push(this.makeAdvanceRequestObjectFromForm(advanceDetail, trpId));
      });
    }

    if (formValue.hotelDetails.length > 0) {
      formValue.hotelDetails.forEach(hotelDetail => {
        arr.push(this.makeHotelRequestObjectFromForm(hotelDetail, trpId));
      });
    }

    if (formValue.transportDetails.length > 0) {
      formValue.transportDetails.forEach(transportDetail => {
        arr.push(this.makeTransportRequestObjectFromForm(transportDetail, trpId));
      });
    }

    return forkJoin(arr);
  }

  makeAdvanceRequestObjectFromForm(advanceDetail, trpId) {
    let advanceDetailObject = {
      amount: advanceDetail.amount,
      currency: advanceDetail.currency,
      custom_field_values: advanceDetail.custom_field_values,
      notes: advanceDetail.notes,
      purpose: advanceDetail.purpose,
      source: 'MOBILE',
      trip_request_id: trpId
    };
    return this.advanceRequestService.submit(advanceDetailObject);
  }

  makeHotelRequestObjectFromForm(hotelDetail, trpId) {
    let hotelDetailObject = {
      amount: 15,
      assigned_at: hotelDetail.assignedAt,
      assigned_to: hotelDetail.assignedTo,
      check_in_dt: hotelDetail.checkInDt,
      check_out_dt: hotelDetail.checkOutDt,
      city: hotelDetail.city,
      currency: hotelDetail.currency,
      custom_field_values: hotelDetail.custom_field_values,
      location: hotelDetail.location,
      need_booking: hotelDetail.needBooking,
      notes: hotelDetail.notes,
      rooms: hotelDetail.rooms,
      source: 'MOBILE',
      traveller_details: hotelDetail.travellerDetails,
      trip_request_id: trpId
    };
    return this.hotelRequestService.upsert(hotelDetailObject);
  }

  makeTransportRequestObjectFromForm(transportDetail, trpId) {
    let transportDetailObject = {
      amount: transportDetail.amount,
      assigned_at: transportDetail.assignedAt,
      assigned_to: this.fgValues.travelAgent || null,
      currency: transportDetail.currency,
      custom_field_values: transportDetail.custom_field_values,
      from_city: transportDetail.fromCity,
      need_booking: transportDetail.needBooking,
      notes: transportDetail.notes,
      onward_dt: transportDetail.onwardDt,
      preferred_timing: transportDetail.transportTiming,
      source: 'MOBILE',
      to_city: transportDetail.toCity,
      transport_mode: transportDetail.transportMode,
      traveller_details: transportDetail.travellerDetails,
      trip_request_id: trpId
    };
    return this.transportationRequestsService.upsert(transportDetailObject);
  }

  async saveDraft() {
    const addExpensePopover = await this.popoverController.create({
      component: SavePopoverComponent,
      componentProps: {
        saveMode: 'DRAFT'
      },
      cssClass: 'dialog-popover'
    });

    if (!this.otherDetailsForm.valid) {
      this.otherDetailsForm.markAllAsTouched();
    } else {
      await addExpensePopover.present();
      const { data } = await addExpensePopover.onDidDismiss();
      if (data && data.continue) {
        this.submitOtherRequests(this.otherDetailsForm.value, 'DRAFT');
      }
    }
  }

  ngOnInit() {

    this.orgUserSettings$ = this.orgUserSettings.get();

    this.minDate = this.fgValues.startDate;
    this.maxDate = this.fgValues.endDate;

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
            const checkOutDate = this.fgValues.cities.length > 1 && this.fgValues.cities[index + 1] ? this.fgValues.cities[index + 1].depart_date : null;

            const details = this.formBuilder.group({
              assignedAt: [new Date()],
              assignedTo: [this.fgValues.travelAgent],
              checkInDt: [city.depart_date, Validators.required],
              checkOutDt: [checkOutDate, Validators.required],
              city: [city.to_city],
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

            const onwardDt = this.fgValues.cities[index].depart_date;

            const details = this.formBuilder.group({
              assignedAt: [new Date()],
              currency: [res.preferredCurrency || res.homeCurrency],
              amount: [],
              custom_field_values: new FormArray([]),
              fromCity: [city.from_city],
              needBooking: [true],
              onwardDt: [onwardDt],
              toCity: [city.to_city],
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
                onwardDt: [this.fgValues.cities[index].return_date],
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
