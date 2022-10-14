import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { Observable } from 'rxjs/internal/Observable';
import { shareReplay } from 'rxjs/internal/operators/shareReplay';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { CurrencyService } from '../../../core/services/currency.service';
import { Params, Router } from '@angular/router';
import { NetworkService } from '../../../core/services/network.service';
import { concat, of, Subject } from 'rxjs';
import { ReportStates } from '../stat-badge/report-states';
import { getCurrencySymbol } from '@angular/common';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { BankAccountsAssigned } from 'src/app/core/models/v2/bank-accounts-assigned.model';
import { OfflineService } from 'src/app/core/services/offline.service';
import { CardDetail } from 'src/app/core/models/card-detail.model';
import { CardAggregateStat } from 'src/app/core/models/card-aggregate-stat.model';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgService } from 'src/app/core/services/org.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  draftStats$: Observable<{ count: number; sum: number }>;

  reportedStats$: Observable<{ count: number; sum: number }>;

  approvedStats$: Observable<{ count: number; sum: number }>;

  paymentPendingStats$: Observable<{ count: number; sum: number }>;

  homeCurrency$: Observable<string>;

  isConnected$: Observable<boolean>;

  currencySymbol$: Observable<string>;

  unreportedExpensesStats$: Observable<{ count: number; sum: number }>;

  incompleteExpensesStats$: Observable<{ count: number; sum: number }>;

  isUnreportedExpensesStatsLoading = true;

  isIncompleteExpensesStatsLoading = true;

  reportStatsLoading = true;

  loadData$ = new Subject();

  isCCCStatsLoading: boolean;

  cardTransactionsAndDetails$: Observable<{ totalTxns: number; totalAmount: number; cardDetails: CardAggregateStat[] }>;

  cardTransactionsAndDetails: CardDetail[];

  isUnifyCCCExpensesSettings: boolean;

  constructor(
    private dashboardService: DashboardService,
    private currencyService: CurrencyService,
    private router: Router,
    private networkService: NetworkService,
    private offlineService: OfflineService,
    private trackingService: TrackingService,
    private orgSettingsService: OrgSettingsService,
    private orgService: OrgService
  ) {}

  get ReportStates() {
    return ReportStates;
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  initializeReportStats() {
    this.reportStatsLoading = true;
    const reportStats$ = this.dashboardService.getReportsStats().pipe(
      tap(() => {
        this.reportStatsLoading = false;
      }),
      shareReplay(1)
    );

    this.draftStats$ = reportStats$.pipe(map((stats) => stats.draft));

    this.reportedStats$ = reportStats$.pipe(map((stats) => stats.report));

    this.approvedStats$ = reportStats$.pipe(map((stats) => stats.approved));

    this.paymentPendingStats$ = reportStats$.pipe(map((stats) => stats.paymentPending));
  }

  initializeExpensesStats() {
    this.unreportedExpensesStats$ = this.dashboardService.getUnreportedExpensesStats().pipe(
      shareReplay(1),
      tap(() => {
        this.isUnreportedExpensesStatsLoading = false;
      })
    );

    this.incompleteExpensesStats$ = this.dashboardService.getIncompleteExpensesStats().pipe(
      shareReplay(1),
      tap(() => {
        this.isIncompleteExpensesStatsLoading = false;
      })
    );
  }

  getCardDetail(statsResponses) {
    const cardNames = [];
    statsResponses.forEach((response) => {
      const cardDetail = {
        cardNumber: response.key[1].column_value,
        cardName: response.key[0].column_value,
      };
      cardNames.push(cardDetail);
    });
    const uniqueCards = JSON.parse(JSON.stringify(cardNames));

    return this.dashboardService.getExpenseDetailsInCards(uniqueCards, statsResponses);
  }

  initializeCCCStats() {
    this.dashboardService
      .getCCCDetails()
      .pipe()
      .subscribe((details) => {
        this.cardTransactionsAndDetails = this.getCardDetail(details.cardDetails);
        this.isCCCStatsLoading = false;
      });
  }

  /*
   * This is required because ionic dosnt reload the page every time we enter, it initializes via ngOnInit only on first entry.
   * The ionViewWillEnter is an alternative for this but not present in child pages.
   * Here, I am setting up the initialize method to be called from the parent's ionViewWillEnter method.
   * **/
  init() {
    const that = this;
    that.cardTransactionsAndDetails = [];
    that.homeCurrency$ = that.currencyService.getHomeCurrency().pipe(shareReplay(1));
    that.currencySymbol$ = that.homeCurrency$.pipe(
      map((homeCurrency: string) => getCurrencySymbol(homeCurrency, 'wide'))
    );

    that.initializeReportStats();
    that.initializeExpensesStats();
    that.offlineService.getOrgSettings().subscribe((orgSettings) => {
      if (orgSettings?.corporate_credit_card_settings?.enabled) {
        this.isUnifyCCCExpensesSettings =
          orgSettings.unify_ccce_expenses_settings &&
          orgSettings.unify_ccce_expenses_settings.allowed &&
          orgSettings.unify_ccce_expenses_settings.enabled;
        that.isCCCStatsLoading = true;
        that.initializeCCCStats();
      } else {
        this.cardTransactionsAndDetails$ = of(null);
      }
    });

    this.orgService.getOrgs().subscribe((orgs) => {
      const isMultiOrg = orgs?.length > 1;

      if (performance.getEntriesByName(PerfTrackers.appLaunchTime)?.length < 1) {
        // Time taken for the app to launch and display the first screen
        performance.mark(PerfTrackers.appLaunchEndTime);

        // Measure time taken to launch app
        performance.measure(PerfTrackers.appLaunchTime, PerfTrackers.appLaunchStartTime, PerfTrackers.appLaunchEndTime);

        const measureLaunchTime = performance.getEntriesByName(PerfTrackers.appLaunchTime);

        // eslint-disable-next-line @typescript-eslint/dot-notation
        const isLoggedIn = performance.getEntriesByName(PerfTrackers.appLaunchStartTime)[0]['detail'];

        // Converting the duration to seconds and fix it to 3 decimal places
        const launchTimeDuration = (measureLaunchTime[0]?.duration / 1000).toFixed(3);

        this.trackingService.appLaunchTime({
          'App launch time': launchTimeDuration,
          'Is logged in': isLoggedIn,
          'Is multi org': isMultiOrg,
        });
      }

      this.trackDashboardLaunchTime();
    });
  }

  ngOnInit() {
    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(shareReplay(1));
    this.setupNetworkWatcher();
  }

  goToReportsPage(state: ReportStates) {
    this.router.navigate(['/', 'enterprise', 'my_reports'], {
      queryParams: {
        filters: JSON.stringify({ state: [state.toString()] }),
      },
    });

    this.trackingService.dashboardOnReportPillClick({
      State: state.toString(),
    });
  }

  goToExpensesPage(state: string) {
    if (state === 'COMPLETE') {
      const queryParams: Params = { filters: JSON.stringify({ state: ['READY_TO_REPORT'] }) };
      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });

      this.trackingService.dashboardOnUnreportedExpensesClick();
    } else {
      const queryParams: Params = { filters: JSON.stringify({ state: ['DRAFT'] }) };
      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams,
      });

      this.trackingService.dashboardOnIncompleteExpensesClick();
    }
  }

  goToCCCPage(state: string) {
    this.router.navigate(['/', 'enterprise', 'corporate_card_expenses', { pageState: state }]);
    this.trackingService.dashboardOnCorporateCardClick({
      pageState: state,
    });
  }

  private trackDashboardLaunchTime() {
    try {
      if (performance.getEntriesByName(PerfTrackers.dashboardLaunchTime).length === 0) {
        // Time taken to land on dashboard page after switching org
        performance.mark(PerfTrackers.dashboardLaunchTime);

        // Measure total time taken from switch org page to landing on dashboard page
        performance.measure(PerfTrackers.dashboardLaunchTime, PerfTrackers.onClickSwitchOrg);

        const measureLaunchTime = performance.getEntriesByName(PerfTrackers.dashboardLaunchTime);

        // Converting the duration to seconds and fix it to 3 decimal places
        const launchTimeDuration = (measureLaunchTime[0]?.duration / 1000)?.toFixed(3);

        this.trackingService.dashboardLaunchTime({
          'Dashboard launch time': launchTimeDuration,
        });
      }
    } catch (err) {}
  }
}
