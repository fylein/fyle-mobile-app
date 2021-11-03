import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { TripRequestCustomFieldsService } from 'src/app/core/services/trip-request-custom-fields.service';
import { map, shareReplay, filter, switchMap, withLatestFrom, tap, finalize, concatMap, reduce } from 'rxjs/operators';
import { Observable, forkJoin, noop, from, EMPTY, iif, of } from 'rxjs';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { Approval } from 'src/app/core/models/approval.model';
import { DataTransformService } from 'src/app/core/services/data-transform.service';
import { AdvanceRequestsCustomFieldsService } from 'src/app/core/services/advance-requests-custom-fields.service';
import { TrpTravellerDetail } from 'src/app/core/models/trip_traveller_detail.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TransportationRequestsService } from 'src/app/core/services/transportation-requests.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { TransportationRequestsComponent } from './transportation-requests/transportation-requests.component';
import { HotelRequestsComponent } from './hotel-requests/hotel-requests.component';
import { AdvanceRequestsComponent } from './advance-requests/advance-requests.component';
import { PopupService } from 'src/app/core/services/popup.service';
import { FyPopoverComponent } from 'src/app/shared/components/fy-popover/fy-popover.component';

@Component({
  selector: 'app-my-view-trips',
  templateUrl: './my-view-trips.page.html',
  styleUrls: ['./my-view-trips.page.scss'],
})
export class MyViewTripsPage implements OnInit {
  tripRequest$: Observable<ExtendedTripRequest>;

  approvals$: Observable<Approval[]>;

  actions$: Observable<any>;

  advanceRequests$: Observable<any>;

  transportationRequests$: Observable<any>;

  hotelRequests$: Observable<any>;

  allTripRequestCustomFields$: Observable<any>;

  activeApprovals$: Observable<Approval[]>;

  tripExtraInfo$: Observable<{
    submittedBy: {
      fullName: string;
      email: string;
    };
    projectName: any;
    tripLocations: (string | string[])[];
    travellers: string;
  }>;

  transformedTripRequests$: Observable<any>;

  transformedAdvanceRequests$: Observable<any>;

  approvers$: Observable<ExtendedOrgUser[]>;

  canPullBack$: Observable<boolean>;

  canCloseTrip$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  canEdit$: Observable<boolean>;

  pullbackLoading = false;

  deleteLoading = false;

  closeLoading = false;

  constructor(
    private tripRequestsService: TripRequestsService,
    private tripRequestCustomFieldsService: TripRequestCustomFieldsService,
    private activatedRoute: ActivatedRoute,
    private customFieldsService: CustomFieldsService,
    private orgUserService: OrgUserService,
    private dataTransformSerivce: DataTransformService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private advanceRequestsCustomFieldsService: AdvanceRequestsCustomFieldsService,
    private transportationRequestsService: TransportationRequestsService,
    private transactionService: TransactionService,
    private router: Router,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private popupService: PopupService
  ) {}

  async deleteTrip() {
    if (this.deleteLoading || this.closeLoading || this.pullbackLoading) {
      return;
    }
    this.deleteLoading = true;
    const id = this.activatedRoute.snapshot.params.id;

    const popupResults = await this.popupService.showPopup({
      header: 'Confirm',
      message: 'Are you sure you want to delete this trip request?',
      primaryCta: {
        text: 'OK',
      },
    });

    if (popupResults === 'primary') {
      this.tripRequestsService.delete(id).subscribe(() => {
        this.deleteLoading = false;
        this.router.navigate(['/', 'enterprise', 'my_trips']);
      });
    } else {
      this.deleteLoading = false;
    }
  }

  getTripRequestCustomFields(allTripRequestCustomFields, tripRequest: ExtendedTripRequest, requestType, requestObj) {
    const customFields = this.tripRequestCustomFieldsService.filterByRequestTypeAndTripType(
      allTripRequestCustomFields,
      requestType,
      tripRequest.trp_trip_type
    );
    requestObj.custom_field_values = this.customFieldsService.standardizeCustomFields(
      requestObj.custom_field_values,
      customFields
    );
    return requestObj;
  }

  getRestrictedApprovers(approvals, tripRequest: ExtendedTripRequest) {
    const approvalStates = ['APPROVAL_PENDING', 'APPROVAL_DONE'];

    const approversNotAllowed = approvals
      .filter((approver) => approvalStates.indexOf(approver.state) > -1)
      .map((approver) => approver.approver_id);

    approversNotAllowed.push(tripRequest.ou_id);

    return approversNotAllowed;
  }

