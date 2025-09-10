import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StatsComponent } from './stats.component';
import { DashboardService } from '../dashboard.service';
import { Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgService } from 'src/app/core/services/org.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ReportStates } from '../stat-badge/report-states.enum';
import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { orgSettingsParamsWithSimplifiedReport, orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { expectedReportStats } from 'src/app/core/mock-data/report-stats.data';
import { reportStatsData1, reportStatsData2 } from 'src/app/core/mock-data/report-stats-data.data';
import { expectedIncompleteExpStats, expectedUnreportedExpStats } from 'src/app/core/mock-data/stats.data';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

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
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getReportsStats',
      'getUnreportedExpensesStats',
      'getIncompleteExpensesStats',
      'getReportStateMapping',
      'isUserAnApprover',
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'appLaunchTime',
      'dashboardLaunchTime',
      'statsClicked',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getOrgs', 'getCurrentOrg', 'getPrimaryOrg']);
    const paymentModeServiceSpy = jasmine.createSpyObj('PaymentModesService', ['isNonReimbursableOrg']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, StatsComponent],
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
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
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
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'stats.myExpenses': 'My expenses',
        'stats.incomplete': 'Incomplete',
        'stats.complete': 'Complete',
        'stats.myExpenseReports': 'My expense reports',
        'stats.draft': 'Draft',
        'stats.submitted': 'Submitted',
        'stats.reported': 'Reported',
        'stats.approved': 'Approved',
        'stats.processing': 'Processing',
        'stats.paymentPending': 'Payment Pending',
        'stats.teamExpenseReports': 'Team expense reports',
        'stats.approvalPending': 'Approval pending',
        'stats.offlineHeader': "You're Offline!",
        'stats.offlineMessage': 'Fear not, you can still add expenses offline.',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
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
          orgSettingsParamsWithSimplifiedReport.payment_mode_settings,
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
        PerfTrackers.appLaunchEndTime,
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
        PerfTrackers.appLaunchEndTime,
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
      orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
      orgService.getPrimaryOrg.and.returnValue(of(orgData1[0]));
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
      orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
      orgService.getPrimaryOrg.and.returnValue(of(orgData1[0]));
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
    dashboardService.getReportStateMapping.and.returnValue('Approved');

    component.goToReportsPage(ReportStates.APPROVED);

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_reports'], {
      queryParams: {
        filters: JSON.stringify({ state: [ReportStates.APPROVED.toString()] }),
      },
    });
    expect(trackingService.statsClicked).toHaveBeenCalledOnceWith({
      event: 'Clicked On Approved Reports',
    });
  });

  describe('goToExpensesPage():', () => {
    it('goToExpensesPage(): should navigate to expenses page with query params', () => {
      component.goToExpensesPage('COMPLETE');

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams: {
          filters: JSON.stringify({ state: ['READY_TO_REPORT'] }),
        },
      });
      expect(trackingService.statsClicked).toHaveBeenCalledOnceWith({
        event: 'Clicked On Unreported Expenses',
      });
    });

    it('goToExpensesPage(): should navigate to expenses page with query params', () => {
      component.goToExpensesPage('INCOMPLETE');

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses'], {
        queryParams: {
          filters: JSON.stringify({ state: ['DRAFT'] }),
        },
      });
      expect(trackingService.statsClicked).toHaveBeenCalledOnceWith({
        event: 'Clicked On Incomplete Expenses',
      });
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
        PerfTrackers.onClickSwitchOrg,
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
        PerfTrackers.onClickSwitchOrg,
      );
      expect(performance.getEntriesByName).toHaveBeenCalledTimes(2);
      expect(trackingService.dashboardLaunchTime).toHaveBeenCalledOnceWith({
        'Dashboard launch time': 'NaN',
      });
    });
  });
});
