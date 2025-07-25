import { TitleCasePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Sanitizer } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TaxGroupService } from 'src/app/core/services/tax-group.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { DependentFieldComponent } from 'src/app/shared/components/dependent-fields/dependent-field/dependent-field.component';
import { FySelectComponent } from 'src/app/shared/components/fy-select/fy-select.component';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { MaskNumber } from 'src/app/shared/pipes/mask-number.pipe';
import { AddEditMileagePage } from './add-edit-mileage.page';
import { TestCases1 } from './add-edit-mileage-1.spec';
import { MileageService } from 'src/app/core/services/mileage.service';
import { MileageRatesService } from 'src/app/core/services/mileage-rates.service';
import { LocationService } from 'src/app/core/services/location.service';
import { FyLocationComponent } from 'src/app/shared/components/fy-location/fy-location.component';
import { TestCases2 } from '../add-edit-mileage/add-edit-mileage-2.spec';
import { TestCases3 } from '../add-edit-mileage/add-edit-mileage-3.spec';
import { TestCases4 } from './add-edit-mileage-4.spec';
import { TestCases5 } from './add-edit-mileage-5.spec';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { AdvanceWalletsService } from 'src/app/core/services/platform/v1/spender/advance-wallets.service';
import { PAGINATION_SIZE } from 'src/app/constants';
import { SpenderService } from 'src/app/core/services/platform/v1/spender/spender.service';
import { CostCentersService } from 'src/app/core/services/cost-centers.service';

export function setFormValid(component) {
  Object.defineProperty(component.fg, 'valid', {
    get: () => true,
  });
}

describe('AddEditMileagePage', () => {
  const getTestBed = () => {
    const accountsServiceSpy = jasmine.createSpyObj('AccountsService', [
      'getMyAccounts',
      'getPaymentModes',
      'getEtxnSelectedPaymentMode',
      'getAccountTypeFromPaymentMode',
      'getPaymentModesWithAdvanceWallets',
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
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getAutoSubmissionReportName']);
    const platformSpenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', [
      'getAllReportsByParams',
      'ejectExpenses',
      'addExpenses',
    ]);
    const advanceWalletsServiceSpy = jasmine.createSpyObj('AdvanceWalletsService', ['getAllAdvanceWallets']);
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll', 'filterByCategory']);
    const customFieldsServiceSpy = jasmine.createSpyObj('CustomFieldsService', [
      'standardizeCustomFields',
      'setDefaultValue',
    ]);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getRemoveCardExpenseDialogBody',
      'removeCorporateCardExpense',
      'unmatchCCCExpense',
      'transformExpense',
      'checkPolicy',
      'upsert',
      'review',
      'matchCCCExpense',
      'getDefaultVehicleType',
    ]);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById', 'post', 'deleteExpenses']);
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
    const expenseCommentServiceSpy = jasmine.createSpyObj('ExpenseCommentService', [
      'getTransformedComments',
      'findLatestExpenseComment',
      'post',
    ]);
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
      'clickDeleteExpense',
      'commuteDeductionAddLocationOptionClicked',
      'commuteDeductionDetailsAddedFromMileageForm',
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
    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustUrl', 'sanitize']);
    const personalCardsServiceSpy = jasmine.createSpyObj('PersonalCardsService', ['matchExpense']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const titleCasePipeSpy = jasmine.createSpyObj('TitleCasePipe', ['transform']);
    const paymentModesServiceSpy = jasmine.createSpyObj('PaymentModesService', [
      'showInvalidPaymentModeToast',
      'checkIfPaymentModeConfigurationsIsEnabled',
    ]);
    const taxGroupServiceSpy = jasmine.createSpyObj('TaxGroupService', ['get']);
    const costCentersServiceSpy = jasmine.createSpyObj('CostCentersService', ['getAllActive']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', [
      'getAllowedCostCenters',
      'getAllowedPaymentModes',
      'get',
    ]);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get']);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const platformHandlerServiceSpy = jasmine.createSpyObj('PlatformHandlerService', ['registerBackButtonAction']);
    const mileageServiceSpy = jasmine.createSpyObj('MileageService', [
      'getDistance',
      'getEmployeeMileageSettings',
      'isCommuteDeductionEnabled',
      'getCommuteDeductionOptions',
    ]);
    const mileageRateServiceSpy = jasmine.createSpyObj('MileageRatesService', [
      'filterEnabledMileageRates',
      'getReadableRate',
      'formatMileageRateName',
      'getAllMileageRates',
    ]);
    const locationServiceSpy = jasmine.createSpyObj('LocationService', [
      'getCurrentLocation',
      'getAutocompletePredictions',
      'getGeocode',
    ]);

    const platformHandlerService = jasmine.createSpyObj('PlatformHandlerService', ['registerBackButtonAction']);

    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getCommuteDetails']);

    TestBed.configureTestingModule({
      declarations: [
        AddEditMileagePage,
        MaskNumber,
        FySelectComponent,
        EllipsisPipe,
        DependentFieldComponent,
        FyLocationComponent,
      ],
      imports: [IonicModule.forRoot(), RouterTestingModule, RouterModule],
      providers: [
        UntypedFormBuilder,
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
        { provide: PAGINATION_SIZE, useValue: 2 },
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
          provide: SpenderReportsService,
          useValue: platformSpenderReportsServiceSpy,
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
          provide: ExpenseCommentService,
          useValue: expenseCommentServiceSpy,
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
          provide: PaymentModesService,
          useValue: paymentModesServiceSpy,
        },
        {
          provide: TaxGroupService,
          useValue: taxGroupServiceSpy,
        },
        {
          provide: CostCentersService,
          useValue: costCentersServiceSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: LaunchDarklyService,
          useValue: launchDarklyServiceSpy,
        },
        {
          provide: Platform,
          useValue: platformSpy,
        },
        {
          provide: PlatformHandlerService,
          useValue: platformHandlerServiceSpy,
        },
        {
          provide: MileageService,
          useValue: mileageServiceSpy,
        },
        {
          provide: MileageRatesService,
          useValue: mileageRateServiceSpy,
        },
        {
          provide: LocationService,
          useValue: locationServiceSpy,
        },
        {
          provide: PlatformHandlerService,
          useValue: platformHandlerServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: EmployeesService,
          useValue: employeesServiceSpy,
        },
        {
          provide: AdvanceWalletsService,
          useValue: advanceWalletsServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    return TestBed;
  };

  TestCases1(getTestBed);
  TestCases2(getTestBed);
  TestCases3(getTestBed);
  TestCases4(getTestBed);
  TestCases5(getTestBed);
});
