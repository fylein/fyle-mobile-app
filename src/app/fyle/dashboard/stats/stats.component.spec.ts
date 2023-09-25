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
});
