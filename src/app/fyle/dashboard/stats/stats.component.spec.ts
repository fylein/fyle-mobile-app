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

fdescribe('StatsComponent', () => {
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
});
