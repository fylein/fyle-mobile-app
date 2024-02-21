import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StatsComponent } from './stats.component';
import { DashboardService } from '../dashboard.service';
import { Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgService } from 'src/app/core/services/org.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ReportStates } from '../stat-badge/report-states';
import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { orgSettingsParamsWithSimplifiedReport, orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { expectedReportStats } from 'src/app/core/mock-data/report-stats.data';
import { reportStatsData1, reportStatsData2 } from 'src/app/core/mock-data/report-stats-data.data';
import { expectedIncompleteExpStats, expectedUnreportedExpStats } from 'src/app/core/mock-data/stats.data';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let router: jasmine.SpyObj<Router>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let paymentModeService: jasmine.SpyObj<PaymentModesService>;
  let performance: jasmine.SpyObj<Performance>;

  beforeEach(waitForAsync(() => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getReportsStats',
      'getUnreportedExpensesStats',
      'getIncompleteExpensesStats',
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'appLaunchTime',
      'dashboardOnReportPillClick',
      'dashboardOnUnreportedExpensesClick',
      'dashboardOnIncompleteExpensesClick',
      'dashboardLaunchTime',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getOrgs']);
    const paymentModeServiceSpy = jasmine.createSpyObj('PaymentModesService', ['isNonReimbursableOrg']);

    TestBed.configureTestingModule({
      declarations: [StatsComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardServiceSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: OrgService,
          useValue: orgServiceSpy,
        },
        {
          provide: PaymentModesService,
          useValue: paymentModeServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    paymentModeService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('get ReportStates() should return ReportStates', () => {
    expect(component.ReportStates).toEqual(ReportStates);
  });

  it('setupNetworkWatcher(): should setup network watcher', (done) => {
    networkService.connectivityWatcher.and.returnValue(null);
    networkService.isOnline.and.returnValue(of(true));

    component.setupNetworkWatcher();
    expect(networkService.connectivityWatcher).toHaveBeenCalledOnceWith(new EventEmitter<boolean>());
    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    component.isConnected$.subscribe((res) => {
      expect(res).toBeTrue();
      done();
    });
  });

  describe('initializeReportStats():', () => {
    beforeEach(() => {
      orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithSimplifiedReport));
      paymentModeService.isNonReimbursableOrg.and.returnValue(false);
      dashboardService.getReportsStats.and.returnValue(of(expectedReportStats));
      component.currencySymbol$ = of('₹');
      component.homeCurrency$ = of('INR');
    });

    it('should initialize reportStatsData$', (done) => {
      component.initializeReportStats();

      expect(component.reportStatsLoading).toBeTrue();
      component.reportStatsData$.subscribe((res) => {
        expect(res).toEqual(reportStatsData1);
        expect(dashboardService.getReportsStats).toHaveBeenCalledTimes(1);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(paymentModeService.isNonReimbursableOrg).toHaveBeenCalledOnceWith(
          orgSettingsParamsWithSimplifiedReport.payment_mode_settings
        );
        expect(component.reportStatsLoading).toBeFalse();
        done();
      });
    });

    it('should initialize reportStatsData$ with enabled as undefined if simplified_report_closure_settings is undefined', (done) => {
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      component.initializeReportStats();

      expect(component.reportStatsLoading).toBeTrue();
      component.reportStatsData$.subscribe((res) => {
        expect(res).toEqual(reportStatsData2);
        expect(dashboardService.getReportsStats).toHaveBeenCalledTimes(1);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(paymentModeService.isNonReimbursableOrg).toHaveBeenCalledOnceWith(orgSettingsRes.payment_mode_settings);
        expect(component.reportStatsLoading).toBeFalse();
        done();
      });
    });

    it('should initialize draftStats$', (done) => {
      component.initializeReportStats();

      component.draftStats$.subscribe((res) => {
        expect(res).toEqual(expectedReportStats.draft);
        done();
      });
    });

    it('should initialize approvedStats$', (done) => {
      component.initializeReportStats();

      component.approvedStats$.subscribe((res) => {
        expect(res).toEqual(expectedReportStats.approved);
        done();
      });
    });

    it('should initialize paymentPendingStats$', (done) => {
      component.initializeReportStats();

      component.paymentPendingStats$.subscribe((res) => {
        expect(res).toEqual(expectedReportStats.paymentPending);
        done();
      });
    });

    it('should initialize processingStats$', () => {
      component.initializeReportStats();

      component.processingStats$.subscribe((res) => {
        expect(res).toEqual(expectedReportStats.processing);
      });
    });
  });

  it('initializeExpensesStats(): should set unreportedExpensesStats$ and incompleteExpensesStats$', (done) => {
    dashboardService.getUnreportedExpensesStats.and.returnValue(of(expectedUnreportedExpStats));
    dashboardService.getIncompleteExpensesStats.and.returnValue(of(expectedIncompleteExpStats));

    component.initializeExpensesStats();

    component.unreportedExpensesStats$.subscribe((res) => {
      expect(res).toEqual(expectedUnreportedExpStats);
      expect(dashboardService.getUnreportedExpensesStats).toHaveBeenCalledTimes(1);
      expect(component.isUnreportedExpensesStatsLoading).toBeFalse();
    });

    component.incompleteExpensesStats$.subscribe((res) => {
      expect(res).toEqual(expectedIncompleteExpStats);
      expect(dashboardService.getIncompleteExpensesStats).toHaveBeenCalledTimes(1);
      expect(component.isIncompleteExpensesStatsLoading).toBeFalse();
      done();
    });
  });

  describe('trackOrgLaunchTime()', () => {
    it('should track org launch time if getEntriesByName() returns empty array', () => {
      const performance = {
        mark: jasmine.createSpy('mark'),
        measure: jasmine.createSpy('measure'),
        getEntriesByName: jasmine
          .createSpy('getEntriesByName')
          .and.returnValues([], [{ duration: 12000 }], [{ detail: true }]),
        now: jasmine.createSpy('now'),
      };
      Object.defineProperty(window, 'performance', {
        value: performance,
      });
      component.trackOrgLaunchTime(true);
      expect(performance.mark).toHaveBeenCalledOnceWith(PerfTrackers.appLaunchEndTime);
      expect(performance.measure).toHaveBeenCalledOnceWith(
        PerfTrackers.appLaunchTime,
        PerfTrackers.appLaunchStartTime,
        PerfTrackers.appLaunchEndTime
      );
      expect(performance.getEntriesByName).toHaveBeenCalledTimes(3);
      expect(trackingService.appLaunchTime).toHaveBeenCalledOnceWith({
        'App launch time': '12.000',
        'Is logged in': true,
        'Is multi org': true,
      });
    });

    it('should track org launch time and call appLaunchTime with NaN if getEntriesByName(appLaunchTime) returns empty array', () => {
      const performance = {
        mark: jasmine.createSpy('mark'),
        measure: jasmine.createSpy('measure'),
        getEntriesByName: jasmine.createSpy('getEntriesByName').and.returnValues([], [], [{ detail: true }]),
        now: jasmine.createSpy('now'),
      };
      Object.defineProperty(window, 'performance', {
        value: performance,
      });
      component.trackOrgLaunchTime(true);
      expect(performance.mark).toHaveBeenCalledOnceWith(PerfTrackers.appLaunchEndTime);
      expect(performance.measure).toHaveBeenCalledOnceWith(
        PerfTrackers.appLaunchTime,
        PerfTrackers.appLaunchStartTime,
        PerfTrackers.appLaunchEndTime
      );
      expect(performance.getEntriesByName).toHaveBeenCalledTimes(3);
      expect(trackingService.appLaunchTime).toHaveBeenCalledOnceWith({
        'App launch time': 'NaN',
        'Is logged in': true,
        'Is multi org': true,
      });
    });

    it('should not track org launch time if getEntriesByName() returns undefined', () => {
      const performance = {
        mark: jasmine.createSpy('mark'),
        measure: jasmine.createSpy('measure'),
        getEntriesByName: jasmine.createSpy('getEntriesByName').and.returnValue(undefined),
        now: jasmine.createSpy('now'),
      };
      Object.defineProperty(window, 'performance', {
        value: performance,
      });
      component.trackOrgLaunchTime(true);
      expect(performance.mark).not.toHaveBeenCalled();
      expect(performance.measure).not.toHaveBeenCalled();
      expect(performance.getEntriesByName).toHaveBeenCalledTimes(1);
      expect(trackingService.appLaunchTime).not.toHaveBeenCalled();
    });
  });

  describe('init():', () => {
    beforeEach(() => {
      spyOn(component, 'initializeReportStats');
      spyOn(component, 'initializeExpensesStats');
      spyOn(component, 'trackOrgLaunchTime');
      currencyService.getHomeCurrency.and.returnValue(of('INR'));
      orgService.getOrgs.and.returnValue(of([]));
    });

    it('should call initializeReportStats(), initializeExpensesStats() and trackOrgLaunchTime() with false if org length is less than 1', () => {
      component.init();

      expect(component.initializeReportStats).toHaveBeenCalledTimes(1);
      expect(component.initializeExpensesStats).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((res) => {
        expect(res).toEqual('INR');
      });
      component.currencySymbol$.subscribe((res) => {
        expect(res).toEqual('₹');
      });
      expect(component.trackOrgLaunchTime).toHaveBeenCalledOnceWith(false);
    });

    it('should call initializeReportStats(), initializeExpensesStats() and trackOrgLaunchTime() with false if org is undefined', () => {
      orgService.getOrgs.and.returnValue(of(undefined));
      component.init();

      expect(component.initializeReportStats).toHaveBeenCalledTimes(1);
      expect(component.initializeExpensesStats).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((res) => {
        expect(res).toEqual('INR');
      });
      component.currencySymbol$.subscribe((res) => {
        expect(res).toEqual('₹');
      });
      expect(component.trackOrgLaunchTime).toHaveBeenCalledOnceWith(false);
    });
  });

  it('ngOnInit(): should setup homeCurrency and call setupNetworkWatcher once', () => {
    spyOn(component, 'setupNetworkWatcher');
    currencyService.getHomeCurrency.and.returnValue(of('INR'));
    component.ngOnInit();

    expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
    component.homeCurrency$.subscribe((res) => {
      expect(res).toEqual('INR');
    });
  });

  it('goToReportsPage(): should navigate to reports page with query params', () => {
    component.goToReportsPage(ReportStates.APPROVED);

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports'], {
      queryParams: {
        filters: JSON.stringify({ state: [ReportStates.APPROVED.toString()] }),
      },
    });
    expect(trackingService.dashboardOnReportPillClick).toHaveBeenCalledOnceWith({
      State: ReportStates.APPROVED.toString(),
    });
  });

  describe('goToExpensesPage():', () => {
    it('goToExpensesPage(): should navigate to expenses page with query params', () => {
      component.redirectToNewPage$ = of(false);
      component.goToExpensesPage('COMPLETE');

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams: {
          filters: JSON.stringify({ state: ['READY_TO_REPORT'] }),
        },
      });
      expect(trackingService.dashboardOnUnreportedExpensesClick).toHaveBeenCalledTimes(1);
    });

    it('goToExpensesPage(): should navigate to expenses page with query params', () => {
      component.redirectToNewPage$ = of(false);
      component.goToExpensesPage('INCOMPLETE');

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams: {
          filters: JSON.stringify({ state: ['DRAFT'] }),
        },
      });
      expect(trackingService.dashboardOnIncompleteExpensesClick).toHaveBeenCalledTimes(1);
    });

    it('goToExpensesPage(): should navigate to v2 expenses page with query params', () => {
      component.redirectToNewPage$ = of(true);
      component.goToExpensesPage('COMPLETE');

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses_v2'], {
        queryParams: {
          filters: JSON.stringify({ state: ['READY_TO_REPORT'] }),
        },
      });
      expect(trackingService.dashboardOnUnreportedExpensesClick).toHaveBeenCalledTimes(1);
    });

    it('goToExpensesPage(): should navigate to v2 expenses page with query params', () => {
      component.redirectToNewPage$ = of(true);
      component.goToExpensesPage('INCOMPLETE');

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses_v2'], {
        queryParams: {
          filters: JSON.stringify({ state: ['DRAFT'] }),
        },
      });
      expect(trackingService.dashboardOnIncompleteExpensesClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('trackDashboardLaunchTime():', () => {
    it('should track dashboard launch time', () => {
      const performance = {
        mark: jasmine.createSpy('mark'),
        measure: jasmine.createSpy('measure'),
        getEntriesByName: jasmine.createSpy('getEntriesByName').and.returnValues([], [{ duration: 12000 }]),
        now: jasmine.createSpy('now'),
      };
      Object.defineProperty(window, 'performance', {
        value: performance,
      });
      //@ts-ignore
      component.trackDashboardLaunchTime();
      expect(performance.mark).toHaveBeenCalledOnceWith(PerfTrackers.dashboardLaunchTime);
      expect(performance.measure).toHaveBeenCalledOnceWith(
        PerfTrackers.dashboardLaunchTime,
        PerfTrackers.onClickSwitchOrg
      );
      expect(performance.getEntriesByName).toHaveBeenCalledTimes(2);
      expect(trackingService.dashboardLaunchTime).toHaveBeenCalledOnceWith({
        'Dashboard launch time': '12.000',
      });
    });

    it('should track dashboard launch time and call Dashboard launch time with NaN if measureLaunchTime is empty array', () => {
      const performance = {
        mark: jasmine.createSpy('mark'),
        measure: jasmine.createSpy('measure'),
        getEntriesByName: jasmine.createSpy('getEntriesByName').and.returnValue([]),
        now: jasmine.createSpy('now'),
      };
      Object.defineProperty(window, 'performance', {
        value: performance,
      });
      //@ts-ignore
      component.trackDashboardLaunchTime();
      expect(performance.mark).toHaveBeenCalledOnceWith(PerfTrackers.dashboardLaunchTime);
      expect(performance.measure).toHaveBeenCalledOnceWith(
        PerfTrackers.dashboardLaunchTime,
        PerfTrackers.onClickSwitchOrg
      );
      expect(performance.getEntriesByName).toHaveBeenCalledTimes(2);
      expect(trackingService.dashboardLaunchTime).toHaveBeenCalledOnceWith({
        'Dashboard launch time': 'NaN',
      });
    });
  });
});
