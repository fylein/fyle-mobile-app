import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, NavController, PopoverController } from '@ionic/angular';

import { MyReportsPage } from './my-reports.page';
import { TasksService } from 'src/app/core/services/tasks.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ExtendQueryParamsService } from 'src/app/core/services/extend-query-params.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { orgSettingsRes, orgSettingsParamsWithSimplifiedReport } from 'src/app/core/mock-data/org-settings.data';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { NetworkService } from 'src/app/core/services/network.service';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { DateService } from 'src/app/core/services/date.service';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty } from 'lodash';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { SelectedFilters } from 'src/app/shared/components/fy-filters/selected-filters.interface';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { Filters } from '../my-expenses/my-expenses-filters.model';
import {
  selectedFilters1,
  selectedFilters2,
  selectedFilters3,
  selectedFilters4,
  selectedFilters5,
} from 'src/app/core/mock-data/selected-filters.data';
import { FyFiltersComponent } from 'src/app/shared/components/fy-filters/fy-filters.component';
import {
  deletePopoverParamsRes,
  expectedGenerateFilterPillsData,
  filterPopoverParams,
  generatedFiltersStateDate,
  generatedFiltersStateDateSortParams,
  openFiltersOptions,
  popoverControllerParams,
} from 'src/app/core/mock-data/my-reports.data';
import { loadData1, loadData2, loadData3 } from 'src/app/core/mock-data/my-reports-load-data.data';
import {
  filter1,
  filter10,
  filter11,
  filter12,
  filter13,
  filter14,
  filter2,
  filter3,
  filter4,
  filter5,
  filter6,
  filter7,
  filter8,
  filter9,
} from 'src/app/core/mock-data/my-reports-filters.data';
import {
  expectedFilterPill1,
  expectedFilterPill10,
  expectedFilterPill11,
  expectedFilterPill12,
  expectedFilterPill13,
  expectedFilterPill14,
  expectedFilterPill2,
  expectedFilterPill3,
  expectedFilterPill4,
  expectedFilterPill5,
  expectedFilterPill6,
  expectedFilterPill7,
  expectedFilterPill8,
  expectedFilterPill9,
} from 'src/app/core/mock-data/my-reports-filterpills.data';
import { completeStats1, emptyStats } from 'src/app/core/mock-data/platform/v1/expenses-stats.data';
import { expectedReportsSinglePage } from 'src/app/core/mock-data/platform-report.data';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { ReportState as PlatformReportState } from 'src/app/core/models/platform/v1/report.model';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

