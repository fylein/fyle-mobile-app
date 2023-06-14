import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TitleCasePipe } from '@angular/common';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DateService } from 'src/app/core/services/date.service';
import { ReportService } from 'src/app/core/services/report.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { StatusService } from 'src/app/core/services/status.service';
import { FileService } from 'src/app/core/services/file.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { CorporateCreditCardExpenseService } from '../../core/services/corporate-credit-card-expense.service';
import { TrackingService } from '../../core/services/tracking.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { TokenService } from 'src/app/core/services/token.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { TaxGroupService } from 'src/app/core/services/tax-group.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { AddEditExpensePage } from './add-edit-expense.page';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter, NO_ERRORS_SCHEMA, Sanitizer } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Subscription, concatMap, of } from 'rxjs';
import { expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { duplicateSetData1 } from 'src/app/core/mock-data/duplicate-sets.data';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { accountsData, orgSettingsData, paymentModesData } from 'src/app/core/test-data/accounts.service.spec.data';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { costCenterApiRes1, expectedCCdata } from 'src/app/core/mock-data/cost-centers.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { unflattenExp1, unflattenExp2 } from 'src/app/core/mock-data/unflattened-expense.data';
import {
  filterOrgCategoryParam,
  orgCategoryData,
  transformedOrgCategories,
} from 'src/app/core/mock-data/org-category.data';
import { criticalPolicyViolation2 } from 'src/app/core/mock-data/crtical-policy-violations.data';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';

fdescribe('AddEditExpensePage', () => {
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

    TestBed.configureTestingModule({
      declarations: [AddEditExpensePage],
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
                dataUrl: '',
                remove_from_report: true,
                canExtractData: false,
                personalCardTxn: '',
                rp_id: '',
                image: '',
                activeIndex: 0,
                navigate_back: true,
                txnIds: [],
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

    //@ts-ignore
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
    it('should back to the report automatically', () => {
      activatedRoute.snapshot.params.bankTxn = JSON.stringify(['btxnSrrehKHsAg']);
      activatedRoute.snapshot.params.persist_filters = true;
      fixture.detectChanges();

      navController.back.and.returnValue(null);

      component.goBack();
      expect(navController.back).toHaveBeenCalledTimes(1);
    });

    it('should back to txn if it is not redirected from report and filters are not persistent', () => {
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

    it('should show popup and go back to txn if navigate back is false', fakeAsync(() => {
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

  xit('merchantValidator', () => {});

  xit('currencyObjValidator', () => {});

  xit('setUpTaxCalculations', () => {});

  xit('checkIfInvalidPaymentMode', () => {});

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

  xit('removeCorporateCardExpense', () => {});

  xit('markPeronsalOrDismiss', () => {});

  xit('showFormValidationErrors', () => {});

  xit('getActionSheetOptions', () => {});

  xit('showMoreActions', () => {});

  xit('getFormValidationErrors', () => {});

  describe('setupCostCenters():', () => {
    it('should setup cost centers', () => {
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
    orgSettingsService.get.and.returnValue(
      of({
        ...orgSettingsData,
        corporate_credit_card_settings: {
          ...orgSettingsData.corporate_credit_card_settings,
          allowed: false,
          enabled: false,
        },
      })
    );
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

  xit('getInstaFyleImageData', () => {});

  xit('getNewExpenseObservable', () => {});

  xit('setupFormInit', () => {});

  xit('getAutofillCategory', () => {});

  xit('setCategoryFromVendor', () => {});

  xit('getCategoryOnEdit', () => {});

  xit('getCategoryOnAdd', () => {});

  xit('setupCustomFields', () => {});

  xit('setupExpenseFields', () => {});

  xit('setupFilteredCategories', () => {});

  xit('getEditExpenseObservable', () => {});

  xit('goToPrev', () => {});

  xit('goToNext', () => {});

  xit('goToTransaction', () => {});

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

  xit('showAddToReportSuccessToast', () => {});

  xit('saveExpense', () => {});

  xit('saveAndNewExpense', () => {});

  xit('saveExpenseAndGotoPrev', () => {});

  xit('saveExpenseAndGotoNext', () => {});

  it('continueWithCriticalPolicyViolation(): should show critical policy violation modal', async () => {
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

  xit('continueWithPolicyViolations', () => {});

  xit('trackPolicyCorrections', () => {});

  xit('editExpense', () => {});

  xit('getTimeSpentOnPage', () => {});

  xit('trackAddExpense', () => {});

  xit('addExpense', () => {});

  xit('closeAddEditExpenses', () => {});

  xit('getParsedReceipt', () => {});

  xit('parseFile', () => {});

  xit('attachReceipts', () => {});

  xit('addAttachments', () => {});

  xit('getReceiptExtension', () => {});

  xit('getReceiptDetails', () => {});

  xit('viewAttachments', () => {});

  xit('deleteExpense', () => {});

  xit('openCommentsModal', () => {});

  xit('hideFields', () => {});

  xit('showFields', () => {});

  xit('getPolicyDetails', () => {});

  xit('saveAndMatchWithPersonalCardTxn', () => {});

  xit('uploadAttachments', () => {});

  xit('addFileType', () => {});

  xit('uploadMultipleFiles', () => {});

  xit('postToFileService', () => {});

  xit('uploadFileAndPostToFileService', () => {});

  xit('getDuplicateExpenses', () => {});

  it('addExpenseDetailsToDuplicateSets(): should add expense to duplicate sets if there exists a duplicate expense', () => {
    const result = component.addExpenseDetailsToDuplicateSets(duplicateSetData1, [expenseData1, expenseData2]);
    expect(result).toEqual([expenseData1]);
  });

  xit('showSuggestedDuplicates', () => {});

  xit('ionViewWillLeave(): should unsubscribe or clean up observables on page exits', () => {
    spyOn(component.hardwareBackButtonAction, 'unsubscribe');
  });
});
