import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Observable, noop, forkJoin, of, concat } from 'rxjs';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DateService } from 'src/app/core/services/date.service';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { map, tap, mergeMap, startWith, concatMap } from 'rxjs/operators';
import * as moment from 'moment';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ModalController } from '@ionic/angular';
import { OtherRequestsComponent } from './other-requests/other-requests.component';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { TripRequestCustomFieldsService } from 'src/app/core/services/trip-request-custom-fields.service';
import { OfflineService } from 'src/app/core/services/offline.service';

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
    private offlineService: OfflineService
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

  debug(doubt) {
    console.log('\n\n\n doubt =>', doubt);
  }

  onSubmit() {
    if (this.fg.valid) {
      console.log('\n\n\n finally form has been submited -> ', this.fg.value);
    } else {
      this.fg.markAllAsTouched();
    }
  }

  get startDate() {
    return this.fg.get('startDate') as FormControl;
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
      toCity = this.cities.controls[this.cities.value.length - 1].value.toCity;
      this.minDate = this.cities.controls[this.cities.value.length - 1].value.departDate;
    }

    const intialCity = this.formBuilder.group({
      fromCity: [toCity, Validators.required],
      toCity: [null, Validators.required],
      departDate: [null, Validators.required]
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
    return await modal.present();
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

    this.tripDate = {
      startMin: this.dateService.addDaysToDate(new Date(), -1),
      endMin: this.dateService.addDaysToDate(new Date(), -1),
      departMin: this.dateService.addDaysToDate(new Date(), -1),
      departMax: this.dateService.addDaysToDate(new Date(), -1)
    };

    this.hotelDate = {
      checkInMin: this.dateService.addDaysToDate(new Date(), -1),
      checkInMax: this.dateService.addDaysToDate(new Date(), -1),
      checkOutMin: this.dateService.addDaysToDate(new Date(), -1)
    };

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
          fromCity: [firstCity.value.fromCity, Validators.required],
          toCity: [firstCity.value.toCity, Validators.required],
          departDate: [firstCity.value.departDate, Validators.required],
          returnDate: [null, Validators.required]
        });
        this.cities.push(intialCity);
        this.addDefaultCity();
      }
    });
  }

}