describe('MyReportsPage', () => {
  let component: MyReportsPage;
  let fixture: ComponentFixture<MyReportsPage>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let extendQueryParamsService: jasmine.SpyObj<ExtendQueryParamsService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let router: jasmine.SpyObj<Router>;
  let navController: jasmine.SpyObj<NavController>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let dateService: jasmine.SpyObj<DateService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let inputElement: HTMLInputElement;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getReportsTaskCount']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['clearTransactionCache']);
    const extendQueryParamsServiceSpy = jasmine.createSpyObj('ExtendQueryParamsService', [
      'extendQueryParamsForTextSearch',
    ]);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseStats']);
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
      'myReportsFilterApplied',
    ]);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const spenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', [
      'getReportsCount',
      'getReportsByParams',
    ]);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });

    TestBed.configureTestingModule({
      declarations: [MyReportsPage, ReportState],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule, TranslocoModule],
      providers: [
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: ExtendQueryParamsService, useValue: extendQueryParamsServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
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
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: SpenderReportsService,
          useValue: spenderReportsServiceSpy,
        },
        { provide: TranslocoService, useValue: translocoServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ReportState,
      ],
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
    extendQueryParamsService = TestBed.inject(ExtendQueryParamsService) as jasmine.SpyObj<ExtendQueryParamsService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;

    // Mock translate method to return expected strings
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.reportState.draft': 'draft',
        'pipes.reportState.submitted': 'submitted',
        'pipes.reportState.reported': 'reported',
        'pipes.reportState.sentBack': 'sent_back',
        'pipes.reportState.autoFlagged': 'auto_flagged',
        'pipes.reportState.rejected': 'rejected',
        'pipes.reportState.approved': 'approved',
        'pipes.reportState.paymentPending': 'payment_pending',
        'pipes.reportState.processing': 'processing',
        'pipes.reportState.closed': 'closed',
        'pipes.reportState.cancelled': 'cancelled',
        'pipes.reportState.disabled': 'disabled',
        'myReportsPage.title': 'My expense reports',
        'myReportsPage.searchPlaceholder': 'Search',
        'myReportsPage.createExpenseReport': 'Create expense report',
        'myReportsPage.zeroState.noReports': 'You have no reports right now',
        'myReportsPage.zeroState.noReportsMatchingFilters': 'You have no reports',
        'myReportsPage.zeroState.matchingAppliedFilters': 'matching the applied filters',
        'myReportsPage.zeroState.noResultsFound': 'No results found',
        'myReportsPage.zeroState.tryDifferentKeyword': 'Try a different keyword',
        'myReportsPage.loading.loadingMoreData': 'Loading more data...',
        'myReportsPage.filters.state': 'State',
        'myReportsPage.filters.date': 'Date',
        'myReportsPage.filters.sortBy': 'Sort by',
        'myReportsPage.stateOptions.draft': 'Draft',
        'myReportsPage.stateOptions.reported': 'Reported',
        'myReportsPage.stateOptions.sentBack': 'Sent Back',
        'myReportsPage.stateOptions.approved': 'Approved',
        'myReportsPage.stateOptions.paymentPending': 'Payment Pending',
        'myReportsPage.stateOptions.paymentProcessing': 'Payment Processing',
        'myReportsPage.stateOptions.paid': 'Paid',
        'myReportsPage.stateOptions.submitted': 'Submitted',
        'myReportsPage.stateOptions.processing': 'Processing',
        'myReportsPage.stateOptions.closed': 'Closed',
        'myReportsPage.dateOptions.all': 'All',
        'myReportsPage.dateOptions.thisWeek': 'This Week',
        'myReportsPage.dateOptions.thisMonth': 'This Month',
        'myReportsPage.dateOptions.lastMonth': 'Last Month',
        'myReportsPage.dateOptions.custom': 'Custom',
        'myReportsPage.sortOptions.dateNewToOld': 'Date - New to Old',
        'myReportsPage.sortOptions.dateOldToNew': 'Date - Old to New',
        'myReportsPage.sortOptions.amountHighToLow': 'Amount - High to Low',
        'myReportsPage.sortOptions.amountLowToHigh': 'Amount - Low to High',
        'myReportsPage.sortOptions.nameAToZ': 'Name - A to Z',
        'myReportsPage.sortOptions.nameZToA': 'Name - Z to A',
        'myReportsPage.filterPills.thisWeek': 'this Week',
        'myReportsPage.filterPills.thisMonth': 'this Month',
        'myReportsPage.filterPills.all': 'All',
        'myReportsPage.filterPills.lastMonth': 'Last Month',
        'myReportsPage.filterPills.dateOldToNew': 'date - old to new',
        'myReportsPage.filterPills.dateNewToOld': 'date - new to old',
        'myReportsPage.filterPills.amountHighToLow': 'amount - high to low',
        'myReportsPage.filterPills.amountLowToHigh': 'amount - low to high',
        'myReportsPage.filterPills.nameAToZ': 'Name - a to z',
        'myReportsPage.filterPills.nameZToA': 'Name - z to a',
        'myReportsPage.filterPills.dateTo': 'to',
        'myReportsPage.tracking.page': 'Reports',
        'myReportsPage.tracking.from': 'My Reports',
      };
      return translations[key] || key;
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter(): ', () => {
    it('should initialize component properties and load data', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        q: 'example:*',
      });
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: expectedReportsSinglePage };

      spenderReportsService.getReportsCount.and.returnValue(of(10));

      spenderReportsService.getReportsByParams.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      expensesService.getExpenseStats.and.returnValue(of(completeStats1));

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

      expect(spenderReportsService.getReportsCount).toHaveBeenCalledTimes(4);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledWith({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        q: 'example:*',
      });

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          state: 'in.(COMPLETE)',
          or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
          report_id: 'is.null',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledTimes(2);

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        order: 'created_at.desc,id.desc',
        q: 'example:*',
      });

      expect(component.acc).toEqual(expectedReportsSinglePage);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(expectedReportsSinglePage);
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

    it('should initialize component properties and load data when search string is empty', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [PlatformReportState.PAID],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: expectedReportsSinglePage };

      spenderReportsService.getReportsCount.and.returnValue(of(10));

      spenderReportsService.getReportsByParams.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      expensesService.getExpenseStats.and.returnValue(of(completeStats1));

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

      inputElement.value = '';

      inputElement.dispatchEvent(new Event('keyup'));

      tick(1000);

      expect(spenderReportsService.getReportsCount).toHaveBeenCalledTimes(4);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledWith({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          state: 'in.(COMPLETE)',
          or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
          report_id: 'is.null',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledTimes(2);

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        order: 'created_at.desc,id.desc',
      });

      expect(component.acc).toEqual(expectedReportsSinglePage);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(expectedReportsSinglePage);
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
        queryParams: { filters: '{"state":["PAID"]}' },
        replaceUrl: true,
      });

      component.nonReimbursableOrg$.subscribe((nonReimbursableOrg) => {
        expect(nonReimbursableOrg).toBeFalse();
      });

      expect(component.clearFilters).toHaveBeenCalledTimes(1);

      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          searchString: '',
        });
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));

    it('should initialize component properties and set simplifyReportsSetting$ to undefined if orgSetting$ is undefined', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: expectedReportsSinglePage };

      spenderReportsService.getReportsCount.and.returnValue(of(10));

      spenderReportsService.getReportsByParams.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(undefined));
      expensesService.getExpenseStats.and.returnValue(of(completeStats1));

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

      expect(spenderReportsService.getReportsCount).toHaveBeenCalledTimes(4);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledWith({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          state: 'in.(COMPLETE)',
          or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
          report_id: 'is.null',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledTimes(2);

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        order: 'created_at.desc,id.desc',
      });

      expect(component.acc).toEqual(expectedReportsSinglePage);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(expectedReportsSinglePage);
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

    it('should initialize component properties and set simplifyReportsSetting$ to false if orgSetting$.payment_mode_setting.payment_modes_order is not defined', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: expectedReportsSinglePage };
      spenderReportsService.getReportsCount.and.returnValue(of(10));

      spenderReportsService.getReportsByParams.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of({ payment_mode_settings: { allowed: true, enabled: true } }));
      expensesService.getExpenseStats.and.returnValue(of(completeStats1));

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

      expect(spenderReportsService.getReportsCount).toHaveBeenCalledTimes(4);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledWith({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          state: 'in.(COMPLETE)',
          or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
          report_id: 'is.null',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledTimes(2);

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        order: 'created_at.desc,id.desc',
      });

      expect(component.acc).toEqual(expectedReportsSinglePage);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(expectedReportsSinglePage);
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
      extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      spenderReportsService.getReportsCount.and.returnValue(of(0));
      orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithSimplifiedReport));
      expensesService.getExpenseStats.and.returnValue(of(emptyStats));

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

      expect(spenderReportsService.getReportsCount).toHaveBeenCalledTimes(6);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 2 times, 1 time in this test case
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledWith({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          state: 'in.(COMPLETE)',
          or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
          report_id: 'is.null',
        });

        expect(expenseAmountStates).toEqual({
          sum: 0,
          count: 0,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(0);
      });

      expect(spenderReportsService.getReportsByParams).not.toHaveBeenCalled();

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
        expect(data).toEqual(loadData1);
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));

    it('should initialize component properties and load data if filters is defined in activatedRoute.snapshot', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: expectedReportsSinglePage };

      spenderReportsService.getReportsCount.and.returnValue(of(10));

      spenderReportsService.getReportsByParams.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      expensesService.getExpenseStats.and.returnValue(of(completeStats1));

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

      expect(spenderReportsService.getReportsCount).toHaveBeenCalledTimes(6);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledWith({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          state: 'in.(COMPLETE)',
          or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
          report_id: 'is.null',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledTimes(3);

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        offset: 0,
        limit: 10,
        order: 'created_at.desc,id.desc',
      });

      expect(component.acc).toEqual(expectedReportsSinglePage);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(expectedReportsSinglePage);
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
        expect(data).toEqual(loadData2);
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));

    it('should initialize component properties and load data if state is defined in activatedRoute.snapshot', fakeAsync(() => {
      tasksService.getReportsTaskCount.and.returnValue(of(5));
      extendQueryParamsService.extendQueryParamsForTextSearch.and.returnValue({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        q: 'example:*',
      });
      const homeCurrency = 'USD';
      currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };

      const paginatedPipeValue = { count: 2, offset: 0, data: expectedReportsSinglePage };
      spenderReportsService.getReportsCount.and.returnValue(of(10));

      spenderReportsService.getReportsByParams.and.returnValue(of(paginatedPipeValue));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      expensesService.getExpenseStats.and.returnValue(of(completeStats1));

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

      expect(spenderReportsService.getReportsCount).toHaveBeenCalledTimes(6);
      // It is called 6 times because loadData$ is behaviorSubject and next() is called 1 times
      expect(spenderReportsService.getReportsCount).toHaveBeenCalledWith({
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        q: 'example:*',
      });

      component.expensesAmountStats$.subscribe((expenseAmountStates) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          state: 'in.(COMPLETE)',
          or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
          report_id: 'is.null',
        });

        expect(expenseAmountStates).toEqual({
          sum: 3494,
          count: 4,
        });
      });

      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledTimes(3);

      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        order: 'created_at.desc,id.desc',
        q: 'example:*',
      });
      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        order: 'created_at.desc,id.desc',
        q: 'example:*',
      });
      expect(spenderReportsService.getReportsByParams).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        state: 'in.(DRAFT,APPROVED,APPROVER_PENDING,APPROVER_INQUIRY,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
        order: 'created_at.desc,id.desc',
        q: 'example:*',
      });

      expect(component.acc).toEqual(expectedReportsSinglePage);

      component.myReports$.subscribe((myReports) => {
        expect(myReports).toEqual(expectedReportsSinglePage);
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

      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);

      expect(component.clearFilters).not.toHaveBeenCalled();

      component.loadData$.subscribe((data) => {
        expect(data).toEqual(loadData3);
      });

      tick(500);

      expect(component.isLoading).toBeFalse();

      discardPeriodicTasks();
    }));
  });

  it('HeaderState(): should return the HeaderState', () => {
    expect(component.HeaderState).toEqual(HeaderState);
  });

  it('ionViewWillLeave(): should set the onPageExit to null', () => {
    component.ionViewWillLeave();
    component.onPageExit.subscribe((pageExit) => {
      expect(pageExit).toBeNull();
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
      const newQueryParams: { and?: string } = {};
      const startDate = new Date('2022-01-01');
      const endDate = new Date('2022-01-31');

      component.filters = filter4;

      component.generateCustomDateParams(newQueryParams);

      expect(newQueryParams.and).toBe(
        `(created_at.gte.${startDate.toISOString()},created_at.lt.${endDate.toISOString()})`
      );
    });

    it('should generate custom date params with start date only', () => {
      const newQueryParams: { and?: string } = {};
      const startDate = new Date('2022-01-01');

      component.filters = filter5;

      component.generateCustomDateParams(newQueryParams);

      expect(newQueryParams.and).toBe(`(created_at.gte.${startDate.toISOString()})`);
    });

    it('should generate custom date params with end date only', () => {
      const newQueryParams: { and?: string } = {};
      const endDate = new Date('2022-01-31');

      component.filters = filter6;

      component.generateCustomDateParams(newQueryParams);

      expect(newQueryParams.and).toBe(`(created_at.lt.${endDate.toISOString()})`);
    });

    it('should not generate custom date params when date filter is not custom', () => {
      const newQueryParams: { and?: string } = {};
      component.filters = filter7;

      component.generateCustomDateParams(newQueryParams);

      expect(newQueryParams.and).toBeUndefined();
    });
  });

  describe('generateDateParams(): ', () => {
    it('should generate date params for this month', () => {
      spyOn(component, 'generateCustomDateParams');
      const newQueryParams: { and?: string } = {};
      const thisMonthRange = {
        from: new Date('2022-01-01'),
        to: new Date('2022-01-31'),
      };
      const expectedAndQuery = `(created_at.gte.${thisMonthRange.from.toISOString()},created_at.lt.${thisMonthRange.to.toISOString()})`;
      dateService.getThisMonthRange.and.returnValue(thisMonthRange);
      const mockFilter = cloneDeep(filter8);
      component.filters = mockFilter;

      component.generateDateParams(newQueryParams);

      expect(newQueryParams.and).toEqual(expectedAndQuery);
      expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith({ and: expectedAndQuery });
    });

    it('should generate date params for this week', () => {
      spyOn(component, 'generateCustomDateParams');
      const newQueryParams: { and?: string } = {};
      const thisWeekRange = {
        from: dayjs('2022-01-01'),
        to: dayjs('2022-01-07'),
      };
      const expectedAndQuery = `(created_at.gte.${thisWeekRange.from.toISOString()},created_at.lt.${thisWeekRange.to.toISOString()})`;
      dateService.getThisWeekRange.and.returnValue(thisWeekRange);
      const mockFilter = cloneDeep(filter9);
      component.filters = mockFilter;

      component.generateDateParams(newQueryParams);

      expect(newQueryParams.and).toEqual(expectedAndQuery);
      expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith({ and: expectedAndQuery });
    });

    it('should generate date params for last month', () => {
      spyOn(component, 'generateCustomDateParams');
      const newQueryParams: { and?: string } = {};
      const lastMonthRange = {
        from: new Date('2021-12-01'),
        to: new Date('2021-12-31'),
      };
      const expectedAndQuery = `(created_at.gte.${lastMonthRange.from.toISOString()},created_at.lt.${lastMonthRange.to.toISOString()})`;
      dateService.getLastMonthRange.and.returnValue(lastMonthRange);
      const mockFilter = cloneDeep(filter10);
      component.filters = mockFilter;

      component.generateDateParams(newQueryParams);

      expect(newQueryParams.and).toEqual(expectedAndQuery);
      expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith({ and: expectedAndQuery });
    });

    it('should not generate date params when date filter is not set', () => {
      spyOn(component, 'generateCustomDateParams');
      const newQueryParams: { and?: string } = {};
      const mockFilter = cloneDeep(filter11);
      component.filters = mockFilter;

      component.generateDateParams(newQueryParams);

      expect(newQueryParams.and).toBeUndefined();
      expect(component.generateCustomDateParams).not.toHaveBeenCalled();
    });

    it('should convert customDateStart and customDateEnd string to date', () => {
      spyOn(component, 'generateCustomDateParams');
      const mockFilter = cloneDeep(filter12);
      component.filters = mockFilter;
      const newQueryParams: { and?: string } = {};

      component.generateDateParams(newQueryParams);
      expect(newQueryParams.and).toBeUndefined();
      expect(component.generateCustomDateParams).toHaveBeenCalledOnceWith(newQueryParams);
    });
  });

  describe('generateStateFilters(): ', () => {
    it('should update the newQueryParams if stateOrFilter length is greater than 0', () => {
      const newQueryParams = {};
      component.filters = filter13;
      component.generateStateFilters(newQueryParams);
      expect(newQueryParams).toEqual({
        state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY,APPROVED,PAYMENT_PENDING,PAYMENT_PROCESSING,PAID)',
      });
    });

    it('should not update the newQueryParams if stateOrFilter length is 0', () => {
      const newQueryParams = {};
      component.filters = {
        state: [],
      };
      component.generateStateFilters(newQueryParams);
      expect(newQueryParams).toEqual({});
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
        sortParam: 'amount',
        sortDir: 'asc',
      };

      component.setSortParams(currentParams);

      expect(currentParams.sortParam).toEqual('amount');
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

      expect(currentParams.sortParam).toEqual('created_at');
      expect(currentParams.sortDir).toEqual('desc');
    });
  });

  it('addNewFiltersToParams(): should update currentParams with new filters and return the updated currentParams', () => {
    component.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });

    spyOn(component, 'generateDateParams').and.callFake((newQueryParams) => {
      newQueryParams.and = '(created_at.gte.january,created_at.lt.march)';
    });

    spyOn(component, 'generateStateFilters').and.callFake((newQueryParams) => {
      newQueryParams.state = 'in.(DRAFT,APPROVER_PENDING)';
    });

    spyOn(component, 'setSortParams').and.callFake((currentParams) => {
      currentParams.sortParam = 'created_at';
      currentParams.sortDir = 'desc';
    });

    const result = component.addNewFiltersToParams();

    expect(result.pageNumber).toEqual(1);
    expect(result.queryParams.and).toEqual('(created_at.gte.january,created_at.lt.march)');
    expect(result.queryParams.state).toEqual('in.(DRAFT,APPROVER_PENDING)');
    expect(result.sortParam).toEqual('created_at');
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
    const report = expectedReportsSinglePage[0];

    component.onReportClick(report);

    expect(router.navigate).toHaveBeenCalledWith([
      '/',
      'enterprise',
      'my_view_report',
      { id: report.id, navigateBack: true },
    ]);
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
    component.onViewCommentsClick();
    expect(isEmpty(component.onViewCommentsClick)).toBeTrue();
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
      expect(component.isSearchBarFocused).toBeTrue();
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
      expect(component.isSearchBarFocused).toBeFalse();
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

    expect(component.isSearchBarFocused).toBeTrue();
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

      expect(component.openFilters).toHaveBeenCalledOnceWith('Sort by');
    });
  });

  describe('onFilterClose', () => {
    beforeEach(() => {
      component.filters = cloneDeep(filter14);
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
      expect(component.filters.state).toBeDefined();
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
      component.onFilterClose('state');

      expect(component.currentPageNumber).toEqual(1);
      component.loadData$.subscribe((data) => {
        expect(data).toEqual({
          pageNumber: 1,
          sortDir: 'desc',
        });
      });
      expect(component.filters.sortDir).toBeDefined();
      expect(component.filters.sortParam).toBeDefined();
      expect(component.filters.state).toBeUndefined();
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
    it('should add "dateOldToNew" to generatedFilters when sortParam is "created_at" and sortDir is "asc"', () => {
      const filter = {
        sortParam: 'created_at',
        sortDir: 'asc',
      };
      const generatedFilters: SelectedFilters<string>[] = [];

      component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters.length).toEqual(1);
      expect(generatedFilters[0].name).toEqual('Sort by');
      expect(generatedFilters[0].value).toEqual('dateOldToNew');
    });

    it('should add "dateNewToOld" to generatedFilters when sortParam is "created_at" and sortDir is "desc"', () => {
      const filter = {
        sortParam: 'created_at',
        sortDir: 'desc',
      };
      const generatedFilters: SelectedFilters<string>[] = [];

      component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters.length).toEqual(1);
      expect(generatedFilters[0].name).toEqual('Sort by');
      expect(generatedFilters[0].value).toEqual('dateNewToOld');
    });

    it('should not modify generatedFilters when sortParam and sortDir are not "created_at" and "asc" or "desc"', () => {
      const filter = {
        sortParam: 'other_sort_param',
        sortDir: 'other_sort_dir',
      };
      const generatedFilters: SelectedFilters<string>[] = [
        {
          name: 'Sort by',
          value: 'dateOldToNew',
        },
      ];

      component.convertRptDtSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters.length).toEqual(1);
      expect(generatedFilters[0].name).toEqual('Sort by');
      expect(generatedFilters[0].value).toEqual('dateOldToNew');
    });
  });

  it('addSortToGeneatedFilters(): should call convertRptDtSortToSelectedFilters, convertAmountSortToSelectedFilters, and convertNameSortToSelectedFilters', () => {
    const filter = {
      sortParam: 'created_at',
      sortDir: 'asc',
    };
    const generatedFilters: SelectedFilters<string>[] = [];

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
      const filter = filter1;

      const generatedFilters = component.generateSelectedFilters(filter);

      expect(generatedFilters).toEqual(generatedFiltersStateDateSortParams);
    });

    it('should not include sort filters if sortParam and sortDir are not provided', () => {
      const filter = {
        state: 'draft',
        date: 'this_month',
      };

      const generatedFilters = component.generateSelectedFilters(filter);

      expect(generatedFilters).toEqual(generatedFiltersStateDate);
    });
  });

  describe('convertNameSortToSelectedFilters(): ', () => {
    it('should add the corresponding name sort filter when sortParam is "purpose" and sortDir is "asc"', () => {
      const filter = {
        sortParam: 'purpose',
        sortDir: 'asc',
      };
      const generatedFilters = [];

      component.convertNameSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'nameAToZ',
        },
      ]);
    });

    it('should add the corresponding name sort filter when sortParam is "purpose" and sortDir is "desc"', () => {
      const filter = {
        sortParam: 'purpose',
        sortDir: 'desc',
      };
      const generatedFilters = [];

      component.convertNameSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'nameZToA',
        },
      ]);
    });

    it('should not add name sort filters if sortParam is not "purpose"', () => {
      const filter = {
        sortParam: 'created_at',
        sortDir: 'asc',
      };
      const generatedFilters = [];

      component.convertNameSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([]);
    });

    it('should not add name sort filters if sortDir is not "asc" or "desc"', () => {
      const filter = {
        sortParam: 'purpose',
        sortDir: 'invalid',
      };
      const generatedFilters = [];

      component.convertNameSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([]);
    });
  });

  describe('convertSelectedSortFiltersToFilters(): ', () => {
    it('should convert selected sort filter to corresponding sortParam and sortDir', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'dateNewToOld',
      };
      const generatedFilters = {};

      component.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'created_at',
        sortDir: 'desc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (dateOldToNew)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'dateOldToNew',
      };
      const generatedFilters = {};

      component.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'created_at',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (amountHighToLow)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'amountHighToLow',
      };
      const generatedFilters = {};

      component.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'amount',
        sortDir: 'desc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (amountLowToHigh)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'amountLowToHigh',
      };
      const generatedFilters = {};

      component.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'amount',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (nameAToZ)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'nameAToZ',
      };
      const generatedFilters = {};

      component.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'purpose',
        sortDir: 'asc',
      });
    });

    it('should convert selected sort filter to corresponding sortParam and sortDir (nameZToA)', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'nameZToA',
      };
      const generatedFilters = {};

      component.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'purpose',
        sortDir: 'desc',
      });
    });

    it('should not modify generatedFilters if sortBy is not provided', () => {
      const sortBy = null;
      const generatedFilters = {
        sortParam: 'purpose',
        sortDir: 'asc',
      };

      component.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'purpose',
        sortDir: 'asc',
      });
    });

    it('should not modify generatedFilters if sortBy value is not recognized', () => {
      const sortBy = {
        name: 'Sort by',
        value: 'invalid',
      };
      const generatedFilters = {
        sortParam: 'amount',
        sortDir: 'desc',
      };

      component.convertSelectedSortFitlersToFilters(sortBy, generatedFilters);

      expect(generatedFilters).toEqual({
        sortParam: 'amount',
        sortDir: 'desc',
      });
    });
  });

  describe('convertFilters(): ', () => {
    beforeEach(() => {
      spyOn(component, 'convertSelectedSortFitlersToFilters');
    });

    it('should convert selected filters to corresponding Filters object', () => {
      const selectedFilters = selectedFilters3;

      const generatedFilters = component.convertFilters(selectedFilters);

      expect(generatedFilters).toEqual({
        state: 'Approved',
        date: 'Last 7 Days',
        customDateStart: new Date('2023-04-01'),
        customDateEnd: new Date('2023-04-04'),
      });
      expect(component.convertSelectedSortFitlersToFilters).toHaveBeenCalledTimes(1);
    });

    it('should convert selected filters to corresponding Filters object incase of associatedData is undefined', () => {
      const selectedFilters = selectedFilters4;

      const generatedFilters = component.convertFilters(selectedFilters);

      expect(generatedFilters).toEqual({
        state: 'Approved',
        date: 'Last 7 Days',
        customDateStart: undefined,
        customDateEnd: undefined,
      });
      expect(component.convertSelectedSortFitlersToFilters).toHaveBeenCalledTimes(1);
    });

    it('should return an empty Filters object if no selected filters are provided', () => {
      const selectedFilters = [];

      const generatedFilters = component.convertFilters(selectedFilters);

      expect(generatedFilters).toEqual({});
      expect(component.convertSelectedSortFitlersToFilters).toHaveBeenCalledTimes(1);
    });

    it('should return a Filters object with only state filter if state filter is selected', () => {
      const selectedFilters = [{ name: 'State', value: 'Draft' }];

      const generatedFilters = component.convertFilters(selectedFilters);

      expect(generatedFilters).toEqual({
        state: 'Draft',
      });
      expect(component.convertSelectedSortFitlersToFilters).toHaveBeenCalledTimes(1);
    });

    it('should return a Filters object with only date filter if date filter is selected', () => {
      const selectedFilters = selectedFilters5;

      const generatedFilters = component.convertFilters(selectedFilters);

      expect(generatedFilters).toEqual({
        date: 'Last Month',
        customDateStart: new Date('2023-01-04'),
        customDateEnd: new Date('2023-01-10'),
      });
      expect(component.convertSelectedSortFitlersToFilters).toHaveBeenCalledTimes(1);
    });
  });

  it('generateStateFilterPills(): should generate state filter pills', () => {
    const filterPills: FilterPill[] = [];
    const filter: Filters = { state: ['APPROVED', 'SUBMITTED'] };
    const simplifyReportsSettings = { enabled: true };

    component.simplifyReportsSettings$ = of(simplifyReportsSettings);

    component.generateStateFilterPills(filterPills, filter);

    component.simplifyReportsSettings$.subscribe(() => {
      expect(filterPills).toEqual(expectedFilterPill1);
    });
  });

  describe('generateCustomDatePill(): ', () => {
    it('should generate custom date filter pill with start and end date', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        customDateStart: new Date('2023-01-21'),
        customDateEnd: new Date('2023-01-31'),
      };

      component.generateCustomDatePill(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill2);
    });

    it('should generate custom date filter pill with only start date', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        customDateStart: new Date('2023-01-21'),
        customDateEnd: null,
      };

      component.generateCustomDatePill(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill3);
    });

    it('should generate custom date filter pill with only end date', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        customDateStart: null,
        customDateEnd: new Date('2023-01-31'),
      };

      component.generateCustomDatePill(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill4);
    });

    it('should not generate custom date filter pill if start and end date are null', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        customDateStart: null,
        customDateEnd: null,
      };

      component.generateCustomDatePill(filter, filterPills);

      expect(filterPills).toEqual([]);
    });
  });

  describe('generateDateFilterPills(): ', () => {
    it('should generate filter pill for "this Week"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        date: DateFilters.thisWeek,
      };

      component.generateDateFilterPills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill5);
    });

    it('should generate filter pill for "this Month"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        date: DateFilters.thisMonth,
      };

      component.generateDateFilterPills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill6);
    });

    it('should generate filter pill for "All"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        date: DateFilters.all,
      };

      component.generateDateFilterPills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill7);
    });

    it('should generate filter pill for "Last Month"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        date: DateFilters.lastMonth,
      };

      component.generateDateFilterPills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill8);
    });

    it('should generate custom date filter pill', () => {
      const filterPills: FilterPill[] = [];
      const filter = filter2;
      spyOn(component, 'generateCustomDatePill');

      component.generateDateFilterPills(filter, filterPills);

      expect(component.generateCustomDatePill).toHaveBeenCalledOnceWith(filter, filterPills);

      expect(filterPills).toEqual([]);
    });

    it('should not generate filter pill if date filter is not set', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        date: null,
      };

      component.generateDateFilterPills(filter, filterPills);

      expect(filterPills).toEqual([]);
    });
  });

  describe('generateSortRptDatePills', () => {
    it('should generate filter pill for "date - old to new"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'created_at',
        sortDir: 'asc',
      };

      component.generateSortRptDatePills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill9);
    });

    it('should generate filter pill for "date - new to old"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'created_at',
        sortDir: 'desc',
      };

      component.generateSortRptDatePills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill10);
    });

    it('should not generate filter pill if sortParam is not "created_at"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'approvalDate',
        sortDir: 'asc',
      };

      component.generateSortRptDatePills(filter, filterPills);

      expect(filterPills).toEqual([]);
    });

    it('should not generate filter pill if sortDir is not "asc" or "desc"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'created_at',
        sortDir: 'other_sort_dir',
      };

      component.generateSortRptDatePills(filter, filterPills);

      expect(filterPills).toEqual([]);
    });
  });

  describe('generateSortAmountPills', () => {
    it('should generate filter pill for "amount - high to low"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'amount',
        sortDir: 'desc',
      };

      component.generateSortAmountPills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill11);
    });

    it('should generate filter pill for "amount - low to high"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'amount',
        sortDir: 'asc',
      };

      component.generateSortAmountPills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill12);
    });

    it('should not generate filter pill if sortParam is not "amount"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'created_at',
        sortDir: 'desc',
      };

      component.generateSortAmountPills(filter, filterPills);

      expect(filterPills).toEqual([]);
    });

    it('should not generate filter pill if sortDir is not "asc" or "desc"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'amount',
        sortDir: 'other_sort_dir',
      };

      component.generateSortAmountPills(filter, filterPills);

      expect(filterPills).toEqual([]);
    });
  });

  describe('generateSortNamePills', () => {
    it('should generate filter pill for "Name - a to z"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'purpose',
        sortDir: 'asc',
      };

      component.generateSortNamePills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill13);
    });

    it('should generate filter pill for "Name - z to a"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'purpose',
        sortDir: 'desc',
      };

      component.generateSortNamePills(filter, filterPills);

      expect(filterPills).toEqual(expectedFilterPill14);
    });

    it('should not generate filter pill if sortParam is not "purpose"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'some_other_param',
        sortDir: 'asc',
      };

      component.generateSortNamePills(filter, filterPills);

      expect(filterPills).toEqual([]);
    });

    it('should not generate filter pill if sortDir is not "asc" or "desc"', () => {
      const filterPills: FilterPill[] = [];
      const filter = {
        sortParam: 'purpose',
        sortDir: 'invalid',
      };

      component.generateSortNamePills(filter, filterPills);

      expect(filterPills).toEqual([]);
    });
  });

  it('generateSortFilterPills(): should call generateSortRptDatePills, generateSortAmountPills, and generateSortNamePills', () => {
    spyOn(component, 'generateSortRptDatePills');
    spyOn(component, 'generateSortAmountPills');
    spyOn(component, 'generateSortNamePills');
    const filter: Filters = {
      sortParam: 'approvalDate',
      sortDir: 'asc',
    };
    const filterPills: FilterPill[] = [];

    component.generateSortFilterPills(filter, filterPills);

    expect(component.generateSortRptDatePills).toHaveBeenCalledTimes(1);
    expect(component.generateSortAmountPills).toHaveBeenCalledTimes(1);
    expect(component.generateSortNamePills).toHaveBeenCalledTimes(1);
  });

  it('generateFilterPills(): should generate filter pills for all filters', () => {
    let filterPills: FilterPill[] = [];
    const filter = filter3;
    spyOn(component, 'generateStateFilterPills').and.callFake((filterPills, filter) => {
      filterPills.push({
        label: 'State',
        type: 'state',
        value: 'active, completed',
      });
    });
    spyOn(component, 'generateDateFilterPills').and.callFake((filter, filterPills) => {
      filterPills.push({
        label: 'Date',
        type: 'date',
        value: 'this Week',
      });
    });

    spyOn(component, 'generateSortFilterPills').and.callFake((filter, filterPills) => {
      filterPills.push({
        label: 'Sort by',
        type: 'sort',
        value: 'date - old to new',
      });
    });

    filterPills = component.generateFilterPills(filter);

    expect(component.generateStateFilterPills).toHaveBeenCalledOnceWith(filterPills, filter);
    expect(component.generateDateFilterPills).toHaveBeenCalledOnceWith(filter, filterPills);
    expect(component.generateSortFilterPills).toHaveBeenCalledOnceWith(filter, filterPills);
    expect(filterPills).toEqual(expectedGenerateFilterPillsData);
  });

  describe('convertAmountSortToSelectedFilters(): ', () => {
    it('should convert amount sort to selected filters for descending sort', () => {
      const filter = {
        sortParam: 'amount',
        sortDir: 'desc',
      };
      const generatedFilters = [];

      component.convertAmountSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'amountHighToLow',
        },
      ]);
    });

    it('should convert amount sort to selected filters for ascending sort', () => {
      const filter = {
        sortParam: 'amount',
        sortDir: 'asc',
      };
      const generatedFilters = [];

      component.convertAmountSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([
        {
          name: 'Sort by',
          value: 'amountLowToHigh',
        },
      ]);
    });

    it('should not convert amount sort to selected filters if sortParam is not "amount"', () => {
      const filter = {
        sortParam: 'other_param',
        sortDir: 'asc',
      };
      const generatedFilters = [];

      component.convertAmountSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([]);
    });

    it('should not convert amount sort to selected filters if sortDir is not "desc" or "asc"', () => {
      const filter = {
        sortParam: 'amount',
        sortDir: 'invalid_dir',
      };
      const generatedFilters = [];

      component.convertAmountSortToSelectedFilters(filter, generatedFilters);

      expect(generatedFilters).toEqual([]);
    });
  });

  it('openFilters(): should create a modal and update the filter if activeFilterInitialName is provided', fakeAsync(() => {
    component.filters = { sortDir: 'desc' };
    component.loadData$ = new BehaviorSubject({});
    const filterPopoverSpy = jasmine.createSpyObj('filterPopover', ['present', 'onWillDismiss']);
    spyOn(component, 'convertFilters').and.returnValue({ sortParam: 'approvalDate', sortDir: 'asc' });
    spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 3 });
    spyOn(component, 'generateFilterPills').and.returnValue([
      {
        label: 'Date',
        type: 'date',
        value: 'this Week',
      },
    ]);
    spyOn(component, 'generateSelectedFilters').and.returnValue([{ name: 'state', value: 'PENDING' }]);
    filterPopoverSpy.onWillDismiss.and.resolveTo({ data: selectedFilters1 });
    modalController.create.and.resolveTo(filterPopoverSpy);

    component.openFilters('State');
    tick(200);

    expect(modalController.create).toHaveBeenCalledOnceWith(filterPopoverParams);

    expect(component.generateSelectedFilters).toHaveBeenCalledOnceWith({ sortDir: 'desc' });
    expect(component.convertFilters).toHaveBeenCalledOnceWith(selectedFilters1);
    expect(component.filters).toEqual({ sortParam: 'approvalDate', sortDir: 'asc' });
    expect(component.currentPageNumber).toBe(1);
    component.loadData$.subscribe((data) => {
      expect(data).toEqual({ pageNumber: 3 });
    });
    expect(component.filterPills).toEqual(expectedFilterPill5);
    expect(component.generateFilterPills).toHaveBeenCalledOnceWith({ sortParam: 'approvalDate', sortDir: 'asc' });
    expect(trackingService.myReportsFilterApplied).toHaveBeenCalledOnceWith({
      sortParam: 'approvalDate',
      sortDir: 'asc',
    });
  }));
});