  getTravellerNames(travellers: TrpTravellerDetail[]) {
    return travellers
      .map((traveller) => {
        let details = traveller.name;
        if (traveller.phone_number) {
          details += '(' + traveller.phone_number + ')';
        }

        return details;
      })
      .join(', ');
  }

  async openTransportationRequests() {
    const transportationRequests = await this.transportationRequests$.toPromise();
    if (transportationRequests.length > 0) {
      await this.loaderService.showLoader();
      const transportReqModal = await this.modalController.create({
        component: TransportationRequestsComponent,
        componentProps: {
          transportationRequests,
        },
      });

      await this.loaderService.hideLoader();

      await transportReqModal.present();
    }
  }

  async openHotelRequests() {
    const hotelRequests = await this.hotelRequests$.toPromise();
    if (hotelRequests.length > 0) {
      await this.loaderService.showLoader();
      const hotelReqModal = await this.modalController.create({
        component: HotelRequestsComponent,
        componentProps: {
          hotelRequests,
        },
      });

      await this.loaderService.hideLoader();

      await hotelReqModal.present();
    }
  }

  async openAdvanceRequests() {
    const advanceRequests = await this.transformedAdvanceRequests$.toPromise();
    if (advanceRequests.length > 0) {
      await this.loaderService.showLoader();
      const advanceReqModal = await this.modalController.create({
        component: AdvanceRequestsComponent,
        componentProps: {
          advanceRequests,
        },
      });

      await this.loaderService.hideLoader();

      await advanceReqModal.present();
    }
  }

  setRequiredTripDetails(eTransportationRequest) {
    const preferredTimings = this.transportationRequestsService.getTransportationPreferredTiming();
    eTransportationRequest = this.transportationRequestsService.setInternalStateAndDisplayName(eTransportationRequest);

    if (eTransportationRequest.tr.preferred_timing) {
      eTransportationRequest.tr.preferred_timing_formatted = preferredTimings.filter(
        (timing) => timing.value === eTransportationRequest.tr.preferred_timing
      );
    }

    return forkJoin({
      bookingNumberExpense: iif(
        () => !!eTransportationRequest.tb.transaction_id,
        this.transactionService.get(eTransportationRequest.tb.transaction_id),
        of(null)
      ),
      cancellationNumberExpense: iif(
        () => !!eTransportationRequest.tc.transaction_id,
        this.transactionService.get(eTransportationRequest.tc.transaction_id),
        of(null)
      ),
    }).pipe(
      map(({ bookingNumberExpense, cancellationNumberExpense }) => {
        if (bookingNumberExpense) {
          eTransportationRequest.tb.transaction_number = bookingNumberExpense.expense_number;
        }

        if (cancellationNumberExpense) {
          eTransportationRequest.tc.transaction_number = cancellationNumberExpense.expense_number;
        }

        return eTransportationRequest;
      })
    );
  }

  editTrip() {
    this.router.navigate(['/', 'enterprise', 'my_add_edit_trip', { id: this.activatedRoute.snapshot.params.id }]);
  }

