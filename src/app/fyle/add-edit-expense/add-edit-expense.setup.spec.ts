import { TitleCasePipe } from '@angular/common';
import { Sanitizer, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController, PopoverController, NavController, ActionSheetController } from '@ionic/angular';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
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
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { AddEditExpensePage } from './add-edit-expense.page';
import { TestCases1 } from './add-edit-expense-1.spec';
import { TestCases2 } from './add-edit-expense-2.spec';
import { TestCases3 } from './add-edit-expense-3.spec';

export function setFormValid(component) {
  Object.defineProperty(component.fg, 'valid', {
    get: () => true,
  });
}

fdescribe('AddEditExpensePage', () => {
  const getTestBed = () => {
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
    });

    return TestBed;
  };

  TestCases1(getTestBed);
  TestCases2(getTestBed);
  TestCases3(getTestBed);
});
