import { CurrencyPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController, NavController, PopoverController } from '@ionic/angular';
import { TestCases1 } from './add-edit-per-diem-1.page.spec';
import { AddEditPerDiemPage } from './add-edit-per-diem.page';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { StatusService } from 'src/app/core/services/status.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TokenService } from 'src/app/core/services/token.service';
import { DateService } from 'src/app/core/services/date.service';
import { TestCases2 } from './add-edit-per-diem-2.page.spec';
import { TestCases3 } from './add-edit-per-diem-3.page.spec';
import { TestCases4 } from './add-edit-per-diem-4.page.spec';
import { TestCases5 } from './add-edit-per-diem-5.page.spec';

describe('AddEditPerDiemPage', () => {
  const getTestBed = () => {
    const accountsServiceSpy = jasmine.createSpyObj('AccountsService', [
      'getEMyAccounts',
      'getPaymentModes',
      'getEtxnSelectedPaymentMode',
      'getAccountTypeFromPaymentMode',
    ]);
    const perDiemServiceSpy = jasmine.createSpyObj('PerDiemService', ['getRates', 'getAllowedPerDiems']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll', 'filterByCategory']);
    const customFieldsServiceSpy = jasmine.createSpyObj('CustomFieldsService', ['standardizeCustomFields']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', [
      'getHomeCurrency',
      'getAmountWithCurrencyFraction',
      'getExchangeRate',
    ]);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getAutoSubmissionReportName',
      'getReportById',
      'getFilteredPendingReports',
      'addTransactions',
      'removeTransaction',
    ]);
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', [
      'getAllowedOrgCategoryIds',
      'getProjectCount',
      'getbyId',
    ]);
    const transactionsOutboxServiceSpy = jasmine.createSpyObj('TransactionsOutboxService', ['addEntryAndSync']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getETxnUnflattened',
      'checkPolicy',
      'upsert',
      'review',
      'delete',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', [
      'transformTo',
      'getCriticalPolicyRules',
      'getPolicyRules',
      'getSpenderExpensePolicyViolations',
    ]);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'getTop']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['find', 'findLatestComment', 'post']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'addPageView',
      'addPageViewWithParams',
      'viewExpense',
      'createExpense',
      'policyCorrection',
      'editExpense',
      'addToExistingReportAddEditExpense',
      'removeFromExistingReportEditExpense',
      'showToastMessage',
      'clickDeleteExpense',
    ]);
    const recentlyUsedItemsServiceSpy = jasmine.createSpyObj('RecentlyUsedItemsService', [
      'getRecentlyUsed',
      'getRecentCostCenters',
      'getRecentlyUsedProjects',
    ]);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', [
      'getAllMap',
      'filterByOrgCategoryId',
      'getDefaultTxnFieldValues',
    ]);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const matSnackbarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const paymentModesServiceSpy = jasmine.createSpyObj('PaymentModesService', [
      'showInvalidPaymentModeToast',
      'checkIfPaymentModeConfigurationsIsEnabled',
    ]);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getAll']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', [
      'getAllowedPaymentModes',
      'get',
      'getAllowedCostCenters',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['addDaysToDate', 'getUTCDate']);

    TestBed.configureTestingModule({
      declarations: [AddEditPerDiemPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, FormsModule, RouterTestingModule, RouterModule],
      providers: [
        FormBuilder,
        FyCurrencyPipe,
        CurrencyPipe,
        {
          provide: AccountsService,
          useValue: accountsServiceSpy,
        },
        {
          provide: PerDiemService,
          useValue: perDiemServiceSpy,
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
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: ProjectsService,
          useValue: projectServiceSpy,
        },
        {
          provide: TransactionsOutboxService,
          useValue: transactionsOutboxServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: PolicyService,
          useValue: policyServiceSpy,
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
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        {
          provide: RecentlyUsedItemsService,
          useValue: recentlyUsedItemsServiceSpy,
        },
        {
          provide: ExpenseFieldsService,
          useValue: expenseFieldsServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackbarSpy,
        },
        {
          provide: PaymentModesService,
          useValue: paymentModesServiceSpy,
        },
        {
          provide: CategoriesService,
          useValue: categoriesServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
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
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                remove_from_report: 'true',
                id: 'tx5n59fvxk4z',
              },
            },
          },
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    return TestBed;
  };

  TestCases1(getTestBed);
  TestCases2(getTestBed);
  TestCases3(getTestBed);
  TestCases4(getTestBed);
  TestCases5(getTestBed);
});
