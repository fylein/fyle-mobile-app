/* eslint-disable @typescript-eslint/dot-notation */
import { Observable, forkJoin, noop, of, from, zip, combineLatest, throwError } from 'rxjs';
import { Component, OnInit, Input, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { map, concatMap, finalize, shareReplay, switchMap, tap, take, catchError, mergeMap } from 'rxjs/operators';
import { TransportationRequestsService } from 'src/app/core/services/transportation-requests.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { TripRequestCustomFieldsService } from 'src/app/core/services/trip-request-custom-fields.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { Router } from '@angular/router';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { HotelRequestService } from 'src/app/core/services/hotel-request.service';
import { SavePopoverComponent } from '../save-popover/save-popover.component';
import * as moment from 'moment';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { TripRequestPolicyService } from '../../../core/services/trip-request-policy.service';
import { PolicyViolationComponent } from '../policy-violation/policy-violation.component';
import { StatusService } from '../../../core/services/status.service';
import { DateService } from 'src/app/core/services/date.service';

@Component({
  selector: 'app-other-requests',
  templateUrl: './other-requests.component.html',
  styleUrls: ['./other-requests.component.scss'],
})
export class OtherRequestsComponent implements OnInit {
  @Input() otherRequests;

  @Input() fgValues;

  @Input() id;

  @ViewChild('formContainer') formContainer: ElementRef;

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

  hotelRequest$: Observable<any>;

  transportationRequest$: Observable<any>;

  advanceRequest$: Observable<any>;

  actions$: Observable<any>;

  minDate;

  maxDate;

  advanceRequestCustomFieldValues: [];

  transportRequestCustomFieldValues: [];

  hotelRequestCustomFieldValues: [];

  tripActions;

  saveDratTripLoading = false;

  submitTripLoading = false;

  tripDate;

  hotelDate;

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
    private popoverController: PopoverController,
    private tripRequestPolicyService: TripRequestPolicyService,
    private statusService: StatusService,
    private dateService: DateService
  ) {}

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
      preferredCurrency: this.preferredCurrency$,
    }).subscribe((res) => {
      const details = this.formBuilder.group({
        amount: [null, Validators.required],
        currency: [res.preferredCurrency || res.homeCurrency, Validators.required],
        purpose: [this.fgValues.purpose || null, Validators.required],
        custom_field_values: new FormArray([]),
        notes: [null],
      });
      this.advanceDetails.push(details);
      this.addCustomFields('advance', this.advanceDetails.length - 1);
    });
  }

  modifyOtherRequestCustomFields(customFields, type): CustomField[] {
    customFields.sort((a, b) => (a.id > b.id ? 1 : -1));
    customFields = customFields.map((customField) => {
      if (customField.type === 'DATE' && customField.value) {
        customField.value = moment(customField.value).format('y-MM-DD');
      }
      return { id: customField.id, name: customField.name, value: customField.value };
    });

    if (type === 'ADVANCE') {
      this.advanceRequestCustomFieldValues = customFields;
      return this.advanceRequestCustomFieldValues;
    }

    if (type === 'TRANSPORT') {
      this.transportRequestCustomFieldValues = customFields;
      return this.transportRequestCustomFieldValues;
    }

    if (type === 'HOTEL') {
      this.hotelRequestCustomFieldValues = customFields;
      return this.hotelRequestCustomFieldValues;
    }
  }

  addCustomFields(requestType, index) {
    if (this.otherRequests[2].transportation && requestType === 'transport') {
      this.transportRequestCustomFields$ = this.tripRequestCustomFieldsService.getAll().pipe(
        map((customFields: any[]) => {
          const customFieldsFormArray = this.transportDetails.controls[index]['controls']
            .custom_field_values as FormArray;
          customFieldsFormArray.clear();
          customFields.sort((a, b) => (a.id > b.id ? 1 : -1));

          customFields = customFields.filter(
            (field) =>
              field.request_type === 'TRANSPORTATION_REQUEST' && field.trip_type.indexOf(this.fgValues.tripType) > -1
          );

          for (const customField of customFields) {
            let value;
            this.transportRequestCustomFieldValues.filter((customFieldValue: any) => {
              if (customFieldValue.id === customField.id) {
                value = customFieldValue.value;
              }
            });
            customFieldsFormArray.push(
              this.formBuilder.group({
                id: customField.id,
                name: customField.input_name,
                value: [value, customField.mandatory && Validators.required],
              })
            );
          }

          return customFields.map((customField, i) => {
            customField.control = customFieldsFormArray.at(i);

            if (customField.input_options) {
              customField.input_options = customField.input_options.map((option) => ({ label: option, value: option }));
            }
            return customField;
          });
        })
      );
    }

    if (this.otherRequests[0].hotel && requestType === 'hotel') {
      this.hotelRequestCustomFields$ = this.tripRequestCustomFieldsService.getAll().pipe(
        map((customFields: any[]) => {
          const customFieldsFormArray = this.hotelDetails.controls[index]['controls'].custom_field_values as FormArray;
          customFieldsFormArray.clear();
          customFields.sort((a, b) => (a.id > b.id ? 1 : -1));

          customFields = customFields.filter(
            (field) => field.request_type === 'HOTEL_REQUEST' && field.trip_type.indexOf(this.fgValues.tripType) > -1
          );

          for (const customField of customFields) {
            let value;
            this.hotelRequestCustomFieldValues.filter((customFieldValue: any) => {
              if (customFieldValue.id === customField.id) {
                value = customFieldValue.value;
              }
            });
            customFieldsFormArray.push(
              this.formBuilder.group({
                id: customField.id,
                name: customField.input_name,
                value: [value, customField.mandatory && Validators.required],
              })
            );
          }

          return customFields.map((customField, i) => {
            customField.control = customFieldsFormArray.at(i);

            if (customField.options) {
              customField.options = customField.options.map((option) => ({ label: option, value: option }));
            }
            return customField;
          });
        })
      );
    }

    if (this.otherRequests[1].advance && requestType === 'advance') {
      this.advanceRequestCustomFields$ = this.advanceRequestsCustomFieldsService.getAll().pipe(
        map((customFields: any[]) => {
          const customFieldsFormArray = this.advanceDetails.controls[index]['controls']
            .custom_field_values as FormArray;
          customFieldsFormArray.clear();
          customFields.sort((a, b) => (a.id > b.id ? 1 : -1));

          for (const customField of customFields) {
            let value;
            this.advanceRequestCustomFieldValues.filter((customFieldValue: any) => {
              if (customFieldValue.id === customField.id) {
                value = customFieldValue.value;
              }
            });

            customFieldsFormArray.push(
              this.formBuilder.group({
                id: customField.id,
                name: customField.name,
                value: [value, customField.mandatory && Validators.required],
              })
            );
          }

          return customFields.map((customField, i) => {
            customField.control = customFieldsFormArray.at(i);

            if (customField.options) {
              customField.options = customField.options.map((option) => ({ label: option, value: option }));
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
        otherRequests: [{ hotel: this.fgValues.hotelRequest }, { transportation: this.fgValues.transportationRequest }],
      },
      cssClass: 'dialog-popover',
    });

    if (this.otherDetailsForm.valid && (!this.fgValues.hotelRequest || !this.fgValues.transportationRequest)) {
      await addExpensePopover.present();
      const { data } = await addExpensePopover.onDidDismiss();
      if (data && data.continue) {
        this.submitOtherRequests(this.otherDetailsForm.value, 'SUBMIT');
      }
    } else if (this.otherDetailsForm.valid) {
      this.submitOtherRequests(this.otherDetailsForm.value, 'SUBMIT');
    } else {
      this.otherDetailsForm.markAllAsTouched();

      const formContainer = this.formContainer.nativeElement as HTMLElement;

      if (formContainer) {
        const invalidElement = formContainer.querySelector('.ng-invalid');
        if (invalidElement) {
          invalidElement.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }
    }
  }

  async showPolicyViolationPopup(policyPopupRules: any[], policyActionDescription: string, tripReq) {
    const latestComment = await this.statusService
      .findLatestComment(tripReq.id, 'trip_requests', tripReq.org_user_id)
      .toPromise();

    const policyViolationsModal = await this.modalController.create({
      component: PolicyViolationComponent,
      componentProps: {
        policyViolationMessages: policyPopupRules,
        policyActionDescription,
        comment: latestComment,
      },
    });

    await policyViolationsModal.present();

    const { data } = await policyViolationsModal.onWillDismiss();
    if (data) {
      return {
        status: 'proceed',
        comment: data.comment,
      };
    } else {
      return {
        status: 'stop',
      };
    }
  }

  checkPolicyAndSaveOrSubmit(tripReq, formValue, saveMode) {
    return this.createOtherRequestForm(formValue, tripReq.id, 'POLICY_CHECK').pipe(
      switchMap((res: any) => {
        const tripRequestObject = {
          trip_request: tripReq,
          advance_requests: res[0],
          transportation_requests: res[2],
          hotel_requests: res[1],
        };

        return this.tripRequestPolicyService.testTripRequest(tripRequestObject).pipe(
          catchError((err) => of(null)),
          switchMap((policyTest: any) => {
            const policyPopupRules = this.tripRequestPolicyService.getPolicyPopupRules(policyTest);
            if (policyPopupRules.length > 0) {
              const policyActionDescription = policyTest && policyTest.trip_request_desired_state.action_description;
              return from(this.showPolicyViolationPopup(policyPopupRules, policyActionDescription, tripReq)).pipe(
                switchMap((policyModalRes) => {
                  if (policyModalRes.status === 'proceed') {
                    return of({
                      tripReq,
                      comment: policyModalRes.comment,
                    });
                  } else {
                    return throwError({
                      status: 'Policy Violated',
                    });
                  }
                })
              );
            } else {
              return of({ tripReq });
            }
          }),
          catchError((err) => {
            if (err.status === 'Policy Violated') {
              return throwError({
                status: 'Policy Violated',
              });
            } else {
              return of({ tripReq });
            }
          })
        );
      }),
      switchMap(({ tripReq, comment }: any) => {
        if (comment && tripReq.id) {
          if (saveMode === 'SUBMIT') {
            return this.tripRequestsService
              .submit(tripReq)
              .pipe(this.updateStatusOnTripReqSubmission(tripReq, comment));
          } else {
            return this.tripRequestsService
              .saveDraft(tripReq)
              .pipe(this.updateStatusOnTripReqDraftSubmission(tripReq, comment));
          }
        } else {
          if (saveMode === 'SUBMIT') {
            return this.tripRequestsService.submit(tripReq);
          } else {
            return this.tripRequestsService.saveDraft(tripReq);
          }
        }
      })
    );
  }

  updateStatusOnTripReqDraftSubmission(tripReq: any, comment: any) {
    return switchMap((res) =>
      this.statusService.findLatestComment(tripReq.id, 'trip_requests', tripReq.org_user_id).pipe(
        switchMap((result) => {
          if (result !== comment) {
            return this.statusService.post('trip_requests', tripReq.id, { comment }, true).pipe(map(() => res));
          } else {
            return of(res);
          }
        })
      )
    );
  }

  updateStatusOnTripReqSubmission(tripReq: any, comment: any) {
    return switchMap((res) =>
      this.statusService.findLatestComment(tripReq.id, 'trip_requests', tripReq.org_user_id).pipe(
        switchMap((result) => {
          if (result !== comment) {
            return this.statusService.post('trip_requests', tripReq.id, { comment }, true).pipe(map(() => res));
          } else {
            return of(res);
          }
        })
      )
    );
  }

  submitOtherRequests(formValue, mode) {
    if (mode === 'SUBMIT') {
      this.submitTripLoading = true;
    } else {
      this.saveDratTripLoading = true;
    }
    let trpId;
    this.makeTripRequestFromForm(this.fgValues)
      .pipe(
        concatMap((tripReq) => {
          if (mode === 'SUBMIT') {
            return this.checkPolicyAndSaveOrSubmit(tripReq, formValue, 'SUBMIT');
          }
          if (mode === 'DRAFT') {
            return this.checkPolicyAndSaveOrSubmit(tripReq, formValue, 'SAVE_DRAFT');
          }
        }),
        concatMap((res: { id: string }) => {
          trpId = res.id;
          return this.createOtherRequestForm(formValue, trpId, 'SUBMIT');
        }),
        concatMap((res) => this.tripRequestsService.triggerPolicyCheck(trpId)),
        finalize(() => {
          if (mode === 'SUBMIT') {
            this.submitTripLoading = false;
          } else {
            this.saveDratTripLoading = false;
          }
        })
      )
      .subscribe(
        () => {
          this.otherDetailsForm.reset();
          this.modalController.dismiss();
          this.router.navigate(['/', 'enterprise', 'my_trips']);
        },
        (_) => {}
      );
  }

  makeTripRequestFromForm(fgValues) {
    if (this.id) {
      return forkJoin({
        tripRequest: this.tripRequestsService.get(this.id),
      }).pipe(
        map((res) => {
          const tripRequest: any = res.tripRequest;

          const trp = {
            ...tripRequest,
            custom_field_values: fgValues.custom_field_values,
            end_dt: fgValues.endDate,
            notes: fgValues.notes,
            project_id: (fgValues.project && fgValues.project.project_id) || null,
            purpose: fgValues.purpose,
            source: fgValues.source,
            start_dt: fgValues.startDate,
            traveller_details: fgValues.travellerDetails,
            trip_cities: fgValues.cities,
            trip_type: fgValues.tripType,
          };
          return trp;
        })
      );
    } else {
      const trp = {
        custom_field_values: fgValues.custom_field_values,
        end_dt: fgValues.endDate,
        notes: fgValues.notes,
        project_id: (fgValues.project && fgValues.project.project_id) || null,
        purpose: fgValues.purpose,
        source: fgValues.source,
        start_dt: fgValues.startDate,
        traveller_details: fgValues.travellerDetails,
        trip_cities: fgValues.cities,
        trip_type: fgValues.tripType,
      };
      return of(trp);
    }
  }

  createOtherRequestForm(formValue, trpId, mode) {
    const advance = [];
    const hotel = [];
    const transport = [];

    this.handleAdvances(formValue, mode, advance, trpId);

    this.handleHotelDetails(formValue, mode, hotel, trpId);

    this.handleTransportDetails(formValue, mode, transport, trpId);

    try {
      if (advance.length === 0 && hotel.length === 0 && transport.length === 0) {
        return of([]);
      } else {
        return forkJoin([
          advance.length > 0 ? forkJoin(advance) : of([]),
          hotel.length > 0 ? forkJoin(hotel) : of([]),
          transport.length > 0 ? forkJoin(transport) : of([]),
        ]);
      }
    } catch (e) {}
  }

  handleTransportDetails(formValue: any, mode: any, transport: any[], trpId: any) {
    if (formValue.transportDetails.length > 0) {
      if (mode === 'POLICY_CHECK') {
        formValue.transportDetails.forEach((transportDetail, index) => {
          transport.push(this.makeTransportRequestObjectFromForm(transportDetail, trpId, index, mode));
        });
      } else {
        // this case handels submit transport request, makes sequential submit calls
        of(formValue.transportDetails)
          .pipe(
            switchMap((transportDetails) => from(transportDetails)),
            concatMap((transportDetail, index) =>
              this.makeTransportRequestObjectFromForm(transportDetail, trpId, index, mode)
            )
          )
          .subscribe(noop);
      }
    }
  }

  handleHotelDetails(formValue: any, mode: any, hotel: any[], trpId: any) {
    if (formValue.hotelDetails.length > 0) {
      if (mode === 'POLICY_CHECK') {
        formValue.hotelDetails.forEach((hotelDetail, index) => {
          hotel.push(this.makeHotelRequestObjectFromForm(hotelDetail, trpId, index, mode));
        });
      } else {
        // this case handels submit hotel request, makes sequential submit calls
        of(formValue.hotelDetails)
          .pipe(
            switchMap((hotelDetails) => from(hotelDetails)),
            concatMap((hotelDetail, index) => this.makeHotelRequestObjectFromForm(hotelDetail, trpId, index, mode))
          )
          .subscribe(noop);
      }
    }
  }

  handleAdvances(formValue: any, mode: any, advance: any[], trpId: any) {
    if (formValue.advanceDetails.length > 0) {
      if (mode === 'POLICY_CHECK') {
        formValue.advanceDetails.forEach((advanceDetail, index) => {
          advance.push(this.makeAdvanceRequestObjectFromForm(advanceDetail, trpId, index, mode));
        });
      } else {
        // this case handels submit advance request, makes sequential submit calls
        of(formValue.advanceDetails)
          .pipe(
            switchMap((advanceDetails) => from(advanceDetails)),
            concatMap((advanceDetail, index) =>
              this.makeAdvanceRequestObjectFromForm(advanceDetail, trpId, index, mode)
            )
          )
          .subscribe(noop);
      }
    }
  }

  // TODO refactor
  makeAdvanceRequestObjectFromForm(advanceDetail, trpId, index, mode) {
    if (this.id) {
      return this.advanceRequest$.pipe(
        switchMap((res) => {
          const advanceRequest: any = res && res[index];

          if (advanceRequest) {
            const advanceDetailObject = {
              ...advanceRequest,
              amount: advanceDetail.amount,
              currency: advanceDetail.currency,
              custom_field_values: advanceDetail.custom_field_values,
              notes: advanceDetail.notes,
              purpose: advanceDetail.purpose,
              source: advanceDetail.source || 'MOBILE',
              trip_request_id: trpId,
            };
            if (mode === 'SUBMIT') {
              return this.submitAdvanceRequest(advanceDetailObject);
            }
            return of(advanceDetailObject);
          } else {
            const advanceDetailObject = {
              amount: advanceDetail.amount,
              currency: advanceDetail.currency,
              custom_field_values: advanceDetail.custom_field_values,
              notes: advanceDetail.notes,
              purpose: advanceDetail.purpose,
              source: 'MOBILE',
              trip_request_id: trpId,
            };
            if (mode === 'SUBMIT') {
              return this.submitAdvanceRequest(advanceDetailObject);
            }
            return of(advanceDetailObject);
          }
        })
      );
    } else {
      const advanceDetailObject = {
        amount: advanceDetail.amount,
        currency: advanceDetail.currency,
        custom_field_values: advanceDetail.custom_field_values,
        notes: advanceDetail.notes,
        purpose: advanceDetail.purpose,
        source: 'MOBILE',
        trip_request_id: trpId,
      };
      if (mode === 'SUBMIT') {
        return this.submitAdvanceRequest(advanceDetailObject);
      }
      return of(advanceDetailObject);
    }
  }

  submitAdvanceRequest(advanceDetailObject) {
    return this.advanceRequestService.submit(advanceDetailObject);
  }

  makeHotelRequestObjectFromForm(hotelDetail, trpId, index, mode) {
    if (this.id) {
      return this.hotelRequest$.pipe(
        switchMap((res) => {
          const hotelRequest: any = res && res[index] && res[index].hr;

          if (hotelRequest) {
            const hotelDetailObject = {
              ...hotelRequest,
              amount: hotelDetail.amount,
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
              source: hotelRequest.source || 'MOBILE',
              traveller_details: hotelDetail.travellerDetails,
              trip_request_id: trpId,
            };
            if (mode === 'SUBMIT') {
              return this.submitHotelRequest(hotelDetailObject);
            }
            return of(hotelDetailObject);
          } else {
            const hotelDetailObject = {
              amount: hotelDetail.amount,
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
              trip_request_id: trpId,
            };
            if (mode === 'SUBMIT') {
              return this.submitHotelRequest(hotelDetailObject);
            }
            return of(hotelDetailObject);
          }
        })
      );
    } else {
      const hotelDetailObject = {
        amount: hotelDetail.amount,
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
        trip_request_id: trpId,
      };
      if (mode === 'SUBMIT') {
        return this.submitHotelRequest(hotelDetailObject);
      }
      return of(hotelDetailObject);
    }
  }

  submitHotelRequest(hotelDetailObject) {
    return this.hotelRequestService.upsert(hotelDetailObject);
  }

  makeTransportRequestObjectFromForm(transportDetail, trpId, index, mode) {
    if (this.id) {
      return this.transportationRequest$.pipe(
        switchMap((res) => {
          const transportationRequest: any = res && res[index] && res[index].tr;

          if (transportationRequest) {
            const transportDetailObject = {
              ...transportationRequest,
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
              source: transportationRequest.source || 'MOBILE',
              to_city: transportDetail.toCity,
              transport_mode: transportDetail.transportMode,
              traveller_details: transportDetail.travellerDetails,
              trip_request_id: trpId,
            };
            if (mode === 'SUBMIT') {
              return this.submitTransportRequest(transportDetailObject);
            }
            return of(transportDetailObject);
          } else {
            const transportDetailObject = {
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
              trip_request_id: trpId,
            };
            if (mode === 'SUBMIT') {
              return this.submitTransportRequest(transportDetailObject);
            }
            return of(transportDetailObject);
          }
        })
      );
    } else {
      const transportDetailObject = {
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
        trip_request_id: trpId,
      };
      if (mode === 'SUBMIT') {
        return this.submitTransportRequest(transportDetailObject);
      }
      return of(transportDetailObject);
    }
  }

  submitTransportRequest(transportDetailObject) {
    return this.transportationRequestsService.upsert(transportDetailObject);
  }

  async saveDraft() {
    const addExpensePopover = await this.popoverController.create({
      component: SavePopoverComponent,
      componentProps: {
        saveMode: 'DRAFT',
      },
      cssClass: 'dialog-popover',
    });

    if (!this.otherDetailsForm.valid) {
      this.otherDetailsForm.markAllAsTouched();

      const formContainer = this.formContainer.nativeElement as HTMLElement;
      if (formContainer) {
        const invalidElement = formContainer.querySelector('.ng-invalid');
        if (invalidElement) {
          invalidElement.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }
    } else {
      await addExpensePopover.present();
      const { data } = await addExpensePopover.onDidDismiss();
      if (data && data.continue) {
        this.submitOtherRequests(this.otherDetailsForm.value, 'DRAFT');
      }
    }
  }

  initializeOtherRequests() {
    const fork$ = forkJoin({
      homeCurrency: this.homeCurrency$,
      preferredCurrency: this.preferredCurrency$,
    }).pipe(
      map((res) => {
        if (this.otherRequests[0].hotel && this.hotelDetails.length === 0) {
          this.fgValues.cities.forEach((city, index) => {
            // eslint-disable-next-line max-len
            const checkOutDate =
              this.fgValues.cities.length > 1 && this.fgValues.cities[index + 1]
                ? this.fgValues.cities[index + 1].onward_dt
                : null;

            const details = this.formBuilder.group({
              assignedAt: [new Date()],
              assignedTo: [this.fgValues.travelAgent],
              checkInDt: [city.onward_dt, Validators.required],
              checkOutDt: [checkOutDate, Validators.required],
              city: [city.to_city],
              currency: [res.preferredCurrency || res.homeCurrency],
              amount: [],
              custom_field_values: new FormArray([]),
              location: [],
              needBooking: [true],
              travellerDetails: [this.fgValues.travellerDetails],
              rooms: [1],
              notes: [],
            });
            this.hotelDetails.push(details);
            this.addCustomFields('hotel', index);
          });
        }

        if (this.otherRequests[2].transportation && this.transportDetails.length === 0) {
          this.fgValues.cities.forEach((city, index) => {
            const onwardDt = this.fgValues.cities[index].onward_dt;

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
              notes: [],
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
                transportMode: [, Validators.required],
                transportTiming: [],
                travellerDetails: [this.fgValues.travellerDetails],
                notes: [],
              });
              this.transportDetails.push(roundTripDetails);
            }
          });
        }

        if (this.otherRequests[1].advance) {
          const details = this.formBuilder.group({
            amount: [null, Validators.required],
            currency: [res.preferredCurrency || res.homeCurrency, Validators.required],
            purpose: [this.fgValues.purpose, Validators.required],
            custom_field_values: new FormArray([]),
            notes: [null],
          });
          this.advanceDetails.push(details);
          // passsing static index as this will execute only once, can also write -> this.advanceDetails.length
          this.addCustomFields('advance', 0);
        }
      })
    );

    fork$.subscribe(noop);
  }

  ngOnInit() {
    this.tripDate = {
      startMin: moment(this.dateService.addDaysToDate(new Date(), -1)).format('y-MM-DD'),
      endMin: moment(this.dateService.addDaysToDate(new Date(), -1)).format('y-MM-DD'),
      departMin: moment(this.dateService.addDaysToDate(new Date(), -1)).format('y-MM-DD'),
      departMax: moment(this.dateService.addDaysToDate(new Date(), -1)).format('y-MM-DD'),
    };

    this.hotelDate = {
      checkInMin: moment(this.fgValues.startDate).format('y-MM-DD'),
      checkInMax: moment(this.dateService.addDaysToDate(new Date(), -1)).format('y-MM-DD'),
      checkOutMin: moment(this.dateService.addDaysToDate(new Date(), -1)).format('y-MM-DD'),
    };

    this.orgUserSettings$ = this.orgUserSettings.get();
    this.advanceRequestCustomFieldValues = [];
    this.hotelRequestCustomFieldValues = [];
    this.transportRequestCustomFieldValues = [];

    this.otherDetailsForm = new FormGroup({
      hotelDetails: new FormArray([]),
      transportDetails: new FormArray([]),
      advanceDetails: new FormArray([]),
    });

    this.minDate = this.fgValues.startDate;
    this.maxDate = this.fgValues.endDate;

    this.tripActions = {
      can_save: true,
      can_submit: true,
    };

    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(map((res) => res));

    this.preferredCurrency$ = this.orgUserSettings$.pipe(map((res) => res.currency_settings.preferred_currency));

    this.currencies$ = from(this.loaderService.showLoader()).pipe(
      concatMap(() => this.currencyService.getAll()),
      map((currenciesObj) =>
        Object.keys(currenciesObj).map((shortCode) => ({
          value: shortCode,
          label: shortCode,
          displayValue: shortCode + ' - ' + currenciesObj[shortCode],
        }))
      ),
      finalize(() => {
        from(this.loaderService.hideLoader()).subscribe(noop);
      }),
      shareReplay(1)
    );

    this.transportationMode$ = of(this.transportationRequestsService.getTransportationModes());
    this.preferredTransportationTiming$ = of(this.transportationRequestsService.getTransportationPreferredTiming());

    this.initializeOtherRequests();

    if (this.id) {
      this.hotelRequest$ = this.tripRequestsService.getHotelRequests(this.id).pipe(shareReplay(1));
      this.transportationRequest$ = this.tripRequestsService.getTransportationRequests(this.id).pipe(shareReplay(1));
      this.advanceRequest$ = this.tripRequestsService.getAdvanceRequests(this.id).pipe(shareReplay(1));
      this.actions$ = this.tripRequestsService.getActions(this.id);

      from(this.loaderService.showLoader('Getting trip details'))
        .pipe(
          switchMap(() =>
            combineLatest([this.hotelRequest$, this.transportationRequest$, this.advanceRequest$, this.actions$])
          ),
          take(1)
        )
        .subscribe(([hotelRequests, transportationRequests, advanceRequests, actions]) => {
          this.tripActions = actions;
          if (this.otherRequests[0].hotel) {
            this.hotelDetails.clear();

            // editing trip req, getting hotel data from api
            if (hotelRequests.length > 0) {
              hotelRequests.forEach((request, index) => {
                const details = this.formBuilder.group({
                  assignedAt: [moment(request.hr.created_at).format('y-MM-DD')],
                  assignedTo: [request.hr.assigned_to],
                  checkInDt: [moment(request.hr.check_in_dt).format('y-MM-DD'), Validators.required],
                  checkOutDt: [moment(request.hr.check_out_dt).format('y-MM-DD'), Validators.required],
                  city: [request.hr.city],
                  currency: [request.hr.currency],
                  amount: [request.hr.amount],
                  location: [request.hr.location],
                  needBooking: [request.hr.need_booking],
                  travellerDetails: [this.fgValues.travellerDetails],
                  rooms: [request.hr.rooms],
                  notes: [request.hr.notes],
                  custom_field_values: new FormArray([]),
                });
                const custom = details.get('custom_field_values') as FormArray;
                const renderedCustomFeild = this.modifyOtherRequestCustomFields(
                  request.hr.custom_field_values,
                  'HOTEL'
                );
                renderedCustomFeild.forEach((field) => {
                  const customFields = this.formBuilder.group({
                    id: [field.id],
                    name: [field.name],
                    value: [field.value],
                  });
                  custom.push(customFields);
                });
                this.hotelDetails.push(details);
              });
            } else {
              // editing trip req, if creating new hotel req
              this.initializeOtherRequests();
            }
          }

          if (this.otherRequests[1].advance) {
            this.advanceDetails.clear();

            if (advanceRequests.length > 0) {
              advanceRequests.forEach((request, index) => {
                const details = this.formBuilder.group({
                  amount: [request.amount, Validators.required],
                  currency: [request.currency],
                  purpose: [request.purpose, Validators.required],
                  custom_field_values: new FormArray([]),
                  notes: [request.notes],
                });
                const custom = details.get('custom_field_values') as FormArray;
                const renderedCustomFeild = this.modifyOtherRequestCustomFields(request.custom_field_values, 'ADVANCE');
                renderedCustomFeild.forEach((field) => {
                  const customFields = this.formBuilder.group({
                    id: [field.id],
                    name: [field.name],
                    value: [field.value],
                  });
                  custom.push(customFields);
                });
                this.advanceDetails.push(details);
              });
            } else {
              this.initializeOtherRequests();
            }
          }

          if (this.otherRequests[2].transportation) {
            this.transportDetails.clear();

            if (transportationRequests.length > 0) {
              transportationRequests.forEach((request, index) => {
                const details = this.formBuilder.group({
                  assignedAt: [request.tr.created_at],
                  currency: [request.tr.currency],
                  amount: [request.tr.amount],
                  custom_field_values: new FormArray([]),
                  fromCity: [request.tr.from_city],
                  needBooking: [request.tr.need_booking],
                  onwardDt: [request.tr.onward_dt],
                  toCity: [request.tr.to_city],
                  transportMode: [request.tr.transport_mode, Validators.required],
                  transportTiming: [request.tr.preferred_timing],
                  travellerDetails: [this.fgValues.travellerDetails],
                  notes: [request.tr.notes],
                });
                const custom = details.get('custom_field_values') as FormArray;
                const renderedCustomFeild = this.modifyOtherRequestCustomFields(
                  request.tr.custom_field_values,
                  'TRANSPORT'
                );
                renderedCustomFeild.forEach((field) => {
                  const customFields = this.formBuilder.group({
                    id: [field.id],
                    name: [field.name],
                    value: [field.value],
                  });
                  custom.push(customFields);
                });
                this.transportDetails.push(details);
              });
            } else {
              this.initializeOtherRequests();
            }
          }

          if (hotelRequests.length === 0 && transportationRequests.length === 0 && advanceRequests.length === 0) {
            this.initializeOtherRequests();
          }
        });
    }
  }
}
