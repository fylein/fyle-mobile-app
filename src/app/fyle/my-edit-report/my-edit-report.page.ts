import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import {concat, forkJoin, from, iif, noop, Observable, of, Subject} from 'rxjs';
import {finalize, map, shareReplay, switchMap, takeUntil, tap} from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { AddExpensesToReportComponent } from './add-expenses-to-report/add-expenses-to-report.component';
import {NetworkService} from '../../core/services/network.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { cloneDeep } from 'lodash';
import {TrackingService} from '../../core/services/tracking.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-my-edit-report',
  templateUrl: './my-edit-report.page.html',
  styleUrls: ['./my-edit-report.page.scss'],
})
export class MyEditReportPage implements OnInit {
  extendedReport$: Observable<ExtendedReport>;
  reportedEtxns$: Observable<Expense[]>;
  unReportedEtxns: Expense[];
  deleteExpensesIdList = [];
  addedExpensesIdList = [];
  isReportEdited = false;
  reportTitle: string;
  isPurposeChanged = false;
  isTripRequestsEnabled: boolean;
  canAssociateTripRequests: boolean;
  tripRequests: any[];
  selectedTripRequest: any;
  tripRequestId: string;

  isConnected$: Observable<boolean>;
  onPageExit = new Subject();
  reportAmount: number;
  noOfTxnsInReport: number;
  selectedTotalAmount: number;
  selectedTotalTxns: number;
  showReportNameError = false;
  reportState: string;
  saveReoprtLoading = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private reportService: ReportService,
    private authService: AuthService,
    private transactionService: TransactionService,
    private modalController: ModalController,
    private offlineService: OfflineService,
    private orgUserSettingsService: OrgUserSettingsService,
    private tripRequestsService: TripRequestsService,
    private networkService: NetworkService,
    private popupService: PopupService,
    private trackingService: TrackingService,
    private modalProperties: ModalPropertiesService
  ) { }

  goBack() {
    this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.activatedRoute.snapshot.params.id }]);
  }

  checkReportEdited() {
    this.isReportEdited = (this.deleteExpensesIdList.length > 0) || (this.addedExpensesIdList.length > 0) || this.isPurposeChanged;
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
  }

  ngOnInit() {
  }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  getVendorName(etxn) {
    const category = etxn.tx_org_category && etxn.tx_org_category.toLowerCase();
    let vendorName = etxn.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = etxn.tx_distance;
      vendorName += ' ' + etxn.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = etxn.tx_num_days;
      vendorName += ' Days';
    }

    return vendorName;
  }


  async showAddExpensesToReportModal() {
    const AddExpensesToReportModal = await this.modalController.create({
      component: AddExpensesToReportComponent,
      componentProps: {
        unReportedEtxns: this.unReportedEtxns
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
    });

    await AddExpensesToReportModal.present();

    const { data } = await AddExpensesToReportModal.onWillDismiss();
    if (data && data.selectedTxnIds) {
      this.addedExpensesIdList = data.selectedTxnIds;
      this.selectedTotalAmount = data.selectedTotalAmount;
      this.selectedTotalTxns = data.selectedTotalTxns;
      this.checkReportEdited();
    }
  }

  addExpenseToDeleteList(etxn: Expense) {
    etxn.isHidden = true;
    this.deleteExpensesIdList.push(etxn.tx_id);
    this.checkReportEdited();
    this.updateStats(etxn, 'remove');
  }

  undoExpenseDelete(etxn: Expense) {
    etxn.isHidden = false;
    const index = this.deleteExpensesIdList.indexOf(etxn.tx_id);
    this.deleteExpensesIdList.splice(index, 1);
    this.checkReportEdited();
    this.updateStats(etxn, 'add');
  }

  updateStats(etxn, action) {
    if (action === 'remove') {
      this.reportAmount = !etxn.tx_skip_reimbursement ? this.reportAmount - etxn.tx_amount : this.reportAmount;
      this.noOfTxnsInReport = this.noOfTxnsInReport - 1;
    } else if (action === 'add') {
      this.reportAmount = !etxn.tx_skip_reimbursement ? this.reportAmount + etxn.tx_amount : this.reportAmount;
      this.noOfTxnsInReport = this.noOfTxnsInReport + 1;
    }
  }

  removeExpenseFromAddedExpensesList(etxn: Expense) {
    etxn.isSelected = false;
    const index = this.addedExpensesIdList.indexOf(etxn.tx_id);
    this.addedExpensesIdList.splice(index, 1);
    this.selectedTotalTxns = this.selectedTotalTxns - 1;
    this.selectedTotalAmount = !etxn.tx_skip_reimbursement ? this.selectedTotalAmount - etxn.tx_amount : this.selectedTotalAmount;
    this.checkReportEdited();
  }

  setPurposeChanged() {
    this.isPurposeChanged = true;
    this.checkReportEdited();
  }

  removeTxnFromReport() {
    const removeTxnList$ = [];
    this.deleteExpensesIdList.forEach(txnId => {
      removeTxnList$.push(this.reportService.removeTransaction(this.activatedRoute.snapshot.params.id, txnId));
    });

    return forkJoin(removeTxnList$);
  }

  saveReport() {
    this.showReportNameError = false;
    this.saveReoprtLoading = true;
    if (this.reportTitle.trim().length <= 0 && this.reportState === 'DRAFT') {
      this.showReportNameError = true;
      return;
    }

    const report = {
      purpose: this.reportTitle,
      id: this.activatedRoute.snapshot.params.id,
      trip_request_id: (this.selectedTripRequest && this.selectedTripRequest.id) || this.tripRequestId
    };

    // method body is same as update
    // should rename method later
    this.reportService.createDraft(report).pipe(
      switchMap(res => {
        return iif(
          () => (this.addedExpensesIdList.length > 0),
          this.reportService.addTransactions(this.activatedRoute.snapshot.params.id, this.addedExpensesIdList).pipe(
            tap(() => this.trackingService.addToExistingReport({Asset: 'Mobile'}))
          ),
          of(false)
        );
      }),
      switchMap(res => {
        return iif(
          () => (this.deleteExpensesIdList.length > 0),
          this.removeTxnFromReport() ,
          of(false)
        );
      }),
      finalize(() => {
        this.saveReoprtLoading = false;
        this.addedExpensesIdList = [];
        this.deleteExpensesIdList = [];
        this.router.navigate(['/', 'enterprise', 'my_reports']);
      })
    ).subscribe(noop);
  }

  async deleteReport() {
    const popupResult = await this.popupService.showPopup({
      header: 'Delete Report?',
      message: `
        <p class="highlight-info">
          All expenses were removed from this report.
        </p>
        <p>
          Are you sure, you want to delete this report?
        </p>
      `,
      primaryCta: {
        text: 'DELETE'
      }
    });

    if (popupResult === 'primary') {
      from(this.loaderService.showLoader()).pipe(
        switchMap(() => {
          return this.reportService.delete(this.activatedRoute.snapshot.params.id);
        }),
        finalize(async () => {
          await this.loaderService.hideLoader();
          this.router.navigate(['/', 'enterprise', 'my_reports']);
        })
      ).subscribe(noop);
    }
  }

  getTripRequests() {
    return this.tripRequestsService.findMyUnreportedRequests().pipe(
      map(res => {
        return res.filter(request => {
          return request.state === 'APPROVED';
        });
      }),
      map((tripRequests: any) => {
        return tripRequests.sort((tripA, tripB) =>  {
          const tripATime = new Date(tripA.created_at).getTime();
          const tripBTime = new Date(tripB.created_at).getTime();
          /**
           * If tripA's time is larger than tripB's time we keep it before tripB
           * in the array because latest trip has to be shown at the top.
           * Else we keep it after tripB cause it was fyled earlier.
           * If both the dates are same (which may not be possible in the real world)
           * we maintain the order in which tripA and tripB are present in the array.
           */
          return (tripATime > tripBTime) ? -1 : ((tripATime < tripBTime) ? 1 : 0);
        });
      }),
      map((tripRequests: any) => {
        return tripRequests.map(tripRequest => {
          return {label: moment(tripRequest.created_at).format('MMM Do YYYY') + ', ' + tripRequest.purpose, value: tripRequest};
        });
      })
    );
  }

  getSelectedTripInfo(tripRequestId) {
    if (this.canAssociateTripRequests) {
      this.tripRequestsService.get(tripRequestId).subscribe((tripRequest: any) => {
        this.selectedTripRequest = tripRequest;
        const selectedTripRequest = {
          label: moment(tripRequest.created_at).format('MMM Do YYYY') + ', ' + tripRequest.purpose,
          value: tripRequest
        };
        this.tripRequests.push(selectedTripRequest);
      });
    } else {
      this.tripRequestId = tripRequestId;
    }
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    this.selectedTotalAmount = 0;
    this.selectedTotalTxns = 0;
    this.deleteExpensesIdList = [];
    this.addedExpensesIdList = [];
    this.extendedReport$ = this.reportService.getReport(this.activatedRoute.snapshot.params.id);
    const orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay(1)
    );
    const orgUserSettings$ = this.orgUserSettingsService.get();

    forkJoin({
      extendedReport: this.extendedReport$,
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
      tripRequests: this.getTripRequests()
    }).subscribe(({ extendedReport, orgSettings,  orgUserSettings, tripRequests}) => {
      this.reportTitle = extendedReport.rp_purpose;
      this.reportAmount = extendedReport.rp_amount;
      this.reportState = extendedReport.rp_state;
      this.noOfTxnsInReport = extendedReport.rp_num_transactions;
      this.isTripRequestsEnabled = orgSettings.trip_requests.enabled;
      this.canAssociateTripRequests = orgSettings.trip_requests.enabled && (!orgSettings.trip_requests.enable_for_certain_employee ||
      (orgSettings.trip_requests.enable_for_certain_employee &&
      orgUserSettings.trip_request_org_user_settings.enabled));
      this.tripRequests = tripRequests;
      if (extendedReport.rp_trip_request_id) {
        this.getSelectedTripInfo(extendedReport.rp_trip_request_id);
      }
    });

    this.reportedEtxns$ = from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return from(this.authService.getEou()).pipe(
          switchMap(eou => {
            return this.transactionService.getAllETxnc({
              tx_org_user_id: 'eq.' + eou.ou.id,
              tx_report_id: 'eq.' + this.activatedRoute.snapshot.params.id,
              order: 'tx_txn_dt.desc,tx_id.desc'
            });
          }),
          map((etxns) => {
            return cloneDeep(etxns);
          }),
          map((etxns: Expense[]) => {
            return etxns.map(etxn => {
              etxn.vendorDetails = this.getVendorName(etxn);
              return etxn as Expense;
            });
          }),
          shareReplay(1)
        );
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    const queryParams = {
      tx_report_id : 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc',
      or: ['(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)']
    };

    this.transactionService.getAllExpenses({ queryParams }).pipe(
      map((etxns) => {
        return cloneDeep(etxns);
      }),
      map((etxns: Expense[]) => {
        etxns.forEach((etxn, i) => {
          etxn.vendorDetails = this.getVendorName(etxn);
          etxn.showDt = true;
          etxn.isSelected = false;
          if (i > 0 && (etxn.tx_txn_dt === etxns[i - 1].tx_txn_dt)) {
            etxn.showDt = false;
          }
        });
        this.unReportedEtxns = etxns;
      }),
    ).subscribe(noop);
  }

}
