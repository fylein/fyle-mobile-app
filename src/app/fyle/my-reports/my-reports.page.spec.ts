import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController, PopoverController } from '@ionic/angular';

import { MyReportsPage } from './my-reports.page';
import { TasksService } from 'src/app/core/services/tasks.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { orgSettingsRes, orgSettingsParamsWithSimplifiedReport } from 'src/app/core/mock-data/org-settings.data';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { apiExtendedReportRes } from 'src/app/core/mock-data/report.data';
import { cardAggregateStatParam, cardAggregateStatParam2 } from 'src/app/core/mock-data/card-aggregate-stat.data';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { NetworkService } from 'src/app/core/services/network.service';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { DateService } from 'src/app/core/services/date.service';
import * as dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';

fdescribe('MyReportsPage', () => {
  let component: MyReportsPage;
  let fixture: ComponentFixture<MyReportsPage>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let router: jasmine.SpyObj<Router>;
  let navController: jasmine.SpyObj<NavController>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let dateService: jasmine.SpyObj<DateService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getReportsTaskCount']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getMyReportsCount',
      'getMyReports',
      'clearTransactionCache',
      'delete',
    ]);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['extendQueryParamsForTextSearch']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getTransactionStats']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['isOnline', 'connectivityWatcher']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'getThisMonthRange',
      'getThisWeekRange',
      'getLastMonthRange',
    ]);
    const activatedRouteSpy = {
      snapshot: {
        params: {
          navigateBack: false,
        },
      },
    };
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'deleteReport',
      'footerHomeTabClicked',
      'tasksPageOpened',
    ]);

    TestBed.configureTestingModule({
      declarations: [MyReportsPage, ReportState],
      imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: ApiV2Service, useValue: apiV2ServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']) },
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        ReportState,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MyReportsPage);
    component = fixture.componentInstance;

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    activatedRoute.snapshot.params = {};
    activatedRoute.snapshot.queryParams = {};
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter(): ', () => {
    it('should initialize component properties and load data', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: apiExtendedReportRes };

      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      reportService.getMyReportsCount.and.returnValue(of(10));

      reportService.getMyReports.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));

      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));

      inputElement = component.simpleSearchInput.nativeElement;

      spyOn(component, 'setupNetworkWatcher');

      spyOn(component, 'clearFilters');

      component.ionViewWillEnter();

      expect(tasksService.getReportsTaskCount).toHaveBeenCalledTimes(1);

      expect(component.reportsTaskCount).toBe(5);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);

      expect(component.searchText).toEqual('');

      expect(component.navigateBack).toBeFalse();

      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });

      expect(component.simpleSearchInput.nativeElement.value).toBe('');

      inputElement.value = 'example';

      inputElement.dispatchEvent(new Event('keyup'));

      tick(1000);

      expect(reportService.getMyReportsCount).toHaveBeenCalledTimes(4);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(reportService.getMyReportsCount).toHaveBeenCalledWith({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(4);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        'example'
      );

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE)',
          or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(reportService.getMyReports).toHaveBeenCalledTimes(2);

      expect(reportService.getMyReports).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' },
        order: null,
      });

      expect(component.acc).toEqual(apiExtendedReportRes);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(apiExtendedReportRes);
      });

      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);

      component.simplifyReportsSettings$.subscribe((simplifyReportSetting) => {
        expect(simplifyReportSetting).toEqual({ enabled: undefined });
      });

      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: { filters: '{"state":["PAID","CANCELLED"]}' },
        replaceUrl: true,
      });

      component.nonReimbursableOrg$.subscribe((nonReimbursableOrg) => {
        expect(nonReimbursableOrg).toBeFalse();
      });

      expect(component.clearFilters).toHaveBeenCalledTimes(1);

      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          searchString: 'example',
        });
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));

    it('should initialize component properties and set simplifyReportsSetting$ to undefined if orgSetting$ is undefined', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: apiExtendedReportRes };

      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      reportService.getMyReportsCount.and.returnValue(of(10));

      reportService.getMyReports.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(undefined));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));

      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));

      inputElement = component.simpleSearchInput.nativeElement;

      spyOn(component, 'setupNetworkWatcher');

      spyOn(component, 'clearFilters');

      component.ionViewWillEnter();

      expect(tasksService.getReportsTaskCount).toHaveBeenCalledTimes(1);

      expect(component.reportsTaskCount).toBe(5);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);

      expect(component.searchText).toEqual('');

      expect(component.navigateBack).toBeFalse();

      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });

      expect(component.simpleSearchInput.nativeElement.value).toBe('');

      inputElement.value = 'example';

      inputElement.dispatchEvent(new Event('keyup'));

      tick(1000);

      expect(reportService.getMyReportsCount).toHaveBeenCalledTimes(4);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(reportService.getMyReportsCount).toHaveBeenCalledWith({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(4);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        'example'
      );

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE)',
          or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(reportService.getMyReports).toHaveBeenCalledTimes(2);

      expect(reportService.getMyReports).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' },
        order: null,
      });

      expect(component.acc).toEqual(apiExtendedReportRes);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(apiExtendedReportRes);
      });

      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);

      component.simplifyReportsSettings$.subscribe((simplifyReportSetting) => {
        expect(simplifyReportSetting).toEqual({ enabled: undefined });
      });

      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: { filters: '{"state":["PAID","CANCELLED"]}' },
        replaceUrl: true,
      });

      component.nonReimbursableOrg$.subscribe((nonReimbursableOrg) => {
        expect(nonReimbursableOrg).toBeUndefined();
      });

      expect(component.clearFilters).toHaveBeenCalledTimes(1);

      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          searchString: 'example',
        });
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));

    it('should initialize component properties and get report by order if sortParam and sortDir is defined, aggregates is empty array and simplified_report is enabled', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      reportService.getMyReportsCount.and.returnValue(of(0));
      orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithSimplifiedReport));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam2));

      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));

      inputElement = component.simpleSearchInput.nativeElement;

      spyOn(component, 'setupNetworkWatcher');

      spyOn(component, 'clearFilters');

      component.ionViewWillEnter();

      component.loadData$.next({
        pageNumber: 1,
        sortParam: 'approvalDate',
        sortDir: 'desc',
      });

      expect(tasksService.getReportsTaskCount).toHaveBeenCalledTimes(1);

      expect(component.reportsTaskCount).toBe(5);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);

      expect(component.searchText).toEqual('');

      expect(component.navigateBack).toBeFalse();

      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });

      expect(component.simpleSearchInput.nativeElement.value).toBe('');

      inputElement.value = 'example';

      inputElement.dispatchEvent(new Event('keyup'));

      tick(1000);

      expect(reportService.getMyReportsCount).toHaveBeenCalledTimes(6);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 2 times, 1 time in this test case
      expect(reportService.getMyReportsCount).toHaveBeenCalledWith({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(6);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        'example'
      );

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE)',
          or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        });

        expect(expenseAmountStates).toEqual({
          sum: 0,
          count: 0,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(0);
      });

      expect(reportService.getMyReports).not.toHaveBeenCalled();

      expect(component.acc).toEqual([]);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual([]);
      });

      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeFalse();
      });

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);

      component.simplifyReportsSettings$.subscribe((simplifyReportSetting) => {
        expect(simplifyReportSetting).toEqual({ enabled: true });
      });

      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: { filters: '{"state":["PAID","CANCELLED"]}' },
        replaceUrl: true,
      });

      component.nonReimbursableOrg$.subscribe((nonReimbursableOrg) => {
        expect(nonReimbursableOrg).toBeFalse();
      });

      expect(component.clearFilters).toHaveBeenCalledTimes(1);

      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          searchString: 'example',
          sortParam: 'approvalDate',
          sortDir: 'desc',
        });
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));

    it('should initialize component properties and load data if filters is defined in activatedRoute.snapshot', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: apiExtendedReportRes };

      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      reportService.getMyReportsCount.and.returnValue(of(10));

      reportService.getMyReports.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));

      activatedRoute.snapshot.queryParams.filters = '{"sortDir": "desc"}';

      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));

      inputElement = component.simpleSearchInput.nativeElement;

      spyOn(component, 'setupNetworkWatcher');

      spyOn(component, 'clearFilters');
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 1, sortDir: 'desc' });
      spyOn(component, 'generateFilterPills');

      component.ionViewWillEnter();

      expect(tasksService.getReportsTaskCount).toHaveBeenCalledTimes(1);

      expect(component.reportsTaskCount).toBe(5);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);

      expect(component.searchText).toEqual('');

      expect(component.navigateBack).toBeFalse();

      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });

      expect(component.simpleSearchInput.nativeElement.value).toBe('');

      inputElement.value = 'example';

      inputElement.dispatchEvent(new Event('keyup'));

      tick(1000);

      expect(reportService.getMyReportsCount).toHaveBeenCalledTimes(6);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(reportService.getMyReportsCount).toHaveBeenCalledWith({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(6);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        'example'
      );

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE)',
          or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(reportService.getMyReports).toHaveBeenCalledTimes(3);

      expect(reportService.getMyReports).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' },
        order: null,
      });

      expect(component.acc).toEqual(apiExtendedReportRes);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(apiExtendedReportRes);
      });

      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);

      component.simplifyReportsSettings$.subscribe((simplifyReportSetting) => {
        expect(simplifyReportSetting).toEqual({ enabled: undefined });
      });

      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: { filters: '{"state":["PAID","CANCELLED"]}' },
        replaceUrl: true,
      });

      component.nonReimbursableOrg$.subscribe((nonReimbursableOrg) => {
        expect(nonReimbursableOrg).toBeFalse();
      });

      expect(component.filters).toEqual({
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
        sortDir: 'desc',
      });

      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);

      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
        sortDir: 'desc',
      });

      expect(component.clearFilters).not.toHaveBeenCalled();

      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          searchString: 'example',
          sortDir: 'desc',
        });
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));

    it('should initialize component properties and load data if state is defined in activatedRoute.snapshot', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: apiExtendedReportRes };

      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      reportService.getMyReportsCount.and.returnValue(of(10));

      reportService.getMyReports.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));

      activatedRoute.snapshot.params.state = 'needsreceipt';

      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));

      inputElement = component.simpleSearchInput.nativeElement;

      spyOn(component, 'setupNetworkWatcher');

      spyOn(component, 'clearFilters');
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 1, sortDir: 'desc' });
      spyOn(component, 'generateFilterPills');

      component.ionViewWillEnter();

      expect(tasksService.getReportsTaskCount).toHaveBeenCalledTimes(1);

      expect(component.reportsTaskCount).toBe(5);

      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);

      expect(component.searchText).toEqual('');

      expect(component.navigateBack).toBeFalse();

      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });

      expect(component.simpleSearchInput.nativeElement.value).toBe('');

      inputElement.value = 'example';

      inputElement.dispatchEvent(new Event('keyup'));

      tick(1000);

      expect(reportService.getMyReportsCount).toHaveBeenCalledTimes(6);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(reportService.getMyReportsCount).toHaveBeenCalledWith({
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });

      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(6);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        { rp_state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)' },
        'example'
      );

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE)',
          or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(reportService.getMyReports).toHaveBeenCalledTimes(3);

      expect(reportService.getMyReports).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' },
        order: null,
      });

      expect(component.acc).toEqual(apiExtendedReportRes);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(apiExtendedReportRes);
      });

      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);

      component.simplifyReportsSettings$.subscribe((simplifyReportSetting) => {
        expect(simplifyReportSetting).toEqual({ enabled: undefined });
      });

      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: { filters: '{"state":["PAID","CANCELLED"]}' },
        replaceUrl: true,
      });

      component.nonReimbursableOrg$.subscribe((nonReimbursableOrg) => {
        expect(nonReimbursableOrg).toBeFalse();
      });

      expect(component.filters).toEqual({
        state: 'NEEDSRECEIPT',
        rp_state: 'in.(needsreceipt)',
      });

      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);

      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        state: 'NEEDSRECEIPT',
        rp_state: 'in.(needsreceipt)',
      });

      expect(component.clearFilters).not.toHaveBeenCalled();

      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          searchString: 'example',
          sortDir: 'desc',
        });
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));
  });

  it('get HeaderState(): should return the HeaderState', () => {
    expect(component.HeaderState).toEqual(HeaderState);
  });

  it('ngOnInit():', () => {
    component.ngOnInit();
  });

  it('ionViewWillLeave(): should set the onPageExit to null', () => {
    component.ionViewWillLeave();
    component.onPageExit.subscribe((pageExit) => {
      expect(pageExit).toBe(null);
    });
  });

  describe('setupNetworkWatcher():', () => {
    it('should setup network watcher', () => {
      networkService.isOnline.and.returnValue(of(true));

      component.setupNetworkWatcher();
      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    });

    it('should navigate to dashboard if device is not online', () => {
      networkService.isOnline.and.returnValue(of(false));

      component.setupNetworkWatcher();
      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
    });
  });

  describe('loadData(event): ', () => {
    it('loadData(event): should increment currentPageNumber and emit updated params and call complete() after 1s', fakeAsync(() => {
      const mockEvent = { target: { complete: jasmine.createSpy('complete') } };
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadData$.getValue().pageNumber).toBe(3);
      tick(1000);
      expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
    }));

    it('loadData(event): should increment currentPageNumber and emit updated params if target is not defined', () => {
      const mockEvent = {};
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadData$.getValue().pageNumber).toBe(3);
    });

    it('loadData(event): should increment currentPageNumber and emit updated params if event if undefined', () => {
      const mockEvent = undefined;
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadData$.getValue().pageNumber).toBe(3);
    });
  });

  describe('doRefresh():', () => {
    it('should refresh data without event', () => {
      reportService.clearTransactionCache.and.returnValue(of(null));
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
      component.doRefresh();
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toBe(1);
      expect(component.loadData$.getValue().pageNumber).toBe(1);
    });

    it('should refresh data and call complete if event if present', () => {
      reportService.clearTransactionCache.and.returnValue(of(null));
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
      const mockEvent = { target: { complete: jasmine.createSpy('complete') } };

      component.doRefresh(mockEvent);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toBe(1);
      expect(component.loadData$.getValue().pageNumber).toBe(1);
      expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
    });

    it('should refresh data if target is not defined', () => {
      reportService.clearTransactionCache.and.returnValue(of(null));
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
      const mockEvent = {};

      component.doRefresh(mockEvent);
      expect(reportService.clearTransactionCache).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toBe(1);
      expect(component.loadData$.getValue().pageNumber).toBe(1);
    });
  });

  describe('generateCustomDateParams():', () => {
    it('should generate custom date params with start and end dates', () => {
      const newQueryParams: { or: string[]; and?: string } = { or: [] };
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-31');

      component.filters = {
        date: DateFilters.custom,
        customDateStart: startDate,
        customDateEnd: endDate,
      };

      component.generateCustomDateParams(newQueryParams);

      expect(newQueryParams.and).toBe(
        `(rp_created_at.gte.${startDate.toISOString()},rp_created_at.lt.${endDate.toISOString()})`
      );
    });

    it('should generate custom date params with start date only', () => {
      const newQueryParams: { or: string[]; and?: string } = { or: [] };
      const startDate = new Date('2022-01-01');

      component.filters = {
        date: DateFilters.custom,
        customDateStart: startDate,
        customDateEnd: null,
      };

      component.generateCustomDateParams(newQueryParams);

      expect(newQueryParams.and).toBe(`(rp_created_at.gte.${startDate.toISOString()})`);
    });

    it('should generate custom date params with end date only', () => {
      const newQueryParams: { or: string[]; and?: string } = { or: [] };
      const endDate = new Date('2022-01-31');

      component.filters = {
        date: DateFilters.custom,
        customDateStart: null,
        customDateEnd: endDate,
      };

      component.generateCustomDateParams(newQueryParams);

      expect(newQueryParams.and).toBe(`(rp_created_at.lt.${endDate.toISOString()})`);
    });

    it('should not generate custom date params when date filter is not custom', () => {
      const newQueryParams: { or: string[]; and?: string } = { or: [] };
      component.filters = {
        date: DateFilters.thisWeek,
        customDateStart: new Date(),
        customDateEnd: new Date(),
      };

      component.generateCustomDateParams(newQueryParams);

      expect(newQueryParams.and).toBeUndefined();
    });
  });

  describe('generateDateParams(): ', () => {
    it('should generate date params for this month', () => {
      spyOn(component, 'generateCustomDateParams');
      const newQueryParams: { or: string[]; and?: string } = { or: [] };
      const thisMonthRange = {
        from: new Date('2022-01-01'),
        to: new Date('2022-01-31'),
      };
      const expectedAndQuery = `(rp_created_at.gte.${thisMonthRange.from.toISOString()},rp_created_at.lt.${thisMonthRange.to.toISOString()})`;
      dateService.getThisMonthRange.and.returnValue(thisMonthRange);
      component.filters = {
        date: DateFilters.thisMonth,
        customDateStart: null,
        customDateEnd: null,
      };

      component.generateDateParams(newQueryParams);

      expect(newQueryParams.and).toEqual(expectedAndQuery);
      expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith({ or: [], and: expectedAndQuery });
    });

    it('should generate date params for this week', () => {
      spyOn(component, 'generateCustomDateParams');
      const newQueryParams: { or: string[]; and?: string } = { or: [] };
      const thisWeekRange = {
        from: dayjs('2022-01-01'),
        to: dayjs('2022-01-07'),
      };
      const expectedAndQuery = `(rp_created_at.gte.${thisWeekRange.from.toISOString()},rp_created_at.lt.${thisWeekRange.to.toISOString()})`;
      dateService.getThisWeekRange.and.returnValue(thisWeekRange);
      component.filters = {
        date: DateFilters.thisWeek,
        customDateStart: null,
        customDateEnd: null,
      };

      component.generateDateParams(newQueryParams);

      expect(newQueryParams.and).toEqual(expectedAndQuery);
      expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith({ or: [], and: expectedAndQuery });
    });

    it('should generate date params for last month', () => {
      spyOn(component, 'generateCustomDateParams');
      const newQueryParams: { or: string[]; and?: string } = { or: [] };
      const lastMonthRange = {
        from: new Date('2021-12-01'),
        to: new Date('2021-12-31'),
      };
      const expectedAndQuery = `(rp_created_at.gte.${lastMonthRange.from.toISOString()},rp_created_at.lt.${lastMonthRange.to.toISOString()})`;
      dateService.getLastMonthRange.and.returnValue(lastMonthRange);
      component.filters = {
        date: DateFilters.lastMonth,
        customDateStart: null,
        customDateEnd: null,
      };

      component.generateDateParams(newQueryParams);

      expect(newQueryParams.and).toEqual(expectedAndQuery);
      expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith({ or: [], and: expectedAndQuery });
    });

    it('should not generate date params when date filter is not set', () => {
      spyOn(component, 'generateCustomDateParams');
      const newQueryParams: { or: string[]; and?: string } = { or: [] };
      component.filters = {
        date: null,
        customDateStart: null,
        customDateEnd: null,
      };

      component.generateDateParams(newQueryParams);

      expect(newQueryParams.and).toBeUndefined();
      expect(component.generateCustomDateParams).not.toHaveBeenCalled();
    });

    it('should convert customDateStart and customDateEnd string to date', () => {
      spyOn(component, 'generateCustomDateParams');
      component.filters = {
        date: DateFilters.all,
        customDateStart: new Date('2023-02-21T00:00:00.000Z'),
        customDateEnd: new Date('2023-02-23T00:00:00.000Z'),
      };
      const newQueryParams: { or: string[]; and?: string } = { or: [] };

      component.generateDateParams(newQueryParams);
      expect(newQueryParams.and).toBeUndefined();
      expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith(newQueryParams);
    });
  });

  describe('generateStateFilters(): ', () => {
    it('should update the newQueryParams if stateOrFilter length is greater than 0', () => {
      const newQueryParams = { or: [] };
      component.filters = {
        state: [
          'DRAFT',
          'APPROVER_PENDING',
          'APPROVER_INQUIRY',
          'APPROVED',
          'PAYMENT_PENDING',
          'PAYMENT_PROCESSING',
          'PAID',
        ],
      };
      component.generateStateFilters(newQueryParams);
      expect(newQueryParams).toEqual({
        or: [
          '(rp_state.in.(DRAFT), rp_state.in.(APPROVER_PENDING), rp_state.in.(APPROVER_INQUIRY), rp_state.in.(APPROVED), rp_state.in.(PAYMENT_PENDING), rp_state.in.(PAYMENT_PROCESSING), rp_state.in.(PAID))',
        ],
      });
    });

    it('should not update the newQueryParams if stateOrFilter length is 0', () => {
      const newQueryParams = { or: [] };
      component.filters = {
        state: [],
      };
      component.generateStateFilters(newQueryParams);
      expect(newQueryParams).toEqual({
        or: [],
      });
    });
  });

  describe('setSortParams(): ', () => {
    it('should set sortParam and sortDir from filters if available', () => {
      const currentParams: Partial<{
        pageNumber: number;
        queryParams: any;
        sortParam: string;
        sortDir: string;
        searchString: string;
      }> = {};

      component.filters = {
        sortParam: 'rp_amount',
        sortDir: 'asc',
      };

      component.setSortParams(currentParams);

      expect(currentParams.sortParam).toEqual('rp_amount');
      expect(currentParams.sortDir).toEqual('asc');
    });

    it('should set default sortParam and sortDir if filters are not available', () => {
      const currentParams: Partial<{
        pageNumber: number;
        queryParams: any;
        sortParam: string;
        sortDir: string;
        searchString: string;
      }> = {};
      component.filters = {};

      component.setSortParams(currentParams);

      expect(currentParams.sortParam).toEqual('rp_created_at');
      expect(currentParams.sortDir).toEqual('desc');
    });
  });

  it('addNewFiltersToParams(): should update currentParams with new filters and return the updated currentParams', () => {
    component.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });

    spyOn(component, 'generateDateParams').and.callFake((newQueryParams) => {
      newQueryParams.and = '(rp_created_at.gte.january,rp_created_at.lt.march)';
    });

    spyOn(component, 'generateStateFilters').and.callFake((newQueryParams) => {
      newQueryParams.or.push('(rp_state.in.(DRAFT), rp_state.in.(APPROVER_PENDING))');
    });

    spyOn(component, 'setSortParams').and.callFake((currentParams) => {
      currentParams.sortParam = 'rp_created_at';
      currentParams.sortDir = 'desc';
    });

    const result = component.addNewFiltersToParams();

    expect(result.pageNumber).toEqual(1);
    expect(result.queryParams.and).toEqual('(rp_created_at.gte.january,rp_created_at.lt.march)');
    expect(result.queryParams.or).toEqual(['(rp_state.in.(DRAFT), rp_state.in.(APPROVER_PENDING))']);
    expect(result.sortParam).toEqual('rp_created_at');
    expect(result.sortDir).toEqual('desc');
  });

  it('clearFilters(): should clear the filter and update loadData$ value', () => {
    component.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });
    spyOn(component, 'generateFilterPills').and.returnValue([{ label: 'Date', type: 'date', value: 'this Week' }]);
    spyOn(component, 'addNewFiltersToParams').and.returnValue({ sortDir: 'desc', sortParam: 'approvalDate' });

    component.clearFilters();
    expect(component.filters).toEqual({});
    expect(component.currentPageNumber).toBe(1);
    component.loadData$.subscribe((data) => {
      expect(data).toEqual({ sortDir: 'desc', sortParam: 'approvalDate' });
    });
    expect(component.filterPills).toEqual([{ label: 'Date', type: 'date', value: 'this Week' }]);
  });

  it('onReportClick(): should navigate to the view report page', () => {
    const erpt = apiExtendedReportRes[0];

    component.onReportClick(erpt);

    expect(router.navigate).toHaveBeenCalledWith([
      '/',
      'enterprise',
      'my_view_report',
      { id: erpt.rp_id, navigateBack: true },
    ]);
  });

  it('getDeleteReportPopoverParams(): should get delete report popup props', (done) => {
    const result = component.getDeleteReportPopoverParams(apiExtendedReportRes[0]);

    reportService.delete.and.returnValue(of(true));

    expect(result).toEqual({
      component: FyDeleteDialogComponent,
      cssClass: 'delete-dialog',
      backdropDismiss: false,
      componentProps: {
        header: 'Delete Report',
        body: 'Are you sure you want to delete this report?',
        infoMessage: 'Deleting the report will not delete any of the expenses.',
        deleteMethod: jasmine.any(Function),
      },
    });

    result.componentProps.deleteMethod().subscribe(() => {
      expect(reportService.delete).toHaveBeenCalledOnceWith(apiExtendedReportRes[0].rp_id);
      done();
    });
  });

  describe('onDeleteReportClick(): ', () => {
    it('should present the popover in case if rp_state is not amongst DRAFT, APPROVER_PENDING, APPROVER_INQUIRY', fakeAsync(() => {
      const cannotDeleteReportPopOverSpy = jasmine.createSpyObj('cannotDeleteReportPopOver', [
        'present',
        'onWillDismiss',
      ]);
      popoverController.create.and.returnValue(Promise.resolve(cannotDeleteReportPopOverSpy));
      const mockErpt = cloneDeep({ ...apiExtendedReportRes[0], rp_state: 'APPROVED' });

      component.onDeleteReportClick(mockErpt);
      tick(200);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Cannot Delete Report',
          message: `Approved report cannot be deleted.`,
          primaryCta: {
            text: 'Close',
            action: 'continue',
          },
        },
        cssClass: 'pop-up-in-center',
      });
    }));

    it('should call the deleteReport and do a refresh if rp_state consist any of DRAFT, APPROVER_PENDING, APPROVER_INQUIRY', fakeAsync(() => {
      const deleteReportPopoverSpy = jasmine.createSpyObj('deleteReportPopover', ['present', 'onDidDismiss']);
      deleteReportPopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });
      popoverController.create.and.returnValue(Promise.resolve(deleteReportPopoverSpy));
      spyOn(component, 'doRefresh');
      const mockDeleteMethod = () => of(true);
      spyOn(component, 'getDeleteReportPopoverParams').and.returnValue({
        component: FyDeleteDialogComponent,
        cssClass: 'delete-dialog',
        backdropDismiss: false,
        componentProps: {
          header: 'Delete Report',
          body: 'Are you sure you want to delete this report?',
          infoMessage: 'Deleting the report will not delete any of the expenses.',
          deleteMethod: mockDeleteMethod,
        },
      });
      reportService.delete.and.returnValue(of(null));
      loaderService.showLoader.and.resolveTo(null);
      loaderService.hideLoader.and.resolveTo(null);
      reportService.delete.and.returnValue(of(null));

      component.onDeleteReportClick(apiExtendedReportRes[0]);
      tick(200);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: FyDeleteDialogComponent,
        cssClass: 'delete-dialog',
        backdropDismiss: false,
        componentProps: {
          header: 'Delete Report',
          body: 'Are you sure you want to delete this report?',
          infoMessage: 'Deleting the report will not delete any of the expenses.',
          deleteMethod: mockDeleteMethod,
        },
      });
      expect(component.getDeleteReportPopoverParams).toHaveBeenCalledOnceWith(apiExtendedReportRes[0]);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(trackingService.deleteReport).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));
  });

  it('onHomeClicked(): should navigate to home dashboard and track event', () => {
    component.onHomeClicked();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: { state: 'home' },
    });
    expect(trackingService.footerHomeTabClicked).toHaveBeenCalledOnceWith({ page: 'Reports' });
  });

  it('onTaskClicked(): should navigate to home dashboard and track event', () => {
    component.onTaskClicked();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: { state: 'tasks', tasksFilters: 'reports' },
    });
    expect(trackingService.tasksPageOpened).toHaveBeenCalledOnceWith({
      Asset: 'Mobile',
      from: 'My Reports',
    });
  });

  it('onCameraClicked(): should navigate to camera overlay', () => {
    component.onCameraClicked();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
  });

  it('onViewCommentsClick()', () => {
    component.onViewCommentsClick({});
  });

  describe('clearText(): ', () => {
    it('should clear the search text, input value, dispatch keyup event, and update search bar focus', () => {
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      const dispatchEventSpy = spyOn(inputElement, 'dispatchEvent');
      component.simpleSearchText = 'some text';
      inputElement.value = 'some text';
      component.isSearchBarFocused = true;

      component.clearText('');

      expect(component.simpleSearchText).toEqual('');
      expect(inputElement.value).toEqual('');
      expect(dispatchEventSpy).toHaveBeenCalledOnceWith(new Event('keyup'));
      expect(component.isSearchBarFocused).toEqual(true);
    });

    it('should clear the search text, input value, dispatch keyup event, and toggle search bar focus when called from onSimpleSearchCancel', () => {
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      const dispatchEventSpy = spyOn(inputElement, 'dispatchEvent');
      component.simpleSearchText = 'some text';
      inputElement.value = 'some text';
      component.isSearchBarFocused = true;

      component.clearText('onSimpleSearchCancel');

      expect(component.simpleSearchText).toEqual('');
      expect(inputElement.value).toEqual('');
      expect(dispatchEventSpy).toHaveBeenCalledOnceWith(new Event('keyup'));
      expect(component.isSearchBarFocused).toEqual(false);
    });
  });

  it('onSimpleSearchCancel(): should set the header state to base and call clearText with "onSimpleSearchCancel"', () => {
    spyOn(component, 'clearText');

    component.onSimpleSearchCancel();

    expect(component.headerState).toEqual(HeaderState.base);
    expect(component.clearText).toHaveBeenCalledWith('onSimpleSearchCancel');
  });

  it('onSearchBarFocus(): should set isSearchBarFocused to true', () => {
    component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));
    inputElement = component.simpleSearchInput.nativeElement;
    component.isSearchBarFocused = false;

    inputElement.dispatchEvent(new Event('focus'));

    expect(component.isSearchBarFocused).toEqual(true);
  });

  it('onFilterPillsClearAll(): should call clearFilters', () => {
    spyOn(component, 'clearFilters');

    component.onFilterPillsClearAll();

    expect(component.clearFilters).toHaveBeenCalledTimes(1);
  });

  describe('onFilterClick(): ', () => {
    it('should call openFilters with State if filterType is state', () => {
      spyOn(component, 'openFilters');

      component.onFilterClick('state');

      expect(component.openFilters).toHaveBeenCalledOnceWith('State');
    });

    it('should call openFilters with Date if filterType is date', () => {
      spyOn(component, 'openFilters');

      component.onFilterClick('date');

      expect(component.openFilters).toHaveBeenCalledOnceWith('Date');
    });

    it('should call openFilters with Date if filterType is date', () => {
      spyOn(component, 'openFilters');

      component.onFilterClick('sort');

      expect(component.openFilters).toHaveBeenCalledOnceWith('Sort By');
    });
  });

  describe('onFilterClose', () => {
    beforeEach(() => {
      component.filters = {
        sortDir: 'desc',
        sortParam: 'rp_created_at',
        rp_state: 'APPROVED',
      };
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 1,
      });
      spyOn(component, 'addNewFiltersToParams').and.returnValue({
        pageNumber: 1,
        sortDir: 'desc',
      });
      spyOn(component, 'generateFilterPills').and.returnValue([{ label: 'Date', type: 'date', value: 'this Week' }]);
    });

    it('should remove sort filters and update data when filterType is "sort"', () => {
      component.onFilterClose('sort');

      expect(component.filters.sortDir).toBeUndefined();
      expect(component.filters.sortParam).toBeUndefined();
      expect(component.filters.rp_state).toBeDefined();
      expect(component.currentPageNumber).toEqual(1);
      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          sortDir: 'desc',
        });
      });
      expect(component.generateFilterPills).toHaveBeenCalledTimes(1);
      expect(component.filterPills).toEqual([{ label: 'Date', type: 'date', value: 'this Week' }]);
    });

    it('should remove other filters and update data when filterType is not "sort"', () => {
      component.onFilterClose('rp_state');

      expect(component.currentPageNumber).toEqual(1);
      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          sortDir: 'desc',
        });
      });
      expect(component.filters.sortDir).toBeDefined();
      expect(component.filters.sortParam).toBeDefined();
      expect(component.filters.rp_state).toBeUndefined();
      expect(component.generateFilterPills).toHaveBeenCalledTimes(1);
      expect(component.filterPills).toEqual([{ label: 'Date', type: 'date', value: 'this Week' }]);
    });
  });

  it('searchClick(): should set headerState and call focus method on input', fakeAsync(() => {
    component.simpleSearchInput = fixture.debugElement.query(By.css('.my-reports--simple-search-input'));
    inputElement = component.simpleSearchInput.nativeElement;
    const mockFocus = spyOn(inputElement, 'focus');

    component.searchClick();

    tick(300);

    expect(mockFocus).toHaveBeenCalledTimes(1);
  }));

  describe('convertRptDtSortToSelectedFilters(): ', () => {
    it('should add "dateOldToNew" to generatedFilters when sortParam is "rp_created_at" and sortDir is "asc"', () => {
      const filter = {
        sortParam: 'rp_created_at',
        sortDir: 'asc',
      };
      const generatedFilters: SelectedFilters<any>[] = [];

      component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters.length).toEqual(1);
      expect(generatedFilters[0].name).toEqual('Sort By');
      expect(generatedFilters[0].value).toEqual('dateOldToNew');
    });

    it('should add "dateNewToOld" to generatedFilters when sortParam is "rp_created_at" and sortDir is "desc"', () => {
      const filter = {
        sortParam: 'rp_created_at',
        sortDir: 'desc',
      };
      const generatedFilters: SelectedFilters<any>[] = [];

      component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters.length).toEqual(1);
      expect(generatedFilters[0].name).toEqual('Sort By');
      expect(generatedFilters[0].value).toEqual('dateNewToOld');
    });

    it('should not modify generatedFilters when sortParam and sortDir are not "rp_created_at" and "asc" or "desc"', () => {
      const filter = {
        sortParam: 'other_sort_param',
        sortDir: 'other_sort_dir',
      };
      const generatedFilters: SelectedFilters<any>[] = [
        {
          name: 'Sort By',
          value: 'dateOldToNew',
        },
      ];

      component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters.length).toEqual(1);
      expect(generatedFilters[0].name).toEqual('Sort By');
      expect(generatedFilters[0].value).toEqual('dateOldToNew');
    });
  });

  it('should call convertRptDtSortToSelectedFilters, convertAmountSortToSelectedFilters, and convertNameSortToSelectedFilters', () => {
    const filter = {
      sortParam: 'rp_created_at',
      sortDir: 'asc',
    };
    const generatedFilters: SelectedFilters<any>[] = [];

    spyOn(component, 'convertRptDtSortToSelectedFilters');
    spyOn(component, 'convertAmountSortToSelectedFilters');
    spyOn(component, 'convertNameSortToSelectedFilters');

    component.addSortToGeneatedFilters(filter, generatedFilters);

    expect(component.convertRptDtSortToSelectedFilters).toHaveBeenCalledOnceWith(filter, generatedFilters);
    expect(component.convertAmountSortToSelectedFilters).toHaveBeenCalledOnceWith(filter, generatedFilters);
    expect(component.convertNameSortToSelectedFilters).toHaveBeenCalledOnceWith(filter, generatedFilters);
  });

  describe('generateSelectedFilters(): ', () => {
    it('should generate selected filters based on the provided filter object', () => {
      const filter = {
        state: 'approved',
        date: 'last_week',
        customDateStart: new Date('2023-01-01'),
        customDateEnd: new Date('2023-01-07'),
        sortParam: 'rp_created_at',
        sortDir: 'asc',
      };

      const generatedFilters = component.generateSelectedFilters(filter);

      expect(generatedFilters).toEqual([
        {
          name: 'State',
          value: 'approved',
        },
        {
          name: 'Date',
          value: 'last_week',
          associatedData: {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-01-07'),
          },
        },
        {
          name: 'Sort By',
          value: 'dateOldToNew',
        },
      ]);
    });

    it('should not include sort filters if sortParam and sortDir are not provided', () => {
      const filter = {
        state: 'draft',
        date: 'this_month',
      };

      const generatedFilters = component.generateSelectedFilters(filter);

      expect(generatedFilters).toEqual([
        {
          name: 'State',
          value: 'draft',
        },
        {
          name: 'Date',
          value: 'this_month',
          associatedData: {
            startDate: undefined,
            endDate: undefined,
          },
        },
      ]);
    });
  });
});
