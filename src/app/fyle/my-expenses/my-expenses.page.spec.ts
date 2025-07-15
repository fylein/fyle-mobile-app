import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ActionSheetController, IonicModule, ModalController, NavController, PopoverController } from '@ionic/angular';

import * as dayjs from 'dayjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import {
  MatLegacySnackBar as MatSnackBar,
  MatLegacySnackBarRef as MatSnackBarRef,
} from '@angular/material/legacy-snack-bar';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { clone, cloneDeep } from 'lodash';
import { BehaviorSubject, Subscription, finalize, noop, of, tap, throwError } from 'rxjs';
import { getElementRef } from 'src/app/core/dom-helpers';
import {
  expectedActionSheetButtonRes,
  expectedActionSheetButtonsWithMileage,
  expectedActionSheetButtonsWithPerDiem,
} from 'src/app/core/mock-data/action-sheet-options.data';
import { allowedExpenseTypes } from 'src/app/core/mock-data/allowed-expense-types.data';
import { apiAuthRes } from 'src/app/core/mock-data/auth-response.data';
import {
  expenseFiltersData2,
  expenseWithPotentialDuplicateFilterData,
} from 'src/app/core/mock-data/expense-filters.data';
import {
  apiExpenseRes,
  expectedFormattedTransaction,
  expenseData2,
  expenseList4,
  expenseListWithoutID,
} from 'src/app/core/mock-data/expense.data';
import {
  cardFilterPill,
  creditTxnFilterPill,
  dateFilterPill,
  expectedFilterPill1,
  expectedFilterPill2,
  filterTypeMappings,
  potentialDuplicatesFilterPill,
  receiptsAttachedFilterPill,
  sortFilterPill,
  splitExpenseFilterPill,
  stateFilterPill,
  typeFilterPill,
} from 'src/app/core/mock-data/filter-pills.data';
import { filterOptions1 } from 'src/app/core/mock-data/filter.data';
import {
  expectedCurrentParamsCannotReportState,
  expectedCurrentParamsDraftState,
  expectedCurrentParamsWithDraftCannotReportState,
  expectedCurrentParamsWoFilterState,
} from 'src/app/core/mock-data/get-expenses-query-params-with-filters.data';
import {
  addExpenseToReportModalParams2,
  modalControllerParams,
  modalControllerParams2,
  newReportModalParams2,
  openFromComponentConfig,
  popoverControllerParams,
} from 'src/app/core/mock-data/modal-controller.data';
import { fyModalProperties } from 'src/app/core/mock-data/model-properties.data';
import { mileagePerDiemPlatformCategoryData } from 'src/app/core/mock-data/org-category.data';
import {

  orgSettingsPendingRestrictions,
  orgSettingsRes,
} from 'src/app/core/mock-data/org-settings.data';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import {
  apiExpenses1,
  expenseData,
  mileageExpenseWithDistance,
  perDiemExpenseWithSingleNumDays,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { selectedFilters1, selectedFilters2 } from 'src/app/core/mock-data/selected-filters.data';
import {
  snackbarPropertiesRes,
  snackbarPropertiesRes2,
  snackbarPropertiesRes3,
  snackbarPropertiesRes4,
} from 'src/app/core/mock-data/snackbar-properties.data';
import { txnList } from 'src/app/core/mock-data/transaction.data';
import { unformattedTxnData } from 'src/app/core/mock-data/unformatted-transaction.data';
import { uniqueCardsData } from 'src/app/core/mock-data/unique-cards.data';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { ExpensesService as SharedExpenseService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { ReportState } from 'src/app/shared/pipes/report-state.pipe';
import { environment } from 'src/environments/environment';
import { AddTxnToReportDialogComponent } from './add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { MyExpensesPage } from './my-expenses.page';
import { MyExpensesService } from './my-expenses.service';
import { completeStats, incompleteStats } from 'src/app/core/mock-data/platform/v1/expenses-stats.data';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import {
  expectedReportsSinglePage,
  expectedReportsSinglePageFiltered,
  expectedReportsSinglePageSubmitted,
  expectedReportsSinglePageWithApproval,
} from 'src/app/core/mock-data/platform-report.data';
import { corporateCardsResponseData } from 'src/app/core/mock-data/corporate-card-response.data';
import { FeatureConfigService } from 'src/app/core/services/platform/v1/spender/feature-config.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { TranslocoService } from '@jsverse/transloco';

describe('MyExpensesPage', () => {
  let component: MyExpensesPage;
  let fixture: ComponentFixture<MyExpensesPage>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
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
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let platformHandlerService: jasmine.SpyObj<PlatformHandlerService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let popupService: jasmine.SpyObj<PopupService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let inputElement: HTMLInputElement;
  let sharedExpenseService: jasmine.SpyObj<SharedExpenseService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let featureConfigService: jasmine.SpyObj<FeatureConfigService>;
  let authService: jasmine.SpyObj<AuthService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getReportsTaskCount', 'getExpensesTaskCount']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getMyExpensesCount',
      'getMyExpenses',
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
      'excludeCCCExpenses',
      'isCriticalPolicyViolatedExpense',
      'isExpenseInDraft',
      'getAllExpenses',
      'getDeleteDialogBody',
      'getExpenseDeletionMessage',
      'getCCCExpenseMessage',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getMileageOrPerDiemCategories']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['isOnline', 'connectivityWatcher']);
    const activatedRouteSpy = {
      snapshot: {
        params: {
          navigateBack: false,
        },
        queryParams: {},
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
      'convertSelectedOptionsToExpenseFilters',
      'generatePotentialDuplicatesFilterPills',
    ]);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set', 'post']);
    const corporateCreditCardServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getExpenseDetailsInCards',
      'getCorporateCards',
    ]);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
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
      'spenderSelectedPendingTxnFromMyExpenses',
      'showOptInModalPostExpenseCreation',
      'skipOptInModalPostExpenseCreation',
      'optInFromPostExpenseCreationModal',
    ]);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const spenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', [
      'addExpenses',
      'getAllReportsByParams',
    ]);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', [
      'getExpensesCount',
      'getExpenses',
      'getAllExpenses',
      'getExpenseById',
      'getExpenseStats',
      'deleteExpenses',
    ]);
    const sharedExpenseServiceSpy = jasmine.createSpyObj('SharedExpenseService', [
      'generateCardNumberParams',
      'generateDateParams',
      'generateReceiptAttachedParams',
      'generateStateFilters',
      'generateTypeFilters',
      'setSortParams',
      'generateSplitExpenseParams',
      'getReportableExpenses',
      'excludeCCCExpenses',
      'isMergeAllowed',
      'isCriticalPolicyViolatedExpense',
      'isExpenseInDraft',
      'getExpenseDeletionMessage',
      'getCCCExpenseMessage',
      'getDeleteDialogBody',
      'restrictPendingTransactionsEnabled',
      'doesExpenseHavePendingCardTransaction',
      'getReportableExpenses',
      'generatePotentialDuplicatesParams',
    ]);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', [
      'canShowOptInAfterExpenseCreation',
      'toggleShowOptInAfterExpenseCreation',
      'canShowOptInModal',
    ]);
    const featureConfigServiceSpy = jasmine.createSpyObj('FeatureConfigService', ['saveConfiguration']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    TestBed.configureTestingModule({
      declarations: [MyExpensesPage, ReportState, MaskNumber],
      imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
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
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
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
        {
          provide: CategoriesService,
          useValue: categoriesServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: SharedExpenseService,
          useValue: sharedExpenseServiceSpy,
        },
        {
          provide: SpenderReportsService,
          useValue: spenderReportsServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: FeatureConfigService,
          useValue: featureConfigServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
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
    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
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
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    platformHandlerService = TestBed.inject(PlatformHandlerService) as jasmine.SpyObj<PlatformHandlerService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    sharedExpenseService = TestBed.inject(SharedExpenseService) as jasmine.SpyObj<SharedExpenseService>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    featureConfigService = TestBed.inject(FeatureConfigService) as jasmine.SpyObj<FeatureConfigService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    component.loadExpenses$ = new BehaviorSubject({});
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
    const dEincompleteExpenseIds = ['txfCdl3TEZ7K', 'txfCdl3TEZ7l', 'txfCdl3TEZ7m'];
    beforeEach(() => {
      component.isConnected$ = of(true);
      backButtonSubscription = new Subscription();
      tasksService.getExpensesTaskCount.and.returnValue(of(10));
      platformHandlerService.registerBackButtonAction.and.returnValue(backButtonSubscription);
      platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      categoriesService.getMileageOrPerDiemCategories.and.returnValue(of(mileagePerDiemPlatformCategoryData));
      spyOn(component, 'getCardDetail').and.returnValue(of(uniqueCardsData));
      spyOn(component, 'syncOutboxExpenses');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'clearFilters');
      spyOn(component, 'setupActionSheet');
      //@ts-ignore
      spyOn(component, 'pollDEIncompleteExpenses').and.returnValue(of(apiExpenses1));
      tokenService.getClusterDomain.and.resolveTo(apiAuthRes.cluster_domain);
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      expensesService.getExpenseStats.and.returnValue(of(completeStats));
      expensesService.getExpensesCount.and.returnValue(of(10));
      expensesService.getExpenses.and.returnValue(of(apiExpenses1));

      spenderReportsService.getAllReportsByParams.and.returnValue(of(expectedReportsSinglePageWithApproval));
      spyOn(component, 'doRefresh');
      spyOn(component, 'backButtonAction');

      spyOn(component, 'formatTransactions').and.returnValue(apiExpenseRes);
      spyOn(component, 'addNewFiltersToParams').and.returnValue({ pageNumber: 1, sortDir: 'desc' });
      spyOn(component, 'generateFilterPills').and.returnValue(creditTxnFilterPill);
      utilityService.canShowOptInModal.and.returnValue(of(true));
      spyOn(component, 'setModalDelay');
      spyOn(component, 'setNavigationSubscription');
      activatedRoute.snapshot.queryParams.redirected_from_add_expense = 'true';
      component.simpleSearchInput = getElementRef(fixture, '.my-expenses--simple-search-input');
      inputElement = component.simpleSearchInput.nativeElement;
    });

    it('should set isInstaFyleEnabled, isMileageEnabled and isPerDiemEnabled to true if orgSettings and employeeSettings properties are enabled', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);
      expect(component.expensesTaskCount).toBe(10);

      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeTrue();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });
    }));

    it('should set isInstaFyleEnabled, isMileageEnabled and isPerDiemEnabled to false if orgSettings and employeeSettings properties are disabled', fakeAsync(() => {
      const mockEmployeeSettingsData = cloneDeep(employeeSettingsData);
      const mockOrgSettingsData = cloneDeep(orgSettingsRes);
      mockEmployeeSettingsData.insta_fyle_settings.enabled = false;
      mockOrgSettingsData.mileage.enabled = false;
      mockOrgSettingsData.per_diem.enabled = false;
      platformEmployeeSettingsService.get.and.returnValue(of(mockEmployeeSettingsData));
      orgSettingsService.get.and.returnValue(of(mockOrgSettingsData));

      component.ionViewWillEnter();
      tick(500);
      expect(component.expensesTaskCount).toBe(10);

      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeFalse();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeFalse();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeFalse();
      });
    }));

    it('should set isInstaFyleEnabled, isMileageEnabled and isPerDiemEnabled to false if orgSettings and employeeSettings properties are not allowed', fakeAsync(() => {
      const mockEmployeeSettingsData = cloneDeep(employeeSettingsData);
      mockEmployeeSettingsData.insta_fyle_settings.allowed = false;
      platformEmployeeSettingsService.get.and.returnValue(of(mockEmployeeSettingsData));

      component.ionViewWillEnter();
      tick(500);
      expect(component.expensesTaskCount).toBe(10);

      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeFalse();
      });
      component.isMileageEnabled$.subscribe((isMileageEnabled) => {
        expect(isMileageEnabled).toBeTrue();
      });
      component.isPerDiemEnabled$.subscribe((isPerDiemEnabled) => {
        expect(isPerDiemEnabled).toBeTrue();
      });
    }));

    it('should set isInstaFyleEnabled, isMileageEnabled and isPerDiemEnabled to undefined if employeeSettings and orgSettings are undefined', fakeAsync(() => {
      platformEmployeeSettingsService.get.and.returnValue(of(undefined));
      orgSettingsService.get.and.returnValue(of(undefined));

      component.ionViewWillEnter();
      tick(500);
      expect(component.expensesTaskCount).toBe(10);
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      component.isInstaFyleEnabled$.subscribe((isInstaFyleEnabled) => {
        expect(isInstaFyleEnabled).toBeUndefined();
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
        jasmine.any(Function)
      );
      expect(tasksService.getExpensesTaskCount).toHaveBeenCalledTimes(1);
      expect(component.expensesTaskCount).toBe(10);
    }));

    it('should set restrictPendingTransactionsEnabled to true when orgSettings.pending_cct_expense_restriction is true', fakeAsync(() => {
      orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));

      component.ionViewWillEnter();
      tick(500);

      expect(component.restrictPendingTransactionsEnabled).toBeTrue();
    }));



    it('should call setupActionSheet once', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(component.setupActionSheet).toHaveBeenCalledOnceWith(orgSettingsRes, allowedExpenseTypes);
    }));

    it('should update cardNumbers by calling getCardDetail', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(component.getCardDetail).toHaveBeenCalled();
      expect(component.cardNumbers).toEqual([
        { label: '****8698 (Business Card1)', value: '8698' },
        { label: '****8698 (Business Card2)', value: '8698' },
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

      component.loadExpenses$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, searchString: 'example' });
      });
    }));

    it('should call extendQueryParamsForTextSearch and getMyExpensesCount whenever loadData$ value changes', fakeAsync(() => {
      component.ionViewWillEnter();
      expect(inputElement.value).toEqual('');
      inputElement.value = 'example';
      inputElement.dispatchEvent(new Event('keyup'));
      tick(500);

      expect(expensesService.getExpensesCount).toHaveBeenCalledTimes(5);
      expect(expensesService.getExpensesCount).toHaveBeenCalledWith({
        report_id: 'is.null',
        state: 'in.(COMPLETE,DRAFT)',
      });
      expect(expensesService.getExpenses).toHaveBeenCalledTimes(2);
      expect(expensesService.getExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        report_id: 'is.null',
        state: 'in.(COMPLETE,DRAFT)',
        order: 'spent_at.desc,created_at.desc,id.desc',
      });

      expect(component.acc).toEqual(apiExpenses1);
    }));

    it('should call getMyExpenseCount with order if sortDir and sortParam are defined', fakeAsync(() => {
      component.ionViewWillEnter();
      component.loadExpenses$.next({
        pageNumber: 1,
        sortDir: 'asc',
        sortParam: 'approvalDate',
      });
      tick(500);

      expect(expensesService.getExpenses).toHaveBeenCalledTimes(2);
      expect(expensesService.getExpenses).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        report_id: 'is.null',
        state: 'in.(COMPLETE,DRAFT)',
        order: 'spent_at.desc,created_at.desc,id.desc',
      });
    }));

    it('should set myExpenses$, count$, isNewUser$ and isInfiniteScrollRequired', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      component.myExpenses$.subscribe((myExpenses) => {
        expect(myExpenses).toEqual(apiExpenses1);
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
        expect(expensesService.getExpenseStats).toHaveBeenCalledWith({
          state: 'in.(COMPLETE,DRAFT)',
          report_id: 'is.null',
        });
        expect(allExpenseCountHeader).toBe(3);
      });
      component.draftExpensesCount$.subscribe((draftExpensesCount) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledWith({
          report_id: 'is.null',
          state: 'in.(DRAFT)',
        });
        expect(draftExpensesCount).toBe(3);
      });
      expect(expensesService.getExpenseStats).toHaveBeenCalledTimes(2);
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
      component.loadExpenses$.subscribe((loadData) => {
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

      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadExpenses$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledTimes(1);
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
        is_policy_flagged: 'eq.true',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
        state: 'POLICY_VIOLATED',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadExpenses$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        state: 'POLICY_VIOLATED',
        is_policy_flagged: 'eq.true',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
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
        policy_amount: 'lt.0.0001',
        state: 'CANNOT_REPORT',
      });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadExpenses$.subscribe((loadData) => {
        expect(loadData).toEqual({ pageNumber: 1, sortDir: 'desc' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({
        policy_amount: 'lt.0.0001',
        state: 'CANNOT_REPORT',
      });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
    }));

    it('should set openReports$ and call doRefresh', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      expect(spenderReportsService.getAllReportsByParams).toHaveBeenCalledOnceWith({
        state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(expectedReportsSinglePageFiltered);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should set openReports$ and call doRefresh if report.approvals is defined', fakeAsync(() => {
      spenderReportsService.getAllReportsByParams.and.returnValue(of(expectedReportsSinglePageWithApproval));
      component.ionViewWillEnter();
      tick(500);

      expect(spenderReportsService.getAllReportsByParams).toHaveBeenCalledOnceWith({
        state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      });
      component.openReports$.subscribe((openReports) => {
        expect(openReports).toEqual(expectedReportsSinglePageFiltered);
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should return an empty array if no expenses are found and search is empty', fakeAsync(() => {
      expensesService.getExpensesCount.and.returnValue(of(0));
      component.ionViewWillEnter();
      component.loadExpenses$.next({
        pageNumber: 1,
        searchString: '',
        sortParam: 'category->name',
        sortDir: 'asc',
      });
      tick(500);

      component.myExpenses$.subscribe((res) => {
        expect(res).toEqual([]);
      });

      expect(expensesService.getExpenses).not.toHaveBeenCalled();
    }));

    it('should call pollDEIncompleteExpenses if expenses not completed DE scan', () => {
      //@ts-ignore
      spyOn(component, 'filterDEIncompleteExpenses').and.returnValue(dEincompleteExpenseIds);
      component.ionViewWillEnter();

      //@ts-ignore
      expect(component.pollDEIncompleteExpenses).toHaveBeenCalledWith(dEincompleteExpenseIds, apiExpenses1);
    });
  });

  it('HeaderState(): should return the headerState', () => {
    expect(component.HeaderState).toEqual(HeaderState);
  });

  describe('pollDEIncompleteExpenses()', () => {
    beforeEach(() => {
      expensesService.getExpenses.and.returnValue(of(apiExpenses1));
      //@ts-ignore
      spyOn(component, 'updateExpensesList').and.returnValue(apiExpenses1);
    });

    it('should call expenseService.getExpenses for dE incomplete expenses and return updated expenses', fakeAsync(() => {
      const dEincompleteExpenseIds = ['txfCdl3TEZ7K', 'txfCdl3TEZ7l', 'txfCdl3TEZ7m'];
      const dEincompleteExpenseIdParams: ExpensesQueryParams = {
        queryParams: { id: `in.(${dEincompleteExpenseIds.join(',')})` },
      };

      //@ts-ignore
      component.pollDEIncompleteExpenses(dEincompleteExpenseIds, apiExpenses1).subscribe((result) => {
        expect(expensesService.getExpenses).toHaveBeenCalledOnceWith({ ...dEincompleteExpenseIdParams.queryParams });
        expect(result).toEqual(apiExpenses1);
      });
      tick(5000);
      discardPeriodicTasks();
    }));

    it('should call expensesService.getExpenses 5 times and stop polling after 30 seconds', fakeAsync(() => {
      const dEincompleteExpenseIds = ['txfCdl3TEZ7K', 'txfCdl3TEZ7l', 'txfCdl3TEZ7m'];
      //@ts-ignore
      spyOn(component, 'filterDEIncompleteExpenses').and.returnValue(dEincompleteExpenseIds);
      //@ts-ignore
      component.pollDEIncompleteExpenses(dEincompleteExpenseIds, apiExpenses1).subscribe(() => {});

      // Simulate 30 seconds of time passing (the polling interval is 5 seconds)
      tick(30000);

      // After 30 seconds, polling should stop, so no further calls to getAllExpenses
      expect(expensesService.getExpenses).toHaveBeenCalledTimes(5); // If called every 5 seconds after the first 5 seconds

      // Cleanup
      discardPeriodicTasks();
    }));
  });

  describe('updateExpensesList', () => {
    beforeEach(() => {
      //@ts-ignore
      spyOn(component, 'isExpenseScanComplete').and.callThrough();
    });

    it('should update expenses with completed scans', () => {
      const updatedExpenses: Expense[] = [
        { ...apiExpenses1[0], extracted_data: { ...apiExpenses1[0].extracted_data, amount: 200 } },
      ];
      const dEincompleteExpenseIds = [apiExpenses1[0].id];

      //@ts-ignore
      component.isExpenseScanComplete.and.returnValue(true);

      //@ts-ignore
      const result = component.updateExpensesList(apiExpenses1, updatedExpenses, dEincompleteExpenseIds);

      expect(result).toEqual([updatedExpenses[0], apiExpenses1[1]]);
    });

    it('should not update expenses if scan is incomplete', () => {
      const updatedExpenses: Expense[] = [
        { ...apiExpenses1[0], extracted_data: { ...apiExpenses1[0].extracted_data, amount: 200 } },
      ];
      const dEincompleteExpenseIds = [apiExpenses1[0].id];

      // Mock isExpenseScanComplete to return false for the updated expense
      //@ts-ignore
      (component.isExpenseScanComplete as jasmine.Spy).and.returnValue(false);

      //@ts-ignore
      const result = component.updateExpensesList(apiExpenses1, updatedExpenses, dEincompleteExpenseIds);

      // Assert
      expect(result).toEqual(apiExpenses1); // No changes should occur
    });
  });

  describe('checkIfScanIsCompleted():', () => {
    it('should check if scan is complete and return true if the expense amount is not null and no other data is present', () => {
      const expense = {
        ...expenseData,
        amount: 100,
        claim_amount: null,
        extracted_data: null,
      };
      //@ts-ignore
      const result = component.isExpenseScanComplete(expense);
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if the expense user amount is present and no extracted data is available', () => {
      const expense = {
        ...expenseData,
        amount: null,
        claim_amount: 7500,
        extracted_data: null,
      };
      //@ts-ignore
      const result = component.isExpenseScanComplete(expense);
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if the required extracted data is present', () => {
      const expense = {
        ...expenseData,
        amount: null,
        claim_amount: null,
        extracted_data: {
          amount: 84.12,
          currency: 'USD',
          category: 'Professional Services',
          date: null,
          vendor_name: null,
          invoice_dt: null,
        },
      };
      //@ts-ignore
      const result = component.isExpenseScanComplete(expense);
      expect(result).toBeTrue();
    });

    it('should return true if the scan has expired', () => {
      const expense = {
        ...expenseData,
        amount: null,
        claim_amount: null,
        extracted_data: null,
      };
      const oneDaysAfter = dayjs(expense.created_at).add(1, 'day').toDate();
      jasmine.clock().mockDate(oneDaysAfter);

      //@ts-ignore
      const result = component.isExpenseScanComplete(expense);
      expect(result).toBeTrue();
    });
  });

  describe('isZeroAmountPerDiemOrMileage():', () => {
    it('should check if scan is complete and return true if it is per diem expense with amount 0', () => {
      const expense = {
        ...cloneDeep(expenseData),
        amount: 0,
      };
      expense.category.name = 'Per Diem';
      //@ts-ignore
      const result = component.isZeroAmountPerDiemOrMileage(expense);
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if it is per diem expense with user amount 0', () => {
      const expense = {
        ...cloneDeep(expenseData),
        amount: null,
        claim_amount: 0,
      };
      expense.category.name = 'Per Diem';
      //@ts-ignore
      const result = component.isZeroAmountPerDiemOrMileage(expense);
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if it is mileage expense with amount 0', () => {
      const expense = {
        ...cloneDeep(expenseData),
        amount: 0,
      };
      expense.category.name = 'Mileage';
      //@ts-ignore
      const result = component.isZeroAmountPerDiemOrMileage(expense);
      expect(result).toBeTrue();
    });

    it('should return false if org category is null', () => {
      const expense = cloneDeep(expenseData);
      expense.category.name = null;
      //@ts-ignore
      const result = component.isZeroAmountPerDiemOrMileage(expense);
      expect(result).toBeFalse();
    });
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
      expect(component.isSearchBarFocused).toBeTrue();
    });

    it('should clear the search text and not toggle isSearchBarFocused when isFromCancel is not specified', () => {
      component.clearText('');

      expect(component.simpleSearchText).toBe('');
      expect(inputElement.value).toBe('');
      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('keyup'));
      expect(component.isSearchBarFocused).toBeFalse();
    });
  });

  describe('isSelectionContainsException', () => {
    it('should return true when policyViolationsCount is greater than 0', () => {
      const result = component.isSelectionContainsException(1, 0, 0);
      expect(result).toBeTrue();
    });

    it('should return true when draftCount is greater than 0', () => {
      const result = component.isSelectionContainsException(0, 1, 0);
      expect(result).toBeTrue();
    });

    it('should return true when pendingTransactionsCount is greater than 0 and restrictPendingTransactionsEnabled is true', () => {
      component.restrictPendingTransactionsEnabled = true;
      const result = component.isSelectionContainsException(0, 0, 1);
      expect(result).toBeTrue();
    });

    it('should return false when all counts are 0 and restrictPendingTransactionsEnabled is false', () => {
      component.restrictPendingTransactionsEnabled = false;
      const result = component.isSelectionContainsException(0, 0, 0);
      expect(result).toBeFalse();
    });

    it('should return false when pendingTransactionsCount is greater than 0 but restrictPendingTransactionsEnabled is false', () => {
      component.restrictPendingTransactionsEnabled = false;
      const result = component.isSelectionContainsException(0, 0, 1);
      expect(result).toBeFalse();
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
      component.loadExpenses$ = new BehaviorSubject({
        searchString: 'example',
      });
      component.headerState = HeaderState.simpleSearch;
      component.allExpensesStats$ = of({ count: 10, amount: 1000 });
      spyOn(component, 'selectExpense');
      spyOn(component, 'setAllExpensesCountAndAmount');
      component.isConnected$ = of(true);
      spyOn(component, 'checkDeleteDisabled').and.returnValue(of(void 0));
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
      component.loadExpenses$ = new BehaviorSubject({});

      component.switchSelectionMode(apiExpenses1[0]);

      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toBe(HeaderState.base);
      expect(component.selectedElements).toEqual([]);
      expect(component.setAllExpensesCountAndAmount).toHaveBeenCalledTimes(1);
      expect(component.selectExpense).toHaveBeenCalledOnceWith(apiExpenses1[0]);
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

  describe('switchOutboxSelectionMode(): ', () => {
    beforeEach(() => {
      component.selectionMode = true;
      component.loadExpenses$ = new BehaviorSubject({
        searchString: 'example',
      });
      component.headerState = HeaderState.simpleSearch;
      component.allExpensesStats$ = of({ count: 10, amount: 1000 });
      spyOn(component, 'selectExpense');
      spyOn(component, 'setAllExpensesCountAndAmount');
      spyOn(component, 'setOutboxExpenseStatsOnSelect');
    });

    it('should set headerState to simpleSearch if searchString is defined in loadData', () => {
      component.switchOutboxSelectionMode();

      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toBe(HeaderState.simpleSearch);
      expect(component.selectedOutboxExpenses).toEqual([]);
      expect(component.selectExpense).not.toHaveBeenCalled();
    });

    it('should set headerState to base if searchString is defined in loadData and if expense is selected', () => {
      component.loadExpenses$ = new BehaviorSubject({});
      transactionService.getReportableExpenses.and.returnValue([]);
      transactionService.excludeCCCExpenses.and.returnValue([]);

      component.switchOutboxSelectionMode(apiExpenseRes[0]);

      expect(component.selectionMode).toBeFalse();
      expect(component.headerState).toBe(HeaderState.base);
      expect(component.selectedOutboxExpenses.length).toEqual(1);
      expect(component.setOutboxExpenseStatsOnSelect).toHaveBeenCalledTimes(2);
    });

    it('should update allExpensesStats$ and headerState if selectionMode is false', () => {
      component.selectionMode = false;

      component.switchOutboxSelectionMode();

      expect(component.selectionMode).toBeTrue();
      expect(component.headerState).toBe(HeaderState.multiselect);
      expect(component.setOutboxExpenseStatsOnSelect).not.toHaveBeenCalled();
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
    it('should call expensesService.getExpenseStats if loadExpenses contains queryParams', () => {
      component.loadExpenses$ = new BehaviorSubject({
        queryParams: {
          'matched_corporate_card_transactions->0->corporate_card_number': '8698',
        },
      });

      expensesService.getExpenseStats.and.returnValue(of(completeStats));
      component.setAllExpensesCountAndAmount();
      component.allExpensesStats$.subscribe((allExpenseStats) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          report_id: 'is.null',
          state: 'in.(COMPLETE,DRAFT)',
          'matched_corporate_card_transactions->0->corporate_card_number': '8698',
        });
        expect(allExpenseStats).toEqual({
          count: 3,
          amount: 30,
        });
      });
    });

    it('should call expensesService.getExpenseStats and initialize queryParams to empty object if loadData.queryParams is falsy', () => {
      component.loadExpenses$ = new BehaviorSubject({
        queryParams: null,
      });
      expensesService.getExpenseStats.and.returnValue(of(incompleteStats));
      component.setAllExpensesCountAndAmount();
      component.allExpensesStats$.subscribe((allExpenseStats) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          report_id: 'is.null',
          state: 'in.(COMPLETE,DRAFT)',
        });
        expect(allExpenseStats).toEqual({
          count: incompleteStats.data.count,
          amount: incompleteStats.data.total_amount,
        });
      });
    });

    it('should handle error in getExpenseStats and complete the observable', () => {
      component.loadExpenses$ = new BehaviorSubject({
        queryParams: {
          'matched_corporate_card_transactions->0->corporate_card_number': '8698',
        },
      });
      expensesService.getExpenseStats.and.returnValue(throwError(() => new Error('error message')));
      component.setAllExpensesCountAndAmount();
      component.allExpensesStats$.subscribe({
        error: (err) => {
          expect(err.message).toEqual('error message');
        },
      });
      expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
        report_id: 'is.null',
        state: 'in.(COMPLETE,DRAFT)',
        'matched_corporate_card_transactions->0->corporate_card_number': '8698',
      });
    });

    it('should delete queryParams.state if queryParams.or contains an element with state', () => {
      component.loadExpenses$ = new BehaviorSubject({
        queryParams: {
          or: ['state->DRAFT'],
          'matched_corporate_card_transactions->0->corporate_card_number': '8698',
          state: 'in.(COMPLETE,DRAFT)',
        },
      });

      expensesService.getExpenseStats.and.returnValue(of(completeStats));
      component.setAllExpensesCountAndAmount();
      component.allExpensesStats$.subscribe((allExpenseStats) => {
        expect(expensesService.getExpenseStats).toHaveBeenCalledOnceWith({
          report_id: 'is.null',
          or: ['state->DRAFT'],
          'matched_corporate_card_transactions->0->corporate_card_number': '8698',
        });
        expect(allExpenseStats).toEqual({
          count: 3,
          amount: 30,
        });
      });
    });
  });

  describe('setupActionSheet()', () => {
    it('should update actionSheetButtons', () => {
      spyOn(component, 'actionSheetButtonsHandler');
      component.setupActionSheet(orgSettingsRes, allowedExpenseTypes);
      expect(component.actionSheetButtons).toEqual(expectedActionSheetButtonRes);
    });

    it('should update actionSheetButtons without mileage', () => {
      spyOn(component, 'actionSheetButtonsHandler');
      const mockAllowedExpenseTypes = clone(allowedExpenseTypes);
      mockAllowedExpenseTypes.mileage = false;
      component.setupActionSheet(orgSettingsRes, mockAllowedExpenseTypes);
      expect(component.actionSheetButtons).toEqual(expectedActionSheetButtonsWithPerDiem);
    });

    it('should update actionSheetButtons without Per Diem', () => {
      spyOn(component, 'actionSheetButtonsHandler');
      const mockAllowedExpenseTypes = clone(allowedExpenseTypes);
      mockAllowedExpenseTypes.perDiem = false;
      component.setupActionSheet(orgSettingsRes, mockAllowedExpenseTypes);
      expect(component.actionSheetButtons).toEqual(expectedActionSheetButtonsWithMileage);
    });
  });

  describe('actionSheetButtonsHandler():', () => {
    it('should call trackingService and navigate to add_edit_per_diem if action is add per diem', () => {
      const handler = component.actionSheetButtonsHandler('Add per diem', 'add_edit_per_diem');
      handler();
      expect(trackingService.myExpensesActionSheetAction).toHaveBeenCalledOnceWith({
        Action: 'Add per diem',
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
      const handler = component.actionSheetButtonsHandler('Add mileage', 'add_edit_mileage');
      handler();
      expect(trackingService.myExpensesActionSheetAction).toHaveBeenCalledOnceWith({
        Action: 'Add mileage',
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

  it('getCardDetail(): should call corporateCreditCardService.getCorporateCards() method', (done) => {
    corporateCreditCardService.getCorporateCards.and.returnValue(
      of([corporateCardsResponseData[0], corporateCardsResponseData[1]])
    );
    const getCardDetailRes$ = component.getCardDetail();

    getCardDetailRes$.subscribe((data) => {
      expect(data).toEqual([uniqueCardsData[0], uniqueCardsData[1]]);
      done();
    });
    expect(corporateCreditCardService.getCorporateCards).toHaveBeenCalledTimes(1);
  });

  describe('ionViewWillLeave():', () => {
    it('should unsubscribe hardwareBackButton and update onPageExit', () => {
      component.hardwareBackButton = new Subscription();
      const unsubscribeSpy = spyOn(component.hardwareBackButton, 'unsubscribe');
      const onPageNextSpy = spyOn(component.onPageExit$, 'next');
      component.ionViewWillLeave();
      expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
      expect(onPageNextSpy).toHaveBeenCalledOnceWith(null);
    });

    it('should unsubscribe navigationSubscription', () => {
      component.navigationSubscription = new Subscription();
      component.hardwareBackButton = new Subscription();
      const navigationUnsubscribeSpy = spyOn(component.navigationSubscription, 'unsubscribe');
      const unsubscribeSpy = spyOn(component.hardwareBackButton, 'unsubscribe');
      const onPageNextSpy = spyOn(component.onPageExit$, 'next');

      component.ionViewWillLeave();
      expect(navigationUnsubscribeSpy).toHaveBeenCalledTimes(1);
      expect(onPageNextSpy).toHaveBeenCalledOnceWith(null);
      expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
    });
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
      component.loadExpenses$ = new BehaviorSubject({
        pageNumber: 2,
      });
    });

    it('should increment currentPageNumber and emit updated params and call complete() after 1s', fakeAsync(() => {
      const mockEvent = { target: { complete: jasmine.createSpy('complete') } };

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadExpenses$.getValue().pageNumber).toBe(3);
      tick(1000);
      expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
    }));

    it('should increment currentPageNumber and emit updated params if target is not defined', () => {
      const mockEvent = {};

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadExpenses$.getValue().pageNumber).toBe(3);
    });

    it('should increment currentPageNumber and emit updated params if event if undefined', () => {
      const mockEvent = undefined;

      component.loadData(mockEvent);

      expect(component.currentPageNumber).toBe(3);
      expect(component.loadExpenses$.getValue().pageNumber).toBe(3);
    });
  });

  describe('doRefresh():', () => {
    beforeEach(() => {
      transactionService.clearCache.and.returnValue(of(null));
      component.currentPageNumber = 2;
      component.loadExpenses$ = new BehaviorSubject({
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
      expect(component.loadExpenses$.getValue().pageNumber).toBe(1);
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
      expect(component.loadExpenses$.getValue().pageNumber).toBe(1);
      expect(mockEvent.target.complete).toHaveBeenCalledTimes(1);
    }));

    it('should refresh data if target is not defined', fakeAsync(() => {
      const mockEvent = {};

      component.doRefresh(mockEvent);
      tick(1000);

      expect(component.selectedElements).toEqual([]);
      expect(transactionService.clearCache).toHaveBeenCalledTimes(1);
      expect(component.currentPageNumber).toBe(1);
      expect(component.loadExpenses$.getValue().pageNumber).toBe(1);
    }));
  });

  it('syncOutboxExpenses(): should call transactionOutboxService and do a refresh', fakeAsync(() => {
    const mockFormattedTransactions = cloneDeep(apiExpenseRes);
    const mockPendingTransactions = cloneDeep(txnList);
    spyOn(component, 'formatTransactions').and.returnValues(mockFormattedTransactions, []);
    transactionOutboxService.getPendingTransactions.and.returnValues(mockPendingTransactions, []);
    transactionOutboxService.sync.and.resolveTo(undefined);
    spyOn(component, 'doRefresh');

    component.syncOutboxExpenses();
    tick(100);

    expect(component.pendingTransactions).toEqual([]);
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
      myExpenseService.generatePotentialDuplicatesFilterPills.and.callFake((filterPill, filters) => {
        filterPill.push(potentialDuplicatesFilterPill);
      });
    });

    it('should return filterPills based on the properties present in filters', () => {
      const filterPillRes = component.generateFilterPills(expenseWithPotentialDuplicateFilterData);
      expect(filterPillRes).toEqual(expectedFilterPill1);
    });

    it('should return filterPills if state, type and cardNumbers properties are not present in filters passed as argument', () => {
      const filterPillRes = component.generateFilterPills(expenseFiltersData2);
      expect(filterPillRes).toEqual(expectedFilterPill2);
    });
  });

  describe('addNewFiltersToParams(): ', () => {
    beforeEach(() => {
      sharedExpenseService.generateCardNumberParams.and.returnValue({
        'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
        or: [],
      });
      sharedExpenseService.generateDateParams.and.returnValue({
        'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
        and: '(spent_at.gte.March,spent_at.lt.April)',
        or: [],
      });
      sharedExpenseService.generateReceiptAttachedParams.and.returnValue({
        'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
        and: '(spent_at.gte.March,spent_at.lt.April)',
        or: [],
      });
      sharedExpenseService.generatePotentialDuplicatesParams.and.returnValue({
        'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
        and: '(spent_at.gte.March,spent_at.lt.April)',
        or: [],
      });
      sharedExpenseService.generateStateFilters.and.returnValue({
        'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
        and: '(spent_at.gte.March,spent_at.lt.April)',
        or: [],
      });
      sharedExpenseService.generateTypeFilters.and.returnValue({
        'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
        and: '(spent_at.gte.March,spent_at.lt.April)',
        or: [],
      });
      sharedExpenseService.setSortParams.and.returnValue({ sortDir: 'asc' });
      sharedExpenseService.generateSplitExpenseParams.and.returnValue({
        or: ['(is_split.eq.true)'],
        'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
        and: '(spent_at.gte.March,spent_at.lt.April)',
      });
    });

    it('should update queryParams if filter state is not defined', () => {
      component.filters = {};

      const currentParams = component.addNewFiltersToParams();

      expect(sharedExpenseService.generateCardNumberParams).toHaveBeenCalledOnceWith({ or: [] }, component.filters);
      expect(sharedExpenseService.generateDateParams).toHaveBeenCalledOnceWith(
        { 'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)', or: [] },
        component.filters
      );
      expect(sharedExpenseService.generateReceiptAttachedParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generatePotentialDuplicatesParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generateStateFilters).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generateTypeFilters).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.setSortParams).toHaveBeenCalledOnceWith({ pageNumber: 1 }, component.filters);
      expect(sharedExpenseService.generateSplitExpenseParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );

      expect(currentParams).toEqual(expectedCurrentParamsWoFilterState);
      expect(component.reviewMode).toBeFalse();
    });

    it('should update queryParams if filter state includes only DRAFT', () => {
      component.filters = {
        state: ['DRAFT'],
      };

      const currentParams = component.addNewFiltersToParams();

      expect(sharedExpenseService.generateCardNumberParams).toHaveBeenCalledOnceWith({ or: [] }, component.filters);
      expect(sharedExpenseService.generateDateParams).toHaveBeenCalledOnceWith(
        { 'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)', or: [] },
        component.filters
      );
      expect(sharedExpenseService.generateReceiptAttachedParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generatePotentialDuplicatesParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generateStateFilters).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generateTypeFilters).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.setSortParams).toHaveBeenCalledOnceWith({ pageNumber: 1 }, component.filters);
      expect(sharedExpenseService.generateSplitExpenseParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );

      expect(currentParams).toEqual(expectedCurrentParamsDraftState);
      expect(component.reviewMode).toBeTrue();
    });

    it('should update queryParams if filter state includes only CANNOT_REPORT', () => {
      component.filters = {
        state: ['CANNOT_REPORT'],
      };

      const currentParams = component.addNewFiltersToParams();

      expect(sharedExpenseService.generateCardNumberParams).toHaveBeenCalledOnceWith({ or: [] }, component.filters);
      expect(sharedExpenseService.generateDateParams).toHaveBeenCalledOnceWith(
        { 'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)', or: [] },
        component.filters
      );
      expect(sharedExpenseService.generateReceiptAttachedParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generatePotentialDuplicatesParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generateStateFilters).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generateTypeFilters).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.setSortParams).toHaveBeenCalledOnceWith({ pageNumber: 1 }, component.filters);
      expect(sharedExpenseService.generateSplitExpenseParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );

      expect(currentParams).toEqual(expectedCurrentParamsCannotReportState);
      expect(component.reviewMode).toBeTrue();
    });

    it('should update queryParams if filter state includes both DRAFT and CANNOT_REPORT', () => {
      component.filters = {
        state: ['DRAFT', 'CANNOT_REPORT'],
      };

      const currentParams = component.addNewFiltersToParams();

      expect(sharedExpenseService.generateCardNumberParams).toHaveBeenCalledOnceWith({ or: [] }, component.filters);
      expect(sharedExpenseService.generateDateParams).toHaveBeenCalledOnceWith(
        { 'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)', or: [] },
        component.filters
      );
      expect(sharedExpenseService.generateReceiptAttachedParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generatePotentialDuplicatesParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generateStateFilters).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.generateTypeFilters).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );
      expect(sharedExpenseService.setSortParams).toHaveBeenCalledOnceWith({ pageNumber: 1 }, component.filters);
      expect(sharedExpenseService.generateSplitExpenseParams).toHaveBeenCalledOnceWith(
        {
          'matched_corporate_card_transactions->0->corporate_card_number': 'in.(789)',
          and: '(spent_at.gte.March,spent_at.lt.April)',
          or: [],
        },
        component.filters
      );

      expect(currentParams).toEqual(expectedCurrentParamsWithDraftCannotReportState);
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
      component.loadExpenses$ = new BehaviorSubject({
        pageNumber: 1,
      });
      component.currentPageNumber = 2;
      myExpenseService.convertSelectedOptionsToExpenseFilters.and.returnValue({ sortDir: 'asc', splitExpense: 'YES' });
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
      expect(myExpenseService.convertSelectedOptionsToExpenseFilters).toHaveBeenCalledOnceWith(selectedFilters2);
      expect(component.filters).toEqual({ sortDir: 'asc', splitExpense: 'YES' });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadExpenses$.subscribe((loadData) => {
        expect(loadData).toEqual({ searchString: 'example' });
      });

      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({ sortDir: 'asc', splitExpense: 'YES' });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      expect(trackingService.myExpensesFilterApplied).toHaveBeenCalledOnceWith({
        filterLabels: ['sortDir', 'splitExpense'],
      });
    }));

    it('should call modalController and myExpensesService if cardNumbers is undefined', fakeAsync(() => {
      component.cardNumbers = undefined;

      component.openFilters('approvalDate');
      tick(200);

      expect(modalController.create).toHaveBeenCalledOnceWith(modalControllerParams2);

      expect(myExpenseService.convertSelectedOptionsToExpenseFilters).toHaveBeenCalledOnceWith(selectedFilters2);
      expect(component.filters).toEqual({ sortDir: 'asc', splitExpense: 'YES' });
      expect(component.currentPageNumber).toBe(1);
      expect(component.addNewFiltersToParams).toHaveBeenCalledTimes(1);
      component.loadExpenses$.subscribe((loadExpenses) => {
        expect(loadExpenses).toEqual({ searchString: 'example' });
      });
      expect(component.generateFilterPills).toHaveBeenCalledOnceWith({ sortDir: 'asc', splitExpense: 'YES' });
      expect(component.filterPills).toEqual(creditTxnFilterPill);
      expect(trackingService.myExpensesFilterApplied).toHaveBeenCalledOnceWith({
        filterLabels: ['sortDir', 'splitExpense'],
      });
    }));
  });

  it('clearFilters(): should clear the filters and call generateFilterPills', () => {
    component.filters = {
      sortDir: 'asc',
      sortParam: 'category->name',
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
    component.loadExpenses$.subscribe((data) => {
      expect(data).toEqual({
        pageNumber: 1,
        searchString: 'example',
      });
    });
    expect(component.generateFilterPills).toHaveBeenCalledOnceWith({});
    expect(component.filterPills).toEqual(creditTxnFilterPill);
  });

  describe('selectExpense(): ', () => {
    beforeEach(() => {
      sharedExpenseService.getReportableExpenses.and.returnValue(apiExpenses1);
      component.allExpensesCount = 2;
      spyOn(component, 'setExpenseStatsOnSelect');
      component.isConnected$ = of(true);
      spyOn(component, 'checkDeleteDisabled').and.returnValue(of(void 0));
      component.selectedElements = cloneDeep(apiExpenses1);
      sharedExpenseService.isMergeAllowed.and.returnValue(true);
      sharedExpenseService.excludeCCCExpenses.and.returnValue(apiExpenses1);
    });

    it('should remove an expense from selectedElements if it is present in selectedElements', () => {
      sharedExpenseService.getReportableExpenses.and.returnValue([]);
      const expense = apiExpenses1[0];
      component.selectedElements = cloneDeep(apiExpenses1);

      component.selectExpense(expense);

      expect(component.selectedElements).toEqual([apiExpenses1[1]]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeFalse();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(sharedExpenseService.isMergeAllowed).toHaveBeenCalledOnceWith([apiExpenses1[1]]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should remove an expense from selectedElements if it is present in selectedElements', () => {
      sharedExpenseService.getReportableExpenses.and.returnValue([]);
      component.allExpensesCount = 3;

      component.selectedElements = cloneDeep(cloneDeep(apiExpenses1));

      component.selectExpense(expenseData);

      expect(component.selectedElements).toEqual([...apiExpenses1, expenseData]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeTrue();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(sharedExpenseService.isMergeAllowed).toHaveBeenCalledOnceWith([...apiExpenses1, expenseData]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should remove an expense from selectedElements if it is present in selectedElements and allExpenseCount is not equal to length of selectedElements', () => {
      sharedExpenseService.getReportableExpenses.and.returnValue([]);

      component.selectedElements = cloneDeep(apiExpenses1);

      component.selectExpense(apiExpenses1[0]);

      expect(component.selectedElements).toEqual([apiExpenses1[1]]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeFalse();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(sharedExpenseService.isMergeAllowed).toHaveBeenCalledOnceWith([apiExpenses1[1]]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should update expenseToBeDeleted if selectedElements is an array of atleast 1', () => {
      sharedExpenseService.excludeCCCExpenses.and.returnValue([apiExpenses1[1]]);
      component.selectedElements = cloneDeep(apiExpenses1);
      component.selectExpense(apiExpenses1[0]);

      expect(component.selectedElements).toEqual([apiExpenses1[1]]);
      expect(component.expensesToBeDeleted).toEqual([apiExpenses1[1]]);
      expect(component.cccExpenses).toBe(0);
      expect(component.selectAll).toBeFalse();
    });

    it('should remove an expense from selectedElements if it is present in selectedElements and tx_id is not present in expense', () => {
      sharedExpenseService.getReportableExpenses.and.returnValue([]);
      component.allExpensesCount = 0;
      const expense = cloneDeep(apiExpenses1[0]);
      expense.id = undefined;
      component.selectedElements = cloneDeep(apiExpenses1);
      component.selectedElements[0].id = undefined;

      component.selectExpense(expense);

      expect(component.selectedElements).toEqual([apiExpenses1[1]]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeFalse();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(sharedExpenseService.isMergeAllowed).toHaveBeenCalledOnceWith([apiExpenses1[1]]);
      expect(component.isMergeAllowed).toBeTrue();
    });
  });

  it('setExpenseStatsOnSelect(): should update allExpenseStats$', () => {
    component.selectedElements = apiExpenses1;
    component.setExpenseStatsOnSelect();
    component.allExpensesStats$.subscribe((expenseStats) => {
      expect(expenseStats).toEqual({
        count: 2,
        amount: 25,
      });
    });
  });

  describe('goToTransaction():', () => {
    it('should navigate to add_edit_mileage page if category is mileage', () => {
      component.goToTransaction({
        expense: { ...expenseData, category: { ...expenseData.category, name: 'mileage' } },
        expenseIndex: 1,
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_mileage',
        { id: expenseData.id, persist_filters: true },
      ]);
    });

    it('should navigate to add_edit_per_diem if category is per diem', () => {
      component.goToTransaction({
        expense: { ...expenseData, category: { ...expenseData.category, name: 'per diem' } },
        expenseIndex: 1,
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_per_diem',
        { id: expenseData.id, persist_filters: true },
      ]);
    });

    it('should navigate to add_edit_expense if category is something else', () => {
      component.goToTransaction({ expense: apiExpenses1[0], expenseIndex: 1 });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_expense',
        { id: apiExpenses1[0].id, persist_filters: true },
      ]);
    });

    it('should not navigate to any other page, if category is not present', () => {
      component.goToTransaction({ expense: { ...apiExpenses1[0], category: null }, expenseIndex: 1 });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_expense',
        { id: apiExpenses1[0].id, persist_filters: true },
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
      spyOn(component, 'unreportableExpenseExceptionHandler');
      spyOn(component, 'reportableExpenseDialogHandler');
    });

    describe('when restrictPendingTransactionsEnabled is false', () => {
      beforeEach(() => {
        // sharedExpenseService.restrictPendingTransactionsEnabled.and.returnValues(false);
      });

      it('should call showNonReportableExpenseSelectedToast and return if selectedElement length is zero', fakeAsync(() => {
        const expenses = cloneDeep(apiExpenses1);
        component.selectedElements = expenses.map((expense) => {
          return { ...expense, id: null };
        });
        component.openCreateReportWithSelectedIds('oldReport');
        tick(100);
        expect(component.showNonReportableExpenseSelectedToast).toHaveBeenCalledOnceWith(
          'Please select one or more expenses to be reported'
        );
        expect(component.openCriticalPolicyViolationPopOver).not.toHaveBeenCalled();
        expect(component.showOldReportsMatBottomSheet).not.toHaveBeenCalled();
        expect(component.showNewReportModal).not.toHaveBeenCalled();
      }));

      it('should call unreportableExpenseExceptionHandler if none of the reportable expenses are selected', fakeAsync(() => {
        component.selectedElements = cloneDeep(apiExpenses1);
        sharedExpenseService.isCriticalPolicyViolatedExpense.and.returnValues(true, true);
        sharedExpenseService.isExpenseInDraft.and.returnValues(false, true);
        component.openCreateReportWithSelectedIds('oldReport');
        tick(100);
        expect(sharedExpenseService.isCriticalPolicyViolatedExpense).toHaveBeenCalledTimes(2);
        expect(sharedExpenseService.isCriticalPolicyViolatedExpense).toHaveBeenCalledWith(apiExpenses1[0]);
        expect(sharedExpenseService.isCriticalPolicyViolatedExpense).toHaveBeenCalledWith(apiExpenses1[1]);

        expect(sharedExpenseService.isExpenseInDraft).toHaveBeenCalledTimes(2);
        expect(sharedExpenseService.isExpenseInDraft).toHaveBeenCalledWith(apiExpenses1[0]);
        expect(sharedExpenseService.isExpenseInDraft).toHaveBeenCalledWith(apiExpenses1[1]);

        component.isReportableExpensesSelected = false;

        expect(component.unreportableExpenseExceptionHandler).toHaveBeenCalledOnceWith(1, 2, 0);
      }));

      it('should call showOldReportsMatBottomSheet if reportType is oldReport', fakeAsync(() => {
        component.selectedElements = cloneDeep(apiExpenses1);
        component.isReportableExpensesSelected = true;
        sharedExpenseService.isCriticalPolicyViolatedExpense.and.returnValues(false, false);
        sharedExpenseService.isExpenseInDraft.and.returnValues(false, false);
        component.openCreateReportWithSelectedIds('oldReport');
        tick(100);
        expect(trackingService.addToReport).toHaveBeenCalled();
        expect(component.showOldReportsMatBottomSheet).toHaveBeenCalledOnceWith();
      }));

      it('should call showOldReportsMatBottomSheet if reportType is newReport', fakeAsync(() => {
        component.selectedElements = cloneDeep(apiExpenses1);
        component.isReportableExpensesSelected = true;
        sharedExpenseService.isCriticalPolicyViolatedExpense.and.returnValues(false, false);
        sharedExpenseService.isExpenseInDraft.and.returnValues(false, false);
        component.openCreateReportWithSelectedIds('newReport');
        tick(100);
        expect(trackingService.addToReport).toHaveBeenCalled();
        expect(component.showNewReportModal).toHaveBeenCalledOnceWith();
      }));

      it('should call reportableExpenseDialogHandler if totalUnreportableCount greater than 0', fakeAsync(() => {
        component.selectedElements = cloneDeep(apiExpenses1);
        component.isReportableExpensesSelected = true;
        sharedExpenseService.isCriticalPolicyViolatedExpense.and.returnValues(false, false);
        sharedExpenseService.isExpenseInDraft.and.returnValues(false, true);
        component.openCreateReportWithSelectedIds('newReport');
        tick(100);
        expect(trackingService.addToReport).toHaveBeenCalled();
        expect(component.reportableExpenseDialogHandler).toHaveBeenCalledWith(1, 0, 0, 'newReport');
      }));
    });

    describe('when restrictPendingTransactionsEnabled is true', () => {
      beforeEach(() => {
        component.restrictPendingTransactionsEnabled = true;
      });

      it('should call showNonReportableExpenseSelectedToast and return if selectedElement length is zero', fakeAsync(() => {
        const expenses = cloneDeep(apiExpenses1);
        component.selectedElements = expenses.map((expense) => {
          return { ...expense, id: null };
        });
        component.openCreateReportWithSelectedIds('oldReport');
        tick(100);
        expect(component.showNonReportableExpenseSelectedToast).toHaveBeenCalledOnceWith(
          'Please select one or more expenses to be reported'
        );
        expect(component.openCriticalPolicyViolationPopOver).not.toHaveBeenCalled();
        expect(component.showOldReportsMatBottomSheet).not.toHaveBeenCalled();
        expect(component.showNewReportModal).not.toHaveBeenCalled();
      }));

      it('should call doesExpenseHavePendingCardTransaction', fakeAsync(() => {
        component.selectedElements = cloneDeep(apiExpenses1);
        sharedExpenseService.isCriticalPolicyViolatedExpense.and.returnValues(true, true);
        sharedExpenseService.isExpenseInDraft.and.returnValues(false, true);
        component.restrictPendingTransactionsEnabled = true;
        component.openCreateReportWithSelectedIds('oldReport');
        tick(100);
        expect(sharedExpenseService.doesExpenseHavePendingCardTransaction).toHaveBeenCalledTimes(2);
        expect(sharedExpenseService.doesExpenseHavePendingCardTransaction).toHaveBeenCalledWith(apiExpenses1[0]);
        expect(sharedExpenseService.doesExpenseHavePendingCardTransaction).toHaveBeenCalledWith(apiExpenses1[1]);
        component.isReportableExpensesSelected = false;
        expect(component.unreportableExpenseExceptionHandler).toHaveBeenCalledOnceWith(1, 2, 0);
      }));
    });
  });

  describe('unreportableExpenseExceptionHandler():', () => {
    beforeEach(() => {
      spyOn(component, 'showNonReportableExpenseSelectedToast');
      // sharedExpenseService.restrictPendingTransactionsEnabled.and.returnValues(true);
    });

    it('should call showNonReportableExpenseSelectedToast when mix of expense types are selected', () => {
      component.unreportableExpenseExceptionHandler(1, 1, 1);
      expect(component.showNonReportableExpenseSelectedToast).toHaveBeenCalledOnceWith(
        "You can't add draft expenses and expenses with critical policy violation & pending transactions."
      );
    });

    it('should call showNonReportableExpenseSelectedToast when mix of draft and policy violation types are selected', () => {
      component.unreportableExpenseExceptionHandler(1, 1, 0);
      expect(component.showNonReportableExpenseSelectedToast).toHaveBeenCalledOnceWith(
        "You can't add draft expenses & expenses with critical policy violations to a report."
      );
    });
  });

  describe('reportableExpenseDialogHandler():', () => {
    beforeEach(() => {
      spyOn(component, 'openCriticalPolicyViolationPopOver');
      // sharedExpenseService.restrictPendingTransactionsEnabled.and.returnValues(true);
    });

    describe('reportableExpenseDialogHandler():', () => {
      it('should set proper message when only draft count is greater than 0', () => {
        component.reportableExpenseDialogHandler(1, 0, 0, 'newReport');
        expect(component.openCriticalPolicyViolationPopOver).toHaveBeenCalledWith({
          title: "Can't add these expenses...",
          message: '1 expense is in draft state.',
          reportType: 'newReport',
        });
      });

      it('should set proper message when only policy violation  count is greater than 0', () => {
        component.reportableExpenseDialogHandler(0, 1, 0, 'newReport');
        expect(component.openCriticalPolicyViolationPopOver).toHaveBeenCalledWith({
          title: "Can't add these expenses...",
          message: '1 expense with Critical Policy Violations.',
          reportType: 'newReport',
        });
      });

      it('should set proper message when only pendingTransactionsCount  count is greater than 0', () => {
        component.reportableExpenseDialogHandler(0, 0, 1, 'newReport');
        expect(component.openCriticalPolicyViolationPopOver).toHaveBeenCalledWith({
          title: "Can't add these expenses...",
          message: '1 expense with pending transactions.',
          reportType: 'newReport',
        });
      });

      it('should set proper message when policy violation and pendingTransactionsCount  count is greater than 0', () => {
        component.reportableExpenseDialogHandler(0, 1, 1, 'newReport');
        expect(component.openCriticalPolicyViolationPopOver).toHaveBeenCalledWith({
          title: "Can't add these expenses...",
          message: '1 expense with pending transactions.<br><br>1 expense with Critical Policy Violations.',
          reportType: 'newReport',
        });
      });
    });
  });

  it('showNewReportModal(): should open modalController and call showAddToReportSuccessToast', fakeAsync(() => {
    component.selectedElements = apiExpenses1;
    sharedExpenseService.getReportableExpenses.and.returnValue(apiExpenses1);
    const addExpenseToNewReportModalSpy = jasmine.createSpyObj('addExpenseToNewReportModal', [
      'present',
      'onDidDismiss',
    ]);
    addExpenseToNewReportModalSpy.onDidDismiss.and.resolveTo({
      data: { report: expectedReportsSinglePage[0], message: 'new report is created' },
    });
    modalController.create.and.resolveTo(addExpenseToNewReportModalSpy);
    modalProperties.getModalDefaultProperties.and.returnValue(fyModalProperties);
    spyOn(component, 'showAddToReportSuccessToast');

    component.showNewReportModal();
    tick(100);
    expect(modalController.create).toHaveBeenCalledOnceWith(newReportModalParams2);
    expect(component.showAddToReportSuccessToast).toHaveBeenCalledOnceWith({
      report: expectedReportsSinglePage[0],
      message: 'new report is created',
    });
  }));

  it('openCreateReport(): should navigate to my_create_report', () => {
    component.openCreateReport();

    expect(trackingService.clickCreateReport).toHaveBeenCalledTimes(1);

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_create_report']);
  });

  describe('openReviewExpenses(): ', () => {
    beforeEach(() => {
      component.loadExpenses$ = new BehaviorSubject({ pageNumber: 1 });

      component.selectedElements = apiExpenses1;
      expensesService.getAllExpenses.and.returnValue(of(apiExpenses1));
      spyOn(component, 'filterExpensesBySearchString').and.returnValue(true);

      expensesService.getExpenseById.withArgs(apiExpenses1[0].id).and.returnValue(of(apiExpenses1[0]));
      expensesService.getExpenseById.withArgs(apiExpenses1[1].id).and.returnValue(of(apiExpenses1[1]));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo(true);
    });

    it('should call getAllExpenses if sortParams and sortDir is undefined in loadData$ and selectedElement length is zero', fakeAsync(() => {
      component.selectedElements = [];
      component.openReviewExpenses();
      tick(100);

      expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: Object({ report_id: 'is.null', state: 'in.(COMPLETE,DRAFT)' }),
        order: 'spent_at.desc,created_at.desc,id.desc',
      });
      expect(component.filterExpensesBySearchString).not.toHaveBeenCalled();
    }));

    it('should call getAllExpenses and filterExpensesBySearchString if searchString, sortParams and sortDir are defined in loadData$ and selectedElement length is zero', fakeAsync(() => {
      component.loadExpenses$ = new BehaviorSubject({
        sortDir: 'asc',
        sortParam: 'category->name',
        searchString: 'example',
      });
      component.selectedElements = [];
      component.openReviewExpenses();
      tick(100);

      expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: { report_id: 'is.null', state: 'in.(COMPLETE,DRAFT)' },
        order: 'category->name.asc',
      });
      expect(component.filterExpensesBySearchString).toHaveBeenCalledTimes(2);
      expect(component.filterExpensesBySearchString).toHaveBeenCalledWith(apiExpenses1[0], 'example');
    }));

    it('should navigate to add_edit_mileage if org_category is mileage and selectedElement length is greater than zero', fakeAsync(() => {
      component.selectedElements = [mileageExpenseWithDistance, apiExpenses1[1]];
      expensesService.getAllExpenses.and.returnValue(of([mileageExpenseWithDistance, apiExpenses1[1]]));
      expensesService.getExpenseById.and.returnValue(of(mileageExpenseWithDistance));
      component.openReviewExpenses();
      tick(100);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(mileageExpenseWithDistance.id);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_mileage',
        { id: 'txcSFe6efB6R', txnIds: JSON.stringify(['txcSFe6efB6R', 'tx5WDG9lxBDT']), activeIndex: 0 },
      ]);
    }));

    it('should navigate to add_edit_per_diem if org_category is Per Diem and selectedElement length is greater than zero', fakeAsync(() => {
      component.selectedElements = [perDiemExpenseWithSingleNumDays, apiExpenses1[1]];
      expensesService.getAllExpenses.and.returnValue(of([perDiemExpenseWithSingleNumDays, apiExpenses1[1]]));
      expensesService.getExpenseById.and.returnValue(of(perDiemExpenseWithSingleNumDays));

      component.openReviewExpenses();
      tick(100);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(perDiemExpenseWithSingleNumDays.id);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_per_diem',
        { id: 'txcSFe6efB6R', txnIds: JSON.stringify(['txcSFe6efB6R', 'tx5WDG9lxBDT']), activeIndex: 0 },
      ]);
    }));

    it('should navigate to add_edit_expense if org_category is not amongst mileage and per diem and selectedElement length is greater than zero', fakeAsync(() => {
      component.selectedElements = apiExpenses1;
      expensesService.getAllExpenses.and.returnValue(of(apiExpenses1));
      expensesService.getExpenseById.and.returnValue(of(apiExpenses1[0]));
      component.openReviewExpenses();
      tick(100);

      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(apiExpenses1[0].id);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_expense',
        { id: 'txDDLtRaflUW', txnIds: '["txDDLtRaflUW","tx5WDG9lxBDT"]', activeIndex: 0 },
      ]);
    }));
  });

  describe('filterExpensesBySearchString(): ', () => {
    it('should return true if expense consist of searchString', () => {
      const expectedFilteredExpenseRes = component.filterExpensesBySearchString(expenseData, 'usvKA4X8Ugcr');

      expect(expectedFilteredExpenseRes).toBeTrue();
    });

    it('should return false if expense does not consist of searchString', () => {
      const expectedFilteredExpenseRes = component.filterExpensesBySearchString(expenseData, 'Software');

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

    expect(modalController.create).toHaveBeenCalledOnceWith(addExpenseToReportModalParams2);
    expect(component.doRefresh).toHaveBeenCalledTimes(1);
  }));

  describe('showAddToReportSuccessToast():', () => {
    let expensesAddedToReportSnackBarSpy: jasmine.SpyObj<MatSnackBarRef<ToastMessageComponent>>;
    beforeEach(() => {
      expensesAddedToReportSnackBarSpy = jasmine.createSpyObj('expensesAddedToReportSnackBar', ['onAction']);
      expensesAddedToReportSnackBarSpy.onAction.and.returnValue(of(undefined));
      matSnackBar.openFromComponent.and.returnValue(expensesAddedToReportSnackBarSpy);
      snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes2);
      spyOn(component, 'doRefresh');
    });

    it('should navigate to my_view_report and open matSnackbar', () => {
      component.showAddToReportSuccessToast({
        message: 'Expense added to report successfully',
        report: expectedReportsSinglePage[0],
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

    it('should navigate to my_view_report with newly created report id in case of adding it to new report and open matSnackbar', () => {
      component.showAddToReportSuccessToast({
        message: 'Expense added to report successfully',
        report: expectedReportsSinglePage[0],
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
  });

  it('addTransactionsToReport(): should show loader call for spenderReportsService and hide the loader', (done) => {
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo(true);

    spenderReportsService.addExpenses.and.returnValue(of(null));
    component
      .addTransactionsToReport(expectedReportsSinglePage[0], ['tx5fBcPBAxLv'])
      .pipe(
        tap((updatedReport) => {
          expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Adding expense to report');
          expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['tx5fBcPBAxLv']);
          expect(updatedReport).toEqual(expectedReportsSinglePage[0]);
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
      component.selectedElements = apiExpenses1;
      component.openReports$ = of(expectedReportsSinglePage);
      sharedExpenseService.getReportableExpenses.and.returnValue(apiExpenses1);
      spyOn(component, 'showAddToReportSuccessToast');
    });

    it('should call matBottomSheet.open and call showAddToReportSuccessToast if data.report is defined', () => {
      component.openReports$ = of(expectedReportsSinglePageSubmitted);
      spyOn(component, 'addTransactionsToReport').and.returnValue(of(expectedReportsSinglePageSubmitted[2]));

      matBottomsheet.open.and.returnValue({
        afterDismissed: () =>
          of({
            report: expectedReportsSinglePageSubmitted[2],
          }),
      } as MatBottomSheetRef<{report: Report}>);

      component.showOldReportsMatBottomSheet();

      expect(matBottomsheet.open).toHaveBeenCalledOnceWith(<any>AddTxnToReportDialogComponent, {
        data: { openReports: expectedReportsSinglePageSubmitted },
        panelClass: ['mat-bottom-sheet-1'],
      });
      expect(component.addTransactionsToReport).toHaveBeenCalledOnceWith(expectedReportsSinglePageSubmitted[2], [
        'txDDLtRaflUW',
        'tx5WDG9lxBDT',
      ]);
      expect(component.showAddToReportSuccessToast).toHaveBeenCalledOnceWith({
        message: 'Expenses added to report successfully',
        report: expectedReportsSinglePageSubmitted[2],
      });
    });

    it('should call matBottomSheet.open and call showAddToReportSuccessToast if data.report is defined and rp_state is draft', () => {
      const mockReportData = cloneDeep(expectedReportsSinglePage);
      mockReportData[0].state = 'DRAFT';
      component.openReports$ = of(mockReportData);
      spyOn(component, 'addTransactionsToReport').and.returnValue(of(mockReportData[0]));
      matBottomsheet.open.and.returnValue({
        afterDismissed: () =>
          of({
            report: mockReportData[0],
          }),
      } as MatBottomSheetRef<{report: Report}>);

      component.showOldReportsMatBottomSheet();
      expect(matBottomsheet.open).toHaveBeenCalledOnceWith(<any>AddTxnToReportDialogComponent, {
        data: { openReports: mockReportData },
        panelClass: ['mat-bottom-sheet-1'],
      });

      expect(component.addTransactionsToReport).toHaveBeenCalledOnceWith(mockReportData[0], [
        'txDDLtRaflUW',
        'tx5WDG9lxBDT',
      ]);
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
      } as MatBottomSheetRef<{report: Report}>);

      component.showOldReportsMatBottomSheet();
      expect(matBottomsheet.open).toHaveBeenCalledOnceWith(<any>AddTxnToReportDialogComponent, {
        data: { openReports: expectedReportsSinglePage },
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
      component.expensesToBeDeleted = apiExpenses1;
    });

    it('should update selectedElements and call deleteBulk method if expenseToBeDeleted is defined', () => {
      component.deleteSelectedExpenses([]);
      expect(transactionOutboxService.deleteBulkOfflineExpenses).not.toHaveBeenCalledOnceWith([], []);
      expect(component.selectedElements).toEqual(apiExpenses1);
      expect(expensesService.deleteExpenses).toHaveBeenCalledOnceWith(['txDDLtRaflUW', 'tx5WDG9lxBDT']);
    });

    it('should not call deleteBulk method if tx_id is not present in expensesToBeDeleted', () => {
      const mockExpensesWithoutId = cloneDeep([apiExpenses1[0]]);
      mockExpensesWithoutId[0].id = undefined;
      component.expensesToBeDeleted = mockExpensesWithoutId;
      component.deleteSelectedExpenses(null);
      expect(transactionOutboxService.deleteBulkOfflineExpenses).not.toHaveBeenCalledOnceWith([], []);
      expect(component.selectedElements).toEqual([]);
      expect(expensesService.deleteExpenses).not.toHaveBeenCalled();
    });

    it('should delete outbox expenses', () => {
      component.deleteSelectedExpenses(expenseList4);

      expect(transactionOutboxService.deleteBulkOfflineExpenses).toHaveBeenCalledOnceWith(
        component.pendingTransactions,
        expenseList4
      );
    });
  });

  describe('openDeleteExpensesPopover(): ', () => {
    beforeEach(() => {
      sharedExpenseService.getExpenseDeletionMessage.and.returnValue('You are about to delete this expense');
      sharedExpenseService.getCCCExpenseMessage.and.returnValue(
        'There are 2 corporate credit cards which can be deleted'
      );
      sharedExpenseService.getDeleteDialogBody.and.returnValue('Once deleted, the action cannot be undone');
      component.expensesToBeDeleted = apiExpenses1;
      component.cccExpenses = 1;
      expensesService.deleteExpenses.and.returnValue(of());
      snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes3);
      spyOn(component, 'doRefresh');
      component.expensesToBeDeleted = cloneDeep(apiExpenses1);
      component.selectedElements = cloneDeep(apiExpenses1);
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

    it('should open a popover and delete offline expenses', fakeAsync(() => {
      component.outboxExpensesToBeDeleted = expenseListWithoutID;
      const deletePopOverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopOverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });
      popoverController.create.and.resolveTo(deletePopOverSpy);

      component.openDeleteExpensesPopover();
      tick(1000);

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
        message: '2 expenses have been deleted',
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: '2 expenses have been deleted',
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
      component.expensesToBeDeleted = cloneDeep(apiExpenses1);
      component.selectedElements = cloneDeep([apiExpenses1[0]]);

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
      component.expensesToBeDeleted = cloneDeep(apiExpenses1);
      component.selectedElements = cloneDeep([apiExpenses1[0]]);

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
      expensesService.getAllExpenses.and.returnValue(of(cloneDeep(apiExpenses1)));
      sharedExpenseService.excludeCCCExpenses.and.returnValue(apiExpenses1);
      sharedExpenseService.getReportableExpenses.and.returnValue(apiExpenses1);
      spyOn(component, 'setExpenseStatsOnSelect');
      component.isConnected$ = of(true);
      spyOn(component, 'checkDeleteDisabled').and.returnValue(of(void 0));
      component.loadExpenses$ = new BehaviorSubject({ pageNumber: 1, searchString: 'Bus' });
    });

    it('should set selectedElement to empty array if checked is false', () => {
      component.selectedElements = cloneDeep(apiExpenses1);
      component.isReportableExpensesSelected = false;
      component.onSelectAll(false);
      expect(component.selectedElements).toEqual([]);
      expect(sharedExpenseService.getReportableExpenses).toHaveBeenCalledOnceWith([]);
      expect(component.isReportableExpensesSelected).toBeTrue();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should select all pending transactions and update stats', () => {
      component.pendingTransactions = expenseList4;
      transactionService.getReportableExpenses.and.returnValue(expenseList4);
      spyOn(component, 'setOutboxExpenseStatsOnSelect');

      component.onSelectAll(true);

      expect(transactionService.getReportableExpenses).toHaveBeenCalledOnceWith(expenseList4);
      expect(component.setOutboxExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(component.isReportableExpensesSelected).toBeTrue();
    });

    it('should update selectedElements, allExpensesCount and call expensesService if checked is true', () => {
      expensesService.getAllExpenses.and.returnValue(of(cloneDeep(apiExpenses1)));
      component.outboxExpensesToBeDeleted = apiExpenseRes;
      component.pendingTransactions = cloneDeep([]);
      component.onSelectAll(true);
      expect(component.isReportableExpensesSelected).toBeTrue();

      expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith({
        queryParams: { report_id: 'is.null', state: 'in.(COMPLETE,DRAFT)', q: 'Bus:*' },
      });
      expect(sharedExpenseService.excludeCCCExpenses).toHaveBeenCalledOnceWith(apiExpenses1);
      expect(sharedExpenseService.getReportableExpenses).toHaveBeenCalledOnceWith(
        component.selectedElements,
        component.restrictPendingTransactionsEnabled
      );
      expect(component.cccExpenses).toBe(0);
      expect(component.selectedElements).toEqual([...apiExpenses1]);
      expect(component.allExpensesCount).toBe(2);
      expect(component.isReportableExpensesSelected).toBeTrue();
      expect(component.setExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
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
      component.loadExpenses$ = new BehaviorSubject({});
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
      component.loadExpenses$.subscribe((data) => {
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
      component.loadExpenses$.subscribe((data) => {
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
    component.selectedElements = apiExpenses1;
    component.mergeExpenses();
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'merge_expense',
      {
        expenseIDs: JSON.stringify(['txDDLtRaflUW', 'tx5WDG9lxBDT']),
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

  it('setOutboxExpenseStatsOnSelect(): should update stats on selecting outbox expenses', (done) => {
    component.selectedOutboxExpenses = expenseList4;

    component.setOutboxExpenseStatsOnSelect();

    component.allExpensesStats$.subscribe((res) => {
      expect(res).toEqual({
        count: 3,
        amount: 49475.76,
      });
      done();
    });
  });

  describe('selectOutboxExpense(): ', () => {
    beforeEach(() => {
      transactionService.getReportableExpenses.and.returnValue(apiExpenseRes);
      component.allExpensesCount = 1;
      spyOn(component, 'setExpenseStatsOnSelect');
      spyOn(component, 'setOutboxExpenseStatsOnSelect');
      component.selectedOutboxExpenses = cloneDeep(apiExpenseRes);
      transactionService.isMergeAllowed.and.returnValue(true);
      transactionService.excludeCCCExpenses.and.returnValue(apiExpenseRes);
    });

    it('should remove an expense from selectedOutboxExpenses if it is present in selectedOutboxExpenses', () => {
      transactionService.getReportableExpenses.and.returnValue([]);
      const expense = apiExpenseRes[0];
      component.selectedOutboxExpenses = cloneDeep(apiExpenseRes);

      component.selectOutboxExpense(expense);

      expect(component.selectedOutboxExpenses).toEqual([]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeFalse();
      expect(component.setOutboxExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.isMergeAllowed).toHaveBeenCalledOnceWith([]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should remove an expense from selectedOutboxExpenses if it is present in selectedOutboxExpenses', () => {
      transactionService.getReportableExpenses.and.returnValue([]);
      component.allExpensesCount = 4;
      const expense = apiExpenseRes[0];
      component.selectedOutboxExpenses = cloneDeep(cloneDeep(expenseList4));

      component.selectOutboxExpense(expense);

      expect(component.selectedOutboxExpenses).toEqual([...expenseList4, expense]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeTrue();
      expect(component.setOutboxExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.isMergeAllowed).toHaveBeenCalledOnceWith([...expenseList4, expense]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should remove an expense from selectedOutboxExpenses if it is present in selectedOutboxExpenses and allExpenseCount is not equal to length of selectedOutboxExpenses', () => {
      transactionService.getReportableExpenses.and.returnValue([]);
      const expense = apiExpenseRes[0];
      component.selectedOutboxExpenses = cloneDeep(apiExpenseRes);

      component.selectOutboxExpense(expense);

      expect(component.selectedOutboxExpenses).toEqual([]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeFalse();
      expect(component.setOutboxExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.isMergeAllowed).toHaveBeenCalledOnceWith([]);
      expect(component.isMergeAllowed).toBeTrue();
    });

    it('should update expenseToBeDeleted if selectedOutboxExpenses is an array of atleast 1', () => {
      component.selectedOutboxExpenses = cloneDeep(apiExpenseRes);
      component.selectOutboxExpense(expenseData2);

      const expectedSelectedElements = [...apiExpenseRes, expenseData2];
      expect(component.selectedOutboxExpenses).toEqual(expectedSelectedElements);
      expect(component.outboxExpensesToBeDeleted).toEqual(apiExpenseRes);
      expect(component.cccExpenses).toBe(1);
      expect(component.selectAll).toBeFalse();
    });

    it('should remove an expense from selectedOutboxExpenses if it is present in selectedOutboxExpenses and tx_id is not present in expense', () => {
      transactionService.getReportableExpenses.and.returnValue([]);
      component.allExpensesCount = 0;
      const expense = cloneDeep(apiExpenseRes[0]);
      expense.tx_id = undefined;
      component.selectedOutboxExpenses = cloneDeep(apiExpenseRes);
      component.selectedOutboxExpenses[0].tx_id = undefined;

      component.selectOutboxExpense(expense);

      expect(component.selectedOutboxExpenses).toEqual([]);
      expect(component.isReportableExpensesSelected).toBeFalse();
      expect(component.selectAll).toBeTrue();
      expect(component.setOutboxExpenseStatsOnSelect).toHaveBeenCalledTimes(1);
      expect(transactionService.isMergeAllowed).toHaveBeenCalledOnceWith([]);
      expect(component.isMergeAllowed).toBeTrue();
    });
  });

  describe('checkDeleteDisabled():', () => {
    it('should check and enable the button for online mode', (done) => {
      component.isConnected$ = of(true);
      component.selectedElements = apiExpenses1;
      component.expensesToBeDeleted = [];

      component.checkDeleteDisabled().subscribe(() => {
        expect(component.isDeleteDisabled).toBeFalse();
        done();
      });
    });

    it('should check and enable the button for offline mode', (done) => {
      component.isConnected$ = of(false);
      component.selectedOutboxExpenses = apiExpenseRes;
      component.outboxExpensesToBeDeleted = [];

      component.checkDeleteDisabled().subscribe(() => {
        expect(component.isDeleteDisabled).toBeFalse();
        done();
      });
    });
  });

  describe('showPromoteOptInModal():', () => {
    beforeEach(() => {
      authService.getEou.and.resolveTo(apiEouRes);
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      featureConfigService.saveConfiguration.and.returnValue(of(null));
    });

    it('should show promote opt-in modal and track skip event if user skipped opt-in', fakeAsync(() => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modal.onDidDismiss.and.resolveTo({ data: { skipOptIn: true } });
      modalController.create.and.resolveTo(modal);

      component.showPromoteOptInModal();
      tick(100);

      expect(trackingService.showOptInModalPostExpenseCreation).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(modal.present).toHaveBeenCalledTimes(1);
      expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledOnceWith({
        feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      });
      expect(trackingService.skipOptInModalPostExpenseCreation).toHaveBeenCalledTimes(1);
      expect(trackingService.optInFromPostExpenseCreationModal).not.toHaveBeenCalled();
    }));

    it('should show promote opt-in modal and track opt-in event if user opted in', fakeAsync(() => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modal.onDidDismiss.and.resolveTo({ data: { skipOptIn: false } });
      modalController.create.and.resolveTo(modal);

      component.showPromoteOptInModal();
      tick(100);

      expect(trackingService.showOptInModalPostExpenseCreation).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(modal.present).toHaveBeenCalledTimes(1);
      expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledOnceWith({
        feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      });
      expect(trackingService.skipOptInModalPostExpenseCreation).not.toHaveBeenCalled();
      expect(trackingService.optInFromPostExpenseCreationModal).toHaveBeenCalledTimes(1);
    }));

    it('should show promote opt-in modal and track opt-in event if data is undefined', fakeAsync(() => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modal.onDidDismiss.and.resolveTo({ data: undefined });
      modalController.create.and.resolveTo(modal);

      component.showPromoteOptInModal();
      tick(100);

      expect(trackingService.showOptInModalPostExpenseCreation).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(modal.present).toHaveBeenCalledTimes(1);
      expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(featureConfigService.saveConfiguration).toHaveBeenCalledOnceWith({
        feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
        key: 'OPT_IN_POPUP_SHOWN_COUNT',
        value: {
          count: 1,
        },
      });
      expect(trackingService.skipOptInModalPostExpenseCreation).not.toHaveBeenCalled();
      expect(trackingService.optInFromPostExpenseCreationModal).toHaveBeenCalledTimes(1);
    }));
  });

  it('setNavigationSubscription(): should clear timeout and show promote opt-in modal if user navigates to manage corporate cards page', fakeAsync(() => {
    spyOn(component, 'showPromoteOptInModal');
    const navigationEvent = new NavigationStart(1, 'my_expenses');
    utilityService.canShowOptInModal.and.returnValue(of(true));
    activatedRoute.snapshot.queryParams.redirected_from_add_expense = 'true';
    utilityService.canShowOptInAfterExpenseCreation.and.returnValue(true);
    Object.defineProperty(router, 'events', { value: of(navigationEvent) });

    component.setNavigationSubscription();
    tick(100);

    expect(utilityService.canShowOptInModal).toHaveBeenCalledOnceWith({
      feature: 'OPT_IN_POPUP_POST_EXPENSE_CREATION',
      key: 'OPT_IN_POPUP_SHOWN_COUNT',
    });
    expect(component.showPromoteOptInModal).toHaveBeenCalledTimes(1);
    expect(utilityService.toggleShowOptInAfterExpenseCreation).toHaveBeenCalledOnceWith(false);
  }));

  it('setModalDelay(): should set optInShowTimer and call showPromoteOptInModal after 2 seconds', fakeAsync(() => {
    spyOn(component, 'showPromoteOptInModal');

    component.setModalDelay();
    tick(4000);

    expect(component.showPromoteOptInModal).toHaveBeenCalledTimes(1);
  }));

  it('onPageClick(): should toggle showOptInAfterExpenseCreation flag', () => {
    component.optInShowTimer = setTimeout(() => {}, 2000);
    component.onPageClick();
    expect(utilityService.toggleShowOptInAfterExpenseCreation).toHaveBeenCalledTimes(1);
  });
});
