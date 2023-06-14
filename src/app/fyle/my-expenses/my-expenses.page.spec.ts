import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ActionSheetController, IonicModule, NavController } from '@ionic/angular';

import { MyExpensesPage } from './my-expenses.page';
import { TasksService } from 'src/app/core/services/tasks.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription, of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { orgSettingsParamsWithSimplifiedReport, orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { apiExtendedReportRes, expectedReportSingleResponse } from 'src/app/core/mock-data/report.data';
import { cardAggregateStatParam, cardAggregateStatParam2 } from 'src/app/core/mock-data/card-aggregate-stat.data';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { NetworkService } from 'src/app/core/services/network.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MyExpensesService } from './my-expenses.service';
import { TokenService } from 'src/app/core/services/token.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { expectedAssignedCCCStats } from 'src/app/core/mock-data/ccc-expense.details.data';
import { expectedUniqueCardStats } from 'src/app/core/mock-data/unique-cards-stats.data';
import { apiExpenseRes, expenseData1 } from 'src/app/core/mock-data/expense.data';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { environment } from 'src/environments/environment';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { creditTxnFilterPill } from 'src/app/core/mock-data/filter-pills.data';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpenseFilters } from './my-expenses-filters.model';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';

describe('MyReportsPage', () => {
  let component: MyExpensesPage;
  let fixture: ComponentFixture<MyExpensesPage>;
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
  let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let matBottomsheet: jasmine.SpyObj<MatBottomSheet>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let myExpenseService: jasmine.SpyObj<MyExpensesService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let actionSheetController: jasmine.SpyObj<ActionSheetController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let corporateCreditCardService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let platformHandlerService: jasmine.SpyObj<PlatformHandlerService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getReportsTaskCount', 'getExpensesTaskCount']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getMyReportsCount',
      'getMyReports',
      'clearTransactionCache',
      'getAllExtendedReports',
    ]);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['extendQueryParamsForTextSearch']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getTransactionStats',
      'getMyExpensesCount',
      'getMyExpenses',
      'getPaginatedETxncCount',
      'clearCache',
    ]);
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
    const transactionOutboxServiceSpy = jasmine.createSpyObj('TransactionOutboxService', [
      'getPendingTransactions',
      'sync',
    ]);
    const matBottomsheetSpy = jasmine.createSpyObj('MatBottomSheet', ['dismiss']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const myExpensesServiceSpy = jasmine.createSpyObj('MyExpensesService', [
      'generateStateFilterPills',
      'generateReceiptsAttachedFilterPills',
      'generateDateFilterPills',
      'generateTypeFilterPills',
      'generateSortFilterPills',
      'generateCardFilterPills',
      'generateSplitExpenseFilterPills',
    ]);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set', 'post']);
    const corporateCreditCardServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getExpenseDetailsInCards',
      'getAssignedCards',
    ]);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const platformHandlerServiceSpy = jasmine.createSpyObj('PlatformHandlerService', ['registerBackButtonAction']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'createFirstExpense',
      'myExpensesActionSheetAction',
      'tasksPageOpened',
      'footerHomeTabClicked',
    ]);

    TestBed.configureTestingModule({
      declarations: [MyExpensesPage, ReportState, MaskNumber],
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
          provide: TransactionsOutboxService,
          useValue: transactionOutboxServiceSpy,
        },
        {
          provide: MatBottomSheet,
          useValue: matBottomsheetSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: MyExpensesService,
          useValue: myExpensesServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: ActionSheetController,
          useValue: actionSheetControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: CorporateCreditCardExpenseService,
          useValue: corporateCreditCardServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: PlatformHandlerService,
          useValue: platformHandlerServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        ReportState,
        MaskNumber,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MyExpensesPage);
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
    transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    matBottomsheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    myExpenseService = TestBed.inject(MyExpensesService) as jasmine.SpyObj<MyExpensesService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    actionSheetController = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    corporateCreditCardService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    platformHandlerService = TestBed.inject(PlatformHandlerService) as jasmine.SpyObj<PlatformHandlerService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should invoke setupNetworkWatcher', () => {
    spyOn(component, 'setupNetworkWatcher');
    component.ngOnInit();
    expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
  });

  describe('ionViewWillEnter(): ', () => {
    it('should set initial data', fakeAsync(() => {
      component.isConnected$ = of(true);
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(4);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(4);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(2);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: null,
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).toHaveBeenCalledTimes(1);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data if orgUserSettings and orgSettings is undefined', fakeAsync(() => {
      component.isConnected$ = of(true);
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(undefined));
      orgSettingsService.get.and.returnValue(of(undefined));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeUndefined();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeUndefined();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeUndefined();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeUndefined();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(undefined);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(4);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(4);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(2);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: null,
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).toHaveBeenCalledTimes(1);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data if simplified_report_closure_settings is present in orgSettings', fakeAsync(() => {
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      component.isConnected$ = of(true);
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithSimplifiedReport));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      component.ionViewWillEnter();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeTrue();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsParamsWithSimplifiedReport);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(4);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(4);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(2);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: null,
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).toHaveBeenCalledTimes(1);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data if loadData contains sortParam and sortDir property', fakeAsync(() => {
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      component.isConnected$ = of(true);
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      component.ionViewWillEnter();
      component.loadData$.next({
        pageNumber: 1,
        sortDir: 'asc',
        sortParam: 'approvalDate',
      });
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      // As we have used next in this test case, that is why apiV2Service is called 6 times
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(6);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(6);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(3);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: 'approvalDate.asc',
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).toHaveBeenCalledTimes(1);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data if openReports has report_approvals property', fakeAsync(() => {
      const backButtonSubscription = new Subscription();
      component.isConnected$ = of(true);
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      const extendedReportResWithReportApproval = [expectedReportSingleResponse];
      reportService.getAllExtendedReports.and.returnValue(of(extendedReportResWithReportApproval));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(4);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(4);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(2);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: null,
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).toHaveBeenCalledTimes(1);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(extendedReportResWithReportApproval);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data incase if count is less than (params.pageNumber - 1) * 10', fakeAsync(() => {
      component.isConnected$ = of(true);
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(0));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(4);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(4);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual([]);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual([]);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(0);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeFalse();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).toHaveBeenCalledTimes(1);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data if activatedRoute.snapshot contains filters', fakeAsync(() => {
      component.isConnected$ = of(true);
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      activatedRoute.snapshot.queryParams.filters = '{"sortDir": "desc"}';
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 1, sortDir: 'desc' });
      spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(6);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(6);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(3);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: null,
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).not.toHaveBeenCalled();
      expect(component.filters).toEqual({
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
        sortDir: 'desc',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc', searchString: 'example' });
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data if activatedRoute.snapshot contains state as needsreceipt', fakeAsync(() => {
      component.isConnected$ = of(true);
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      activatedRoute.snapshot.params.state = 'needsreceipt';
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 1, sortDir: 'desc' });
      spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(6);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(6);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(3);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: null,
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).not.toHaveBeenCalled();
      expect(component.filters).toEqual({
        tx_receipt_required: 'eq.true',
        state: 'NEEDS_RECEIPT',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc', searchString: 'example' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        state: 'NEEDS_RECEIPT',
        tx_receipt_required: 'eq.true',
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data if activatedRoute.snapshot contains state as policyviolated', fakeAsync(() => {
      component.isConnected$ = of(true);
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      activatedRoute.snapshot.params.state = 'policyviolated';
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 1, sortDir: 'desc' });
      spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(6);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(6);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(3);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: null,
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).not.toHaveBeenCalled();
      expect(component.filters).toEqual({
        tx_policy_flag: 'eq.true',
        or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        state: 'POLICY_VIOLATED',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc', searchString: 'example' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        tx_policy_flag: 'eq.true',
        or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        state: 'POLICY_VIOLATED',
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set initial data if activatedRoute.snapshot contains state as cannotreport', fakeAsync(() => {
      component.isConnected$ = of(true);
      const backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'formatTransactions');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo('https://staging.fyle.tech');
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      transactionService.getMyExpensesCount.and.returnValue(of(10));
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      transactionService.getMyExpenses.and.returnValue(
        of({ count: 2, limit: 10, offset: 0, data: apiExpenseRes, url: '' })
      );
      transactionService.getPaginatedETxncCount.and.returnValue(of({ count: 10 }));
      reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      activatedRoute.snapshot.params.state = 'cannotreport';
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 1, sortDir: 'desc' });
      spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
      component.ionViewWillEnter();
      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(component.expensesTaskCount).toBe(10);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });

      expect(component.isNewReportsFlowEnabled).toBeFalse();
      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(400);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledTimes(6);
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        undefined
      );
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledWith(
        {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        'example'
      );
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledTimes(6);
      expect(transactionService.getMyExpensesCount).toHaveBeenCalledWith({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(3);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: null,
      });
      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenseRes);
      });
      component.count$.subscribe((count) => {
        expect(count).toBe(10);
      });
      component.isNewUser$.subscribe((isNewUser) => {
        expect(isNewUser).toBeFalse();
      });
      component.isInfiniteScrollRequired$.subscribe((isInfiniteScrollReq) => {
        expect(isInfiniteScrollReq).toBeTrue();
      });
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      component.allExpenseCountHeader$.subscribe((allExpenseCountHeader) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_state: 'in.(COMPLETE,DRAFT)',
          tx_report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(4);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(4);
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: JSON.stringify(component.filters),
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).not.toHaveBeenCalled();
      expect(component.filters).toEqual({
        tx_policy_amount: 'lt.0.0001',
        state: 'CANNOT_REPORT',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc', searchString: 'example' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        tx_policy_amount: 'lt.0.0001',
        state: 'CANNOT_REPORT',
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      tick(500);
      expect(component.isLoading).toBeFalse();
      expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
        queryParams: {
          rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        },
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(apiExtendedReportRes);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));
  });

  it('HeaderState(): should return the headerState', () => {
    expect(component.HeaderState).toEqual(HeaderState);
  });

  describe('clearText', () => {
    it('should clear the search text and dispatch keyup event', () => {
      component.isSearchBarFocused = false;
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      const dispatchEventSpy = spyOn(inputElement, 'dispatchEvent');
      component.clearText('onSimpleSearchCancel');

      expect(component.simpleSearchText).toBe('');
      expect(inputElement.value).toBe('');
      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('keyup'));
      expect(component.isSearchBarFocused).toBe(true);
    });

    it('should clear the search text and not toggle isSearchBarFocused when isFromCancel is not specified', () => {
      component.isSearchBarFocused = false;
      component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
      inputElement = component.simpleSearchInput.nativeElement;
      const dispatchEventSpy = spyOn(inputElement, 'dispatchEvent');
      component.clearText('');

      expect(component.simpleSearchText).toBe('');
      expect(inputElement.value).toBe('');
      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('keyup'));
      expect(component.isSearchBarFocused).toBe(false);
    });
  });

  it('onSearchBarFocus(): should set isSearchBarFocused to true', () => {
    component.isSearchBarFocused = false;
    component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
    inputElement = component.simpleSearchInput.nativeElement;
    inputElement.dispatchEvent(new Event('focus'));
    expect(component.isSearchBarFocused).toBeTrue();
  });

  it('formatTransactions(): should format transactions correctly', () => {
    const transactions = apiExpenseRes;
    const formattedTransactions = component.formatTransactions(transactions);

    expect(formattedTransactions.length).toBe(transactions.length);
  });

  describe('switchSelectionMode(): ', () => {
    it('should switch to selection mode', () => {
      component.selectionMode = true;
      component.loadData$ = new BehaviorSubject({
        searchString: 'example',
      });
      spyOn(component, 'selectExpense');
      spyOn(component, 'setAllExpensesCountAndAmount');
      component.switchSelectionMode();

      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toBe(HeaderState.simpleSearch);
      expect(component.selectedElements).toEqual([]);
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      expect(component.selectExpense).not.toHaveBeenCalled();
    });

    it('should switch to multi-select mode and call selectExpense if expense is provided', () => {
      component.selectionMode = true;
      component.loadData$ = new BehaviorSubject({});
      spyOn(component, 'selectExpense');
      spyOn(component, 'setAllExpensesCountAndAmount');
      const expense = apiExpenseRes[0];

      component.switchSelectionMode(expense);

      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toBe(HeaderState.base);
      expect(component.selectedElements).toEqual([]);
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      expect(component.selectExpense).toHaveBeenCalledOnceWith(expense);
    });

    it('should switch back to normal mode', () => {
      component.selectionMode = false;
      component.loadData$ = new BehaviorSubject({
        searchString: 'example',
      });
      spyOn(component, 'selectExpense');
      spyOn(component, 'setAllExpensesCountAndAmount');
      component.headerState = HeaderState.simpleSearch;
      component.allExpensesStats$ = of({ count: 10, amount: 1000 });

      component.switchSelectionMode();

      expect(component.selectionMode).toBeTrue();
      expect(component.headerState).toBe(HeaderState.multiselect);
      expect(component.setAllExpensesCountAndAmount).not.toHaveBeenCalled();
      expect(component.selectExpense).not.toHaveBeenCalled();
      component.allExpensesStats$.subscribe((stats) => {
        expect(stats.count).toBe(0);
        expect(stats.amount).toBe(0);
      });
    });
  });

  it('sendFirstExpenseCreatedEvent(): should fetch storage data', fakeAsync(() => {
    component.allExpensesStats$ = of({
      count: 0,
      amount: 0,
    });
    storageService.get.and.resolveTo(false);
    component.sendFirstExpenseCreatedEvent();
    tick(100);
    expect(storageService.get).toHaveBeenCalledOnceWith('isFirstExpenseCreated');
    expect(trackingService.createFirstExpense).toHaveBeenCalledTimes(1);
    expect(storageService.set).toHaveBeenCalledOnceWith('isFirstExpenseCreated', true);
  }));

  describe('setAllExpensesCountAndAmount(): ', () => {
    it('should call transactionService if loadData contains queryParams', () => {
      component.loadData$ = new BehaviorSubject({
        queryParams: {
          corporate_credit_card_account_number: '8698',
        },
      });
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam));
      component.setAllExpensesCountAndAmount();
      component.allExpensesStats$.subscribe((allExpenseStats) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
          or: '(corporate_credit_card_account_number.8698)',
        });
        expect(allExpenseStats).toEqual({
          count: 4,
          amount: 3494,
        });
      });
    });

    it('should call transactionService if loadData does not contain queryParams', () => {
      component.loadData$ = new BehaviorSubject({
        queryParams: false,
      });
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam2));
      component.setAllExpensesCountAndAmount();
      component.allExpensesStats$.subscribe((allExpenseStats) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        });
        expect(allExpenseStats).toEqual({
          count: 4,
          amount: 0,
        });
      });
    });

    it('should throw error if transactionService throws an error', () => {
      component.loadData$ = new BehaviorSubject({
        queryParams: {
          corporate_credit_card_account_number: '8698',
        },
      });
      transactionService.getTransactionStats.and.returnValue(throwError(() => new Error('error message')));
      component.setAllExpensesCountAndAmount();
      component.allExpensesStats$.subscribe((allExpenseStats) => {
        expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
          scalar: true,
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
          or: '(corporate_credit_card_account_number.8698)',
        });
        expect(allExpenseStats).toEqual({
          count: 4,
          amount: 3494,
        });
      });
    });
  });
  it('setupActionSheet(): should update actionSheetButtons', () => {
    spyOn(component, 'actionSheetButtonsHandler');
    component.setupActionSheet(orgSettingsRes);
    expect(component.actionSheetButtons).toEqual([
      {
        text: 'Capture Receipt',
        icon: 'assets/svg/fy-camera.svg',
        cssClass: 'capture-receipt',
        handler: component.actionSheetButtonsHandler('capture receipts', 'camera_overlay'),
      },
      {
        text: 'Add Manually',
        icon: 'assets/svg/fy-expense.svg',
        cssClass: 'capture-receipt',
        handler: component.actionSheetButtonsHandler('Add Expense', 'add_edit_expense'),
      },
      {
        text: 'Add Mileage',
        icon: 'assets/svg/fy-mileage.svg',
        cssClass: 'capture-receipt',
        handler: component.actionSheetButtonsHandler('Add Mileage', 'add_edit_mileage'),
      },
      {
        text: 'Add Per Diem',
        icon: 'assets/svg/fy-calendar.svg',
        cssClass: 'capture-receipt',
        handler: component.actionSheetButtonsHandler('Add Per Diem', 'add_edit_per_diem'),
      },
    ]);
  });

  it('actionSheetButtonsHandler(): should call trackingService and navigate to a route', () => {
    component.actionSheetButtonsHandler('Add Per Diem', 'add_edit_per_diem');
    expect(trackingService.myExpensesActionSheetAction).toHaveBeenCalledOnceWith({
      Action: 'Add Per Diem',
    });
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_per_diem',
      {
        navigate_back: true,
      },
    ]);
  });

  it('getCardDetail(): should call corporateCreditCardService', () => {
    corporateCreditCardService.getExpenseDetailsInCards.and.returnValue(expectedUniqueCardStats);
    const getCardDetailRes = component.getCardDetail(cardAggregateStatParam);

    expect(getCardDetailRes).toEqual(expectedUniqueCardStats);
    expect(corporateCreditCardService.getExpenseDetailsInCards).toHaveBeenCalledOnceWith(
      [
        { cardName: 'DAMNA', cardNumber: '8698' },
        { cardName: 'DAMNA', cardNumber: '8698' },
        { cardName: 'PEX BANK', cardNumber: '869' },
      ],
      cardAggregateStatParam
    );
  });

  it('ionViewWillLeave(): should unsubscribe hardwareBackButton and update onPageExit', () => {
    component.hardwareBackButton = new Subscription();
    const unsubscribeSpy = spyOn(component.hardwareBackButton, 'unsubscribe');
    const onPageNextSpy = spyOn(component.onPageExit$, 'next');
    component.ionViewWillLeave();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
    expect(onPageNextSpy).toHaveBeenCalledOnceWith(null);
  });

  describe('backButtonAction(): ', () => {
    it('should call switchSelectionMode when headerState is HeaderState.multiselect', () => {
      spyOn(component, 'switchSelectionMode');
      spyOn(component, 'onSimpleSearchCancel');
      component.headerState = HeaderState.multiselect;

      component.backButtonAction();

      expect(component.switchSelectionMode).toHaveBeenCalledTimes(1);
      expect(component.onSimpleSearchCancel).not.toHaveBeenCalled();
      expect(navController.back).not.toHaveBeenCalled();
    });

    it('should call onSimpleSearchCancel when headerState is HeaderState.simpleSearch', () => {
      spyOn(component, 'switchSelectionMode');
      spyOn(component, 'onSimpleSearchCancel');
      component.headerState = HeaderState.simpleSearch;

      component.backButtonAction();

      expect(component.onSimpleSearchCancel).toHaveBeenCalledTimes(1);
      expect(component.switchSelectionMode).not.toHaveBeenCalled();
      expect(navController.back).not.toHaveBeenCalled();
    });

    it('should call navController.back when headerState is neither HeaderState.multiselect nor HeaderState.simpleSearch', () => {
      spyOn(component, 'switchSelectionMode');
      spyOn(component, 'onSimpleSearchCancel');
      component.headerState = HeaderState.base;

      component.backButtonAction();

      expect(navController.back).toHaveBeenCalled();
      expect(component.switchSelectionMode).not.toHaveBeenCalled();
      expect(component.onSimpleSearchCancel).not.toHaveBeenCalled();
    });
  });

  it('setupNetworkWatcher(): should update isConnected$ and call connectivityWatcher', () => {
    networkService.isOnline.and.returnValue(of(true));
    component.setupNetworkWatcher();
    expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
    expect(networkService.isOnline).toHaveBeenCalledTimes(1);
    component.isConnected$.subscribe((isConnected) => {
      expect(isConnected).toBeTrue();
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
    it('should refresh data without event', fakeAsync(() => {
      transactionService.clearCache.and.returnValue(of(null));
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
      component.doRefresh();
      tick(1000);

      expect(component.selectedElements).toEqual([]);
      expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toBe(1);
      expect(component.loadData$.getValue().pageNumber).toBe(1);
    }));

    it('should refresh data and call complete if event if present and selectionMode is true', fakeAsync(() => {
      transactionService.clearCache.and.returnValue(of(null));
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
      spyOn(component, 'setExpenseStatsOnSelect');
      component.selectionMode = true;
      const mockEvent = { target: { complete: jasmine.createSpy('complete') } };

      component.doRefresh(mockEvent);
      tick(1000);

      expect(component.selectedElements).toEqual([]);
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toBe(1);
      expect(component.loadData$.getValue().pageNumber).toBe(1);
      expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
    }));

    it('should refresh data if target is not defined', fakeAsync(() => {
      transactionService.clearCache.and.returnValue(of(null));
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
      const mockEvent = {};

      component.doRefresh(mockEvent);
      tick(1000);

      expect(component.selectedElements).toEqual([]);
      expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toBe(1);
      expect(component.loadData$.getValue().pageNumber).toBe(1);
    }));
  });

  it('syncOutboxExpenses(): should call transactionoutboxService and do a refresh', fakeAsync(() => {
    spyOn(component, 'formatTransactions').and.returnValues(apiExpenseRes, []);
    transactionOutboxService.getPendingTransactions.and.returnValues(apiExpenseRes, []);
    transactionOutboxService.sync.and.resolveTo(undefined);
    spyOn(component, 'doRefresh');

    component.syncOutboxExpenses();
    tick(100);

    expect(component.pendingTransactions).toEqual(apiExpenseRes);
    expect(component.formatTransactions).toHaveBeenCalledTimes(2);
    expect(transactionOutboxService.getPendingTransactions).toHaveBeenCalledTimes(2);
    expect(transactionOutboxService.sync).toHaveBeenCalledTimes(1);
    expect(component.syncing).toBeFalse();
    expect(component.doRefresh).toHaveBeenCalledTimes(1);
  }));

  describe('generateFilterPills(): ', () => {
    it('should return filterPills based on the property present in filters', () => {
      const filters: ExpenseFilters = {
        state: ['DRAFT', 'READY_TO_REPORT'],
        date: DateFilters.thisWeek,
        receiptsAttached: 'YES',
        type: ['PerDiem', 'Mileage'],
        sortParam: 'tx_org_category',
        sortDir: 'asc',
        cardNumbers: ['1234', '5678'],
        splitExpense: 'YES',
      };
      const filterPill: FilterPill[] = [];

      myExpenseService.generateStateFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push({
          label: 'Type',
          type: 'state',
          value: 'Incomplete, Complete',
        });
      });
      myExpenseService.generateReceiptsAttachedFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push({
          label: 'Receipts Attached',
          type: 'receiptsAttached',
          value: 'yes',
        });
      });
      myExpenseService.generateDateFilterPills.and.returnValue([
        {
          label: 'Date',
          type: 'date',
          value: 'this Week',
        },
      ]);
      myExpenseService.generateTypeFilterPills.and.callFake((filters, filterPill) => {
        filterPill.push({
          label: 'Expense Type',
          type: 'type',
          value: 'Per Diem, Mileage',
        });
      });
      myExpenseService.generateSortFilterPills.and.callFake((filters, filterPill) => {
        filterPill.push({
          label: 'Sort By',
          type: 'sort',
          value: 'category - a to z',
        });
      });
      myExpenseService.generateCardFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push({
          label: 'Cards',
          type: 'cardNumbers',
          value: '****1234, ****5678',
        });
      });
      myExpenseService.generateSplitExpenseFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push({
          label: 'Split Expense',
          type: 'splitExpense',
          value: 'yes',
        });
      });

      const expectedFilterPill = [
        {
          label: 'Type',
          type: 'state',
          value: 'Incomplete, Complete',
        },
        {
          label: 'Receipts Attached',
          type: 'receiptsAttached',
          value: 'yes',
        },
        {
          label: 'Expense Type',
          type: 'type',
          value: 'Per Diem, Mileage',
        },
        {
          label: 'Sort By',
          type: 'sort',
          value: 'category - a to z',
        },
        {
          label: 'Cards',
          type: 'cardNumbers',
          value: '****1234, ****5678',
        },
        {
          label: 'Split Expense',
          type: 'splitExpense',
          value: 'yes',
        },
      ];

      const filterPillRes = component.generateFilterPills(filters);
      expect(filterPillRes).toEqual(expectedFilterPill);
    });

    it('should return filterPills based if state, type and cardNumbers are not present in filters', () => {
      const filters: ExpenseFilters = {
        date: DateFilters.thisWeek,
        receiptsAttached: 'YES',
        sortParam: 'tx_org_category',
        sortDir: 'asc',
        splitExpense: 'YES',
      };
      const filterPill: FilterPill[] = [];

      myExpenseService.generateReceiptsAttachedFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push({
          label: 'Receipts Attached',
          type: 'receiptsAttached',
          value: 'yes',
        });
      });
      myExpenseService.generateDateFilterPills.and.returnValue([
        {
          label: 'Date',
          type: 'date',
          value: 'this Week',
        },
      ]);
      myExpenseService.generateSortFilterPills.and.callFake((filters, filterPill) => {
        filterPill.push({
          label: 'Sort By',
          type: 'sort',
          value: 'category - a to z',
        });
      });
      myExpenseService.generateSplitExpenseFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push({
          label: 'Split Expense',
          type: 'splitExpense',
          value: 'yes',
        });
      });

      const expectedFilterPill = [
        {
          label: 'Receipts Attached',
          type: 'receiptsAttached',
          value: 'yes',
        },
        {
          label: 'Sort By',
          type: 'sort',
          value: 'category - a to z',
        },
        {
          label: 'Split Expense',
          type: 'splitExpense',
          value: 'yes',
        },
      ];

      const filterPillRes = component.generateFilterPills(filters);
      expect(filterPillRes).toEqual(expectedFilterPill);
    });
  });

  it('onHomeClicked(): should navigate to my_dashboard and call trackingService', () => {
    component.onHomeClicked();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: { state: 'home' },
    });
    expect(trackingService.footerHomeTabClicked).toHaveBeenCalledOnceWith({
      page: 'Expenses',
    });
  });

  it('onCameraClicked(): should navigate to camera_overlay', () => {
    component.onCameraClicked();
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  });

  it('onTaskClicked(): should navigate to my_dashboard and call trackingService', () => {
    component.onTaskClicked();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: { state: 'tasks', tasksFilters: 'expenses' },
    });
    expect(trackingService.tasksPageOpened).toHaveBeenCalledOnceWith({
      Asset: 'Mobile',
      from: 'My Expenses',
    });
  });

  it('searchClick(): should set headerState and call focus method on input', fakeAsync(() => {
    component.simpleSearchInput = fixture.debugElement.query(By.css('.my-expenses--simple-search-input'));
    inputElement = component.simpleSearchInput.nativeElement;
    const mockFocus = spyOn(inputElement, 'focus');

    component.searchClick();
    expect(component.headerState).toEqual(HeaderState.simpleSearch);
    tick(300);
    expect(mockFocus).toHaveBeenCalledTimes(1);
  }));

  it('mergeExpense(): should navigate to merge_expenses with payload data', () => {
    component.selectedElements = apiExpenseRes;
    const strigifiedElements = JSON.stringify(apiExpenseRes);
    component.mergeExpenses();
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'merge_expense',
      {
        selectedElements: strigifiedElements,
        from: 'MY_EXPENSES',
      },
    ]);
  });

  describe('showCamera(): ', () => {
    it('should set isCameraPreviewStarted to false if argument is false', () => {
      component.isCameraPreviewStarted = true;
      component.showCamera(false);
      expect(component.isCameraPreviewStarted).toBeFalse();
    });
    it('should set isCameraPreviewStarted to true if argument is true', () => {
      component.isCameraPreviewStarted = false;
      component.showCamera(true);
      expect(component.isCameraPreviewStarted).toBeTrue();
    });
  });
});
