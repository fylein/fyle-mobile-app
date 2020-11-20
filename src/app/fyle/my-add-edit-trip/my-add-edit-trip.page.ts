import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Observable, noop } from 'rxjs';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DateService } from 'src/app/core/services/date.service';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { map, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { OrgUserService } from 'src/app/core/services/org-user.service';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private dateService: DateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private orgUserService: OrgUserService
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

  remove(i) {
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
    console.log('\n\n\n finally form has been submited -> ', this.fg.value);
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

  addDefaultCity() {
    const intialCity = this.formBuilder.group({
      fromCity: [null, Validators.required],
      toCity: [null, Validators.required],
      date: [null, Validators.required]
    });
    this.cities.push(intialCity);
  }

  addNewCity() {
    this.addDefaultCity();
  }

  intializeDefaults() {
    this.setDefaultStarrtDate();
    this.addDefaultCity();
  }

  ngOnInit() {

    const id = this.activatedRoute.snapshot.params.id;

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
      travelAgent: new FormControl('', []),
      notes: new FormControl('', []),
      transportationRequest: new FormControl('', []),
      hotelRequest: new FormControl('', []),
      advanceRequest: new FormControl('', [])
    });

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
      checkOutMin: this.dateService.addDaysToDate(new Date(), -1),
    };

    this.minDate = moment(new Date('Jan 1, 2001')).format('y-MM-D');
    this.maxDate = moment(this.dateService.addDaysToDate(this.today, 1)).format('y-MM-D');

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
  }

}
