import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';

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
import { InfiniteScrollCustomEvent, IonInfiniteScrollCustomEvent } from '@ionic/core';

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
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getReportsTaskCount']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getMyReportsCount', 'getMyReports']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['extendQueryParamsForTextSearch']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getTransactionStats']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['isOnline', 'connectivityWatcher']);
    const activatedRouteSpy = {
      snapshot: {
        params: {
          navigateBack: false,
        },
      },
    };

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
        ReportState,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MyReportsPage);
    component = fixture.componentInstance;

    const activatedRouteSnapshot = TestBed.inject(ActivatedRoute).snapshot;
    activatedRouteSnapshot.params = {};
    activatedRouteSnapshot.queryParams = {};

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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

  xit('loadData(event): should increment pageNumber and update loadData$', () => {
    const mockEvent = { target: { complete: jasmine.createSpy('complete') } };
    component.currentPageNumber = 2;

    component.loadData(mockEvent);

    expect(component.currentPageNumber).toBe(3);
    expect(component.loadData$.getValue().pageNumber).toBe(3);
    tick(1000);
    expect(mockEvent.target.complete).toHaveBeenCalled();
  });
});