  async pullBack() {
    this.pullbackLoading = true;
    const pullBackPopover = await this.popoverController.create({
      component: FyPopoverComponent,
      componentProps: {
        title: 'Pull Back Trip',
        formLabel: 'Pulling back your trip request will allow you to edit and re-submit the request.',
      },
      cssClass: 'fy-dialog-popover',
    });

    await pullBackPopover.present();

    const { data } = await pullBackPopover.onWillDismiss();

    if (data && data.comment) {
      const status = {
        comment: data.comment,
      };

      const addStatusPayload = {
        status,
        notify: false,
      };

      const id = this.activatedRoute.snapshot.params.id;

      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() => this.tripRequestsService.pullBackTrip(id, addStatusPayload)),
          finalize(() => {
            this.pullbackLoading = false;
            from(this.loaderService.hideLoader());
          })
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'my_trips']);
        });
    } else {
      this.pullbackLoading = false;
    }
  }

  async closeTrip() {
    this.closeLoading = true;
    const id = this.activatedRoute.snapshot.params.id;

    const popupResults = await this.popupService.showPopup({
      header: 'Close Trip',
      message: 'Are you sure you want to close this trip?',
      primaryCta: {
        text: 'OK',
      },
    });

    if (popupResults === 'primary') {
      from(this.loaderService.showLoader())
        .pipe(
          switchMap(() => this.tripRequestsService.closeTrip(id)),
          finalize(() => {
            this.closeLoading = false;
            from(this.loaderService.hideLoader());
          })
        )
        .subscribe(() => {
          this.router.navigate(['/', 'enterprise', 'my_trips']);
        });
    } else {
      this.closeLoading = false;
    }
  }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;
    const eou$ = from(this.authService.getEou());
    this.tripRequest$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.tripRequestsService.getTrip(id)),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay(1)
    );

    this.approvals$ = this.tripRequestsService.getApproversByTripRequestId(id).pipe(shareReplay(1));
    this.actions$ = this.tripRequestsService.getActions(id).pipe(shareReplay(1));
    this.advanceRequests$ = this.tripRequestsService.getAdvanceRequests(id).pipe(shareReplay(1));
    this.allTripRequestCustomFields$ = this.tripRequestCustomFieldsService.getAll();

    this.activeApprovals$ = this.approvals$.pipe(
      map((approvals) => approvals.filter((approval) => approval.state !== 'APPROVAL_DISABLED'))
    );

    this.tripExtraInfo$ = this.tripRequest$.pipe(
      map((extendedTripRequest) => ({
        submittedBy: {
          fullName: extendedTripRequest.us_full_name,
          email: extendedTripRequest.us_email,
        },
        projectName: extendedTripRequest.trp_project_name || null,
        tripLocations: extendedTripRequest.trp_trip_cities.map((location) => {
          if (extendedTripRequest.trp_trip_type !== 'MULTI_CITY') {
            return [
              location.from_city.city ? location.from_city.city : location.from_city.display,
              location.to_city.city ? location.to_city.city : location.to_city.display,
            ];
          }

          return location.from_city.city ? location.from_city.city : location.from_city.display;
        }),
        travellers: this.getTravellerNames(extendedTripRequest.trp_traveller_details),
      }))
    );

    this.canPullBack$ = this.actions$.pipe(map((actions) => actions.can_pull_back));

    this.canCloseTrip$ = this.actions$.pipe(map((actions) => actions.can_close_trip));

    this.canDelete$ = this.actions$.pipe(map((actions) => actions.can_delete));

    this.canEdit$ = this.actions$.pipe(map((actions) => actions.can_edit));

    this.transportationRequests$ = forkJoin([
      this.tripRequestsService.getTransportationRequests(id),
      this.allTripRequestCustomFields$,
      this.tripRequest$,
    ]).pipe(
      map((aggregatedRes) => {
        const [transportationRequests, allCustomFields, tripRequest] = aggregatedRes;
        return transportationRequests.map((transportationRequest) => {
          const transformedTransportationRequests = this.dataTransformSerivce.unflatten(transportationRequest);
          return this.getTripRequestCustomFields(
            allCustomFields,
            tripRequest,
            'TRANSPORTATION_REQUEST',
            transformedTransportationRequests
          ) as [];
        });
      }),
      switchMap((transportationReqs) => from(transportationReqs)),
      concatMap((transportationReq) => this.setRequiredTripDetails(transportationReq)),
      reduce((acc, curr) => acc.concat(curr), []),
      shareReplay(1)
    );

    this.hotelRequests$ = forkJoin([
      this.tripRequestsService.getHotelRequests(id),
      this.allTripRequestCustomFields$,
      this.tripRequest$,
    ]).pipe(
      map((aggregatedRes) => {
        const [hotelRequests, allCustomFields, tripRequest] = aggregatedRes;
        return hotelRequests.map((hotelRequest) => {
          const transformedHotelRequest = this.dataTransformSerivce.unflatten(hotelRequest);
          return this.getTripRequestCustomFields(
            allCustomFields,
            tripRequest,
            'HOTEL_REQUEST',
            transformedHotelRequest
          );
        });
      }),
      shareReplay(1)
    );

    this.transformedAdvanceRequests$ = forkJoin({
      advanceRequests: this.advanceRequests$,
      advanceRequestsCustomFields: this.advanceRequestsCustomFieldsService.getAll(),
    }).pipe(
      map((aggregatedRes) => {
        const { advanceRequests, advanceRequestsCustomFields } = aggregatedRes;
        return advanceRequests.map((advanceRequest) => {
          advanceRequest.custom_field_values = this.customFieldsService.standardizeCustomFields(
            advanceRequest.custom_field_values,
            advanceRequestsCustomFields
          );
          return advanceRequest;
        });
      })
    );
  }

  ngOnInit() {}
}
