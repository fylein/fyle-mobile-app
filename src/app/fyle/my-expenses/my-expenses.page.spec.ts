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
import { cardAggregateStatParam, cardAggregateStatParam3 } from 'src/app/core/mock-data/card-aggregate-stats.data';
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
import { apiExpenseRes, expectedFormattedTransaction, expenseData1 } from 'src/app/core/mock-data/expense.data';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { environment } from 'src/environments/environment';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import {
  cardFilterPill,
  creditTxnFilterPill,
  dateFilterPill,
  expectedFilterPill1,
  expectedFilterPill2,
  receiptsAttachedFilterPill,
  sortFilterPill,
  splitExpenseFilterPill,
  stateFilterPill,
  typeFilterPill,
} from 'src/app/core/mock-data/filter-pills.data';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpenseFilters } from './expense-filters.model';
import { txnData2 } from 'src/app/core/mock-data/transaction.data';
import { unformattedTxnData } from 'src/app/core/mock-data/unformatted-transaction.data';
import { expenseFiltersData1, expenseFiltersData2 } from 'src/app/core/mock-data/expense-filters.data';
import { expectedActionSheetButtonRes } from 'src/app/core/mock-data/action-sheet-options.data';
import { cloneDeep } from 'lodash';
import { apiAuthRes } from 'src/app/core/mock-data/auth-reponse.data';
import { cardDetailsData1 } from 'src/app/core/mock-data/card-details.data';
import { getElementRef } from 'src/app/core/dom-helpers';

