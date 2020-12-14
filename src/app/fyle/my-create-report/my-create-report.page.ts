import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { forkJoin, from, noop, Observable } from 'rxjs';
import { finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/expense.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { ReportService } from 'src/app/core/services/report.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { ReportSummaryComponent } from './report-summary/report-summary.component';


@Component({
  selector: 'app-my-create-report',
  templateUrl: './my-create-report.page.html',
  styleUrls: ['./my-create-report.page.scss'],
})
export class MyCreateReportPage implements OnInit {

  readyToReportEtxns: Expense[];
  reportTitle: string;
  homeCurrency$: Observable<string>;
  selectedTotalAmount = 0;
  selectedTotalTxns = 0;
  selectedTxnIds: string[];
  isTripRequestsEnabled: boolean;
  canAssociateTripRequests: boolean;
  tripRequests: any[];
  selectedTripRequest: any;
  tripRequestId: string;

  constructor(
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private currencyService: CurrencyService,
    private loaderService: LoaderService,
    private router: Router,
    private popoverController: PopoverController,
    private offlineService: OfflineService,
    private orgUserSettingsService: OrgUserSettingsService,
    private tripRequestsService: TripRequestsService

  ) { }

  cancel() {
    if (this.selectedTxnIds.length > 0) {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_reports']);
    }
  }

  async showReportSummaryPopover(action) {
    const homeCurrency = await this.homeCurrency$.toPromise();

    const reportSummaryPopover = await this.popoverController.create({
      component: ReportSummaryComponent,
      componentProps: {
        selectedTotalAmount: this.selectedTotalAmount,
        selectedTotalTxns: this.selectedTotalTxns,
        homeCurrency: homeCurrency,
        purpose: this.reportTitle,
        action
      },
      cssClass: 'dialog-popover'
    });

    await reportSummaryPopover.present();

    const { data } = await reportSummaryPopover.onWillDismiss();

    if (data && data.saveReport) {
      const report = {
        purpose: this.reportTitle,
        source: 'MOBILE',
        trip_request_id: (this.selectedTripRequest && this.selectedTripRequest.id) || this.tripRequestId
      };
      const etxns = this.readyToReportEtxns.filter(etxn => etxn.isSelected);
      const txnIds = etxns.map(etxn => etxn.tx_id);
      this.selectedTotalAmount = etxns.reduce((acc, obj) => acc + obj.tx_amount, 0);

      if (action === 'draft') {
        this.loaderService.showLoader('Saving Report...');
        this.reportService.createDraft(report).pipe(
          switchMap((res) => {
            return this.reportService.addTransactions(res.id, txnIds);
          }),
          finalize(() => {
            this.loaderService.hideLoader();
            this.router.navigate(['/', 'enterprise', 'my_reports']);
          })
        ).subscribe(noop);
      } else {
        this.loaderService.showLoader('Submitting Report...');
        this.reportService.create(report, txnIds).pipe(
          finalize(() => {
            this.loaderService.hideLoader();
            this.router.navigate(['/', 'enterprise', 'my_reports']);
          })
        ).subscribe(noop);
      }
    }
  }

  toggleSelectAll(value: boolean) {
    this.readyToReportEtxns.forEach(etxn => {
      etxn.isSelected = value;
    });
    this.getReportTitle();
  }

  getVendorDetails(expense) {
    const category = expense.tx_org_category && expense.tx_org_category.toLowerCase();
    let vendorName = expense.tx_vendor || 'Expense';

    if (category === 'mileage') {
      vendorName = expense.tx_distance;
      vendorName += ' ' + expense.tx_distance_unit;
    } else if (category === 'per diem') {
      vendorName = expense.tx_num_days;
      vendorName += ' Days';
    }

    return vendorName;
  }

  getReportTitle() {
    const etxns = this.readyToReportEtxns.filter(etxn => etxn.isSelected);
    const txnIds = etxns.map(etxn => etxn.tx_id);
    this.selectedTotalAmount = etxns.reduce((acc, obj) => acc + obj.tx_amount, 0);
    this.selectedTotalTxns = txnIds.length;

    if (txnIds.length > 0) {
      return this.reportService.getReportPurpose({ids: txnIds}).pipe(
        map(res => {
          return res;
        })
      ).subscribe(res => {
        this.reportTitle = res;
      });
    }
  }

  toggleTransaction(etxn) {
    etxn.isSelected = !etxn.isSelected;
    this.getReportTitle();
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

  ionViewWillEnter() {
    this.selectedTxnIds = this.activatedRoute.snapshot.params.txn_ids ? JSON.parse(this.activatedRoute.snapshot.params.txn_ids) : new Array();
    const queryParams = {
      tx_report_id : 'is.null',
      tx_state: 'in.(COMPLETE)',
      order: 'tx_txn_dt.desc'
    };

    const orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay()
    );
    const orgUserSettings$ = this.orgUserSettingsService.get();

    forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
      tripRequests: this.getTripRequests()
    }).subscribe(({ orgSettings,  orgUserSettings, tripRequests}) => {
      this.isTripRequestsEnabled = orgSettings.trip_requests.enabled;
      this.canAssociateTripRequests = orgSettings.trip_requests.enabled && (!orgSettings.trip_requests.enable_for_certain_employee ||
      (orgSettings.trip_requests.enable_for_certain_employee &&
      orgUserSettings.trip_request_org_user_settings.enabled));
      this.tripRequests = tripRequests;
    });

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.transactionService.getAllExpenses({ queryParams }).pipe(
          map(etxns => {
            etxns.forEach((etxn, i) => {
              etxn.vendorDetails = this.getVendorDetails(etxn);
              etxn.showDt = true;
              if (i > 0 && (etxn.tx_txn_dt === etxns[i - 1].tx_txn_dt)) {
                etxn.showDt = false;
              }
              etxn.isSelected = true;

              if (this.selectedTxnIds.length > 0) {
                if (this.selectedTxnIds.indexOf(etxn.tx_id) === -1) {
                  etxn.isSelected = false;
                }
              }
            });
            return etxns;
          }),
        );
      }),
      finalize(() => from(this.loaderService.hideLoader())),
      shareReplay()
    ).subscribe(res => {
      this.readyToReportEtxns = res;
      this.getReportTitle();
    });

    this.homeCurrency$ = this.currencyService.getHomeCurrency();
  }

  ngOnInit() {}

}
