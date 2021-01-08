import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import {concat, forkJoin, from, iif, noop, Observable, of, Subject} from 'rxjs';
import {finalize, map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
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
    private networkService: NetworkService
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
      }
    });

    await AddExpensesToReportModal.present();

    const { data } = await AddExpensesToReportModal.onWillDismiss();
    if (data && data.selectedTxnIds) {
      this.addedExpensesIdList = data.selectedTxnIds;
      this.checkReportEdited();
    }
  }

  addExpenseToDeleteList(etxn: Expense) {
    etxn.isHidden = true;
    this.deleteExpensesIdList.push(etxn.tx_id);
    this.checkReportEdited();
    // Todo: update report amount and count after
    // 1. deselct old reported expense and
    // 2. select new expense
  }

  undoExpenseDelete(etxn: Expense) {
    etxn.isHidden = false;
    const index = this.deleteExpensesIdList.indexOf(etxn.tx_id);
    this.deleteExpensesIdList.splice(index, 1);
    this.checkReportEdited();
    // Todo: update report amount and count after
    // 1. deselct old reported expense and
    // 2. select new expense
  }

  removeExpenseFromAddedExpensesList(etxn: Expense) {
    etxn.isSelected = false;
    const index = this.addedExpensesIdList.indexOf(etxn.tx_id);
    this.addedExpensesIdList.splice(index, 1);
    this.checkReportEdited();
    // Todo: update report amount and count after
    // 1. deselct old reported expense and
    // 2. select new expense
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
    const report = {
      purpose: this.reportTitle,
      id: this.activatedRoute.snapshot.params.id,
      trip_request_id: (this.selectedTripRequest && this.selectedTripRequest.id) || this.tripRequestId
    };

    this.reportService.createDraft(report).pipe(
      switchMap(res => {
        return iif(
          () => (this.addedExpensesIdList.length > 0),
          this.reportService.addTransactions(this.activatedRoute.snapshot.params.id, this.addedExpensesIdList),
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
        this.addedExpensesIdList = [];
        this.deleteExpensesIdList = [];
        this.router.navigate(['/', 'enterprise', 'my_reports']);
      })
    ).subscribe(noop);
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
    this.extendedReport$ = this.reportService.getReport(this.activatedRoute.snapshot.params.id);
    const orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay()
    );
    const orgUserSettings$ = this.orgUserSettingsService.get();

    forkJoin({
      extendedReport: this.extendedReport$,
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
      tripRequests: this.getTripRequests()
    }).subscribe(({ extendedReport, orgSettings,  orgUserSettings, tripRequests}) => {
      this.reportTitle = extendedReport.rp_purpose;
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
          map((etxns: Expense[]) => {
            return etxns.map(etxn => {
              etxn.vendorDetails = this.getVendorName(etxn);
              return etxn as Expense;
            });
          }),
          shareReplay()
        );
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    );

    const queryParams = {
      tx_report_id : 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc'
    };

    this.transactionService.getAllExpenses({ queryParams }).pipe(
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
