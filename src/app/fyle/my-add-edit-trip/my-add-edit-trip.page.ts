import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from, forkJoin, Observable } from 'rxjs';
import { OfflineService } from 'src/app/core/services/offline.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DateService } from 'src/app/core/services/date.service';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { switchMap, map } from 'rxjs/operators';
import { noop } from '@angular/compiler/src/render3/view/util';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private dateService: DateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder
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

  intializeTraveler() {

  }

  debug(doubt) {
    console.log('\n\n\n doubt =>', doubt);
  }

  onSubmit() {
    console.log('\n\n\n finally form has been submited -> ', this.fg.value);
  }

  ngOnInit() {

    const id = this.activatedRoute.snapshot.params.id;

    const eou$ = from(this.authService.getEou());

    this.tripTypes = [
      {
        id: 'ONE_WAY',
        name: 'One Way'
      }, {
        id: 'ROUND',
        name: 'Round Trip'
      }, {
        id: 'MULTI_CITY',
        name: 'Multi City'
      }
    ];

    this.fg = new FormGroup({
      travellerDetails: new FormArray([])
   });


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

    if (this.mode === 'edit') {

    } else if (this.mode === 'add') {
      eou$.subscribe(res => {
        this.setTripRequestObject(res.us.full_name, res.ou.mobile);
      });
    }

  }

}
