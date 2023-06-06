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
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { DateService } from 'src/app/core/services/date.service';
import * as dayjs from 'dayjs';

describe('MyReportsPage', () => {
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
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getReportsTaskCount']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getMyReportsCount',
      'getMyReports',
      'clearTransactionCache',
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

  it('should increment currentPageNumber and emit updated params', fakeAsync(() => {
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
      // Set up test data
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
});
