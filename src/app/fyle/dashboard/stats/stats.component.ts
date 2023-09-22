import { Component, EventEmitter, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { Observable } from 'rxjs/internal/Observable';
import { shareReplay } from 'rxjs/internal/operators/shareReplay';
import { map, tap } from 'rxjs/operators';
import { CurrencyService } from '../../../core/services/currency.service';
import { Params, Router } from '@angular/router';
import { NetworkService } from '../../../core/services/network.service';
import { concat, forkJoin, Subject } from 'rxjs';
import { ReportStates } from '../stat-badge/report-states';
import { getCurrencySymbol } from '@angular/common';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgService } from 'src/app/core/services/org.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { ReportStats } from 'src/app/core/models/report-stats.model';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  draftStats$: Observable<{ count: number; sum: number }>;

  approvedStats$: Observable<{ count: number; sum: number }>;

  paymentPendingStats$: Observable<{ count: number; sum: number }>;

  processingStats$: Observable<{ count: number; sum: number }>;

  homeCurrency$: Observable<string>;

  isConnected$: Observable<boolean>;

  currencySymbol$: Observable<string>;

  unreportedExpensesStats$: Observable<{ count: number; sum: number }>;

  incompleteExpensesStats$: Observable<{ count: number; sum: number }>;

  isUnreportedExpensesStatsLoading = true;

  isIncompleteExpensesStatsLoading = true;

  simplifyReportsSettings$: Observable<{ enabled: boolean }>;

  reportStatsLoading = true;

  loadData$ = new Subject();

  reportStatsData$: Observable<{
    reportStats: ReportStats;
    simplifyReportsSettings: { enabled: boolean };
    homeCurrency: string;
    currencySymbol: string;
    isNonReimbursableOrg: boolean;
  }>;

  constructor(
    private dashboardService: DashboardService,
    private currencyService: CurrencyService,
    private router: Router,
    private networkService: NetworkService,
    private trackingService: TrackingService,
    private orgSettingsService: OrgSettingsService,
    private orgService: OrgService,
    private paymentModeService: PaymentModesService
  ) {}

  get ReportStates(): typeof ReportStates {
    return ReportStates;
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  initializeReportStats(): void {
    this.reportStatsLoading = true;
    const reportStats$ = this.dashboardService.getReportsStats().pipe(
      tap(() => {
        this.reportStatsLoading = false;
      }),
      shareReplay(1)
    );

    const orgSettings$ = this.orgSettingsService.get().pipe(shareReplay(1));
    const simplifyReportsSettings$ = orgSettings$.pipe(
      map((orgSettings) => ({ enabled: orgSettings?.simplified_report_closure_settings?.enabled }))
    );

    const isNonReimbursableOrg$ = orgSettings$.pipe(
      map((orgSettings) => this.paymentModeService.isNonReimbursableOrg(orgSettings.payment_mode_settings))
    );

    this.reportStatsData$ = forkJoin({
      reportStats: reportStats$,
      simplifyReportsSettings: simplifyReportsSettings$,
      homeCurrency: this.homeCurrency$,
      currencySymbol: this.currencySymbol$,
      isNonReimbursableOrg: isNonReimbursableOrg$,
    });

    this.draftStats$ = reportStats$.pipe(map((stats) => stats.draft));

    this.approvedStats$ = reportStats$.pipe(map((stats) => stats.approved));

    this.paymentPendingStats$ = reportStats$.pipe(map((stats) => stats.paymentPending));

    this.processingStats$ = reportStats$.pipe(map((stats) => stats.processing));
  }

  initializeExpensesStats(): void {
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

  trackOrgLaunchTime(isMultiOrg: boolean): void {
    if (performance.getEntriesByName(PerfTrackers.appLaunchTime)?.length < 1) {
      // Time taken for the app to launch and display the first screen
      performance.mark(PerfTrackers.appLaunchEndTime);

      // Measure time taken to launch app
      performance.measure(PerfTrackers.appLaunchTime, PerfTrackers.appLaunchStartTime, PerfTrackers.appLaunchEndTime);

      const measureLaunchTime = performance.getEntriesByName(PerfTrackers.appLaunchTime);

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const isLoggedIn = performance.getEntriesByName(PerfTrackers.appLaunchStartTime)[0]['detail'] as boolean;

      // Converting the duration to seconds and fix it to 3 decimal places
      const launchTimeDuration = (measureLaunchTime[0]?.duration / 1000).toFixed(3);

      this.trackingService.appLaunchTime({
        'App launch time': launchTimeDuration,
        'Is logged in': isLoggedIn,
        'Is multi org': isMultiOrg,
      });
    }
  }

  /*
   * This is required because ionic dosnt reload the page every time we enter, it initializes via ngOnInit only on first entry.
   * The ionViewWillEnter is an alternative for this but not present in child pages.
   * Here, I am setting up the initialize method to be called from the parent's ionViewWillEnter method.
   * **/
  init(): void {
    const that = this;

    that.homeCurrency$ = that.currencyService.getHomeCurrency().pipe(shareReplay(1));
    that.currencySymbol$ = that.homeCurrency$.pipe(
      map((homeCurrency: string) => getCurrencySymbol(homeCurrency, 'wide'))
    );

    that.initializeReportStats();
    that.initializeExpensesStats();

    this.orgService.getOrgs().subscribe((orgs) => {
      const isMultiOrg = orgs?.length > 1;

      this.trackOrgLaunchTime(isMultiOrg);

      this.trackDashboardLaunchTime();
    });
  }

  ngOnInit(): void {
    this.homeCurrency$ = this.currencyService.getHomeCurrency().pipe(shareReplay(1));
    this.setupNetworkWatcher();
  }

  goToReportsPage(state: ReportStates): void {
    this.router.navigate(['/', 'enterprise', 'my_reports'], {
      queryParams: {
        filters: JSON.stringify({ state: [state.toString()] }),
      },
    });

    this.trackingService.dashboardOnReportPillClick({
      State: state.toString(),
    });
  }

  goToExpensesPage(state: string): void {
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

  private trackDashboardLaunchTime(): void {
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
