import { TitleCasePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter, NO_ERRORS_SCHEMA, Sanitizer } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ActionSheetController,
  IonicModule,
  ModalController,
  NavController,
  Platform,
  PopoverController,
} from '@ionic/angular';
import { Subscription, of } from 'rxjs';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { actionSheetOptionsData } from 'src/app/core/mock-data/action-sheet-options.data';
import { costCenterApiRes1, expectedCCdata } from 'src/app/core/mock-data/cost-centers.data';
import { criticalPolicyViolation2 } from 'src/app/core/mock-data/crtical-policy-violations.data';
import { duplicateSetData1 } from 'src/app/core/mock-data/duplicate-sets.data';
import { expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { fileObjectData } from 'src/app/core/mock-data/file-object.data';
import { individualExpPolicyStateData2 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import {
  filterOrgCategoryParam,
  orgCategoryData,
  transformedOrgCategories,
} from 'src/app/core/mock-data/org-category.data';
import { orgSettingsCCCDisabled, orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { instaFyleData1, instaFyleData2, parsedReceiptData1 } from 'src/app/core/mock-data/parsed-receipt.data';
import { splitPolicyExp4 } from 'src/app/core/mock-data/policy-violation.data';
import {
  getMarkDismissModalParamsData1,
  getMarkDismissModalParamsData2,
} from 'src/app/core/mock-data/popover-params.data';
import { recentUsedCategoriesRes, recentlyUsedRes } from 'src/app/core/mock-data/recently-used.data';
import { txnData2, txnList } from 'src/app/core/mock-data/transaction.data';
import { UndoMergeData2 } from 'src/app/core/mock-data/undo-merge.data';
import { unflattenExp1, unflattenExp2, unflattenedTxn } from 'src/app/core/mock-data/unflattened-expense.data';
import {
  expectedUnflattendedTxnData1,
  unflattenedTxnData,
  unflattenedTxnWithExtractedData,
} from 'src/app/core/mock-data/unflattened-txn.data';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { DateService } from 'src/app/core/services/date.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TaxGroupService } from 'src/app/core/services/tax-group.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import {
  accountsData,
  orgSettingsData,
  paymentModesData,
  unflattenedAccount1Data,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { projectsV1Data } from 'src/app/core/test-data/projects.spec.data';
import { estatusData1 } from 'src/app/core/test-data/status.service.spec.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { FyPolicyViolationComponent } from 'src/app/shared/components/fy-policy-violation/fy-policy-violation.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { CorporateCreditCardExpenseService } from '../../core/services/corporate-credit-card-expense.service';
import { TrackingService } from '../../core/services/tracking.service';
import { AddEditExpensePage } from './add-edit-expense.page';
import { SuggestedDuplicatesComponent } from './suggested-duplicates/suggested-duplicates.component';

const properties = {
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
};

describe('AddEditExpensePage', () => {
  let component: AddEditExpensePage;
  let fixture: ComponentFixture<AddEditExpensePage>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let accountsService: jasmine.SpyObj<AccountsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let formBuilder: FormBuilder;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let dateService: jasmine.SpyObj<DateService>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let customFieldsService: jasmine.SpyObj<CustomFieldsService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let router: jasmine.SpyObj<Router>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let statusService: jasmine.SpyObj<StatusService>;
  let fileService: jasmine.SpyObj<FileService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let popupService: jasmine.SpyObj<PopupService>;
  let navController: jasmine.SpyObj<NavController>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let recentlyUsedItemsService: jasmine.SpyObj<RecentlyUsedItemsService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let actionSheetController: jasmine.SpyObj<ActionSheetController>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;
  let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let platform: Platform;
  let titleCasePipe: jasmine.SpyObj<TitleCasePipe>;
  let handleDuplicates: jasmine.SpyObj<HandleDuplicatesService>;
  let paymentModesService: jasmine.SpyObj<PaymentModesService>;
  let taxGroupService: jasmine.SpyObj<TaxGroupService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;

  beforeEach(waitForAsync(() => {
    const accountsServiceSpy = jasmine.createSpyObj('AccountsService', [
      'getEMyAccounts',
      'getPaymentModes',
      'getEtxnSelectedPaymentMode',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', [
      'getAll',
      'filterRequired',
      'getCategoryById',
      'getCategoryByName',
      'getSystemCategories',
      'getBreakfastSystemCategories',
    ]);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['getUTCDate', 'addDaysToDate', 'isSameDate']);
    const projectsServiceSpy = jasmine.createSpyObj('ProjectsService', [
      'getAllActive',
      'getbyId',
      'getAllowedOrgCategoryIds',
      'getProjectCount',
    ]);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getAutoSubmissionReportName',
      'getFilteredPendingReports',
      'addTransactions',
      'removeTransaction',
    ]);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll', 'filterByCategory']);
    const customFieldsServiceSpy = jasmine.createSpyObj('CustomFieldsService', ['standardizeCustomFields']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'delete',
      'getRemoveCardExpenseDialogBody',
      'removeCorporateCardExpense',
      'unmatchCCCExpense',
      'getETxnUnflattened',
      'getSplitExpenses',
      'checkPolicy',
      'upsert',
      'review',
      'matchCCCExpense',
      'getETxnc',
    ]);
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', [
      'transformTo',
      'getCriticalPolicyRules',
      'getPolicyRules',
      'getSpenderExpensePolicyViolations',
    ]);
    const transactionOutboxServiceSpy = jasmine.createSpyObj('TransactionsOutboxService', [
      'parseReceipt',
      'addEntryAndSync',
      'addEntry',
      'fileUpload',
      'isPDF',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'getTop']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'findLatestComment', 'post']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', [
      'findByTransactionId',
      'downloadUrl',
      'post',
      'readFile',
      'getImageTypeFromDataUrl',
    ]);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', [
      'getAmountWithCurrencyFraction',
      'getHomeCurrency',
      'getExchangeRate',
      'getAll',
    ]);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const popupServiceSpy = jasmine.createSpyObj('PopupService', ['showPopup']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'markPersonal',
      'dismissCreditTransaction',
      'getEccceByGroupId',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'viewExpense',
      'deleteExpense',
      'unlinkCorporateCardExpense',
      'showToastMessage',
      'setCategoryFromVendor',
      'saveReceiptWithInvalidForm',
      'clickSaveAddNew',
      'policyCorrection',
      'editExpense',
      'addToExistingReportAddEditExpense',
      'removeFromExistingReportEditExpense',
      'createExpense',
      'addAttachment',
      'viewAttachment',
      'addComment',
      'viewComment',
      'hideMoreClicked',
      'showMoreClicked',
      'newExpenseCreatedFromPersonalCard',
    ]);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', ['get']);
    const recentlyUsedItemsServiceSpy = jasmine.createSpyObj('RecentlyUsedItemsService', [
      'getRecentCostCenters',
      'getRecentlyUsedProjects',
      'getRecentCurrencies',
      'getRecentlyUsed',
      'getRecentCategories',
    ]);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', [
      'getAllMap',
      'filterByOrgCategoryId',
      'getDefaultTxnFieldValues',
    ]);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustUrl']);
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', ['matchExpense']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const titleCasePipeSpy = jasmine.createSpyObj('TitleCasePipe', ['transform']);
    const handleDuplicatesSpy = jasmine.createSpyObj('HandleDuplicatesService', ['getDuplicatesByExpense']);
    const paymentModesServiceSpy = jasmine.createSpyObj('PaymentModesService', [
      'showInvalidPaymentModeToast',
      'checkIfPaymentModeConfigurationsIsEnabled',
    ]);
    const taxGroupServiceSpy = jasmine.createSpyObj('TaxGroupService', ['get']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', [
      'getAllowedCostCenters',
      'getAllowedPaymentModes',
      'get',
    ]);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get']);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);

    TestBed.configureTestingModule({
      declarations: [AddEditExpensePage, MaskNumber],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, FormsModule, RouterTestingModule, RouterModule],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'txyeiYbLDSOy',
                bankTxn: '',
                persist_filters: false,
              },
            },
          },
        },
        {
          provide: AccountsService,
          useValue: accountsServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: CategoriesService,
          useValue: categoriesServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        {
          provide: ProjectsService,
          useValue: projectsServiceSpy,
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: CustomInputsService,
          useValue: customInputsServiceSpy,
        },
        {
          provide: CustomFieldsService,
          useValue: customFieldsServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: PolicyService,
          useValue: policyServiceSpy,
        },
        {
          provide: TransactionsOutboxService,
          useValue: transactionOutboxServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: StatusService,
          useValue: statusServiceSpy,
        },
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: PopupService,
          useValue: popupServiceSpy,
        },
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        {
          provide: CorporateCreditCardExpenseService,
          useValue: corporateCreditCardExpenseServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: RecentLocalStorageItemsService,
          useValue: recentLocalStorageItemsServiceSpy,
        },
        {
          provide: RecentlyUsedItemsService,
          useValue: recentlyUsedItemsServiceSpy,
        },
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: ExpenseFieldsService,
          useValue: expenseFieldsServiceSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: ActionSheetController,
          useValue: actionSheetControllerSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: Sanitizer,
          useValue: sanitizerSpy,
        },
        {
          provide: PersonalCardsService,
          useValue: personalCardsServiceSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesSpy,
        },
        {
          provide: TitleCasePipe,
          useValue: titleCasePipeSpy,
        },
        {
          provide: HandleDuplicatesService,
          useValue: handleDuplicatesSpy,
        },
        {
          provide: PaymentModesService,
          useValue: paymentModesServiceSpy,
        },
        {
          provide: TaxGroupService,
          useValue: taxGroupServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: LaunchDarklyService,
          useValue: launchDarklyServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(AddEditExpensePage);
    component = fixture.componentInstance;

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    formBuilder = TestBed.inject(FormBuilder);
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    customFieldsService = TestBed.inject(CustomFieldsService) as jasmine.SpyObj<CustomFieldsService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService) as jasmine.SpyObj<RecentlyUsedItemsService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    actionSheetController = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
    personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    platform = TestBed.inject(Platform);
    titleCasePipe = TestBed.inject(TitleCasePipe) as jasmine.SpyObj<TitleCasePipe>;
    handleDuplicates = TestBed.inject(HandleDuplicatesService) as jasmine.SpyObj<HandleDuplicatesService>;
    paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
    taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;

    component.fg = formBuilder.group({
      currencyObj: [, component.currencyObjValidator],
      paymentMode: [, Validators.required],
      project: [],
      category: [],
      dateOfSpend: [, component.customDateValidator],
      vendor_id: [, component.merchantValidator],
      purpose: [],
      report: [],
      tax_group: [],
      tax_amount: [],
      location_1: [],
      location_2: [],
      from_dt: [],
      to_dt: [],
      flight_journey_travel_class: [],
      flight_return_travel_class: [],
      train_travel_class: [],
      bus_travel_class: [],
      distance: [],
      distance_unit: [],
      custom_inputs: new FormArray([]),
      duplicate_detection_reason: [],
      billable: [],
      costCenter: [],
      hotel_is_breakfast_provided: [],
      project_dependent_fields: formBuilder.array([]),
      cost_center_dependent_fields: formBuilder.array([]),
    });

    component._isExpandedView = true;
    component.navigateBack = true;
    component.hardwareBackButtonAction = new Subscription();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('scrollInputIntoView', () => {});

  describe('goBack():', () => {
    it('should back to the report if redirected from the report page', () => {
      component.isRedirectedFromReport = true;
      fixture.detectChanges();

      navController.back.and.returnValue(null);

      component.goBack();
      expect(navController.back).toHaveBeenCalledTimes(1);
    });

    it('should go back to my expenses page if it is not redirected from report and no filters are applied', () => {
      activatedRoute.snapshot.params.persist_filters = false;
      component.isRedirectedFromReport = false;
      fixture.detectChanges();

      component.goBack();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });
  });

  describe('showClosePopup(): ', () => {
    beforeEach(() => {
      component.presetCurrency = 'USD';
      component.fg.controls.category.setValue('Category');
      fixture.detectChanges();
    });

    it('should show close popup and automatically go back if action is continue', fakeAsync(() => {
      const unsavedChangesPopOverSpy = jasmine.createSpyObj('unsavedChangesPopOver', ['present', 'onWillDismiss']);
      unsavedChangesPopOverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'continue',
        },
      });
      popoverController.create.and.resolveTo(unsavedChangesPopOverSpy);
      navController.back.and.returnValue(null);

      component.showClosePopup();
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Unsaved Changes',
          message: 'You have unsaved information that will be lost if you discard this expense.',
          primaryCta: {
            text: 'Discard',
            action: 'continue',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });
      expect(navController.back).toHaveBeenCalledTimes(1);
    }));

    it('should show close popup and go back to expense page if navigate back is false', fakeAsync(() => {
      const unsavedChangesPopOverSpy = jasmine.createSpyObj('unsavedChangesPopOver', ['present', 'onWillDismiss']);
      unsavedChangesPopOverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'continue',
        },
      });
      popoverController.create.and.resolveTo(unsavedChangesPopOverSpy);
      spyOn(component, 'goBack');
      component.navigateBack = false;
      fixture.detectChanges();

      component.showClosePopup();
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Unsaved Changes',
          message: 'You have unsaved information that will be lost if you discard this expense.',
          primaryCta: {
            text: 'Discard',
            action: 'continue',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });
      expect(component.goBack).toHaveBeenCalledTimes(1);
    }));
  });

  describe('merchantValidator():', () => {
    it('should check field value and return null if name less 250 characters', () => {
      component.fg.controls.vendor_id.setValue({
        display_name: 'name',
      });
      const result = component.merchantValidator(component.fg.controls.vendor_id.value);
      expect(result).toBeNull();
    });
  });

  xit('currencyObjValidator', () => {});

  xit('setUpTaxCalculations', () => {});

  describe('checkIfInvalidPaymentMode():', () => {
    it('should check for invalid payment mode', (done) => {
      component.etxn$ = of(unflattenExp1);
      component.fg.controls.paymentMode.setValue(unflattenedAccount1Data);
      component.fg.controls.currencyObj.setValue({
        currency: 'USD',
        amount: 500,
      });
      fixture.detectChanges();

      component.checkIfInvalidPaymentMode().subscribe((res) => {
        expect(res).toBeFalse();
        done();
      });
    });

    it('should check for invalid payment in case of Advance accounts', (done) => {
      component.etxn$ = of(unflattenExp1);
      component.fg.controls.paymentMode.setValue({
        ...unflattenedAccount1Data,
        acc: { ...unflattenedAccount1Data.acc, type: AccountType.ADVANCE },
      });
      component.fg.controls.currencyObj.setValue({
        currency: 'USD',
        amount: 500,
      });
      fixture.detectChanges();

      component.checkIfInvalidPaymentMode().subscribe((res) => {
        expect(res).toBeTrue();
        expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should check for invalid payment mode if the source account ID matches with the account type', (done) => {
      component.etxn$ = of(unflattenExp1);
      component.fg.controls.paymentMode.setValue({
        ...unflattenedAccount1Data,
        acc: { ...unflattenedAccount1Data.acc, type: AccountType.ADVANCE, id: 'acc5APeygFjRd' },
      });
      component.fg.controls.currencyObj.setValue({
        currency: 'USD',
        amount: 500,
      });
      fixture.detectChanges();

      component.checkIfInvalidPaymentMode().subscribe((res) => {
        expect(res).toBeTrue();
        expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('unmatchExpense():', () => {
    it('should show popup and selected txns if primary action is selected', fakeAsync(() => {
      popupService.showPopup.and.resolveTo('primary');

      component.unmatchExpense(unflattenExp1);
      tick(500);

      expect(popupService.showPopup).toHaveBeenCalledOnceWith({
        header: 'Unmatch?',
        message: 'This will remove the mapping between corporate card expense and this expense.',
        primaryCta: {
          text: 'UNMATCH',
        },
      });
      expect(component.showSelectedTransaction).toBeFalse();
      expect(component.isDraftExpense).toBeTrue();
      expect(component.selectedCCCTransaction).toBeNull();
    }));

    it('should show popup and other settings if it is a CCC txn and draft is enabled', fakeAsync(() => {
      popupService.showPopup.and.resolveTo('primary');
      component.isSplitExpensesPresent = true;
      component.isDraftExpenseEnabled = true;
      component.isSplitExpensesPresent = true;
      component.alreadyApprovedExpenses = [unflattenExp2];
      fixture.detectChanges();

      component.unmatchExpense({
        ...unflattenExp1,
        tx: { ...unflattenExp1.tx, state: 'APPROVER_PENDING' },
      });
      tick(500);

      expect(popupService.showPopup).toHaveBeenCalledOnceWith({
        header: 'Unmatch?',
        message:
          'Unmatching the card transaction from this split expense will also unmatch it from the other splits associated with the expense.',
        primaryCta: {
          text: 'UNMATCH',
        },
      });
      expect(component.isDraftExpense).toBeFalse();
      expect(component.canChangeMatchingCCCTransaction).toBeFalse();
      expect(component.selectedCCCTransaction).toBeNull();
    }));
  });

  it('setupNetworkWatcher(): should setup network watching', (done) => {
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

  xit('openSplitExpenseModal', () => {});

  describe('markCCCAsPersonal():', () => {
    it('should mark a CCC txn as personal', (done) => {
      transactionService.delete.and.returnValue(of(expenseData1));
      trackingService.deleteExpense.and.returnValue(null);
      corporateCreditCardExpenseService.markPersonal.and.returnValue(of(expenseData1));

      component.markCCCAsPersonal(expenseData1.tx_id).subscribe((res) => {
        expect(res).toEqual(expenseData1);
        expect(transactionService.delete).toHaveBeenCalledOnceWith(expenseData1.tx_id);
        expect(trackingService.deleteExpense).toHaveBeenCalledOnceWith({ Type: 'Marked Personal' });
        expect(corporateCreditCardExpenseService.markPersonal).toHaveBeenCalledOnceWith(
          component.corporateCreditCardExpenseGroupId
        );
        done();
      });
    });

    it('should return null if delete operation fails', (done) => {
      transactionService.delete.and.returnValue(of(null));

      component.markCCCAsPersonal(expenseData1.tx_id).subscribe((res) => {
        expect(res).toBeNull();
        expect(transactionService.delete).toHaveBeenCalledOnceWith(expenseData1.tx_id);
        done();
      });
    });
  });

  describe('dismissCCC():', () => {
    it('should dismiss CCC txn', (done) => {
      transactionService.delete.and.returnValue(of(expenseData1));
      trackingService.deleteExpense.and.returnValue(null);
      corporateCreditCardExpenseService.dismissCreditTransaction.and.returnValue(of(expenseData1));

      component
        .dismissCCC(expenseData1.tx_id, expenseData1.tx_corporate_credit_card_expense_group_id)
        .subscribe((res) => {
          expect(res).toEqual(expenseData1);
          expect(transactionService.delete).toHaveBeenCalledOnceWith(expenseData1.tx_id);
          expect(trackingService.deleteExpense).toHaveBeenCalledOnceWith({ Type: 'Dismiss as Card Payment' });
          expect(corporateCreditCardExpenseService.dismissCreditTransaction).toHaveBeenCalledOnceWith(
            expenseData1.tx_corporate_credit_card_expense_group_id
          );
          done();
        });
    });

    it('should return null if delete operation fails', (done) => {
      transactionService.delete.and.returnValue(of(null));

      component
        .dismissCCC(expenseData1.tx_id, expenseData1.tx_corporate_credit_card_expense_group_id)
        .subscribe((res) => {
          expect(res).toBeNull();
          expect(transactionService.delete).toHaveBeenCalledOnceWith(expenseData1.tx_id);
          done();
        });
    });
  });

  it('getRemoveCCCExpModalParams(): should return params for remove CCC expense modal', (done) => {
    transactionService.removeCorporateCardExpense.and.returnValue(of(UndoMergeData2));
    const header = 'Remove Card Expense';
    const body = 'removed';
    const ctaText = 'Confirm';
    const ctaLoadingText = 'Confirming';

    const result = component.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText);
    result.componentProps.deleteMethod().subscribe((res) => {
      expect(res).toEqual(UndoMergeData2);
      expect(transactionService.removeCorporateCardExpense).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      done();
    });
  });

  describe('removeCorporateCardExpense():', () => {
    it('should remove CCC expense', fakeAsync(() => {
      component.etxn$ = of({ ...txnList[0] });
      spyOn(component, 'goBack');
      transactionService.getRemoveCardExpenseDialogBody.and.returnValue('removed');
      spyOn(component, 'getRemoveCCCExpModalParams');
      spyOn(component, 'showSnackBarToast');

      const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

      popoverController.create.and.resolveTo(deletePopoverSpy);

      component.removeCorporateCardExpense();
      tick(500);

      const header = 'Remove Card Expense';
      const body = 'removed';
      const ctaText = 'Confirm';
      const ctaLoadingText = 'Confirming';

      expect(component.getRemoveCCCExpModalParams).toHaveBeenCalledOnceWith(header, body, ctaText, ctaLoadingText);
      expect(popoverController.create).toHaveBeenCalledOnceWith(
        component.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText)
      );
      expect(trackingService.unlinkCorporateCardExpense).toHaveBeenCalledOnceWith({
        Type: 'unlink corporate card expense',
        transaction: undefined,
      });
      expect(component.goBack).toHaveBeenCalledOnceWith();
      expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
        { message: 'Successfully removed the card details from the expense.' },
        'information',
        ['msb-info']
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: 'Successfully removed the card details from the expense.',
      });
    }));

    it('navigate back to report if redirected from report after removing txn', fakeAsync(() => {
      const txn = { ...unflattenedTxn, tx: { ...unflattenedTxn.tx, report_id: 'rpFE5X1Pqi9P' } };
      component.etxn$ = of(txn);
      transactionService.getRemoveCardExpenseDialogBody.and.returnValue('removed');
      spyOn(component, 'getRemoveCCCExpModalParams');
      spyOn(component, 'showSnackBarToast');

      const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

      popoverController.create.and.resolveTo(deletePopoverSpy);

      component.removeCorporateCardExpense();
      tick(500);

      const header = 'Remove Card Expense';
      const body = 'removed';
      const ctaText = 'Confirm';
      const ctaLoadingText = 'Confirming';

      expect(component.getRemoveCCCExpModalParams).toHaveBeenCalledOnceWith(header, body, ctaText, ctaLoadingText);
      expect(popoverController.create).toHaveBeenCalledOnceWith(
        component.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText)
      );
      expect(trackingService.unlinkCorporateCardExpense).toHaveBeenCalledOnceWith({
        Type: 'unlink corporate card expense',
        transaction: txn.tx,
      });

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_report',
        { id: 'rpFE5X1Pqi9P', navigateBack: true },
      ]);
      expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
        { message: 'Successfully removed the card details from the expense.' },
        'information',
        ['msb-info']
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: 'Successfully removed the card details from the expense.',
      });
    }));
  });

  xdescribe('getMarkDismissModalParams():', () => {
    it('should get delete method to unmatch personal expense', (done) => {
      transactionService.unmatchCCCExpense.and.returnValue(of(null));
      spyOn(component, 'markCCCAsPersonal');
      const result = component.getMarkDismissModalParams(
        {
          header: 'Header',
          body: 'This is body',
          ctaText: 'Done',
          ctaLoadingText: 'Loading',
        },
        true
      );

      result.componentProps.deleteMethod().subscribe(() => {
        expect(transactionService.unmatchCCCExpense).toHaveBeenCalledOnceWith(
          activatedRoute.snapshot.params.id,
          component.corporateCreditCardExpenseGroupId
        );
        done();
      });
    });
  });

  describe('markPeronsalOrDismiss(): ', () => {
    it('should dismiss txn as specified', fakeAsync(() => {
      spyOn(component, 'getMarkDismissModalParams');
      spyOn(component, 'showSnackBarToast');
      component.etxn$ = of(unflattenedTxn);

      const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

      popoverController.create.and.resolveTo(deletePopoverSpy);

      fixture.detectChanges();

      component.markPeronsalOrDismiss('dismiss');
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith(
        component.getMarkDismissModalParams(getMarkDismissModalParamsData1, true)
      );
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
      expect(component.showSnackBarToast).toHaveBeenCalledOnceWith({ message: 'Dismissed expense' }, 'information', [
        'msb-info',
      ]);
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: 'Dismissed expense' });
    }));

    it('should mark txn as personal', fakeAsync(() => {
      spyOn(component, 'getMarkDismissModalParams');
      spyOn(component, 'showSnackBarToast');
      component.etxn$ = of(unflattenedTxn);

      const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
      deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

      popoverController.create.and.resolveTo(deletePopoverSpy);
      component.isExpenseMatchedForDebitCCCE = true;

      fixture.detectChanges();

      component.markPeronsalOrDismiss('personal');
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith(
        component.getMarkDismissModalParams(getMarkDismissModalParamsData2, true)
      );
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
      expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
        { message: 'Marked expense as Personal' },
        'information',
        ['msb-info']
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: 'Marked expense as Personal' });
    }));
  });

  xit('showFormValidationErrors', () => {});

  it('removeCCCHandler(): should call method to remove CCC expense', () => {
    spyOn(component, 'removeCorporateCardExpense');

    component.removeCCCHandler();
    expect(component.removeCorporateCardExpense).toHaveBeenCalledTimes(1);
  });

  it('markPersonalHandler(): should call method to mark expense as personal', () => {
    spyOn(component, 'markPeronsalOrDismiss');

    component.markPersonalHandler();
    expect(component.markPeronsalOrDismiss).toHaveBeenCalledOnceWith('personal');
  });

  it('markDismissHandler(): should call method to dismiss the expense', () => {
    spyOn(component, 'markPeronsalOrDismiss');

    component.markDismissHandler();
    expect(component.markPeronsalOrDismiss).toHaveBeenCalledOnceWith('dismiss');
  });

  describe('splitExpCategoryHandler():', () => {
    it('should call method to display split expense modal and split by category', () => {
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });

      spyOn(component, 'openSplitExpenseModal');

      component.splitExpCategoryHandler();
      expect(component.openSplitExpenseModal).toHaveBeenCalledOnceWith('categories');
    });

    it('should validation errors if any inside the form', () => {
      spyOn(component, 'showFormValidationErrors');

      component.splitExpCategoryHandler();
      expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
    });
  });

  describe('splitExpProjectHandler():', () => {
    it('should call method to display split expense modal and split by project', () => {
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });

      spyOn(component, 'openSplitExpenseModal');

      component.splitExpProjectHandler();
      expect(component.openSplitExpenseModal).toHaveBeenCalledOnceWith('projects');
    });

    it('should validation errors if any inside the form', () => {
      spyOn(component, 'showFormValidationErrors');

      component.splitExpProjectHandler();
      expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
    });
  });

  describe('splitExpCostCenterHandler():', () => {
    it('should call method to display split expense modal and split by cost centers', () => {
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });

      spyOn(component, 'openSplitExpenseModal');

      component.splitExpCostCenterHandler();
      expect(component.openSplitExpenseModal).toHaveBeenCalledOnceWith('cost centers');
    });

    it('should validation errors if any inside the form', () => {
      spyOn(component, 'showFormValidationErrors');

      component.splitExpCostCenterHandler();
      expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
    });
  });

  it('getActionSheetOptions(): should get action sheet options', (done) => {
    orgSettingsService.get.and.returnValue(
      of({
        ...orgSettingsData,
        expense_settings: { ...orgSettingsData.expense_settings, split_expense_settings: { enabled: true } },
      })
    );
    component.costCenters$ = of(costCenterApiRes1);
    projectsService.getAllActive.and.returnValue(of(projectsV1Data));
    component.filteredCategories$ = of(transformedOrgCategories);
    component.txnFields$ = of({ project_id: 257528 });
    component.isCccExpense = true;
    component.canDismissCCCE = true;
    component.isCorporateCreditCardEnabled = true;
    component.canRemoveCardExpense = true;
    component.isExpenseMatchedForDebitCCCE = true;
    launchDarklyService.getVariation.and.returnValue(of(true));
    fixture.detectChanges();

    component.getActionSheetOptions().subscribe((res) => {
      expect(res.length).toEqual(6);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(projectsService.getAllActive).toHaveBeenCalledTimes(1);
      expect(launchDarklyService.getVariation).toHaveBeenCalledOnceWith(
        'show_project_mapped_categories_in_split_expense',
        false
      );
      done();
    });
  });

  it('showMoreActions(): should show action sheet', fakeAsync(() => {
    component.actionSheetOptions$ = of(actionSheetOptionsData);

    const actionSheetSpy = jasmine.createSpyObj('actionSheet', ['present']);
    actionSheetController.create.and.resolveTo(actionSheetSpy);

    component.showMoreActions();
    tick(500);

    expect(actionSheetController.create).toHaveBeenCalledOnceWith({
      header: 'MORE ACTIONS',
      mode: 'md',
      cssClass: 'fy-action-sheet',
      buttons: actionSheetOptionsData,
    });
  }));

  xit('getFormValidationErrors', () => {});

  describe('setupCostCenters():', () => {
    it('should return list of cost centers if enabled', () => {
      component.orgUserSettings$ = of(orgUserSettingsData);
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      orgUserSettingsService.getAllowedCostCenters.and.returnValue(of(costCenterApiRes1));
      fixture.detectChanges();

      component.setupCostCenters();

      component.isCostCentersEnabled$.subscribe((res) => {
        expect(res).toBeTrue();
      });

      component.costCenters$.subscribe((res) => {
        expect(res).toEqual(expectedCCdata);
      });

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgUserSettingsService.getAllowedCostCenters).toHaveBeenCalledOnceWith(orgUserSettingsData);
    });

    it('should return empty array if cost centers are not enabled', () => {
      component.orgUserSettings$ = of(orgUserSettingsData);
      orgSettingsService.get.and.returnValue(
        of({ ...orgSettingsRes, cost_centers: { ...orgSettingsRes.cost_centers, enabled: false } })
      );
      orgUserSettingsService.getAllowedCostCenters.and.returnValue(of(costCenterApiRes1));
      fixture.detectChanges();

      component.setupCostCenters();

      component.isCostCentersEnabled$.subscribe((res) => {
        expect(res).toBeFalse();
      });

      component.costCenters$.subscribe((res) => {
        expect(res).toEqual([]);
      });

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    });
  });

  xit('setupBalanceFlag', () => {});

  it('getPaymentModes(): should get payment modes', (done) => {
    component.etxn$ = of({
      ...unflattenExp1,
      tx: { ...unflattenExp1.tx, corporate_credit_card_expense_group_id: false },
    });
    accountsService.getEMyAccounts.and.returnValue(of(accountsData));
    orgSettingsService.get.and.returnValue(of(orgSettingsCCCDisabled));
    orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
      of([AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY])
    );
    paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(
      of(orgSettingsData.payment_mode_settings.enabled && orgSettingsData.payment_mode_settings.allowed)
    );
    accountsService.getPaymentModes.and.returnValue(paymentModesData);
    fixture.detectChanges();

    component.getPaymentModes().subscribe((res) => {
      expect(res).toEqual(paymentModesData);
      expect(component.showCardTransaction).toBeFalse();
      expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
      expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getActiveCategories(): should get active categories', (done) => {
    categoriesService.getAll.and.returnValue(of(filterOrgCategoryParam));
    categoriesService.filterRequired.and.returnValue([filterOrgCategoryParam[0]]);

    component.getActiveCategories().subscribe((res) => {
      expect(res).toEqual([filterOrgCategoryParam[0]]);
      expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      expect(categoriesService.filterRequired).toHaveBeenCalledOnceWith(filterOrgCategoryParam);
      done();
    });
  });

  describe('getInstaFyleImageData():', () => {
    it('should return image data if parsed from a receipt', (done) => {
      activatedRoute.snapshot.params.dataUrl = 'data-url';
      activatedRoute.snapshot.params.canExtractData = 'true';
      currencyService.getHomeCurrency.and.returnValue(of('INR'));
      currencyService.getExchangeRate.and.returnValue(of(82));
      transactionOutboxService.parseReceipt.and.resolveTo(parsedReceiptData1);

      component.getInstaFyleImageData().subscribe((res) => {
        expect(res).toEqual(instaFyleData1);
        expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('data-url');
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith(
          'USD',
          'INR',
          new Date('2023-02-15T06:30:00.000Z')
        );
        done();
      });
    });

    it('should return extracted data if both extracted and home currencies are same', (done) => {
      activatedRoute.snapshot.params.dataUrl = 'data-url';
      activatedRoute.snapshot.params.canExtractData = 'true';
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      transactionOutboxService.parseReceipt.and.resolveTo(parsedReceiptData1);

      component.getInstaFyleImageData().subscribe((res) => {
        expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('data-url');
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(res).toEqual(instaFyleData2);
        done();
      });
    });

    it('should return data from URL if data extraction is not allowed', (done) => {
      activatedRoute.snapshot.params.dataUrl = 'data-url';
      activatedRoute.snapshot.params.canExtractData = 'false';
      component.getInstaFyleImageData().subscribe((res) => {
        expect(res).toEqual({
          thumbnail: 'data-url',
          type: 'image',
          url: 'data-url',
        });
        done();
      });
    });

    it('should get null if there is no data in URL', (done) => {
      component.getInstaFyleImageData().subscribe((res) => {
        expect(res).toBeNull();
        done();
      });
    });
  });

  xit('getNewExpenseObservable', () => {});

  xit('setupFormInit', () => {});

  xdescribe('getAutofillCategory(): ', () => {
    it('should populate the auto fill category list', () => {
      const result = component.getAutofillCategory({
        isAutofillsEnabled: true,
        recentValue: recentlyUsedRes,
        recentCategories: recentUsedCategoriesRes,
        etxn: unflattenExp1,
        category: orgCategoryData[0],
      });
    });

    it('');
  });

  it('setCategoryFromVendor(): should set category in the form', () => {
    categoriesService.getCategoryByName.and.returnValue(of(orgCategoryData));

    component.setCategoryFromVendor(orgCategoryData.displayName);
    expect(trackingService.setCategoryFromVendor).toHaveBeenCalledOnceWith(orgCategoryData);
    expect(component.fg.controls.category.value).toEqual(orgCategoryData);
  });

  xit('getCategoryOnEdit', () => {});

  xit('getCategoryOnAdd', () => {});

  xit('setupCustomFields', () => {});

  xit('setupExpenseFields', () => {});

  xit('setupFilteredCategories', () => {});

  describe('getEditExpenseObservable(): ', () => {
    it('should get editable expense observable if the txn is in DRAFT state', (done) => {
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnWithExtractedData));
      categoriesService.getCategoryByName.and.returnValue(of(orgCategoryData));
      dateService.getUTCDate.and.returnValue(new Date('2023-01-24T11:30:00.000Z'));

      component.getEditExpenseObservable().subscribe((res) => {
        expect(res).toEqual(expectedUnflattendedTxnData1);
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
        expect(categoriesService.getCategoryByName).toHaveBeenCalledOnceWith(
          unflattenedTxnWithExtractedData.tx.extracted_data.category
        );
        expect(dateService.getUTCDate).toHaveBeenCalledWith(
          new Date(unflattenedTxnWithExtractedData.tx.extracted_data.date)
        );
        expect(component.isIncompleteExpense).toBeTrue();
        done();
      });
    });

    it('should return txn if state is not DRAFT', (done) => {
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));

      component.getEditExpenseObservable().subscribe((res) => {
        expect(res).toEqual(unflattenedTxnData);
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
        done();
      });
    });
  });

  it('goToPrev(): should go to the previous txn', () => {
    spyOn(component, 'goToTransaction');
    activatedRoute.snapshot.params.activeIndex = 1;
    component.reviewList = ['txSEM4DtjyKR', 'txNyI8ot5CuJ'];
    transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
    fixture.detectChanges();

    component.goToPrev();
    expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txSEM4DtjyKR');
    expect(component.goToTransaction).toHaveBeenCalledOnceWith(unflattenedTxnData, component.reviewList, 0);
  });

  it('goToNext(): should got to the next txn', () => {
    const etxn = { ...unflattenedTxnData, tx: { ...unflattenedTxnData.tx, id: 'txNyI8ot5CuJ' } };
    spyOn(component, 'goToTransaction');
    activatedRoute.snapshot.params.activeIndex = 0;
    component.reviewList = ['txSEM4DtjyKR', 'txNyI8ot5CuJ'];
    transactionService.getETxnUnflattened.and.returnValue(of(etxn));
    fixture.detectChanges();

    component.goToNext();
    expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txNyI8ot5CuJ');
    expect(component.goToTransaction).toHaveBeenCalledOnceWith(etxn, component.reviewList, 1);
  });

  describe('goToTransaction():', () => {
    const txn_ids = ['txfCdl3TEZ7K'];
    it('should go to add-edit mileage if category is mileage', () => {
      const expense = { ...unflattenExp1, tx: { ...unflattenExp1.tx, org_category: 'MILEAGE' } };
      component.goToTransaction(expense, txn_ids, 0);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_mileage',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(txn_ids),
          activeIndex: 0,
        },
      ]);
    });

    it('should go to add-edit per diem if category is per diem', () => {
      const expense = { ...unflattenExp1, tx: { ...unflattenExp1.tx, org_category: 'PER DIEM' } };
      component.goToTransaction(expense, txn_ids, 0);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_per_diem',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(txn_ids),
          activeIndex: 0,
        },
      ]);
    });

    it('should go to add-edit per diem if category is per diem', () => {
      const expense = unflattenExp1;
      component.goToTransaction(expense, txn_ids, 0);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'add_edit_expense',
        {
          id: expense.tx.id,
          txnIds: JSON.stringify(txn_ids),
          activeIndex: 0,
        },
      ]);
    });
  });

  xit('customDateValidator', () => {});

  xit('ionViewWillEnter', () => {});

  xit('generateEtxnFromFg', () => {});

  xit('checkPolicyViolation', () => {});

  xit('getCustomFields', () => {});

  it('reloadCurrentRoute(): should reload the current load', fakeAsync(() => {
    component.reloadCurrentRoute();
    tick(500);

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/enterprise/my_expenses', { skipLocationChange: true });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'add_edit_expense']);
  }));

  xit('showAddToReportSuccessToast');

  describe('saveExpense():', () => {
    it('should save an expense and match as personal if created from a personal card', () => {
      spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      component.isCreatedFromPersonalCard = true;
      component.mode = 'add';
      spyOn(component, 'saveAndMatchWithPersonalCardTxn');

      component.saveExpense();
      expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
      expect(component.saveAndMatchWithPersonalCardTxn).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveAndNewExpense():', () => {
    it('should save and create expense if the form is valid and is in add mode', () => {
      spyOn(component, 'addExpense').and.returnValue(of(txnData2));
      spyOn(component, 'reloadCurrentRoute');
      spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
      component.mode = 'add';
      component.fg.clearValidators();
      component.fg.updateValueAndValidity();
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveAndNewExpense();
      expect(trackingService.clickSaveAddNew).toHaveBeenCalledTimes(1);
      expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
      expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEW_EXPENSE');
      expect(component.reloadCurrentRoute).toHaveBeenCalledTimes(1);
    });

    it('should save an edited expense if the form is valid and is in edit mode ', () => {
      spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
      spyOn(component, 'editExpense').and.returnValue(of(txnData2));
      spyOn(component, 'goBack');
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveAndNewExpense();
      expect(trackingService.clickSaveAddNew).toHaveBeenCalledTimes(1);
      expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
      expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEW_EXPENSE');
      expect(component.goBack).toHaveBeenCalledTimes(1);
    });

    it('should show validation errors if payment mode is invalid', fakeAsync(() => {
      spyOn(component, 'showFormValidationErrors');
      spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));

      component.saveAndNewExpense();
      tick(3000);

      expect(trackingService.clickSaveAddNew).toHaveBeenCalledTimes(1);
      expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      expect(component.invalidPaymentMode).toBeFalse();
    }));
  });

  describe('saveExpenseAndGotoPrev():', () => {
    it('should add a new expense and close the form', () => {
      spyOn(component, 'addExpense').and.returnValue(of(txnData2));
      spyOn(component, 'closeAddEditExpenses');
      component.activeIndex = 0;
      component.mode = 'add';
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveExpenseAndGotoPrev();
      expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_EXPENSE');
      expect(component.closeAddEditExpenses).toHaveBeenCalledOnceWith();
    });

    it('should add a new expense and go to the previous expense if not the first one in list', () => {
      spyOn(component, 'addExpense').and.returnValue(of(txnData2));
      spyOn(component, 'goToPrev');
      component.activeIndex = 1;
      component.mode = 'add';
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveExpenseAndGotoPrev();
      expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_EXPENSE');
      expect(component.goToPrev).toHaveBeenCalledOnceWith();
    });

    it('should save an edited expense and close the form', () => {
      spyOn(component, 'editExpense').and.returnValue(of(txnData2));
      spyOn(component, 'closeAddEditExpenses');
      component.activeIndex = 0;
      component.mode = 'edit';
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveExpenseAndGotoPrev();
      expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_EXPENSE');
      expect(component.closeAddEditExpenses).toHaveBeenCalledOnceWith();
    });

    it('should save an edited expense and go to the previous expense', () => {
      spyOn(component, 'editExpense').and.returnValue(of(txnData2));
      spyOn(component, 'goToPrev');
      component.activeIndex = 1;
      component.mode = 'edit';
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveExpenseAndGotoPrev();
      expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_EXPENSE');
      expect(component.goToPrev).toHaveBeenCalledOnceWith();
    });

    it('should show validation errors if the form is not valid', () => {
      spyOn(component, 'showFormValidationErrors');

      component.saveExpenseAndGotoPrev();

      expect(component.showFormValidationErrors).toHaveBeenCalledOnceWith();
    });
  });

  describe('saveExpenseAndGotoNext():', () => {
    it('should add a new expense and close the form', () => {
      spyOn(component, 'addExpense').and.returnValue(of(txnData2));
      spyOn(component, 'closeAddEditExpenses');
      component.activeIndex = 0;
      component.reviewList = ['id1'];
      component.mode = 'add';
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveExpenseAndGotoNext();
      expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
      expect(component.closeAddEditExpenses).toHaveBeenCalledOnceWith();
    });

    it('should add a new expense and go to the next expense if not the first one in list', () => {
      spyOn(component, 'addExpense').and.returnValue(of(txnData2));
      spyOn(component, 'goToNext');
      component.activeIndex = 0;
      component.mode = 'add';
      component.reviewList = ['id1', 'id2'];
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveExpenseAndGotoNext();
      expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
      expect(component.goToNext).toHaveBeenCalledTimes(1);
    });

    it('should save an edited expense and close the form', () => {
      spyOn(component, 'editExpense').and.returnValue(of(txnData2));
      spyOn(component, 'closeAddEditExpenses');
      component.activeIndex = 0;
      component.mode = 'edit';
      component.reviewList = ['id1'];
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveExpenseAndGotoNext();
      expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
      expect(component.closeAddEditExpenses).toHaveBeenCalledTimes(1);
    });

    it('should save an edited expense and go to the next expense', () => {
      spyOn(component, 'editExpense').and.returnValue(of(txnData2));
      spyOn(component, 'goToNext');
      component.activeIndex = 0;
      component.mode = 'edit';
      component.reviewList = ['id1', 'id2'];
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
      fixture.detectChanges();

      component.saveExpenseAndGotoNext();
      expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
      expect(component.goToNext).toHaveBeenCalledTimes(1);
    });

    it('should show validation errors if the form is not valid', () => {
      spyOn(component, 'showFormValidationErrors');

      component.saveExpenseAndGotoNext();

      expect(component.showFormValidationErrors).toHaveBeenCalledOnceWith();
    });
  });

  it('continueWithCriticalPolicyViolation(): should show critical policy violation modal', async () => {
    modalProperties.getModalDefaultProperties.and.returnValue(properties);
    const fyCriticalPolicyViolationPopOverSpy = jasmine.createSpyObj('fyCriticalPolicyViolationPopOver', [
      'present',
      'onWillDismiss',
    ]);
    fyCriticalPolicyViolationPopOverSpy.onWillDismiss.and.resolveTo({
      data: {
        action: 'primary',
      },
    });

    modalController.create.and.resolveTo(fyCriticalPolicyViolationPopOverSpy);

    const result = await component.continueWithCriticalPolicyViolation(criticalPolicyViolation2);

    expect(result).toBeTrue();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyCriticalPolicyViolationComponent,
      componentProps: {
        criticalViolationMessages: criticalPolicyViolation2,
      },
      mode: 'ios',
      presentingElement: await modalController.getTop(),
      ...properties,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
  });

  it('continueWithPolicyViolations(): should display violations and relevant CTA in a modal', async () => {
    modalProperties.getModalDefaultProperties.and.returnValue(properties);
    const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
    currencyModalSpy.onWillDismiss.and.resolveTo({
      data: { action: 'primary' },
    });
    modalController.create.and.resolveTo(currencyModalSpy);

    const result = await component.continueWithPolicyViolations(
      criticalPolicyViolation2,
      splitPolicyExp4.data.final_desired_state
    );

    expect(result).toEqual({ action: 'primary' });
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyPolicyViolationComponent,
      componentProps: {
        policyViolationMessages: criticalPolicyViolation2,
        policyAction: splitPolicyExp4.data.final_desired_state,
      },
      mode: 'ios',
      ...properties,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
  });

  it('trackPolicyCorrections(): should track policy corrections', () => {
    component.isCriticalPolicyViolated$ = of(true);
    component.comments$ = of(estatusData1);
    component.fg.markAsDirty();

    fixture.detectChanges();

    component.trackPolicyCorrections();
    expect(trackingService.policyCorrection).toHaveBeenCalledWith({ Violation: 'Critical', Mode: 'Edit Expense' });
    expect(trackingService.policyCorrection).toHaveBeenCalledWith({ Violation: 'Regular', Mode: 'Edit Expense' });
  });

  xit('editExpense', () => {});

  it('getTimeSpentOnPage(): should get time spent on page', () => {
    component.expenseStartTime = 164577000;
    fixture.detectChanges();

    const result = component.getTimeSpentOnPage();
    expect(result).toEqual((new Date().getTime() - component.expenseStartTime) / 1000);
  });

  xit('trackAddExpense', () => {});

  xit('addExpense', () => {});

  it('closeAddEditExpenses(): should close the form and navigate back to my_expenses page', () => {
    component.closeAddEditExpenses();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
  });

  it('getParsedReceipt(): should get parsed receipt', fakeAsync(() => {
    transactionOutboxService.parseReceipt.and.resolveTo(parsedReceiptData1);
    currencyService.getHomeCurrency.and.returnValue(of('INR'));
    currencyService.getExchangeRate.and.returnValue(of(82));

    const result = component.getParsedReceipt('base64encoded', 'jpeg');
    tick(500);

    result.then((res) => {
      expect(res).toEqual({
        data: {
          category: 'SYSTEM',
          currency: 'USD',
          amount: 100,
          date: new Date('2023-02-15T06:30:00.000Z'),
          invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
          vendor_name: 'vendor',
        },
        exchangeRate: 82,
      });
      expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('base64encoded', 'jpeg');
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith(
        'USD',
        'INR',
        new Date('2023-02-15T06:30:00.000Z')
      );
    });
  }));

  xit('parseFile', () => {});

  xit('attachReceipts', () => {});

  xit('addAttachments', () => {});

  it('getReceiptExtension(): should get file extension', () => {
    const result = component.getReceiptExtension('name.pdf');
    expect(result).toEqual('pdf');
  });

  describe('getReceiptDetails():', () => {
    it('should get receipt details if file has pdf extension', () => {
      spyOn(component, 'getReceiptExtension').and.returnValue('pdf');

      const result = component.getReceiptDetails({ ...fileObjectData, name: '000.pdf' });

      expect(result).toEqual({
        type: 'pdf',
        thumbnail: 'img/fy-pdf.svg',
      });
    });

    it('should get receipt details if file is an image', () => {
      spyOn(component, 'getReceiptExtension').and.returnValue('jpeg');

      const result = component.getReceiptDetails(fileObjectData);

      expect(result).toEqual({
        type: 'image',
        thumbnail: fileObjectData.url,
      });
    });
  });

  xit('viewAttachments', () => {});

  describe('deleteExpense():', () => {
    it('should delete expense and navigate back to report if deleting directly from report', fakeAsync(() => {
      spyOn(component, 'getDeleteReportParams');
      const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

      deletePopoverSpy.onDidDismiss.and.resolveTo({
        data: {
          status: 'success',
        },
      });

      popoverController.create.and.resolveTo(deletePopoverSpy);
      component.isRedirectedFromReport = true;
      fixture.detectChanges();

      const header = 'Remove Expense';
      const body = 'Are you sure you want to remove this expense from this report?';
      const ctaText = 'Remove';
      const ctaLoadingText = 'Removing';

      component.deleteExpense('rpFE5X1Pqi9P');
      tick(500);

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_view_report', { id: 'rpFE5X1Pqi9P' }]);
      expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
        { header, body, ctaText, ctaLoadingText },
        true,
        'rpFE5X1Pqi9P'
      );
      expect(popoverController.create).toHaveBeenCalledOnceWith(
        component.getDeleteReportParams({ header, body, ctaText, ctaLoadingText }, true, 'rpFE5X1Pqi9P')
      );
    }));

    it('should delete expense and go back to my expenses page if not redirected from report', fakeAsync(() => {
      spyOn(component, 'getDeleteReportParams');
      const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

      deletePopoverSpy.onDidDismiss.and.resolveTo({
        data: {
          status: 'success',
        },
      });

      popoverController.create.and.resolveTo(deletePopoverSpy);
      component.isRedirectedFromReport = false;
      fixture.detectChanges();

      const header = 'Delete Expense';
      const body = 'Are you sure you want to delete this expense?';
      const ctaText = 'Delete';
      const ctaLoadingText = 'Deleting';

      component.deleteExpense();
      tick(500);

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
      expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
        { header, body, ctaText, ctaLoadingText },
        undefined,
        undefined
      );
      expect(popoverController.create).toHaveBeenCalledOnceWith(
        component.getDeleteReportParams({ header, body, ctaText, ctaLoadingText }, undefined, undefined)
      );
    }));
  });

  describe('openCommentsModal():', () => {
    it('should add comment', fakeAsync(() => {
      component.etxn$ = of(unflattenExp1);
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      const modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);

      modalSpy.onDidDismiss.and.resolveTo({ data: { updated: 'comment' } });

      modalController.create.and.resolveTo(modalSpy);

      component.openCommentsModal();
      tick(500);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ViewCommentComponent,
        componentProps: {
          objectType: 'transactions',
          objectId: unflattenExp1.tx.id,
        },
        ...properties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(trackingService.addComment).toHaveBeenCalledTimes(1);
    }));

    it('should view comment', fakeAsync(() => {
      component.etxn$ = of(unflattenExp1);
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      const modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);

      modalSpy.onDidDismiss.and.resolveTo({ data: {} });

      modalController.create.and.resolveTo(modalSpy);

      component.openCommentsModal();
      tick(500);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: ViewCommentComponent,
        componentProps: {
          objectType: 'transactions',
          objectId: unflattenExp1.tx.id,
        },
        ...properties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
      expect(trackingService.viewComment).toHaveBeenCalledTimes(1);
    }));
  });

  it('hideFields(): should disable expanded view', () => {
    component.hideFields();

    expect(trackingService.hideMoreClicked).toHaveBeenCalledOnceWith({
      source: 'Add Edit Expenses page',
    });
    expect(component.isExpandedView).toBeFalse();
  });

  it('showFields(): should show expanded view', () => {
    component.showFields();

    expect(trackingService.showMoreClicked).toHaveBeenCalledOnceWith({
      source: 'Add Edit Expenses page',
    });
    expect(component.isExpandedView).toBeTrue();
  });

  it('getPolicyDetails(): should get policy details', () => {
    policyService.getSpenderExpensePolicyViolations.and.returnValue(of(individualExpPolicyStateData2));

    component.getPolicyDetails();

    expect(component.policyDetails).toEqual(individualExpPolicyStateData2);
    expect(policyService.getSpenderExpensePolicyViolations).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
  });

  xit('saveAndMatchWithPersonalCardTxn', () => {});

  xit('uploadAttachments', () => {});

  describe('addFileType(): ', () => {
    it('should add file type image to objects if the file is not a pdf', () => {
      transactionOutboxService.isPDF.and.returnValue(false);
      const result = component.addFileType([fileObjectData]);

      expect(result).toEqual([{ ...fileObjectData, type: 'image' }]);
    });

    it('should add file type pdf to objects if the file is a pdf', () => {
      transactionOutboxService.isPDF.and.returnValue(true);
      const result = component.addFileType([{ ...fileObjectData, type: 'pdf' }]);

      expect(result).toEqual([{ ...fileObjectData, type: 'pdf' }]);
    });
  });

  it('postToFileService(): should post files to file service', () => {
    fileService.post.and.returnValue(of(null));

    component.postToFileService(fileObjectData, 'tx5fBcPBAxLv');

    expect(fileService.post).toHaveBeenCalledOnceWith({ ...fileObjectData, transaction_id: 'tx5fBcPBAxLv' });
  });

  it('uploadFileAndPostToFileService(): should upload to file service', () => {
    transactionOutboxService.fileUpload.and.resolveTo(fileObjectData);
    spyOn(component, 'postToFileService');

    component.uploadFileAndPostToFileService(fileObjectData, 'tx5fBcPBAxLv').subscribe(() => {
      expect(transactionOutboxService.fileUpload).toHaveBeenCalledOnceWith(fileObjectData.url, fileObjectData.type);
      expect(component.postToFileService).toHaveBeenCalledOnceWith(fileObjectData, 'tx5fBcPBAxLv');
    });
  });

  describe('getDuplicateExpenses():', () => {
    it('should get duplicate expenses', () => {
      activatedRoute.snapshot.params.id = 'tx5fBcPBAxLv';
      handleDuplicates.getDuplicatesByExpense.and.returnValue(of([duplicateSetData1]));
      transactionService.getETxnc.and.returnValue(of([expenseData1]));
      spyOn(component, 'addExpenseDetailsToDuplicateSets').and.returnValue([expenseData1]);

      component.getDuplicateExpenses();
      expect(handleDuplicates.getDuplicatesByExpense).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(transactionService.getETxnc).toHaveBeenCalledOnceWith({
        offset: 0,
        limit: 100,
        params: { tx_id: `in.(${['tx5fBcPBAxLv'].join(',')})` },
      });
      expect(component.addExpenseDetailsToDuplicateSets).toHaveBeenCalledOnceWith(duplicateSetData1, [expenseData1]);
    });

    it('should return empty array if no duplicate is found', () => {
      activatedRoute.snapshot.params.id = 'tx5fBcPBAxLv';
      handleDuplicates.getDuplicatesByExpense.and.returnValue(of([]));

      component.getDuplicateExpenses();
      expect(handleDuplicates.getDuplicatesByExpense).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
      expect(component.duplicateExpenses).toBeUndefined();
    });
  });

  it('addExpenseDetailsToDuplicateSets(): should add expense to duplicate sets if there exists a duplicate expense', () => {
    const result = component.addExpenseDetailsToDuplicateSets(duplicateSetData1, [expenseData1, expenseData2]);
    expect(result).toEqual([expenseData1]);
  });

  it('showSuggestedDuplicates(): should show potential duplicates', fakeAsync(() => {
    spyOn(component, 'getDuplicateExpenses');

    modalProperties.getModalDefaultProperties.and.returnValue(properties);

    const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
    currencyModalSpy.onWillDismiss.and.resolveTo({ data: { action: 'dismissed' } });

    modalController.create.and.resolveTo(currencyModalSpy);

    component.showSuggestedDuplicates([expenseData1]);
    tick(500);

    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: SuggestedDuplicatesComponent,
      componentProps: {
        duplicateExpenses: [expenseData1],
      },
      mode: 'ios',
      ...properties,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    expect(component.getDuplicateExpenses).toHaveBeenCalledTimes(1);
  }));

  it('showSnackBarToast(): should show snackbar with relevant properties', () => {
    const properties = {
      data: {
        icon: 'tick-square-filled',
        showCloseButton: true,
        message: 'Message',
      },
      duration: 3000,
    };
    snackbarProperties.setSnackbarProperties.and.returnValue(properties);

    component.showSnackBarToast({ message: 'Message' }, 'success', ['panel-class']);

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...properties,
      panelClass: ['panel-class'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', { message: 'Message' });
  });

  xit('ionViewWillLeave(): should unsubscribe or clean up observables on page exits', () => {
    spyOn(component.hardwareBackButtonAction, 'unsubscribe');
  });

  it('showSizeLimitExceededPopover(): should show a warning popover if size of the file increases', fakeAsync(() => {
    const sizeLimitExceededPopoverSpy = jasmine.createSpyObj('sizeLimitExceededPopover', ['present']);

    popoverController.create.and.resolveTo(sizeLimitExceededPopoverSpy);

    component.showSizeLimitExceededPopover();
    tick(500);

    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Size limit exceeded',
        message: 'The uploaded file is greater than 5MB in size. Please reduce the file size and try again.',
        primaryCta: {
          text: 'OK',
        },
      },
      cssClass: 'pop-up-in-center',
    });
  }));
});
