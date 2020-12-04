import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Observable, noop, forkJoin, of, concat } from 'rxjs';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DateService } from 'src/app/core/services/date.service';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { map, tap, mergeMap, startWith, concatMap, finalize, shareReplay, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { OtherRequestsComponent } from './other-requests/other-requests.component';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { TripRequestCustomFieldsService } from 'src/app/core/services/trip-request-custom-fields.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { SavePopoverComponent } from './save-popover/save-popover.component';

@Component({
  selector: 'app-my-add-edit-trip',
  templateUrl: './my-add-edit-trip.page.html',
  styleUrls: ['./my-add-edit-trip.page.scss'],
})
export class MyAddEditTripPage implements OnInit {

  // allowedProjectIds$: Observable<any>;
  eou$: Observable<ExtendedOrgUser>;
  tripTypes = [];
  tripDate;
  hotelDate;
  tripActions;
  mode;
  minDate;
  maxDate;
  today;
  isTripTypeMultiCity$: Observable<boolean>;
  isTransportationRequested$: Observable<boolean>;
  isHotelRequested$: Observable<boolean>;
  isAdvanceRequested$: Observable<boolean>;
  travelAgents$: Observable<any>;
  customFields$: Observable<any>;
  isProjectsEnabled$: Observable<boolean>;
  projects$: Observable<[]>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dateService: DateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private orgUserService: OrgUserService,
    private modalController: ModalController,
    private tripRequestCustomFieldsService: TripRequestCustomFieldsService,
    private offlineService: OfflineService,
    private tripRequestsService: TripRequestsService,
    private loaderService: LoaderService,
    private popoverController: PopoverController
  ) { }

  fg: FormGroup;

  goBack() {
    this.router.navigate(['/', 'enterprise', 'my_trips']);
  }

  setTripRequestObject(name, mobile) {
    const intialTraveler = this.formBuilder.group({
      name: [name],
      contact: [mobile]
    });
    this.travellerDetails.push(intialTraveler);
  }

  removeTraveller(i) {
    this.travellerDetails.removeAt(i);
  }

  removeCity(i) {
    this.cities.removeAt(i);
  }

  addNewTraveller() {
    const intialTraveler = this.formBuilder.group({
      name: [null],
      contact: [null]
    });
    this.travellerDetails.push(intialTraveler);
  }

  get travellerDetails() {
    return this.fg.get('travellerDetails') as FormArray;
  }

  // debug(doubt) {
  //   console.log('\n\n\n doubt =>', doubt);
  // }

  async onSubmit() {
    const addExpensePopover = await this.popoverController.create({
      component: SavePopoverComponent,
      componentProps: {
        saveMode: 'SUBMIT',
        otherRequests: [
          { hotel: this.fg.get('hotelRequest').value || false },
          { transportation: this.fg.get('transportationRequest').value || false }
        ]
      },
      cssClass: 'dialog-popover'
    });

    if (this.fg.valid) {
      if (!(this.fg.controls.endDate.value >= this.fg.controls.startDate.value)) {
        this.fg.markAllAsTouched();
        return;
      } else {
        await addExpensePopover.present();
        const { data } = await addExpensePopover.onDidDismiss();
        if (data.continue) {
          this.submitTripRequest(this.fg.value);
        }
      }
    } else {
      this.fg.markAllAsTouched();
    }
  }

  async saveDraftModal() {
    const addExpensePopover = await this.popoverController.create({
      component: SavePopoverComponent,
      componentProps: {
        saveMode: 'DRAFT'
      },
      cssClass: 'dialog-popover'
    });

    if (this.fg.valid) {
      if (!(this.fg.controls.endDate.value >= this.fg.controls.startDate.value)) {
        this.fg.markAllAsTouched();
        return;
      } else {
        await addExpensePopover.present();
        const { data } = await addExpensePopover.onDidDismiss();
        if (data.continue) {
          this.saveAsDraft(this.fg.value);
        }
      }
    } else {
      this.fg.markAllAsTouched();
    }
  }

  saveAsDraft(formValue) {
    from(this.loaderService.showLoader('Saving as draft')).pipe(
      map(() => {
        return this.makeTrpfromFormFg(formValue);
      }),
      switchMap(res => {
        return this.tripRequestsService.saveDraft(res);
      }),
      switchMap(res => {
        return this.tripRequestsService.triggerPolicyCheck(res.id);
      }),
      finalize(() => {
        this.loaderService.hideLoader();
        this.fg.reset();
        this.router.navigate(['/', 'enterprise', 'my_trips']);
      })
    ).subscribe(noop);
    // vm.criticalPromise = TripRequestsService.saveDraft(angular.copy(vm.tripRequest.trp)).then(function (tripRequest) {
    //   var promises = submitTransportationAndHotelRequest(tripRequest);
    //   if (vm.advanceRequests.length > 0) {
    //     promises.advancesRequest = saveAdvancesRequests(tripRequest);
    //   }
    //   return $q.all(promises).then(function (res) {
    //     $ionicLoading.hide();
    //     TripRequestsService.triggerPolicyCheck(tripRequest.id);
    //     res.tripRequest = tripRequest;
    //     return res;
    //   });
    // });
    // return vm.criticalPromise;
  }

  makeTrpfromFormFg(formValue) {
    const trp = {
      custom_field_values: formValue.custom_field_values,
      end_dt: formValue.endDate,
      notes: formValue.notes,
      project_id: formValue.project.project_id,
      purpose: formValue.purpose,
      source: 'MOBILE',
      start_dt: formValue.startDate,
      traveller_details: formValue.travellerDetails,
      trip_cities: formValue.cities,
      trip_type: formValue.tripType
    };
    return trp;
  }

  submitTripRequest(formValue) {
    from(this.loaderService.showLoader('Submitting Trip Request')).pipe(
      map(() => {
        return this.makeTrpfromFormFg(formValue);
      }),
      switchMap(res => {
        return this.tripRequestsService.submit(res);
      }),
      switchMap(res => {
        return this.tripRequestsService.triggerPolicyCheck(res.id);
      }),
      finalize(() => {
        this.loaderService.hideLoader();
        this.fg.reset();
        this.router.navigate(['/', 'enterprise', 'my_trips']);
      })
    ).subscribe(noop);
    // vm.criticalPromise = this.tripRequestsService.submit(angular.copy(vm.tripRequest.trp)).then(function (tripRequest) {
    //   var promises = submitTransportationAndHotelRequest(tripRequest);
    //   if (vm.advanceRequests.length > 0) {
    //     promises.advancesRequest = submitAdvancesRequests(tripRequest);
    //   }
    //   return $q.all(promises).then(function (res) {
    //     $ionicLoading.hide();
    //     TripRequestsService.triggerPolicyCheck(tripRequest.id);
    //     res.tripRequest = tripRequest;
    //     return res;
    //   });
    // });
    // return vm.criticalPromise;

  }

  get startDate() {
    return this.fg.get('startDate') as FormControl;
  }

  get endDate() {
    return this.fg.get('endDate') as FormControl;
  }

  setDefaultStarrtDate() {
    this.today = new Date();
    this.startDate.setValue(moment(this.today).format('y-MM-DD'));
  }

  get cities() {
    return this.fg.get('cities') as FormArray;
  }

  get tripType() {
    return this.fg.get('tripType').value;
  }

  addDefaultCity() {
    let toCity;
    if (this.cities.value.length >= 1) {
      toCity = this.cities.controls[this.cities.value.length - 1].value.to_city;
      this.minDate = this.cities.controls[this.cities.value.length - 1].value.depart_date;
    }

    const intialCity = this.formBuilder.group({
      from_city: [toCity, Validators.required],
      to_city: [null, Validators.required],
      depart_date: [null, Validators.required]
    });

    if (this.fg.controls.tripType.value === 'ROUND') {
      intialCity.addControl('returnDate', new FormControl('', Validators.required));
    }
    this.cities.push(intialCity);
  }

  addNewCity() {
    this.addDefaultCity();
  }

  intializeDefaults() {
    this.setDefaultStarrtDate();
    this.addDefaultCity();
  }

  async openModal() {

    const modal = await this.modalController.create({
      component: OtherRequestsComponent,
      componentProps: {
        otherRequests: [
          { hotel: this.fg.get('hotelRequest').value || false },
          { advance: this.fg.get('advanceRequest').value || false },
          { transportation: this.fg.get('transportationRequest').value || false }
        ],
        fgValues: this.fg.value
      }
    });

    if (this.fg.valid) {
      if (!(this.fg.controls.endDate.value >= this.fg.controls.startDate.value)) {
        this.fg.markAllAsTouched();
        return;
      } else {
        return await modal.present();
      }
    } else {
      this.fg.markAllAsTouched();
    }
  }

  ngOnInit() {

    const id = this.activatedRoute.snapshot.params.id;
    const orgSettings$ = this.offlineService.getOrgSettings();

    this.tripTypes = [
      {
        value: 'ONE_WAY',
        label: 'One Way'
      }, {
        value: 'ROUND',
        label: 'Round Trip'
      }, {
        value: 'MULTI_CITY',
        label: 'Multi City'
      }
    ];

    // TODO use formBuilder.group
    this.fg = new FormGroup({
      travellerDetails: new FormArray([]),
      tripType: new FormControl('ONE_WAY', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      purpose: new FormControl('', [Validators.required]),
      cities: new FormArray([]),
      project: new FormControl('', [Validators.required]),
      travelAgent: new FormControl('', [Validators.required]),
      notes: new FormControl('', []),
      transportationRequest: new FormControl('', []),
      hotelRequest: new FormControl('', []),
      advanceRequest: new FormControl('', []),
      custom_field_values: new FormArray([])
    });

    this.customFields$ = this.tripRequestCustomFieldsService.getAll().pipe(
      map((customFields: any[]) => {
        customFields = customFields.filter(field => {
          return field.request_type === 'TRIP_REQUEST';
        });
        const customFieldsFormArray = this.fg.controls.custom_field_values as FormArray;
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

    this.intializeDefaults();

    this.minDate = this.fg.controls.startDate.value;
    this.maxDate = this.fg.controls.endDate.value;

    if (id) {
      // promises.tripRequest = TripRequestsService.getETripRequest(id);
      this.mode = 'edit';
    } else {
      this.mode = 'add';
      this.tripActions = {
        can_save: true,
        can_submit: true
      };
    }

    this.eou$ = from(this.authService.getEou());
    this.travelAgents$ = this.orgUserService.getAllCompanyEouc().pipe(
      map(eous => {
        let travelAgents = [];
        eous.filter(eou => {
          if (eou.ou.roles.indexOf('TRAVEL_AGENT') > -1) {
            travelAgents.push({
              label: eou.us.full_name + '(' + eou.us.email + ')',
              value: eou.ou.id
            });
          }
        });
        return travelAgents;
      })
    );

    if (this.mode === 'edit') {

    } else if (this.mode === 'add') {
      this.eou$.subscribe(res => {
        this.setTripRequestObject(res.us.full_name, res.ou.mobile);
      });
    }

    this.isTripTypeMultiCity$ = this.fg.controls.tripType.valueChanges.pipe(
      map(res => res === 'MULTI_CITY')
    );

    this.isTripTypeMultiCity$.subscribe(isMulticity => {
      if (isMulticity) {
        this.addDefaultCity();
      } else {
        const firstCity = this.cities.at(0);
        this.cities.clear();
        this.cities.push(firstCity);
      }
    });

    this.isTransportationRequested$ = this.fg.controls.transportationRequest.valueChanges.pipe(
      map(res => {
        return res;
      })
    );

    this.isHotelRequested$ = this.fg.controls.hotelRequest.valueChanges.pipe(
      map(res => {
        return res;
      })
    );

    this.isAdvanceRequested$ = this.fg.controls.advanceRequest.valueChanges.pipe(
      map(res => {
        return res;
      })
    );

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => {
        return orgSettings.projects && orgSettings.projects.enabled;
      })
    );
    this.projects$ = this.offlineService.getProjects();

    this.fg.controls.tripType.valueChanges.subscribe(res => {
      if (res === 'ROUND') {
        const firstCity = this.cities.at(0);
        this.cities.clear();
        const intialCity = this.formBuilder.group({
          from_city: [firstCity.value.fromCity, Validators.required],
          to_city: [firstCity.value.toCity, Validators.required],
          depart_date: [firstCity.value.departDate, Validators.required],
          return_date: [null, Validators.required]
        });
        this.cities.push(intialCity);
      }
    });

    this.fg.valueChanges.subscribe(formValue => {
      console.log('\n\n\n\n formValue -> ', formValue);
      if (formValue.tripType === 'MULTI_CITY') {
        this.minDate = formValue.cities[formValue.cities.length - 2].depart_date;
      }
    });
  }

}
