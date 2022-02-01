import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { TripRequestCustomFieldsService } from 'src/app/core/services/trip-request-custom-fields.service';
import {
  map,
  shareReplay,
  filter,
  switchMap,
  withLatestFrom,
  tap,
  finalize,
  concatMap,
  reduce,
  startWith,
} from 'rxjs/operators';
import { Observable, forkJoin, noop, from, EMPTY, iif, of, Subject } from 'rxjs';
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
import { TransportationRequestComponent } from '../view-team-trip/transportation-request/transportation-request.component';
import { HotelRequestComponent } from '../view-team-trip/hotel-request/hotel-request.component';
import { AdvanceRequestComponent } from '../view-team-trip/advance-request/advance-request.component';
import { PopupService } from 'src/app/core/services/popup.service';
import { ActionPopoverComponent } from './action-popover/action-popover.component';

@Component({
  selector: 'app-view-team-trip',
  templateUrl: './view-team-trip.page.html',
  styleUrls: ['./view-team-trip.page.scss'],
})
export class ViewTeamTripPage implements OnInit {
  tripRequest$: Observable<ExtendedTripRequest>;

  approvals$: Observable<Approval[]>;

  actions$: Observable<any>;

  actionsRedefined$: Observable<any>;

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

  eou$: Observable<any>;

  refreshApprovers$ = new Subject();

  canDoAction$: Observable<boolean>;

  actionsLoading = false;

  deprecationMsg$: Observable<string>;

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
    const id = this.activatedRoute.snapshot.params.id;

    const popupResults = await this.popupService.showPopup({
      header: 'Confirm',
      message: 'Are you sure you want to delete this trip',
      primaryCta: {
        text: 'Delete Trip',
      },
    });

    if (popupResults === 'primary') {
      this.tripRequestsService.delete(id).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_trips']);
      });
    }
  }

  onUpdateApprover(message: boolean) {
    if (message) {
      this.refreshApprovers$.next();
    }
  }

  getTripRequestCustomFields(allTripRequestCustomFields, tripRequest: ExtendedTripRequest, requestType, requestObj) {
    const customFields = this.tripRequestCustomFieldsService.filterByRequestTypeAndTripType(
      allTripRequestCustomFields,
      requestType,
      tripRequest.trp_trip_type
    );
    requestObj.custom_field_values = this.customFieldsService.standardizeCustomFields(
      requestObj.trp_custom_field_values,
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
        component: TransportationRequestComponent,
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
        component: HotelRequestComponent,
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
        component: AdvanceRequestComponent,
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

  async openActionBlock() {
    this.actionsLoading = true;
    const actions = await this.actionsRedefined$.toPromise();

    const actionBlock = await this.popoverController.create({
      component: ActionPopoverComponent,
      componentProps: {
        actions,
      },
      cssClass: 'dialog-popover',
    });

    await actionBlock.present();
    const { data } = await actionBlock.onDidDismiss();
    if (data) {
      this.actionsLoading = false;
    } else {
      this.actionsLoading = false;
    }
  }

  async closeTrip() {
    const id = this.activatedRoute.snapshot.params.id;

    const popupResults = await this.popupService.showPopup({
      header: 'Close Trip',
      message: 'Are you sure you want to close this trip?',
      primaryCta: {
        text: 'Close Trip',
      },
    });

    if (popupResults === 'primary') {
      from(this.loaderService.showLoader()).pipe(
        switchMap(() => this.tripRequestsService.closeTrip(id)),
        finalize(() => from(this.loaderService.hideLoader()))
      );
    }
  }

  getApproverEmails(activeApprovals) {
    return activeApprovals.map((approver) => approver.approver_email);
  }

  ionViewWillEnter() {
    const id = this.activatedRoute.snapshot.params.id;
    this.eou$ = from(this.authService.getEou());
    this.tripRequest$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => this.tripRequestsService.getTrip(id)),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    this.approvals$ = this.tripRequestsService.getApproversByTripRequestId(id).pipe();
    this.actions$ = this.tripRequestsService.getActions(id);
    this.advanceRequests$ = this.tripRequestsService.getAdvanceRequests(id).pipe(shareReplay(1));
    this.allTripRequestCustomFields$ = this.tripRequestCustomFieldsService.getAll().pipe(shareReplay(1));

    this.canDoAction$ = this.actions$.pipe(
      map((actions) => actions.can_approve || actions.can_inquire || actions.can_reject)
    );

    const currentApproval$ = forkJoin([this.eou$, this.tripRequest$]).pipe(
      map(([eou, tripRequest]) => tripRequest.approvals[eou.ou.id].state)
    );

    this.actionsRedefined$ = forkJoin([this.eou$, this.actions$, currentApproval$]).pipe(
      map(([eou, actions, currentApproval]) => {
        if (actions.can_approve && eou.ou.roles.indexOf('ADMIN') > -1) {
          if (currentApproval === 'APPROVAL_PENDING') {
            actions.can_approve = true;
          } else {
            actions.can_approve = false;
          }
        }
        return actions;
      })
    );

    this.activeApprovals$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap(() => this.approvals$),
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

    this.transformedTripRequests$ = this.refreshApprovers$.pipe(
      startWith(true),
      switchMap((res) =>
        forkJoin({
          tripRequest: this.tripRequest$,
          allTripRequestCustomFields: this.allTripRequestCustomFields$,
        })
      ),
      map(({ tripRequest, allTripRequestCustomFields }) =>
        this.getTripRequestCustomFields(allTripRequestCustomFields, tripRequest, 'TRIP_REQUEST', tripRequest)
      )
    );

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

    this.deprecationMsg$ = this.tripRequestsService.getTripDeprecationMsg('team');
  }

  ngOnInit() {}
}
