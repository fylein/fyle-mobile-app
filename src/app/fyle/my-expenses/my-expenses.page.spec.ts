import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ActionSheetController, IonicModule, ModalController, NavController, PopoverController } from '@ionic/angular';

import { MyExpensesPage } from './my-expenses.page';
import { TasksService } from 'src/app/core/services/tasks.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, finalize, noop, of, tap, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { orgSettingsParamsWithSimplifiedReport, orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { NO_ERRORS_SCHEMA, TemplateRef } from '@angular/core';
import { apiExtendedReportRes, expectedReportSingleResponse } from 'src/app/core/mock-data/report.data';
import { cardAggregateStatParam, cardAggregateStatParam3 } from 'src/app/core/mock-data/card-aggregate-stats.data';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { NetworkService } from 'src/app/core/services/network.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
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
import {
  apiExpenseRes,
  expectedFormattedTransaction,
  expenseData1,
  expenseData2,
  expenseData3,
  expenseList4,
  mileageExpenseWithoutDistance,
  perDiemExpenseSingleNumDays,
} from 'src/app/core/mock-data/expense.data';
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
  filterTypeMappings,
  receiptsAttachedFilterPill,
  sortFilterPill,
  splitExpenseFilterPill,
  stateFilterPill,
  typeFilterPill,
} from 'src/app/core/mock-data/filter-pills.data';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpenseFilters } from './expense-filters.model';
import { txnData2, txnList } from 'src/app/core/mock-data/transaction.data';
import { unformattedTxnData } from 'src/app/core/mock-data/unformatted-transaction.data';
import { expenseFiltersData1, expenseFiltersData2 } from 'src/app/core/mock-data/expense-filters.data';
import { expectedActionSheetButtonRes } from 'src/app/core/mock-data/action-sheet-options.data';
import { cloneDeep } from 'lodash';
import { apiAuthRes } from 'src/app/core/mock-data/auth-reponse.data';
import { cardDetailsData1 } from 'src/app/core/mock-data/card-details.data';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { filterOptions1 } from 'src/app/core/mock-data/filter.data';
import { selectedFilters1, selectedFilters2 } from 'src/app/core/mock-data/selected-filters.data';
import {
  addExpenseToReportModalParams,
  modalControllerParams,
  modalControllerParams2,
  newReportModalParams,
  openFromComponentConfig,
  popoverControllerParams,
} from 'src/app/core/mock-data/modal-controller.data';
import { expectedCurrentParams } from 'src/app/core/mock-data/get-expenses-query-params-with-filters.data';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { Expense } from 'src/app/core/models/expense.model';
import { fyModalProperties } from 'src/app/core/mock-data/model-properties.data';
import {
  snackbarPropertiesRes,
  snackbarPropertiesRes2,
  snackbarPropertiesRes3,
  snackbarPropertiesRes4,
} from 'src/app/core/mock-data/snackbar-properties.data';
import {
  expectedCriticalPolicyViolationPopoverParams,
  expectedCriticalPolicyViolationPopoverParams2,
  expectedCriticalPolicyViolationPopoverParams3,
} from 'src/app/core/mock-data/critical-policy-violation-popover.data';
import { ExtendedReport } from 'src/app/core/models/report.model';
import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
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
  let modalController: jasmine.SpyObj<ModalController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let popupService: jasmine.SpyObj<PopupService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getReportsTaskCount', 'getExpensesTaskCount']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getMyReportsCount',
      'getMyReports',
      'clearTransactionCache',
      'getAllExtendedReports',
      'addTransactions',
    ]);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['extendQueryParamsForTextSearch']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getTransactionStats',
      'getMyExpensesCount',
      'getMyExpenses',
      'getPaginatedETxncCount',
      'clearCache',
      'generateCardNumberParams',
      'generateDateParams',
      'generateReceiptAttachedParams',
      'generateStateFilters',
      'generateTypeFilters',
      'setSortParams',
      'generateSplitExpenseParams',
      'delete',
      'getReportableExpenses',
      'isMergeAllowed',
      'getDeletableTxns',
      'excludeCCCExpenses',
      'getIsCriticalPolicyViolated',
      'getIsDraft',
      'getETxnUnflattened',
      'getAllExpenses',
      'getDeleteDialogBody',
      'getExpenseDeletionMessage',
      'getCCCExpenseMessage',
      'deleteBulk',
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
      'deleteOfflineExpense',
      'deleteBulkOfflineExpenses',
    ]);
    const matBottomsheetSpy = jasmine.createSpyObj('MatBottomSheet', ['dismiss', 'open']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const myExpensesServiceSpy = jasmine.createSpyObj('MyExpensesService', [
      'generateStateFilterPills',
      'generateReceiptsAttachedFilterPills',
      'generateDateFilterPills',
      'generateTypeFilterPills',
      'generateSortFilterPills',
      'generateCardFilterPills',
      'generateSplitExpenseFilterPills',
      'convertFilters',
      'generateSelectedFilters',
      'getFilters',
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
      'myExpensesFilterApplied',
      'deleteExpense',
      'clickAddToReport',
      'showToastMessage',
      'addToReport',
      'clickCreateReport',
      'myExpensesBulkDeleteExpenses',
    ]);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);

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
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: PopupService,
          useValue: popupServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesSpy,
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
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    component.loadData$ = new BehaviorSubject({});
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
        queryParams: null,
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

  describe('addNewFiltersToParams(): ', () => {
    beforeEach(() => {
      component.loadData$ = new BehaviorSubject({
        pageNumber: 2,
      });
      transactionService.generateCardNumberParams.and.returnValue({
        corporate_credit_card_account_number: 'in.(789)',
        or: [],
      });
      transactionService.generateDateParams.and.returnValue({
        corporate_credit_card_account_number: 'in.(789)',
        and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
        or: [],
      });
      transactionService.generateReceiptAttachedParams.and.returnValue({
        corporate_credit_card_account_number: 'in.(789)',
        and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
        or: [],
      });
      transactionService.generateStateFilters.and.returnValue({
        corporate_credit_card_account_number: 'in.(789)',
        and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
        or: [],
      });
      transactionService.generateTypeFilters.and.returnValue({
        corporate_credit_card_account_number: 'in.(789)',
        and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
        or: [],
      });
      transactionService.setSortParams.and.returnValue({ sortDir: 'asc' });
      transactionService.generateSplitExpenseParams.and.returnValue({
        or: ['(tx_is_split_expense.eq.true)'],
        corporate_credit_card_account_number: 'in.(789)',
        and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)',
      });
    });

    it('should update queryParams if filter state is not defined', () => {
      component.filters = {};

      const currentParams = component.addNewFiltersToParams();

      expect(transactionService.generateCardNumberParams).toHaveBeenCalledOnceWith({ or: [] }, component.filters);
      expect(transactionService.generateDateParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', or: [] },
        component.filters
      );
      expect(transactionService.generateReceiptAttachedParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.generateStateFilters).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.generateTypeFilters).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.setSortParams).toHaveBeenCalledOnceWith({ pageNumber: 1 }, component.filters);
      expect(transactionService.generateSplitExpenseParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );

      expect(currentParams).toEqual(expectedCurrentParams);
      expect(component.reviewMode).toBeFalse();
    });

    it('should update queryParams if filter state includes only DRAFT', () => {
      component.filters = {
        state: ['DRAFT'],
      };

      const currentParams = component.addNewFiltersToParams();

      expect(transactionService.generateCardNumberParams).toHaveBeenCalledOnceWith({ or: [] }, component.filters);
      expect(transactionService.generateDateParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', or: [] },
        component.filters
      );
      expect(transactionService.generateReceiptAttachedParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.generateStateFilters).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.generateTypeFilters).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.setSortParams).toHaveBeenCalledOnceWith({ pageNumber: 1 }, component.filters);
      expect(transactionService.generateSplitExpenseParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );

      expect(currentParams).toEqual(expectedCurrentParams);
      expect(component.reviewMode).toBeTrue();
    });

    it('should update queryParams if filter state includes only CANNOT_REPORT', () => {
      component.filters = {
        state: ['CANNOT_REPORT'],
      };

      const currentParams = component.addNewFiltersToParams();

      expect(transactionService.generateCardNumberParams).toHaveBeenCalledOnceWith({ or: [] }, component.filters);
      expect(transactionService.generateDateParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', or: [] },
        component.filters
      );
      expect(transactionService.generateReceiptAttachedParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.generateStateFilters).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.generateTypeFilters).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.setSortParams).toHaveBeenCalledOnceWith({ pageNumber: 1 }, component.filters);
      expect(transactionService.generateSplitExpenseParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );

      expect(currentParams).toEqual(expectedCurrentParams);
      expect(component.reviewMode).toBeTrue();
    });

    it('should update queryParams if filter state includes both DRAFT and CANNOT_REPORT', () => {
      component.filters = {
        state: ['DRAFT', 'CANNOT_REPORT'],
      };

      const currentParams = component.addNewFiltersToParams();

      expect(transactionService.generateCardNumberParams).toHaveBeenCalledOnceWith({ or: [] }, component.filters);
      expect(transactionService.generateDateParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', or: [] },
        component.filters
      );
      expect(transactionService.generateReceiptAttachedParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.generateStateFilters).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.generateTypeFilters).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );
      expect(transactionService.setSortParams).toHaveBeenCalledOnceWith({ pageNumber: 1 }, component.filters);
      expect(transactionService.generateSplitExpenseParams).toHaveBeenCalledOnceWith(
        { corporate_credit_card_account_number: 'in.(789)', and: '(tx_txn_dt.gte.March,tx_txn_dt.lt.April)', or: [] },
        component.filters
      );

      expect(currentParams).toEqual(expectedCurrentParams);
      expect(component.reviewMode).toBeTrue();
    });

    it('should set reviewMode to false if filter state is APPROVED', () => {
      component.filters = {
        state: ['APPROVED'],
      };

      const currentParams = component.addNewFiltersToParams();
      expect(component.reviewMode).toBeFalse();
    });
  });

  describe('openFilters(): ', () => {
    beforeEach(() => {
      myExpenseService.getFilters.and.returnValue(cloneDeep(filterOptions1));
      const filterPopoverSpy = jasmine.createSpyObj('filterPopover', ['present', 'onWillDismiss']);
      filterPopoverSpy.onWillDismiss.and.resolveTo({ data: selectedFilters2 });
      modalController.create.and.resolveTo(filterPopoverSpy);
      component.filters = {
        state: [],
      };
      myExpenseService.generateSelectedFilters.and.returnValue(selectedFilters1);
      component.loadData$ = new BehaviorSubject({
        pageNumber: 1,
      });
      component.currentPageNumber = 2;
      myExpenseService.convertFilters.and.returnValue({ sortDir: 'asc', splitExpense: 'YES' });
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ searchString: 'example' });
      spyOn(component, 'generateFilterPills').and.returnValue([
        {
          label: 'Transactions Type',
          type: 'string',
          value: 'Credit',
        },
      ]);
    });

    it('should call modalController and myExpensesService', fakeAsync(() => {
      component.cardNumbers = [
        {
          label: 'ABC',
          value: '1234',
        },
      ];

      component.openFilters('approvalDate');
      tick(200);

      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams);
      expect(myExpenseService.convertFilters).toHaveBeenCalledOnceWith(selectedFilters2);
      expect(component.filters).toEqual({ sortDir: 'asc', splitExpense: 'YES' });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ searchString: 'example' });
      });

      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({ sortDir: 'asc', splitExpense: 'YES' });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      expect(trackingService.myExpensesFilterApplied).toHaveBeenCalledOnceWith({ sortDir: 'asc', splitExpense: 'YES' });
    }));

    it('should call modalController and myExpensesService if cardNumbers is undefined', fakeAsync(() => {
      component.cardNumbers = undefined;

      component.openFilters('approvalDate');
      tick(200);

      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams2);

      expect(myExpenseService.convertFilters).toHaveBeenCalledOnceWith(selectedFilters2);
      expect(component.filters).toEqual({ sortDir: 'asc', splitExpense: 'YES' });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((loadData) => {
        expect(loadData).toEqual({ searchString: 'example' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({ sortDir: 'asc', splitExpense: 'YES' });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      expect(trackingService.myExpensesFilterApplied).toHaveBeenCalledOnceWith({ sortDir: 'asc', splitExpense: 'YES' });
    }));
  });

  it('clearFilters(): should clear the filters and call generateFilterPills', () => {
    component.filters = {
      sortDir: 'asc',
      sortParam: 'tx_org_category',
    };
    component.currentPageNumber = 3;
    spyOn(component, 'addNewFiltersToParams').and.returnValue({
      pageNumber: 1,
      searchString: 'example',
    });

    spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);

    component.clearFilters();

    expect(component.filters).toEqual({});
    expect(component.currentPageNumber).toBe(1);
    expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
    component.loadData$.subscribe((data) => {
      expect(data).toEqual({
        pageNumber: 1,
        searchString: 'example',
      });
    });
    expect(component.generateFilterPills).toHaveBeenCalledOnceWith({});
    expect(component.filterPills).toEqual(creditTxnFilterPill);
  });

  it('setState(): should pageNumber to 1 and update isLoading correctly', fakeAsync(() => {
    spyOn(component, 'addNewFiltersToParams').and.returnValue({
      pageNumber: 1,
      searchString: 'example',
    });
    component.loadData$ = new BehaviorSubject({
      pageNumber: 1,
    });

    component.setState();

    expect(component.isLoading).toBeTrue();
    expect(component.currentPageNumber).toBe(1);
    component.loadData$.subscribe((data) => {
      expect(data).toEqual({
        pageNumber: 1,
        searchString: 'example',
      });
    });
    tick(500);
    expect(component.isLoading).toBeFalse();
  }));

  describe('selectExpense(): ', () => {
    beforeEach(() => {
      transactionService.getReportableExpenses.and.returnValue(apiExpenseRes);
      component.allExpensesCount = 1;
      spyOn(component, 'setExpenseStatsOnSelect');
      component.selectedElements = cloneDeep(apiExpenseRes);
      transactionService.isMergeAllowed.and.returnValue(true);
      transactionService.getDeletableTxns.and.returnValue(apiExpenseRes);
      transactionService.excludeCCCExpenses.and.returnValue(apiExpenseRes);
    });

    it('should remove an expense from selectedElements if it is present in selectedElements', () => {
      transactionService.getReportableExpenses.and.returnValue([]);
      const expense = apiExpenseRes[0];
      component.selectedElements = cloneDeep(apiExpenseRes);

      component.selectExpense(expense);

      expect(component.selectedElements).toEqual([]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeFalse();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.isMergeAllowed).toHaveBeenCalledOnceWith([]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should remove an expense from selectedElements if it is present in selectedElements', () => {
      transactionService.getReportableExpenses.and.returnValue([]);
      component.allExpensesCount = 4;
      const expense = apiExpenseRes[0];
      component.selectedElements = cloneDeep(cloneDeep(expenseList4));

      component.selectExpense(expense);

      expect(component.selectedElements).toEqual([...expenseList4, expense]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeTrue();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.isMergeAllowed).toHaveBeenCalledOnceWith([...expenseList4, expense]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should remove an expense from selectedElements if it is present in selectedElements and allExpenseCount is not equal to length of selectedElements', () => {
      transactionService.getReportableExpenses.and.returnValue([]);
      const expense = apiExpenseRes[0];
      component.selectedElements = cloneDeep(apiExpenseRes);

      component.selectExpense(expense);

      expect(component.selectedElements).toEqual([]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeFalse();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.isMergeAllowed).toHaveBeenCalledOnceWith([]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should update expenseToBeDeleted if selectedElements is an array of atleast 1', () => {
      component.selectedElements = cloneDeep(apiExpenseRes);
      component.selectExpense(expenseData2);

      const expectedSelectedElements = [...apiExpenseRes, expenseData2];
      expect(component.selectedElements).toEqual(expectedSelectedElements);
      expect(component.expensesToBeDeleted).toEqual(apiExpenseRes);
      expect(component.cccExpenses).toBe(1);
      expect(component.selectAll).toBeFalse();
    });

    it('should remove an expense from selectedElements if it is present in selectedElements and tx_id is not present in expense', () => {
      transactionService.getReportableExpenses.and.returnValue([]);
      component.allExpensesCount = 0;
      const expense = cloneDeep(apiExpenseRes[0]);
      expense.tx_id = undefined;
      component.selectedElements = cloneDeep(apiExpenseRes);
      component.selectedElements[0].tx_id = undefined;

      component.selectExpense(expense);

      expect(component.selectedElements).toEqual([]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeTrue();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.isMergeAllowed).toHaveBeenCalledOnceWith([]);
      expect(component.isMergeAllowed).toBeTrue();
    });
  });

  it('setExpenseStatsOnSelect(): should update allExpenseStats$', () => {
    component.selectedElements = expenseList4;
    component.setExpenseStatsOnSelect();
    component.allExpensesStats$.subscribe((expenseStats) => {
      expect(expenseStats).toEqual({
        count: 3,
        amount: 49475.76,
      });
    });
  });

  describe('goToTransaction():', () => {
    it('should navigate to add_edit_mileage page if category is mileage', () => {
      component.goToTransaction({ etxn: mileageExpenseWithoutDistance });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_mileage',
        { id: 'txEpXa1cd6oq', persist_filters: true },
      ]);
    });

    it('should navigate to add_edit_per_diem if category is per diem', () => {
      component.goToTransaction({ etxn: perDiemExpenseSingleNumDays });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_per_diem',
        { id: 'txWDbbZhNwdA', persist_filters: true },
      ]);
    });

    it('should navigate to add_edit_expense if category is something else', () => {
      component.goToTransaction({ etxn: expenseData3 });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_expense',
        { id: 'tx3qHxFNgRcZ', persist_filters: true },
      ]);
    });
  });

  describe('openCriticalPolicyViolationPopOver():', () => {
    beforeEach(() => {
      const criticalPolicyViolationPopOverSpy = jasmine.createSpyObj('criticalPolicyViolationPopOver', [
        'present',
        'onWillDismiss',
      ]);
      criticalPolicyViolationPopOverSpy.onWillDismiss.and.resolveTo({ data: { action: 'continue' } });
      popoverController.create.and.resolveTo(criticalPolicyViolationPopOverSpy);
      spyOn(component, 'showOldReportsMatBottomSheet');
      spyOn(component, 'showNewReportModal');
    });

    it('should open popoverController and call showOldReportsMatBottomSheet', fakeAsync(() => {
      component.openCriticalPolicyViolationPopOver({
        title: '2 Draft Expenses blocking the way',
        message: '2 expenses are in draft state.',
        reportType: 'oldReport',
      });
      tick(100);

      expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams);

      expect(component.showOldReportsMatBottomSheet).toHaveBeenCalledTimes(1);
      expect(component.showNewReportModal).not.toHaveBeenCalled();
    }));

    it('should open popoverController and call showNewReportModal', fakeAsync(() => {
      component.openCriticalPolicyViolationPopOver({
        title: '2 Draft Expenses blocking the way',
        message: '2 expenses are in draft state.',
        reportType: 'newReport',
      });
      tick(100);

      expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams);

      expect(component.showOldReportsMatBottomSheet).not.toHaveBeenCalled();
      expect(component.showNewReportModal).toHaveBeenCalledTimes(1);
    }));
  });

  it('showNonReportableExpenseSelectedToast(): should call matSnackbar and call trackingService', () => {
    snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes);
    component.showNonReportableExpenseSelectedToast('Please select one or more expenses to be reported');

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, openFromComponentConfig);
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('failure', {
      message: 'Please select one or more expenses to be reported',
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'Please select one or more expenses to be reported',
    });
  });

  describe('openCreateReportWithSelectedIds(): ', () => {
    beforeEach(() => {
      spyOn(component, 'showNonReportableExpenseSelectedToast');
      spyOn(component, 'openCriticalPolicyViolationPopOver');
      spyOn(component, 'showOldReportsMatBottomSheet');
      spyOn(component, 'showNewReportModal');
    });

    it('should call showNonReportableExpenseSelectedToast and return if selectedElement length is zero', fakeAsync(() => {
      component.selectedElements = cloneDeep(apiExpenseRes);
      component.selectedElements[0].tx_id = undefined;

      component.openCreateReportWithSelectedIds('oldReport');
      tick(100);

      expect(trackingService.addToReport).not.toHaveBeenCalled();

      expect(component.showNonReportableExpenseSelectedToast).toHaveBeenCalledOnceWith(
        'Please select one or more expenses to be reported'
      );
      expect(component.openCriticalPolicyViolationPopOver).not.toHaveBeenCalled();
      expect(component.showOldReportsMatBottomSheet).not.toHaveBeenCalled();
      expect(component.showNewReportModal).not.toHaveBeenCalled();
    }));

    it('should call showNonReportableExpenseSelectedToast if policyViolationExpenses length is equal to selectedElements length', fakeAsync(() => {
      component.selectedElements = expenseList4;
      transactionService.getIsCriticalPolicyViolated.and.returnValues(true, true, true);
      transactionService.getIsDraft.and.returnValues(false, false, true);

      component.openCreateReportWithSelectedIds('oldReport');
      tick(100);

      expect(trackingService.addToReport).not.toHaveBeenCalled();
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[2]);
      expect(transactionService.getIsDraft).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[2]);

      expect(component.showNonReportableExpenseSelectedToast).toHaveBeenCalledOnceWith(
        'You cannot add critical policy violated expenses to a report'
      );
    }));

    it('should call showNonReportableExpenseSelectedToast if expensesInDraftState length is equal to selectedElements length', fakeAsync(() => {
      component.selectedElements = expenseList4;
      transactionService.getIsCriticalPolicyViolated.and.returnValues(false, false, true);
      transactionService.getIsDraft.and.returnValues(true, true, true);

      component.openCreateReportWithSelectedIds('oldReport');
      tick(100);

      expect(trackingService.addToReport).not.toHaveBeenCalled();
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[2]);
      expect(transactionService.getIsDraft).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[2]);

      expect(component.showNonReportableExpenseSelectedToast).toHaveBeenCalledOnceWith(
        'You cannot add draft expenses to a report'
      );
    }));

    it('should call showNonReportableExpenseSelectedToast if isReportableExpensesSelected is falsy', fakeAsync(() => {
      component.isReportableExpensesSelected = false;
      component.selectedElements = expenseList4;
      transactionService.getIsCriticalPolicyViolated.and.returnValues(false, false, true);
      transactionService.getIsDraft.and.returnValues(false, true, false);

      component.openCreateReportWithSelectedIds('oldReport');
      tick(100);

      expect(trackingService.addToReport).not.toHaveBeenCalled();
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[2]);
      expect(transactionService.getIsDraft).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[2]);

      expect(component.showNonReportableExpenseSelectedToast).toHaveBeenCalledOnceWith(
        'You cannot add draft expenses and critical policy violated expenses to a report'
      );
    }));

    it('should call trackingService and showOldReportsMatBottomSheet if report is oldReport and policyViolationExpenses and draftExpenses are zero', fakeAsync(() => {
      component.isReportableExpensesSelected = true;
      component.selectedElements = expenseList4;
      transactionService.getIsCriticalPolicyViolated.and.returnValues(false, false, false);
      transactionService.getIsDraft.and.returnValues(false, false, false);

      component.openCreateReportWithSelectedIds('oldReport');
      tick(100);

      expect(trackingService.addToReport).toHaveBeenCalledTimes(1);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[2]);
      expect(transactionService.getIsDraft).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[2]);

      expect(component.showOldReportsMatBottomSheet).toHaveBeenCalledOnceWith();
    }));

    it('should call trackingService and showNewReportModal if report is newReport and policyViolationExpenses and draftExpenses are zero', fakeAsync(() => {
      component.isReportableExpensesSelected = true;
      component.selectedElements = expenseList4;
      transactionService.getIsCriticalPolicyViolated.and.returnValues(false, false, false);
      transactionService.getIsDraft.and.returnValues(false, false, false);

      component.openCreateReportWithSelectedIds('newReport');
      tick(100);

      expect(trackingService.addToReport).toHaveBeenCalledTimes(1);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[2]);
      expect(transactionService.getIsDraft).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[2]);

      expect(component.showNewReportModal).toHaveBeenCalledOnceWith();
    }));

    it('should call trackingService and openCriticalPolicyViolationPopOver if policyViolationExpenses and draftExpenses are present', fakeAsync(() => {
      component.isReportableExpensesSelected = true;
      const mockExpenseList = cloneDeep(expenseList4);
      mockExpenseList[1].tx_amount = undefined;
      mockExpenseList[1].tx_admin_amount = 34;
      component.selectedElements = mockExpenseList;
      transactionService.getIsCriticalPolicyViolated.and.returnValues(true, true, false);
      transactionService.getIsDraft.and.returnValues(false, false, true);
      component.homeCurrency$ = of('USD');
      component.homeCurrencySymbol = '$';

      component.openCreateReportWithSelectedIds('newReport');
      tick(100);

      expect(trackingService.addToReport).toHaveBeenCalledTimes(1);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(mockExpenseList[0]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(mockExpenseList[1]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(mockExpenseList[2]);
      expect(transactionService.getIsDraft).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(mockExpenseList[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(mockExpenseList[1]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(mockExpenseList[2]);

      expect(component.openCriticalPolicyViolationPopOver).toHaveBeenCalledOnceWith(
        expectedCriticalPolicyViolationPopoverParams
      );
    }));

    it('should call trackingService and openCriticalPolicyViolationPopOver if draftExpense is zero', fakeAsync(() => {
      component.isReportableExpensesSelected = true;
      const mockExpenseList = cloneDeep(expenseList4);
      mockExpenseList[1].tx_amount = undefined;
      mockExpenseList[1].tx_admin_amount = 34;
      component.selectedElements = mockExpenseList;
      transactionService.getIsCriticalPolicyViolated.and.returnValues(true, true, false);
      transactionService.getIsDraft.and.returnValues(false, false, false);
      component.homeCurrency$ = of('USD');
      component.homeCurrencySymbol = '$';

      component.openCreateReportWithSelectedIds('newReport');
      tick(100);

      expect(trackingService.addToReport).toHaveBeenCalledTimes(1);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(mockExpenseList[0]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(mockExpenseList[1]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(mockExpenseList[2]);
      expect(transactionService.getIsDraft).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(mockExpenseList[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(mockExpenseList[1]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(mockExpenseList[2]);

      expect(component.openCriticalPolicyViolationPopOver).toHaveBeenCalledOnceWith(
        expectedCriticalPolicyViolationPopoverParams2
      );
    }));

    it('should call trackingService and openCriticalPolicyViolationPopOver if policyViolationExpenses is zero', fakeAsync(() => {
      component.isReportableExpensesSelected = true;
      component.selectedElements = expenseList4;
      transactionService.getIsCriticalPolicyViolated.and.returnValues(false, false, false);
      transactionService.getIsDraft.and.returnValues(false, true, false);
      component.homeCurrency$ = of('USD');
      component.homeCurrencySymbol = '$';

      component.openCreateReportWithSelectedIds('newReport');
      tick(100);

      expect(trackingService.addToReport).toHaveBeenCalledTimes(1);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsCriticalPolicyViolated).toHaveBeenCalledWith(expenseList4[2]);
      expect(transactionService.getIsDraft).toHaveBeenCalledTimes(3);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[0]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[1]);
      expect(transactionService.getIsDraft).toHaveBeenCalledWith(expenseList4[2]);

      expect(component.openCriticalPolicyViolationPopOver).toHaveBeenCalledOnceWith(
        expectedCriticalPolicyViolationPopoverParams3
      );
    }));
  });

  it('showNewReportModal(): should open modalController and call showAddToReportSuccessToast', fakeAsync(() => {
    component.selectedElements = apiExpenseRes;
    transactionService.getReportableExpenses.and.returnValue(apiExpenseRes);
    const addExpenseToNewReportModalSpy = jasmine.createSpyObj('addExpenseToNewReportModal', [
      'present',
      'onDidDismiss',
    ]);
    addExpenseToNewReportModalSpy.onDidDismiss.and.resolveTo({
      data: { report: apiExtendedReportRes[0], message: 'new report is created' },
    });
    modalController.create.and.resolveTo(addExpenseToNewReportModalSpy);
    modalProperties.getModalDefaultProperties.and.returnValue(fyModalProperties);
    spyOn(component, 'showAddToReportSuccessToast');

    component.showNewReportModal();
    tick(100);

    expect(transactionService.getReportableExpenses).toHaveBeenCalledOnceWith(apiExpenseRes);

    expect(modalController.create).toHaveBeenCalledOnceWith(newReportModalParams);
    expect(component.showAddToReportSuccessToast).toHaveBeenCalledOnceWith({
      report: apiExtendedReportRes[0],
      message: 'new report is created',
    });
  }));

  it('openCreateReport(): should navigate to my_create_report', () => {
    component.openCreateReport();

    expect(trackingService.clickCreateReport).toHaveBeenCalledTimes(1);

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_create_report']);
  });

  describe('openReviewExpenses(): ', () => {
    let mockExpense: Expense[];
    beforeEach(() => {
      component.loadData$ = new BehaviorSubject({ pageNumber: 1 });
      mockExpense = cloneDeep(apiExpenseRes);
      component.selectedElements = mockExpense;
      transactionService.getAllExpenses.and.returnValue(of(mockExpense));
      spyOn(component, 'filterExpensesBySearchString').and.returnValue(true);
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo(true);
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
    });

    it('should call getAllExpenses if sortParams and sortDir is undefined in loadData$ and selectedElement length is zero', fakeAsync(() => {
      component.selectedElements = [];
      component.openReviewExpenses();
      tick(100);

      expect(transactionService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: { tx_report_id: 'is.null', tx_state: 'in.(COMPLETE,DRAFT)' },
        order: null,
      });
      expect(component.filterExpensesBySearchString).not.toHaveBeenCalled();
    }));

    it('should call getAllExpenses and filterExpensesBySearchString if searchString, sortParams and sortDir are defined in loadData$ and selectedElement length is zero', fakeAsync(() => {
      component.loadData$ = new BehaviorSubject({
        sortDir: 'asc',
        sortParam: 'tx_org_category',
        searchString: 'example',
      });
      component.selectedElements = [];
      component.openReviewExpenses();
      tick(100);

      expect(transactionService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: { tx_report_id: 'is.null', tx_state: 'in.(COMPLETE,DRAFT)' },
        order: 'tx_org_category.asc',
      });
      expect(component.filterExpensesBySearchString).toHaveBeenCalledOnceWith(mockExpense[0], 'example');
    }));

    it('should navigate to add_edit_mileage if org_category is mileage and selectedElement length is greater than zero', fakeAsync(() => {
      const mockUnflattedData = cloneDeep(unflattenedTxnData);
      mockUnflattedData.tx.org_category = 'Mileage';
      transactionService.getETxnUnflattened.and.returnValue(of(mockUnflattedData));
      component.openReviewExpenses();
      tick(100);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('tx3nHShG60zq');
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_mileage',
        {
          id: 'tx3qHxFNgRcZ',
          txnIds: JSON.stringify(['tx3nHShG60zq']),
          activeIndex: 0,
        },
      ]);
    }));

    it('should navigate to add_edit_per_diem if org_category is Per Diem and selectedElement length is greater than zero', fakeAsync(() => {
      const mockUnflattedData = cloneDeep(unflattenedTxnData);
      mockUnflattedData.tx.org_category = 'Per Diem';
      transactionService.getETxnUnflattened.and.returnValue(of(mockUnflattedData));
      component.openReviewExpenses();
      tick(100);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('tx3nHShG60zq');
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_per_diem',
        {
          id: 'tx3qHxFNgRcZ',
          txnIds: JSON.stringify(['tx3nHShG60zq']),
          activeIndex: 0,
        },
      ]);
    }));

    it('should navigate to add_edit_expense if org_category is not amongst mileage and per diem and selectedElement length is greater than zero', fakeAsync(() => {
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
      component.openReviewExpenses();
      tick(100);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('tx3nHShG60zq');
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_expense',
        {
          id: 'tx3qHxFNgRcZ',
          txnIds: JSON.stringify(['tx3nHShG60zq']),
          activeIndex: 0,
        },
      ]);
    }));
  });

  describe('filterExpensesBySearchString(): ', () => {
    it('should return true if expense consist of searchString', () => {
      const expectedFilteredExpenseRes = component.filterExpensesBySearchString(expenseData1, 'Groc');

      expect(expectedFilteredExpenseRes).toBeTrue();
    });

    it('should return false if expense does not consist of searchString', () => {
      const expectedFilteredExpenseRes = component.filterExpensesBySearchString(expenseData1, 'Software');

      expect(expectedFilteredExpenseRes).toBeFalse();
    });
  });

  it('onAddTransactionToReport(): should open modalController and doRefresh', fakeAsync(() => {
    const addExpenseToReportModalSpy = jasmine.createSpyObj('addExpenseToReportModal', ['present', 'onDidDismiss']);
    addExpenseToReportModalSpy.onDidDismiss.and.resolveTo({ data: { reload: true } });
    modalController.create.and.resolveTo(addExpenseToReportModalSpy);
    modalProperties.getModalDefaultProperties.and.returnValue(fyModalProperties);
    spyOn(component, 'doRefresh');

    component.onAddTransactionToReport({ tx_id: '12345' });
    tick(100);

    expect(modalController.create).toHaveBeenCalledOnceWith(addExpenseToReportModalParams);
    expect(component.doRefresh).toHaveBeenCalledTimes(1);
  }));

  it('should navigate to my_view_report and open matSnackbar', () => {
    const expensesAddedToReportSnackBarSpy = jasmine.createSpyObj('expensesAddedToReportSnackBar', ['onAction']);
    expensesAddedToReportSnackBarSpy.onAction.and.returnValue(of(undefined));
    matSnackBar.openFromComponent.and.returnValue(expensesAddedToReportSnackBarSpy);
    snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes2);
    spyOn(component, 'doRefresh');

    component.showAddToReportSuccessToast({
      message: 'Expense added to report successfully',
      report: apiExtendedReportRes[0],
    });

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarPropertiesRes2,
      panelClass: ['msb-success-with-camera-icon'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'Expense added to report successfully',
      redirectionText: 'View Report',
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'Expense added to report successfully',
    });
    expect(component.isReportableExpensesSelected).toBeFalse();
    expect(component.selectionMode).toBeFalse();
    expect(component.headerState).toEqual(HeaderState.base);
    expect(component.doRefresh).toHaveBeenCalledTimes(1);

    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'my_view_report',
      { id: 'rprAfNrce73O', navigateBack: true },
    ]);
  });

  it('addTransactionsToReport(): should show loader call reportService and hide the loader', (done) => {
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo(true);

    reportService.addTransactions.and.returnValue(of(apiExtendedReportRes));
    component
      .addTransactionsToReport(apiExtendedReportRes[0], ['tx5fBcPBAxLv'])
      .pipe(
        tap((updatedReport) => {
          expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Adding transaction to report');
          expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rprAfNrce73O', ['tx5fBcPBAxLv']);
          expect(updatedReport).toEqual(apiExtendedReportRes[0]);
        }),
        finalize(() => {
          expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        })
      )
      .subscribe(noop);
    done();
  });

  describe('showOldReportsMatBottomSheet(): ', () => {
    beforeEach(() => {
      component.selectedElements = apiExpenseRes;
      component.isNewReportsFlowEnabled = true;
      component.openReports$ = of(apiExtendedReportRes);
      transactionService.getReportableExpenses.and.returnValue(apiExpenseRes);
      spyOn(component, 'showAddToReportSuccessToast');
    });

    it('should call matBottomSheet.open and call showAddToReportSuccessToast if data.report is defined', () => {
      spyOn(component, 'addTransactionsToReport').and.returnValue(of(apiExtendedReportRes[0]));
      matBottomsheet.open.and.returnValue({
        afterDismissed: () =>
          of({
            report: apiExtendedReportRes[0],
          }),
      } as MatBottomSheetRef<ExtendedReport>);

      component.showOldReportsMatBottomSheet();

      expect(transactionService.getReportableExpenses).toHaveBeenCalledOnceWith(apiExpenseRes);
      expect(matBottomsheet.open).toHaveBeenCalledOnceWith(<any>AddTxnToReportDialogComponent, {
        data: { openReports: apiExtendedReportRes, isNewReportsFlowEnabled: true },
        panelClass: ['mat-bottom-sheet-1'],
      });
      expect(component.addTransactionsToReport).toHaveBeenCalledOnceWith(apiExtendedReportRes[0], ['tx3nHShG60zq']);
      expect(component.showAddToReportSuccessToast).toHaveBeenCalledOnceWith({
        message: 'Expenses added to report successfully',
        report: apiExtendedReportRes[0],
      });
    });

    it('should call matBottomSheet.open and call showAddToReportSuccessToast if data.report is defined and rp_state is draft', () => {
      const mockReportData = cloneDeep(apiExtendedReportRes);
      mockReportData[0].rp_state = 'DRAFT';
      component.openReports$ = of(mockReportData);
      spyOn(component, 'addTransactionsToReport').and.returnValue(of(mockReportData[0]));
      matBottomsheet.open.and.returnValue({
        afterDismissed: () =>
          of({
            report: mockReportData[0],
          }),
      } as MatBottomSheetRef<ExtendedReport>);

      component.showOldReportsMatBottomSheet();
      expect(transactionService.getReportableExpenses).toHaveBeenCalledOnceWith(apiExpenseRes);
      expect(matBottomsheet.open).toHaveBeenCalledOnceWith(<any>AddTxnToReportDialogComponent, {
        data: { openReports: mockReportData, isNewReportsFlowEnabled: true },
        panelClass: ['mat-bottom-sheet-1'],
      });

      expect(component.addTransactionsToReport).toHaveBeenCalledOnceWith(mockReportData[0], ['tx3nHShG60zq']);
      expect(component.showAddToReportSuccessToast).toHaveBeenCalledOnceWith({
        message: 'Expenses added to an existing draft report',
        report: mockReportData[0],
      });
    });

    it('should call matBottomSheet.open and should not call showAddToReportSuccessToast if data.report is null', () => {
      spyOn(component, 'addTransactionsToReport');
      matBottomsheet.open.and.returnValue({
        afterDismissed: () =>
          of({
            report: null,
          }),
      } as MatBottomSheetRef<ExtendedReport>);

      component.showOldReportsMatBottomSheet();
      expect(transactionService.getReportableExpenses).toHaveBeenCalledOnceWith(apiExpenseRes);
      expect(matBottomsheet.open).toHaveBeenCalledOnceWith(<any>AddTxnToReportDialogComponent, {
        data: { openReports: apiExtendedReportRes, isNewReportsFlowEnabled: true },
        panelClass: ['mat-bottom-sheet-1'],
      });

      expect(component.addTransactionsToReport).not.toHaveBeenCalled();
      expect(component.showAddToReportSuccessToast).not.toHaveBeenCalled();
    });
  });

  it('openActionSheet(): should open actionSheetController', fakeAsync(() => {
    const actionSheetSpy = jasmine.createSpyObj('actionSheet', ['present']);
    component.actionSheetButtons = [];
    actionSheetController.create.and.returnValue(actionSheetSpy);

    component.openActionSheet();
    tick(100);

    expect(actionSheetController.create).toHaveBeenCalledOnceWith({
      header: 'ADD EXPENSE',
      mode: 'md',
      cssClass: 'fy-action-sheet',
      buttons: [],
    });
  }));

  describe('deleteSelectedExpenses(): ', () => {
    beforeEach(() => {
      component.pendingTransactions = [];
      component.expensesToBeDeleted = expenseList4;
    });
    it('should update selectedElements and call deleteBulk method if expenseToBeDeleted is defined', () => {
      component.deleteSelectedExpenses([]);
      expect(transactionOutboxService.deleteBulkOfflineExpenses).toHaveBeenCalledOnceWith([], []);
      expect(component.selectedElements).toEqual(expenseList4);
      expect(transactionService.deleteBulk).toHaveBeenCalledOnceWith(['txKFqMRPNLsa', 'txc5zbIpTGMU', 'txo3tuIb7em4']);
    });
    it('should not call deleteBulk method if tx_id is not present in expensesToBeDeleted', () => {
      const mockExpensesWithoutId = cloneDeep(apiExpenseRes);
      mockExpensesWithoutId[0].tx_id = undefined;
      component.expensesToBeDeleted = mockExpensesWithoutId;
      component.deleteSelectedExpenses([]);
      expect(transactionOutboxService.deleteBulkOfflineExpenses).toHaveBeenCalledOnceWith([], []);
      expect(component.selectedElements).toEqual([]);
      expect(transactionService.deleteBulk).not.toHaveBeenCalled();
    });
  });

  describe('openDeleteExpensesPopover(): ', () => {
    beforeEach(() => {
      transactionService.getExpenseDeletionMessage.and.returnValue('You are about to delete this expense');
      transactionService.getCCCExpenseMessage.and.returnValue(
        'There are 2 corporate credit cards which can be deleted'
      );
      transactionService.getDeleteDialogBody.and.returnValue('Once deleted, the action cannot be undone');
      component.expensesToBeDeleted = apiExpenseRes;
      component.cccExpenses = 1;
      transactionService.deleteBulk.and.returnValue(of(txnList));
      snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes3);
      spyOn(component, 'doRefresh');
      component.expensesToBeDeleted = cloneDeep(expenseList4);
      component.selectedElements = cloneDeep(expenseList4);
    });

    it('should open a popover and get data of expenses on dismiss', fakeAsync(() => {
      const deletePopOverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopOverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });
      popoverController.create.and.resolveTo(deletePopOverSpy);

      component.openDeleteExpensesPopover();
      tick(100);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: FyDeleteDialogComponent,
        cssClass: 'delete-dialog',
        backdropDismiss: false,
        componentProps: {
          header: 'Delete Expense',
          body: 'Once deleted, the action cannot be undone',
          ctaText: 'Exclude and Delete',
          disableDelete: false,
          deleteMethod: jasmine.any(Function),
        },
      });
    }));

    it('should open a popover and get data of expenses on dismiss if expensesToBeDeleted and cccExpenses are zero', fakeAsync(() => {
      const deletePopOverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopOverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });
      popoverController.create.and.resolveTo(deletePopOverSpy);
      component.cccExpenses = 0;
      component.expensesToBeDeleted = [];
      spyOn(component, 'deleteSelectedExpenses').and.callThrough();

      component.openDeleteExpensesPopover();
      tick(100);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: FyDeleteDialogComponent,
        cssClass: 'delete-dialog',
        backdropDismiss: false,
        componentProps: {
          header: 'Delete Expense',
          body: 'Once deleted, the action cannot be undone',
          ctaText: 'Delete',
          disableDelete: true,
          deleteMethod: jasmine.any(Function),
        },
      });
    }));

    it('should show message using matSnackbar if data is successfully deleted and selectedElements are greater than 1', fakeAsync(() => {
      const deletePopOverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopOverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });
      popoverController.create.and.resolveTo(deletePopOverSpy);

      component.openDeleteExpensesPopover();
      tick(100);

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarPropertiesRes3,
        panelClass: ['msb-success-with-camera-icon'],
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
        message: '3 expenses have been deleted',
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: '3 expenses have been deleted',
      });
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should show message using matSnackbar if data is successfully deleted and selectedElements is 1', fakeAsync(() => {
      const deletePopOverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopOverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });
      popoverController.create.and.resolveTo(deletePopOverSpy);
      const mockExpenseList = cloneDeep(expenseList4);
      component.expensesToBeDeleted = cloneDeep(mockExpenseList);
      component.selectedElements = cloneDeep([mockExpenseList[0]]);

      component.openDeleteExpensesPopover();
      tick(100);

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarPropertiesRes3,
        panelClass: ['msb-success-with-camera-icon'],
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
        message: '1 expense has been deleted',
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: '1 expense has been deleted' });
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should show message using matSnackbar if data cannot be deleted', fakeAsync(() => {
      snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes4);
      const deletePopOverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopOverSpy.onDidDismiss.and.resolveTo({ data: { status: 'failure' } });
      popoverController.create.and.resolveTo(deletePopOverSpy);
      const mockExpenseList = cloneDeep(expenseList4);
      component.expensesToBeDeleted = cloneDeep(mockExpenseList);
      component.selectedElements = cloneDeep([mockExpenseList[0]]);

      component.openDeleteExpensesPopover();
      tick(100);

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarPropertiesRes4,
        panelClass: ['msb-failure-with-camera-icon'],
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('failure', {
        message: 'We could not delete the expenses. Please try again',
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: 'We could not delete the expenses. Please try again',
      });
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));
  });

  describe('onSelectAll(): ', () => {
    beforeEach(() => {
      transactionService.getAllExpenses.and.returnValue(of(cloneDeep(apiExpenseRes)));
      transactionService.getDeletableTxns.and.returnValue(apiExpenseRes);
      transactionService.excludeCCCExpenses.and.returnValue(apiExpenseRes);
      transactionService.getReportableExpenses.and.returnValue(apiExpenseRes);
      apiV2Service.extendQueryParamsForTextSearch.and.returnValue({
        tx_report_id: 'is.null',
        tx_state: 'in.(COMPLETE,DRAFT)',
      });
      spyOn(component, 'setExpenseStatsOnSelect');
      component.loadData$ = new BehaviorSubject({ pageNumber: 1 });
    });

    it('should set selectedElement to empty array if checked is false', () => {
      component.selectedElements = cloneDeep(apiExpenseRes);
      component.isReportableExpensesSelected = false;
      component.onSelectAll(false);
      expect(component.selectedElements).toEqual([]);
      expect(transactionService.getReportableExpenses).toHaveBeenCalledOnceWith([]);
      expect(component.isReportableExpensesSelected).toBeTrue();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should update selectedElements, allExpensesCount and call apiV2Service if checked is true', () => {
      transactionService.getAllExpenses.and.returnValue(of(cloneDeep(expenseList4)));
      component.pendingTransactions = cloneDeep(apiExpenseRes);
      component.onSelectAll(true);
      expect(component.isReportableExpensesSelected).toBeTrue();
      expect(apiV2Service.extendQueryParamsForTextSearch).toHaveBeenCalledOnceWith(
        { tx_report_id: 'is.null', tx_state: 'in.(COMPLETE,DRAFT)' },
        undefined
      );
      expect(transactionService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: { tx_report_id: 'is.null', tx_state: 'in.(COMPLETE,DRAFT)' },
      });
      expect(transactionService.excludeCCCExpenses).toHaveBeenCalledOnceWith([...apiExpenseRes, ...expenseList4]);
      expect(transactionService.getDeletableTxns).toHaveBeenCalledOnceWith([...apiExpenseRes, ...expenseList4]);
      expect(component.cccExpenses).toBe(3);
      expect(component.selectedElements).toEqual([...apiExpenseRes, ...expenseList4]);
      expect(component.allExpensesCount).toBe(4);
      expect(component.isReportableExpensesSelected).toBeTrue();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(2);
    });
  });

  it('onSimpleSearchCancel(): should set headerState to base and call clearText', () => {
    component.headerState = HeaderState.simpleSearch;
    spyOn(component, 'clearText');

    component.onSimpleSearchCancel();

    expect(component.headerState).toEqual(HeaderState.base);
    expect(component.clearText).toHaveBeenCalledOnceWith('onSimpleSearchCancel');
  });

  it('onFilterPillsClearAll(): should call clearFilters', () => {
    spyOn(component, 'clearFilters');
    component.onFilterPillsClearAll();
    expect(component.clearFilters).toHaveBeenCalledTimes(1);
  });

  describe('onFilterClick(): ', () => {
    beforeEach(() => {
      spyOn(component, 'openFilters');
    });
    filterTypeMappings.forEach((filterTypeMapping) => {
      it('should call openFilters with Type if argument is state', fakeAsync(() => {
        component.onFilterClick(filterTypeMapping.type);
        tick(100);

        expect(component.openFilters).toHaveBeenCalledOnceWith(filterTypeMapping.label);
      }));
    });
  });

  describe('onFilterClose(): ', () => {
    beforeEach(() => {
      component.loadData$ = new BehaviorSubject({});
      component.filters = {
        sortDir: 'asc',
        sortParam: 'tx_org_category',
      };
      component.currentPageNumber = 2;
      spyOn(component, 'addNewFiltersToParams').and.returnValue({
        pageNumber: 3,
      });
      spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
    });

    it('should remove sortDir and sortParam if filterType is sort', () => {
      component.onFilterClose('sort');

      expect(component.filters.sortDir).toBeUndefined();
      expect(component.filters.sortParam).toBeUndefined();
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((data) => {
        expect(data).toEqual({ pageNumber: 3 });
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
    });

    it('should remove property from filter if filterType is other than sort', () => {
      component.onFilterClose('sortDir');
      expect(component.filters).toEqual({
        sortParam: 'tx_org_category',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadData$.subscribe((data) => {
        expect(data).toEqual({ pageNumber: 3 });
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
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