describe('MyExpensesPage', () => {
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
    let backButtonSubscription: Subscription;

    beforeEach(() => {
      component.isConnected$ = of(true);
      backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardService.getAssignedCards.and.returnValue(of(expectedAssignedCCCStats));
      spyOn(component, 'getCardDetail').and.returnValue(expectedUniqueCardStats);
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      tokenService.getClusterDomain.and.resolveTo(apiAuthRes.cluster_domain);
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
      transactionOutboxService.getPendingTransactions.and.returnValue(apiExpenseRes);
      spyOn(component, 'formatTransactions').and.returnValue(apiExpenseRes);
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 1, sortDir: 'desc' });
      spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
      component.simpleSearchInput = getElementRef(fixture, '.my-expenses--simple-search-input');
      inputElement = component.simpleSearchInput.nativeElement;
    });

    it('should set isNewReportsFlowEnabled, isInstaFyleEnabled, isBulkFyleEnabled, isMileageEnabled and isPerDiemEnabled to true if orgSettings and orgUserSettings properties are enabled', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);
      expect(component.expensesTaskCount).toBe(10);
      expect(component.isNewReportsFlowEnabled).toBeFalse();

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
    }));

    it('should set isNewReportsFlowEnabled, isInstaFyleEnabled, isBulkFyleEnabled, isMileageEnabled and isPerDiemEnabled to false if orgSettings and orgUserSettings properties are disabled', fakeAsync(() => {
      const mockOrgUserSettingsData = cloneDeep(orgUserSettingsData);
      const mockOrgSettingsData = cloneDeep(orgSettingsRes);
      mockOrgUserSettingsData.insta_fyle_settings.enabled = false;
      mockOrgUserSettingsData.bulk_fyle_settings.enabled = false;
      mockOrgSettingsData.mileage.enabled = false;
      mockOrgSettingsData.per_diem.enabled = false;
      orgUserSettingsService.get.and.returnValue(of(mockOrgUserSettingsData));
      orgSettingsService.get.and.returnValue(of(mockOrgSettingsData));

      component.ionViewWillEnter();
      tick(500);
      expect(component.expensesTaskCount).toBe(10);
      expect(component.isNewReportsFlowEnabled).toBeFalse();

      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeFalse();
      });
      component.isBulkFyleEnabled$.subscribe((isBulkFyleEnabled) => {
        expect(isBulkFyleEnabled).toBeFalse();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeFalse();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeFalse();
      });
    }));

    it('should set isNewReportsFlowEnabled, isInstaFyleEnabled, isBulkFyleEnabled, isMileageEnabled and isPerDiemEnabled to false if orgSettings and orgUserSettings properties are not allowed', fakeAsync(() => {
      const mockOrgUserSettingsData = cloneDeep(orgUserSettingsData);
      mockOrgUserSettingsData.insta_fyle_settings.allowed = false;
      mockOrgUserSettingsData.bulk_fyle_settings.allowed = false;
      orgUserSettingsService.get.and.returnValue(of(mockOrgUserSettingsData));

      component.ionViewWillEnter();
      tick(500);
      expect(component.expensesTaskCount).toBe(10);
      expect(component.isNewReportsFlowEnabled).toBeFalse();

      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeFalse();
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
    }));

    it('should set isInstaFyleEnabled, isBulkFyleEnabled, isMileageEnabled and isPerDiemEnabled to undefined if orgUserSettings and orgSettings are undefined', fakeAsync(() => {
      orgUserSettingsService.get.and.returnValue(of(undefined));
      orgSettingsService.get.and.returnValue(of(undefined));

      component.ionViewWillEnter();
      tick(500);
      expect(component.expensesTaskCount).toBe(10);
      expect(component.isNewReportsFlowEnabled).toBeFalse();

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
    }));

    it('should set hardwareBackButton and expenseTaskCount successfully', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);
      expect(component.hardwareBackButton).toEqual(backButtonSubscription);
      expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
        BackButtonActionPriority.MEDIUM,
        component.backButtonAction
      );
      expect(tasksService.getExpensesTaskCount).toHaveBeenCalledTimes(1);
      expect(component.expensesTaskCount).toBe(10);
    }));

    it('should set isNewReportFlowEnabled to true if simplified_report_closure_settings is defined ', fakeAsync(() => {
      orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithSimplifiedReport));

      component.ionViewWillEnter();
      tick(500);

      expect(component.isNewReportsFlowEnabled).toBeTrue();
    }));

    it('should call setupActionSheet once', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes);
    }));

    it('should update cardNumbers by calling getCardDetail', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(corporateCreditCardService.getAssignedCards).toHaveBeenCalledTimes(1);
      expect(component.getCardDetail).toHaveBeenCalledOnceWith(expectedAssignedCCCStats.cardDetails);
      expect(component.cardNumbers).toEqual([
        { label: '****8698', value: '8698' },
        { label: '****869', value: '869' },
      ]);
    }));

    it('should update headerState, reviewMode and set isLoading to false after 500ms', fakeAsync(() => {
      component.ionViewWillEnter();

      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.reviewMode).toBeFalse();
      expect(component.isLoading).toBeTrue();

      tick(500);

      expect(component.isLoading).toBeFalse();
    }));

    it('should set clusterDomain, ROUTER_API_ENDPOINT, navigateBack, simpleSearchText, currentPageNumber, selectionMode and selectedElements', fakeAsync(() => {
      component.simpleSearchText = 'example';
      component.currentPageNumber = 2;
      component.selectionMode = true;
      component.ionViewWillEnter();
      tick(500);

      expect(component.ROUTER_API_ENDPOINT).toEqual(environment.ROUTER_API_ENDPOINT);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.clusterDomain).toEqual(apiAuthRes.cluster_domain);
      expect(component.navigateBack).toBeFalse();
      expect(component.simpleSearchText).toEqual('');
      expect(component.currentPageNumber).toBe(1);
      expect(component.selectionMode).toBeFalse();
      expect(component.selectedElements).toEqual([]);
    }));

    it('should call syncOutboxExpenses twice if isConnected is true', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(2);
    }));

    it('should call syncOutboxExpenses once if isConnected is false', fakeAsync(() => {
      component.isConnected$ = of(false);
      component.ionViewWillEnter();
      tick(500);

      expect(component.syncOutboxExpenses).toHaveBeenCalledTimes(1);
    }));

    it('should set homeCurrency and homeCurrencySymbol correctly', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      component.homeCurrency$.subscribe((currency) => {
        expect(currency).toEqual('USD');
      });
      expect(component.homeCurrencySymbol).toEqual('$');
    }));

    it('should update loadData$ if user types something in input', fakeAsync(() => {
      component.ionViewWillEnter();
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(500);

      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, searchString: 'example' });
      });
    }));

    it('should call extendQueryParamsForTextSearch and getMyExpensesCount whenever loadData$ value changes', fakeAsync(() => {
      component.ionViewWillEnter();
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(500);
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
      expect(component.acc).toEqual(apiExpenseRes);
    }));

    it('should not call getMyExpenses if count is less than (params.pageNumber - 1) * 10', fakeAsync(() => {
      transactionService.getMyExpensesCount.and.returnValue(of(0));
      component.ionViewWillEnter();
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(500);

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
      expect(component.clusterDomain).toEqual(apiAuthRes.cluster_domain);
      expect(transactionService.getMyExpenses).not.toHaveBeenCalled();
      expect(component.acc).toEqual([]);
    }));

    it('should call getMyExpenseCount with order if sortDir and sortParam are defined', fakeAsync(() => {
      component.ionViewWillEnter();
      component.loadData$.next({
        pageNumber: 1,
        sortDir: 'asc',
        sortParam: 'approvalDate',
      });
      tick(500);

      expect(transactionService.getMyExpenses).toHaveBeenCalledTimes(2);
      expect(transactionService.getMyExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        queryParams: {
          tx_report_id: 'is.null',
          tx_state: 'in.(COMPLETE,DRAFT)',
        },
        order: 'approvalDate.asc',
      });
    }));

    it('should set pendingTransactions by calling transactionOutboxService', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(component.isLoadingDataInInfiniteScroll).toBeFalse();
      expect(component.acc).toEqual(apiExpenseRes);
      expect(transactionOutboxService.getPendingTransactions).toHaveBeenCalledTimes(1);
      expect(component.pendingTransactions).toEqual(apiExpenseRes);
      expect(component.formatTransactions).toHaveBeenCalledTimes(1);
    }));

    it('should set myExpenses$, count$, isNewUser$ and isInfiniteScrollRequired', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

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
    }));

    it('should call setAllExpensesCountAndAmount once', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
    }));

    it('should update allExpenseCountHeader$ and draftExpensesCount$ based on loadData', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

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
    }));

    it('should navigate relative to activatedRoute and call clearFilters if snapshot.params and queryParams are undefined', fakeAsync(() => {
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      const stringifiedFilters = JSON.stringify(component.filters);
      component.ionViewWillEnter();
      tick(500);

      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRoute,
        queryParams: {
          filters: stringifiedFilters,
        },
        replaceUrl: true,
      });
      expect(component.clearFilters).toHaveBeenCalledTimes(1);
    }));

    it('should update filters and filterPills if activatedRoute contains filters', fakeAsync(() => {
      activatedRoute.snapshot.queryParams.filters = '{"sortDir": "desc"}';
      component.ionViewWillEnter();
      tick(500);
      expect(component.clearFilters).not.toHaveBeenCalled();
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc' });
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
    }));

    it('should update filters and filterPills if activatedRoute state is equal to needsreceipt', fakeAsync(() => {
      activatedRoute.snapshot.params.state = 'needsreceipt';
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      component.ionViewWillEnter();
      tick(500);
      expect(component.clearFilters).not.toHaveBeenCalled();
      expect(component.filters).toEqual({
        tx_receipt_required: 'eq.true',
        state: 'NEEDS_RECEIPT',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        state: 'NEEDS_RECEIPT',
        tx_receipt_required: 'eq.true',
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
    }));

    it('should update filters and filterPills if activatedRoute state is equal to policyviolated', fakeAsync(() => {
      activatedRoute.snapshot.params.state = 'policyviolated';
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      component.ionViewWillEnter();
      tick(500);

      expect(component.clearFilters).not.toHaveBeenCalled();
      expect(component.filters).toEqual({
        tx_policy_flag: 'eq.true',
        or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        state: 'POLICY_VIOLATED',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        tx_policy_flag: 'eq.true',
        or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        state: 'POLICY_VIOLATED',
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
    }));

    it('should update filters and filterPills if activatedRoute state is equal to cannotreport', fakeAsync(() => {
      activatedRoute.snapshot.params.state = 'cannotreport';
      component.filters = {
        state: [AdvancesStates.paid, AdvancesStates.cancelled],
      };
      component.ionViewWillEnter();
      tick(500);

      expect(component.clearFilters).not.toHaveBeenCalled();
      expect(component.filters).toEqual({
        tx_policy_amount: 'lt.0.0001',
        state: 'CANNOT_REPORT',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        tx_policy_amount: 'lt.0.0001',
        state: 'CANNOT_REPORT',
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
    }));

    it('should set openReports$ and call doRefresh', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

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

    it('should set openReports$ and call doRefresh if report_approvals is defined', fakeAsync(() => {
      const extendedReportResWithReportApproval = [expectedReportSingleResponse];
      reportService.getAllExtendedReports.and.returnValue(of(extendedReportResWithReportApproval));
      component.ionViewWillEnter();
      tick(500);

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
  });

  it('HeaderState(): should return the headerState', () => {
    expect(component.HeaderState).toEqual(HeaderState);
  });

  describe('clearText', () => {
    let dispatchEventSpy: jasmine.Spy;
    beforeEach(() => {
      component.isSearchBarFocused = false;
      component.simpleSearchInput = getElementRef(fixture, '.my-expenses--simple-search-input');
      inputElement = component.simpleSearchInput.nativeElement;
      dispatchEventSpy = spyOn(inputElement, 'dispatchEvent');
    });
    it('should clear the search text and dispatch keyup event', () => {
      component.clearText('onSimpleSearchCancel');

      expect(component.simpleSearchText).toBe('');
      expect(inputElement.value).toBe('');
      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('keyup'));
      expect(component.isSearchBarFocused).toBe(true);
    });

    it('should clear the search text and not toggle isSearchBarFocused when isFromCancel is not specified', () => {
      component.clearText('');

      expect(component.simpleSearchText).toBe('');
      expect(inputElement.value).toBe('');
      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('keyup'));
      expect(component.isSearchBarFocused).toBe(false);
    });
  });

  it('onSearchBarFocus(): should set isSearchBarFocused to true', () => {
    component.isSearchBarFocused = false;
    component.simpleSearchInput = getElementRef(fixture, '.my-expenses--simple-search-input');
    inputElement = component.simpleSearchInput.nativeElement;
    inputElement.dispatchEvent(new Event('focus'));
    expect(component.isSearchBarFocused).toBeTrue();
  });

  it('formatTransactions(): should format transactions correctly', () => {
    const unformattedTransactions = unformattedTxnData;
    const formattedTransactions = component.formatTransactions(unformattedTransactions);

    expect(formattedTransactions.length).toBe(unformattedTransactions.length);
    expect(formattedTransactions).toEqual(expectedFormattedTransaction);
  });

  describe('switchSelectionMode(): ', () => {
    beforeEach(() => {
      component.selectionMode = true;
      component.loadData$ = new BehaviorSubject({
        searchString: 'example',
      });
      component.headerState = HeaderState.simpleSearch;
      component.allExpensesStats$ = of({ count: 10, amount: 1000 });
      spyOn(component, 'selectExpense');
      spyOn(component, 'setAllExpensesCountAndAmount');
    });
    it('should set headerState to simpleSearch if searchString is defined in loadData', () => {
      component.switchSelectionMode();

      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toBe(HeaderState.simpleSearch);
      expect(component.selectedElements).toEqual([]);
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      expect(component.selectExpense).not.toHaveBeenCalled();
    });

    it('should set headerState to base if searchString is defined in loadData and if expense is selected', () => {
      component.loadData$ = new BehaviorSubject({});
      const expense = apiExpenseRes[0];

      component.switchSelectionMode(expense);

      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toBe(HeaderState.base);
      expect(component.selectedElements).toEqual([]);
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      expect(component.selectExpense).toHaveBeenCalledOnceWith(expense);
    });

    it('should update allExpensesStats$ and headerState if selectionMode is false', () => {
      component.selectionMode = false;

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

  it('sendFirstExpenseCreatedEvent(): should store the first expense created event', fakeAsync(() => {
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
    it('should call transactionService.getTransactionStats if loadData contains queryParams', () => {
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

    it('should call transactionService.getTransactionStats and initialize queryParams to empty object if loadData.queryParams is falsy', () => {
      component.loadData$ = new BehaviorSubject({
        queryParams: false,
      });
      transactionService.getTransactionStats.and.returnValue(of(cardAggregateStatParam3));
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

    it('should handle error in getTransactionStats and complete the observable', () => {
      component.loadData$ = new BehaviorSubject({
        queryParams: {
          corporate_credit_card_account_number: '8698',
        },
      });
      transactionService.getTransactionStats.and.returnValue(throwError(() => new Error('error message')));
      component.setAllExpensesCountAndAmount();
      component.allExpensesStats$.subscribe({
        complete: () => {
          expect().nothing();
        },
      });
      expect(transactionService.getTransactionStats).toHaveBeenCalledOnceWith('count(tx_id),sum(tx_amount)', {
        scalar: true,
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
        or: '(corporate_credit_card_account_number.8698)',
      });
    });
  });
  it('setupActionSheet(): should update actionSheetButtons', () => {
    spyOn(component, 'actionSheetButtonsHandler');
    component.setupActionSheet(orgSettingsRes);
    expect(component.actionSheetButtons).toEqual(expectedActionSheetButtonRes);
  });

  describe('actionSheetButtonsHandler():', () => {
    it('should call trackingService and navigate to add_edit_per_diem if action is add per diem', () => {
      const handler = component.actionSheetButtonsHandler('Add Per Diem', 'add_edit_per_diem');
      handler();
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
    it('should call trackingService and navigate to add_edit_mileage if action is add mileage', () => {
      const handler = component.actionSheetButtonsHandler('Add Mileage', 'add_edit_mileage');
      handler();
      expect(trackingService.myExpensesActionSheetAction).toHaveBeenCalledOnceWith({
        Action: 'Add Mileage',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_mileage',
        {
          navigate_back: true,
        },
      ]);
    });
    it('should call trackingService and navigate to add_edit_expense if action is add expense', () => {
      const handler = component.actionSheetButtonsHandler('Add Expense', 'add_edit_expense');
      handler();
      expect(trackingService.myExpensesActionSheetAction).toHaveBeenCalledOnceWith({
        Action: 'Add Expense',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_expense',
        {
          navigate_back: true,
        },
      ]);
    });
    it('should call trackingService and navigate to camera_overlay if action is capture receipts', () => {
      const handler = component.actionSheetButtonsHandler('capture receipts', 'camera_overlay');
      handler();
      expect(trackingService.myExpensesActionSheetAction).toHaveBeenCalledOnceWith({
        Action: 'capture receipts',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'camera_overlay',
        {
          navigate_back: true,
        },
      ]);
    });
  });

  it('getCardDetail(): should call corporateCreditCardService.getExpenseDetailsInCards method', () => {
    corporateCreditCardService.getExpenseDetailsInCards.and.returnValue(expectedUniqueCardStats);
    const getCardDetailRes = component.getCardDetail(cardAggregateStatParam);

    expect(getCardDetailRes).toEqual(expectedUniqueCardStats);
    expect(corporateCreditCardService.getExpenseDetailsInCards).toHaveBeenCalledOnceWith(
      cardDetailsData1,
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
    beforeEach(() => {
      spyOn(component, 'switchSelectionMode');
      spyOn(component, 'onSimpleSearchCancel');
    });
    it('should call switchSelectionMode when headerState is HeaderState.multiselect', () => {
      component.headerState = HeaderState.multiselect;

      component.backButtonAction();

      expect(component.switchSelectionMode).toHaveBeenCalledTimes(1);
      expect(component.onSimpleSearchCancel).not.toHaveBeenCalled();
      expect(navController.back).not.toHaveBeenCalled();
    });

    it('should call onSimpleSearchCancel when headerState is HeaderState.simpleSearch', () => {
      component.headerState = HeaderState.simpleSearch;

      component.backButtonAction();

      expect(component.onSimpleSearchCancel).toHaveBeenCalledTimes(1);
      expect(component.switchSelectionMode).not.toHaveBeenCalled();
      expect(navController.back).not.toHaveBeenCalled();
    });

    it('should call navController.back when headerState is neither HeaderState.multiselect nor HeaderState.simpleSearch', () => {
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

  describe('loadData(): ', () => {
    beforeEach(() => {
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
    });
    it('should increment currentPageNumber and emit updated params and call complete() after 1s', fakeAsync(() => {
      const mockEvent = { target: { complete: jasmine.createSpy('complete') } };

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadData$.getValue().pageNumber).toBe(3);
      tick(1000);
      expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
    }));

    it('should increment currentPageNumber and emit updated params if target is not defined', () => {
      const mockEvent = {};

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadData$.getValue().pageNumber).toBe(3);
    });

    it('should increment currentPageNumber and emit updated params if event if undefined', () => {
      const mockEvent = undefined;

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadData$.getValue().pageNumber).toBe(3);
    });
  });

  describe('doRefresh():', () => {
    beforeEach(() => {
      transactionService.clearCache.and.returnValue(of(null));
      component.currentPageNumber = 2;
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
      spyOn(component, 'setExpenseStatsOnSelect');
    });
    it('should refresh data if ionRefresher event is not passed as an argument', fakeAsync(() => {
      component.doRefresh();
      tick(1000);

      expect(component.selectedElements).toEqual([]);
      expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toBe(1);
      expect(component.loadData$.getValue().pageNumber).toBe(1);
    }));

    it('should refresh data and call complete if ionRefresher event if present and selectionMode is true', fakeAsync(() => {
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
    beforeEach(() => {
      myExpenseService.generateStateFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push(stateFilterPill);
      });
      myExpenseService.generateReceiptsAttachedFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push(receiptsAttachedFilterPill);
      });
      myExpenseService.generateDateFilterPills.and.returnValue(dateFilterPill);
      myExpenseService.generateTypeFilterPills.and.callFake((filters, filterPill) => {
        filterPill.push(typeFilterPill);
      });
      myExpenseService.generateSortFilterPills.and.callFake((filters, filterPill) => {
        filterPill.push(sortFilterPill);
      });
      myExpenseService.generateCardFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push(cardFilterPill);
      });
      myExpenseService.generateSplitExpenseFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push(splitExpenseFilterPill);
      });
    });
    it('should return filterPills based on the properties present in filters', () => {
      const filterPillRes = component.generateFilterPills(expenseFiltersData1);
      expect(filterPillRes).toEqual(expectedFilterPill1);
    });

    it('should return filterPills if state, type and cardNumbers properties are not present in filters passed as argument', () => {
      const filterPillRes = component.generateFilterPills(expenseFiltersData2);
      expect(filterPillRes).toEqual(expectedFilterPill2);
    });
  });
});
