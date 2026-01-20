import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { DateService } from 'src/app/core/services/date.service';
import { SplitExpenseService } from 'src/app/core/services/split-expense.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { SplitExpensePage } from './split-expense.page';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ModalController, NavController, PopoverController } from '@ionic/angular/standalone';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterTestingModule } from '@angular/router/testing';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import {
  expectedFilterOrgCategory,
  expectedOrgCategoriesPaginated,
  filterOrgCategoryParam,
  orgCategoryData1,
  transformedOrgCategories,
  unspecifiedCategory,
} from 'src/app/core/mock-data/org-category.data';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { FyAlertInfoComponent } from 'src/app/shared/components/fy-alert-info/fy-alert-info.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  modifiedTxnData4,
  modifiedTxnData5,
  modifiedTxnData6,
  modifiedTxnData7,
  sourceTxn2,
  splitTxns,
  txnData,
  txnData2,
  txnData4,
  txnData6,
  txnList,
} from 'src/app/core/mock-data/transaction.data';
import { expenseFieldObjData, txnFieldData } from 'src/app/core/mock-data/expense-field-obj.data';
import {
  fileObjectData5,
  fileObject6,
  fileObject8,
  fileObjectAdv,
  fileObjectAdv1,
  fileObjectData4,
  fileUrlMockData,
  fileObjectData1,
} from 'src/app/core/mock-data/file-object.data';

import {
  splitExpense1,
  splitExpense2,
  splitExpense8,
  splitExpense9,
  splitExpenseDataWithCostCenter,
  splitExpenseDataWithCostCenter2,
  splitExpenseDataWithProject,
  splitExpenseDataWithProject2,
} from 'src/app/core/mock-data/split-expense.data';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { dependentFieldValues } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import {
  allowedActiveCategories,
  allowedActiveCategoriesListOptions,
  expectedProjectsResponse,
  testActiveCategoryList,
  testActiveCategoryListOptions,
  testProjectV2,
} from 'src/app/core/test-data/projects.spec.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SplitExpensePolicyViolationComponent } from 'src/app/shared/components/split-expense-policy-violation/split-expense-policy-violation.component';
import { policyViolation1, policyViolationData6 } from 'src/app/core/mock-data/policy-violation.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { unflattenedAccount3Data } from 'src/app/core/test-data/accounts.service.spec.data';
import { categorieListRes, orgCategoryListItemData1 } from 'src/app/core/mock-data/org-category-list-item.data';
import { cloneDeep } from 'lodash';
import {
  splitExpenseFormData1,
  splitExpenseFormData2,
  splitExpenseFormData3,
  splitExpenseFormData5,
  splitExpenseFormData6,
} from 'src/app/core/mock-data/split-expense-form.data';
import { costCentersData3, expectedCCdata } from 'src/app/core/mock-data/cost-centers.data';
import {
  currencyObjData1,
  currencyObjData2,
  currencyObjData3,
  currencyObjData4,
} from 'src/app/core/mock-data/currency-obj.data';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import {
  costCenterExpenseField,
  expenseFieldResponse,
  transformedResponse,
} from 'src/app/core/mock-data/expense-field.data';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { txnCustomPropertiesData } from 'src/app/core/mock-data/txn-custom-properties.data';
import { filteredSplitPolicyViolationsData } from 'src/app/core/mock-data/filtered-split-policy-violations.data';
import {
  filteredMissingFieldsViolationsData,
  filteredMissingFieldsViolationsData2,
} from 'src/app/core/mock-data/filtered-missing-fields-violations.data';
import {
  transformedSplitExpenseMissingFieldsData,
  transformedSplitExpenseMissingFieldsData3,
  transformedSplitExpenseMissingFieldsData4,
} from 'src/app/core/mock-data/transformed-split-expense-missing-fields.data';
import { splitPolicyExp1 } from 'src/app/core/mock-data/split-expense-policy.data';
import { SplitExpenseMissingFieldsData } from 'src/app/core/mock-data/split-expense-missing-fields.data';
import { splitPayloadData1 } from 'src/app/core/mock-data/split-payload.data';
import {
  expenseData,
  mileageExpense,
  platformExpenseDataWithoutReportId,
  platformExpenseWithExtractedData,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { orgSettingsWithProjectCategoryRestrictions } from 'src/app/core/mock-data/org-settings.data';
import { CostCentersService } from 'src/app/core/services/cost-centers.service';
import dayjs from 'dayjs';
import { OrgCategory } from 'src/app/core/models/v1/org-category.model';
import { FyMsgPopoverComponent } from 'src/app/shared/components/fy-msg-popover/fy-msg-popover.component';
import { ReviewSplitExpenseComponent } from 'src/app/shared/components/review-split-expense/review-split-expense.component';
import { splitConfig } from 'src/app/core/mock-data/split-config.data';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
describe('SplitExpensePage', () => {
  let component: SplitExpensePage;
  let fixture: ComponentFixture<SplitExpensePage>;
  let formBuilder: jasmine.SpyObj<UntypedFormBuilder>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let dateService: jasmine.SpyObj<DateService>;
  let splitExpenseService: jasmine.SpyObj<SplitExpenseService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let navController: jasmine.SpyObj<NavController>;
  let router: jasmine.SpyObj<Router>;
  let transactionsOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let policyService: jasmine.SpyObj<PolicyService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let costCentersService: jasmine.SpyObj<CostCentersService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let orgSettingsService: jasmine.SpyObj<PlatformOrgSettingsService>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;
  let activateRouteMock: ActivatedRoute;
  let destroy$: Subject<void>;
  let formControlSpy: jasmine.SpyObj<UntypedFormControl>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', [
      'getAll',
      'filterRequired',
      'getCategoryByName',
    ]);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['getUTCDate', 'addDaysToDate']);
    const splitExpenseServiceSpy = jasmine.createSpyObj('SplitExpenseService', [
      'createSplitTxns',
      'splitExpense',
      'postSplitExpenseComments',
      'filteredMissingFieldsViolations',
      'filteredPolicyViolations',
      'handlePolicyAndMissingFieldsCheck',
      'checkIfMissingFieldsExist',
      'transformSplitTo',
      'normalizeSplitAmounts',
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById'], {
      splitExpensesData$: new BehaviorSubject(null),
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const transactionsOutboxServiceSpy = jasmine.createSpyObj('TransactionsOutboxService', ['fileUpload']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'showToastMessage',
      'splittingExpense',
      'splitExpenseSuccess',
      'splitExpenseFailed',
      'splitExpensePolicyCheckFailed',
      'splitExpensePolicyAndMissingFieldsPopupShown',
    ]);
    const policyServiceSpy = jasmine.createSpyObj('PolicyService', ['checkIfViolationsExist']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'present', 'getTop']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const costCentersServiceSpy = jasmine.createSpyObj('CostCentersService', ['getAllActive']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', [
      'getAllowedCostCenters',
      'get',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('PlatformOrgSettingsService', ['get']);
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', [
      'getDependentFieldValuesForBaseField',
    ]);
    formControlSpy = jasmine.createSpyObj('FormControl', ['clearValidators', 'updateValueAndValidity']);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);
    const projectsServiceSpy = jasmine.createSpyObj('ProjectsService', ['getbyId', 'getAllowedOrgCategoryIds']);
    const timezoneServiceSpy = jasmine.createSpyObj('TimezoneService', [
      'convertToUtc',
      'convertAllDatesToProperLocale',
    ]);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule,
        RouterTestingModule,
        MatIconTestingModule,
        TranslocoModule,
        SplitExpensePage,
        FyAlertInfoComponent,
      ],
      providers: [
        UntypedFormBuilder,
        {
          provide: CategoriesService,
          useValue: categoriesServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        { provide: SplitExpenseService, useValue: splitExpenseServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TransactionsOutboxService, useValue: transactionsOutboxServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: ModalPropertiesService, useValue: modalPropertiesSpy },
        { provide: CostCentersService, useValue: costCentersServiceSpy },
        { provide: PlatformEmployeeSettingsService, useValue: platformEmployeeSettingsServiceSpy },
        { provide: PlatformOrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: DependentFieldsService, useValue: dependentFieldsServiceSpy },
        { provide: LaunchDarklyService, useValue: launchDarklyServiceSpy },
        { provide: ProjectsService, useValue: projectsServiceSpy },
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                currencyObj: '{"currency":"USD","symbol":"$","id":"USD"}',
                splitConfig:
                  '{"category":{"is_mandatory":false,"is_visible":true},"costCenter":{"is_mandatory":false,"is_visible":true},"project":{"is_mandatory":true,"is_visible":true}}',
                txnFields: '{"project_id":"test","cost_center_id":"test"}',
                fileObjs: '[{"url":"mockUrl"}]',
                txn: '{"project_id": "3943"}',
                selectedCCCTransaction: '{"id":"tx3qwe4ty"}',
                selectedReportId: '"rpt3qwe4ty"',
                selectedProject: JSON.stringify(expectedProjectsResponse[0]),
                expenseFields: JSON.stringify(expenseFieldResponse),
              },
            },
          },
        },
        {
          provide: TimezoneService,
          useValue: timezoneServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SplitExpensePage);
    component = fixture.componentInstance;

    formBuilder = TestBed.inject(UntypedFormBuilder) as jasmine.SpyObj<UntypedFormBuilder>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    splitExpenseService = TestBed.inject(SplitExpenseService) as jasmine.SpyObj<SplitExpenseService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    transactionsOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    costCentersService = TestBed.inject(CostCentersService) as jasmine.SpyObj<CostCentersService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    orgSettingsService = TestBed.inject(PlatformOrgSettingsService) as jasmine.SpyObj<PlatformOrgSettingsService>;
    dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    timezoneService = TestBed.inject(TimezoneService) as jasmine.SpyObj<TimezoneService>;
    activateRouteMock = TestBed.inject(ActivatedRoute);
    destroy$ = new Subject<void>();
    component.destroy$ = destroy$;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goBack()', () => {
    component.goBack();
    expect(navController.back).toHaveBeenCalledTimes(1);
  });

  describe('onChangeAmount():', () => {
    it('should get the new amount and percentage value after amount is changed for first split', fakeAsync(() => {
      spyOn(component, 'getTotalSplitAmount');
      component.amount = 2000;
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(120),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const otherSplitExpenseForm = new UntypedFormGroup({
        amount: new UntypedFormControl(800),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });
      Object.defineProperty(splitExpenseForm1.controls.amount, '_pendingChange', { value: true });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, otherSplitExpenseForm]);

      component.onChangeAmount(splitExpenseForm1, 0);
      tick(500);
      expect(otherSplitExpenseForm.controls.amount.value).toEqual(1880);
      expect(otherSplitExpenseForm.controls.percentage.value).toEqual(94);
      expect(splitExpenseForm1.controls.percentage.value).toEqual(6);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    }));

    it('should get the new amount and percentage value after amount is changed for second split', fakeAsync(() => {
      spyOn(component, 'getTotalSplitAmount');
      component.amount = 2000;
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(1200),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const otherSplitExpenseForm = new UntypedFormGroup({
        amount: new UntypedFormControl(80),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });
      Object.defineProperty(otherSplitExpenseForm.controls.amount, '_pendingChange', { value: true });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, otherSplitExpenseForm]);

      component.onChangeAmount(otherSplitExpenseForm, 1);
      tick(500);
      expect(splitExpenseForm1.controls.amount.value).toEqual(1920);
      expect(splitExpenseForm1.controls.percentage.value).toEqual(96);
      expect(otherSplitExpenseForm.controls.percentage.value).toEqual(4);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    }));

    it('should return void immediately if amount is null', () => {
      spyOn(component, 'getTotalSplitAmount');
      const splitExpenseForm1 = cloneDeep(splitExpenseFormData1);

      Object.defineProperty(splitExpenseForm1.controls.amount, '_pendingChange', { value: true });

      component.onChangeAmount(splitExpenseForm1, 0);

      expect(splitExpenseForm1.controls.amount.value).toEqual(120);
      expect(splitExpenseForm1.controls.percentage.value).toEqual(60);
      expect(component.getTotalSplitAmount).not.toHaveBeenCalled();
    });

    it('should return void immediately if splitExpenseForm.amount is not a number', () => {
      spyOn(component, 'getTotalSplitAmount');
      component.amount = 2000;
      const splitExpenseForm1 = cloneDeep(splitExpenseFormData2);

      Object.defineProperty(splitExpenseForm1.controls.amount, '_pendingChange', { value: true });

      component.onChangeAmount(splitExpenseForm1, 0);

      expect(splitExpenseForm1.controls.amount.value).toBeNull();
      expect(splitExpenseForm1.controls.percentage.value).toEqual(60);
      expect(component.getTotalSplitAmount).not.toHaveBeenCalled();
    });
  });

  describe('onChangePercentage():', () => {
    it('should return void immediately if amount is null', () => {
      spyOn(component, 'getTotalSplitAmount');
      const splitExpenseForm1 = cloneDeep(splitExpenseFormData1);

      Object.defineProperty(splitExpenseForm1.controls.percentage, '_pendingChange', { value: true });

      component.onChangePercentage(splitExpenseForm1, 0);

      expect(splitExpenseForm1.controls.amount.value).toEqual(120);
      expect(splitExpenseForm1.controls.percentage.value).toEqual(60);
      expect(component.getTotalSplitAmount).not.toHaveBeenCalled();
    });

    it('should return void immediately if splitExpenseForm.percentage is not a number', () => {
      spyOn(component, 'getTotalSplitAmount');
      component.amount = 2000;
      const splitExpenseForm1 = cloneDeep(splitExpenseFormData3);

      Object.defineProperty(splitExpenseForm1.controls.percentage, '_pendingChange', { value: true });

      component.onChangePercentage(splitExpenseForm1, 0);

      expect(splitExpenseForm1.controls.amount.value).toEqual(120);
      expect(splitExpenseForm1.controls.percentage.value).toBeNull();
      expect(component.getTotalSplitAmount).not.toHaveBeenCalled();
    });

    it('should get the new amount and percentage value after percentage is changed for first split', fakeAsync(() => {
      spyOn(component, 'getTotalSplitAmount');
      component.amount = 2000;
      const splitExpenseForm1 = cloneDeep(splitExpenseFormData1);
      const otherSplitExpenseForm = cloneDeep(splitExpenseFormData5);
      Object.defineProperty(splitExpenseForm1.controls.percentage, '_pendingChange', { value: true });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, otherSplitExpenseForm]);

      component.onChangePercentage(splitExpenseForm1, 0);

      expect(otherSplitExpenseForm.controls.percentage.value).toEqual(40);
      expect(otherSplitExpenseForm.controls.amount.value).toEqual(800);
      expect(splitExpenseForm1.controls.percentage.value).toEqual(60);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    }));

    it('should get the new amount and percentage value after percentage is changed for second split', fakeAsync(() => {
      spyOn(component, 'getTotalSplitAmount');
      component.amount = 2000;
      const splitExpenseForm1 = cloneDeep(splitExpenseFormData1);
      const otherSplitExpenseForm = cloneDeep(splitExpenseFormData6);
      Object.defineProperty(otherSplitExpenseForm.controls.percentage, '_pendingChange', { value: true });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, otherSplitExpenseForm]);

      component.onChangePercentage(otherSplitExpenseForm, 1);

      expect(splitExpenseForm1.controls.percentage.value).toEqual(4);
      expect(splitExpenseForm1.controls.amount.value).toEqual(80);
      expect(otherSplitExpenseForm.controls.percentage.value).toEqual(96);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    }));
  });

  describe('getTotalSplitAmount():', () => {
    it('should calculate total split amount and remaining amount correctly when there are two form groups', () => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(473.4),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
      });
      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(315.6),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
      });
      component.amount = 789;

      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);

      component.getTotalSplitAmount();

      expect(component.totalSplitAmount).toEqual(789);
      expect(component.remainingAmount).toEqual(0);
    });

    it('should calculate total split amount and remaining amount correctly when the expense is not evenly split in three', () => {
      component.amount = 25000;
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(5000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
      });

      const splitExpenseForm3 = new UntypedFormGroup({
        amount: new UntypedFormControl(null),
        currency: new UntypedFormControl(null),
        percentage: new UntypedFormControl(null),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
      });

      component.splitExpensesFormArray = new UntypedFormArray([
        splitExpenseForm1,
        splitExpenseForm2,
        splitExpenseForm3,
      ]);

      component.getTotalSplitAmount();
      expect(component.totalSplitAmount).toEqual(15000);
      expect(component.remainingAmount).toEqual(10000);
    });
  });

  describe('setUpSplitExpenseBillable():', () => {
    it('should return false when billable is disabled at org level', () => {
      component.txnFields = {
        ...txnFieldData,
        billable: {
          ...txnFieldData.billable,
          is_enabled: false,
        },
      };
      component.transaction = splitTxns[0]; // billable: true
      const result = component.setUpSplitExpenseBillable(splitExpense1);
      expect(result).toBeFalse();
    });

    it('should return project default_billable when project exists and billable is enabled', () => {
      component.txnFields = txnFieldData;
      const splitExpenseWithBillableProject = {
        ...splitExpense1,
        project: {
          ...splitExpense1.project,
          default_billable: true,
        },
      };
      const result = component.setUpSplitExpenseBillable(splitExpenseWithBillableProject);
      expect(result).toBeTrue();
    });

    it('should return false when project has default_billable as false', () => {
      component.txnFields = txnFieldData;
      const splitExpenseWithNonBillableProject = {
        ...splitExpense1,
        project: {
          ...splitExpense1.project,
          default_billable: false,
        },
      };
      const result = component.setUpSplitExpenseBillable(splitExpenseWithNonBillableProject);
      expect(result).toBeFalse();
    });

    it('should return false when project has default_billable as null', () => {
      component.txnFields = txnFieldData;
      const splitExpenseWithNullBillableProject = {
        ...splitExpense1,
        project: {
          ...splitExpense1.project,
          default_billable: null,
        },
      };
      const result = component.setUpSplitExpenseBillable(splitExpenseWithNullBillableProject);
      expect(result).toBeFalse();
    });

    it('should return transaction billable when no project and billable is enabled', () => {
      component.txnFields = txnFieldData;
      component.transaction = splitTxns[0]; // billable: true
      const result = component.setUpSplitExpenseBillable(splitExpense2);
      expect(result).toBeTrue();
    });

    it('should return false when transaction is not billable and no project', () => {
      component.txnFields = txnFieldData;
      component.transaction = txnList[0]; // billable: false
      const result = component.setUpSplitExpenseBillable(splitExpense2);
      expect(result).toBeFalse();
    });

    it('should return false when transaction billable is null and no project', () => {
      component.txnFields = txnFieldData;
      component.transaction = { ...txnList[0], billable: null };
      const result = component.setUpSplitExpenseBillable(splitExpense2);
      expect(result).toBeFalse();
    });
  });

  describe('setUpSplitExpenseTax()', () => {
    it('should return the correct value when the expense is split by tax', () => {
      component.transaction = txnData6;
      const result = component.setUpSplitExpenseTax(splitExpense2);
      expect(result).toEqual(202.386);
    });

    it('should return the tax amount when the expense is split by tax and the tax amount has a falsy value', () => {
      const splitTransactionData = {
        ...txnData6,
        tax_amount: 0,
      };
      component.transaction = splitTransactionData;
      const result = component.setUpSplitExpenseTax(splitExpense1);
      expect(result).toBe(0);
    });
  });

  describe('uploadNewFiles(): ', () => {
    it('should upload new files when the type is an image', (done) => {
      const mockFileObjectAdv = cloneDeep(fileObjectData5);
      const mockFileObject = {
        ...mockFileObjectAdv,
        name: '000.jpeg',
      };
      const mockFile = cloneDeep(fileObjectAdv);
      const files = mockFile;
      const dataUrl = mockFile[0].url;
      const attachmentType = 'image';
      transactionsOutboxService.fileUpload.and.resolveTo(mockFileObject);

      component.uploadNewFiles(files).subscribe((result) => {
        expect(result).toEqual([mockFileObject]);
        expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(dataUrl, attachmentType);
        done();
      });
    });

    it('should upload new files when the type is a png', (done) => {
      const mockFileObjectAdv = cloneDeep(fileObjectAdv);
      const mockFile = {
        ...mockFileObjectAdv[0],
        type: 'png',
      };
      const files = [mockFile];
      const dataUrl = mockFileObjectAdv[0].url;
      const attachmentType = 'image';
      transactionsOutboxService.fileUpload.and.resolveTo(fileObjectData5);

      component.uploadNewFiles(files).subscribe((result) => {
        expect(result).toEqual([fileObjectData5]);
        expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(dataUrl, attachmentType);
        done();
      });
    });

    it('should upload new files when the type is a pdf', (done) => {
      const files = [cloneDeep(fileObjectAdv1)];
      const mockFileObjectAdv = cloneDeep(fileObjectData5);
      const mockFileObject = {
        ...mockFileObjectAdv,
        name: '000.pdf',
      };
      const dataUrl = files[0].url;
      const attachmentType = 'pdf';
      transactionsOutboxService.fileUpload.and.resolveTo(mockFileObject);
      component.uploadNewFiles(files).subscribe((result) => {
        expect(result).toEqual([mockFileObject]);
        expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(dataUrl, attachmentType);
        done();
      });
    });

    it('should return null when there are no valid files', (done) => {
      const files = [];
      component.uploadNewFiles(files).subscribe((result) => {
        expect(result).toBeNull();
        expect(transactionsOutboxService.fileUpload).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('uploadFiles', () => {
    it('should upload files when the transacton id is not specified', (done) => {
      spyOn(component, 'uploadNewFiles').and.returnValue(of([fileObjectData4]));
      component.transaction = splitTxns[0];
      component.uploadFiles([fileObjectData4]).subscribe((result) => {
        expect(component.fileObjs).toEqual([fileObjectData4]);
        expect(result).toEqual([fileObjectData4]);
        expect(component.uploadNewFiles).toHaveBeenCalledOnceWith([fileObjectData4]);
        done();
      });
    });

    it('should return the attached files when the transaction id is specified', (done) => {
      spyOn(component, 'getAttachedFiles').and.returnValue(of(fileObject8));
      const FileObject9: FileObject[] = fileUrlMockData.map((fileObject) => ({
        ...fileObject,
        id: 'fizBwnXhyZTp',
      }));
      component.transaction = sourceTxn2;
      component.uploadFiles(FileObject9).subscribe((result) => {
        expect(result).toEqual(fileObject8);
        expect(component.getAttachedFiles).toHaveBeenCalledOnceWith('txxkBruL0EO9');
        done();
      });
    });
  });

  it('getCategoryList(): get the category list', () => {
    component.categories$ = of(categorieListRes);
    component.getCategoryList();
    expect(component.categoryList).toEqual(expectedOrgCategoriesPaginated);
  });

  it('toastWithoutCTA(): should display the toast without CTA', () => {
    const message = 'Your expense was split successfully. All the split expenses were added to the report';
    const toastType = ToastType.SUCCESS;
    const panelClassData = 'msb-success-with-camera-icon-for-split-exp';
    component.toastWithoutCTA(message, toastType, panelClassData);
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarProperties.setSnackbarProperties(toastType, { message }),
      panelClass: [panelClassData],
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
  });

  describe('showSuccessToast()', () => {
    beforeEach(() => {
      spyOn(component, 'toastWithoutCTA');
    });

    it('should show success toast', () => {
      const toastMessage = 'Expense split successfully.';
      component.showSuccessToast();
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        toastMessage,
        ToastType.SUCCESS,
        'msb-success-with-camera-icon-for-split-exp',
      );
    });
  });

  it('getAttachedFiles(): should get all the attached files', (done) => {
    const expenseId = 'fizBwnXhyZTp';
    expensesService.getExpenseById.and.returnValue(of(platformExpenseWithExtractedData));
    component.getAttachedFiles(expenseId).subscribe((result) => {
      expect(result).toEqual(platformExpenseWithExtractedData.files);
      expect(component.fileObjs).toEqual(platformExpenseWithExtractedData.files);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(expenseId);
      done();
    });
  });

  it('getActiveCategories(): should get the active categories', (done) => {
    categoriesService.getAll.and.returnValue(of(filterOrgCategoryParam));
    categoriesService.filterRequired.and.returnValue(expectedFilterOrgCategory);
    component.getActiveCategories().subscribe((res) => {
      expect(res).toEqual(expectedFilterOrgCategory);
      expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      expect(categoriesService.filterRequired).toHaveBeenCalledOnceWith(filterOrgCategoryParam);
      done();
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      categoriesService.getAll.and.returnValue(of(testActiveCategoryList));
      categoriesService.filterRequired.and.returnValue(testActiveCategoryList);

      projectsService.getbyId.and.returnValue(of(testProjectV2));
      projectsService.getAllowedOrgCategoryIds.and.returnValue(allowedActiveCategories);

      orgSettingsService.get.and.returnValue(of(orgSettingsWithProjectCategoryRestrictions));
      platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));

      dependentFieldsService.getDependentFieldValuesForBaseField.and.returnValue(of(dependentFieldValues));

      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      dateService.addDaysToDate.and.returnValue(new Date());

      spyOn(component, 'getActiveCategories').and.callThrough();
      launchDarklyService.getVariation.and.returnValue(of(false));
      component.transaction = cloneDeep(txnData);
      dateService.addDaysToDate.and.returnValue(new Date('2023-01-11'));
      spyOn(component, 'getUnspecifiedCategory');
      component.isReviewModalOpen = true;
      component.splitConfig = cloneDeep(splitConfig);
    });

    it('should should show all categories if show_project_mapped_categories_in_split_expense flag is false', () => {
      launchDarklyService.getVariation.and.returnValue(of(false));

      component.ionViewWillEnter();

      expect(launchDarklyService.getVariation).toHaveBeenCalledWith(
        'show_project_mapped_categories_in_split_expense',
        false,
      );
      expect(component.getActiveCategories).toHaveBeenCalled();

      expect(projectsService.getbyId).not.toHaveBeenCalled();
      expect(projectsService.getAllowedOrgCategoryIds).not.toHaveBeenCalled();

      component.categories$.subscribe((categories) => {
        expect(categories).toEqual(testActiveCategoryListOptions);
      });
    });

    it('should show only project mapped categories if show_project_mapped_categories_in_split_expense flag is true and expense has a project', () => {
      launchDarklyService.getVariation.and.returnValue(of(true));

      component.ionViewWillEnter();

      expect(launchDarklyService.getVariation).toHaveBeenCalledOnceWith(
        'show_project_mapped_categories_in_split_expense',
        false,
      );
      expect(component.getActiveCategories).toHaveBeenCalled();

      expect(projectsService.getbyId).toHaveBeenCalledWith(component.transaction.project_id);
      expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledWith(
        testProjectV2,
        testActiveCategoryList,
        true,
      );

      component.categories$.subscribe((categories) => {
        expect(categories).toEqual(allowedActiveCategoriesListOptions);
      });
    });

    it('should show all categories if show_project_mapped_categories_in_split_expense flag is true but expense does not have a project', () => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      activateRouteMock.snapshot.params.txn = '{"project_id": null}';

      component.ionViewWillEnter();

      expect(launchDarklyService.getVariation).toHaveBeenCalledWith(
        'show_project_mapped_categories_in_split_expense',
        false,
      );
      expect(component.getActiveCategories).toHaveBeenCalled();

      expect(projectsService.getbyId).not.toHaveBeenCalled();
      expect(projectsService.getAllowedOrgCategoryIds).not.toHaveBeenCalled();

      component.categories$.subscribe((categories) => {
        expect(categories).toEqual(testActiveCategoryListOptions);
      });
    });

    it('should set dependentCustomProperties$ correctly if parentFieldId is defined', () => {
      activateRouteMock.snapshot.params.txnFields = JSON.stringify(txnFieldData);
      component.ionViewWillEnter();

      component.dependentCustomProperties$.subscribe((dependentCustomProperties) => {
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          txnData.custom_properties,
          184692,
        );
        expect(dependentCustomProperties).toEqual(dependentFieldValues);
      });
    });

    it('should set dependentCustomProperties$ to NULL if parentFieldId is undefined', () => {
      component.ionViewWillEnter();

      component.dependentCustomProperties$.subscribe((dependentCustomProperties) => {
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          txnData.custom_properties,
          undefined,
        );
        expect(dependentCustomProperties).toBeNull();
      });
    });

    it('should set costCenters$ correctly if cost center is shown in split expense', () => {
      const mockCostCenters = costCentersData3.slice(0, 2);
      costCentersService.getAllActive.and.returnValue(of(mockCostCenters));
      activateRouteMock.snapshot.params.splitConfig =
        '{"category":{"is_mandatory":false,"is_visible":true},"costCenter":{"is_mandatory":false,"is_visible":true},"project":{"is_mandatory":true,"is_visible":true}}';

      component.ionViewWillEnter();

      component.costCenters$.subscribe((costCenters) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(1);
        expect(costCenters).toEqual(expectedCCdata);
      });
    });

    it('should set costCenters$ to empty array if cost_centers are not enabled in orgSettings', () => {
      const mockOrgSettings = cloneDeep(orgSettingsGetData);
      mockOrgSettings.cost_centers.enabled = false;
      orgSettingsService.get.and.returnValue(of(mockOrgSettings));
      activateRouteMock.snapshot.params.splitConfig =
        '{"category":{"is_mandatory":false,"is_visible":true},"costCenter":{"is_mandatory":false,"is_visible":true},"project":{"is_mandatory":true,"is_visible":true}}';

      component.ionViewWillEnter();

      component.costCenters$.subscribe((costCenters) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(costCentersService.getAllActive).not.toHaveBeenCalledTimes(1);
        expect(costCenters).toEqual([]);
      });
    });

    it('should set isCorporateCardsEnabled$ correctly and call setValuesForCCC once', () => {
      activateRouteMock.snapshot.params.currencyObj = JSON.stringify(currencyObjData1);
      spyOn(component, 'setValuesForCCC');

      component.ionViewWillEnter();

      component.isCorporateCardsEnabled$.subscribe((isCorporateCardsEnabled) => {
        expect(isCorporateCardsEnabled).toBeTrue();
      });

      expect(component.setValuesForCCC).toHaveBeenCalledOnceWith(currencyObjData1, 'USD', true);
    });

    it('should open review modal if isReviewModalOpen is false', () => {
      spyOn(component, 'openReviewSplitExpenseModal');
      component.isReviewModalOpen = false;
      const mockData = { expenses: [] };
      spyOn(expensesService.splitExpensesData$, 'asObservable').and.returnValue(of(mockData));

      component.ionViewWillEnter();

      expect(component.openReviewSplitExpenseModal).toHaveBeenCalledWith([]);
    });

    it('should not open review modal if isReviewModalOpen is true', () => {
      spyOn(component, 'openReviewSplitExpenseModal');
      component.isReviewModalOpen = true;
      const mockData = { expenses: [] };
      spyOn(expensesService.splitExpensesData$, 'asObservable').and.returnValue(of(mockData));
      component.ionViewWillEnter();

      expect(component.openReviewSplitExpenseModal).not.toHaveBeenCalled();
    });

    it('should correctly initialize required variables', () => {
      component.isReviewModalOpen = true;
      component.ionViewWillEnter();

      expect(component.splitConfig).toEqual(JSON.parse(activateRouteMock.snapshot.params.splitConfig));
      expect(component.txnFields).toEqual(JSON.parse(activateRouteMock.snapshot.params.txnFields));
      expect(component.fileUrls).toEqual(JSON.parse(activateRouteMock.snapshot.params.fileObjs));
      expect(component.selectedCCCTransaction).toEqual(
        JSON.parse(activateRouteMock.snapshot.params.selectedCCCTransaction),
      );
      expect(component.reportId).toEqual(JSON.parse(activateRouteMock.snapshot.params.selectedReportId));
      expect(component.transaction).toEqual(JSON.parse(activateRouteMock.snapshot.params.txn));
      expect(component.selectedProject).toEqual(JSON.parse(activateRouteMock.snapshot.params.selectedProject));
      expect(component.expenseFields).toEqual(JSON.parse(activateRouteMock.snapshot.params.expenseFields));
    });

    it('should set parentFieldId to cost_center_id when project is not visible but costCenter is visible', () => {
      component.txnFields = cloneDeep(txnFieldData);
      component.splitConfig = component.splitConfig = {
        ...cloneDeep(splitConfig),
        category: { ...splitConfig.project, is_visible: false },
      };

      component.ionViewWillEnter();

      expect(component.splitConfig.costCenter.is_visible).toBeTrue();
      expect(component.txnFields.cost_center_id).toBeDefined();
    });

    it('should call getCategoryList when ionViewWillEnter is called', () => {
      spyOn(component, 'getCategoryList');
      component.ionViewWillEnter();
      expect(component.getCategoryList).toHaveBeenCalled();
    });

    it('should call addCostCenterIdToTxnFields when cost center is visible', () => {
      spyOn(component, 'addCostCenterIdToTxnFields');
      component.ionViewWillEnter();
      expect(component.addCostCenterIdToTxnFields).toHaveBeenCalled();
    });
  });

  describe('setValuesForCCC():', () => {
    beforeEach(() => {
      component.splitConfig = cloneDeep(splitConfig);
      component.txnFields = txnFieldData;

      spyOn(component, 'getActiveCategories').and.returnValue(of([]));
      spyOn(component, 'getFilteredCategories').and.returnValue(of([]));
    });

    it('should set the values for CCC split expenses when coporate credit cards is enabled', () => {
      component.amount = 2000;
      spyOn(component, 'setAmountAndCurrency').and.callThrough();
      spyOn(component, 'add').and.callThrough();
      spyOn(component, 'getTotalSplitAmount').and.callThrough();
      const currencyObj = currencyObjData2;
      const homeCurrency = 'INR';
      const isCorporateCardsEnabled = true;

      const amount1 = 1200;
      const amount2 = 800;
      const percentage1 = 60;
      const percentage2 = 40;

      component.setValuesForCCC(currencyObj, homeCurrency, isCorporateCardsEnabled);
      expect(component.setAmountAndCurrency).toHaveBeenCalledWith(currencyObj, homeCurrency);
      expect(component.add).toHaveBeenCalledWith(amount1, 'INR', percentage1, null);
      expect(component.add).toHaveBeenCalledWith(amount2, 'INR', percentage2, null);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(3);
    });

    it('should set the values to null if coporate credit cards is disabled and the amount is less than 0.0001', () => {
      component.amount = 0.00001;
      spyOn(component, 'setAmountAndCurrency').and.callThrough();
      spyOn(component, 'add').and.callThrough();
      spyOn(component, 'getTotalSplitAmount').and.callThrough();
      const mockUnFlattenedDate = currencyObjData3;
      const currencyObj = mockUnFlattenedDate;
      const homeCurrency = 'INR';
      const isCorporateCardsEnabled = false;

      const amount1 = null;
      const amount2 = null;
      //as these will be null only if amount is not present
      const percentage1 = 60;
      const percentage2 = 40;

      component.setValuesForCCC(currencyObj, homeCurrency, isCorporateCardsEnabled);
      expect(component.setAmountAndCurrency).toHaveBeenCalledWith(currencyObj, homeCurrency);
      expect(component.add).toHaveBeenCalledWith(amount1, 'INR', percentage1, null);
      expect(component.add).toHaveBeenCalledWith(amount2, 'INR', percentage2, null);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(3);
    });
  });

  describe('setAmountAndCurrency():', () => {
    it('should set the amount and currency when orig currency and amount are present', () => {
      const currencyObj = currencyObjData4;
      const homeCurrency = orgData1[0].currency;
      component.setAmountAndCurrency(currencyObj, homeCurrency);
      expect(component.amount).toBe(800000);
      expect(component.currency).toEqual('USD');
    });

    it('should set the amount and currency when orig currency and amount are not present', () => {
      const mockCurrencyObj = {
        ...unflattenedAccount3Data,
        amount: 23213,
        orig_amount: null,
        orig_currency: null,
      };
      const homeCurrency = orgData1[0].currency;
      component.setAmountAndCurrency(mockCurrencyObj, homeCurrency);
      expect(component.amount).toBe(23213);
      expect(component.currency).toEqual('USD');
    });

    it('should set the currency to homeCurrency when curency and orig currency is not present', () => {
      const mockCurrencyObj = {
        ...currencyObjData3,
        currency: null,
        orig_currency: null,
      };
      const homeCurrency = orgData1[0].currency;
      component.setAmountAndCurrency(mockCurrencyObj, homeCurrency);
      expect(component.amount).toBe(0.00001);
      expect(component.currency).toEqual(homeCurrency);
    });
  });

  describe('customDateValidator():', () => {
    it('should return null when the date is within the valid range', () => {
      const control = new UntypedFormControl('2023-06-15');
      const result = component.customDateValidator(control);
      expect(result).toBeNull();
    });

    it('should return an error object when the date is after the upper bound of the valid range', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      const control = new UntypedFormControl(tomorrow.toISOString().substring(0, 10));
      const result = component.customDateValidator(control);
      expect(result).toEqual({ invalidDateSelection: true });
    });
  });

  describe('updateCategoryMandatoryStatus():', () => {
    beforeEach(() => {
      component.splitConfig = cloneDeep(splitConfig);

      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl('Test Project'),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(5000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(null),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });

      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);
    });

    it('should set the category field mandatory value to false when categories are not present ', () => {
      component.splitConfig.category.is_mandatory = true;

      spyOn(component.splitExpensesFormArray.at(0), 'get').and.returnValue(formControlSpy);
      spyOn(component.splitExpensesFormArray.at(1), 'get').and.returnValue(formControlSpy);

      component.updateCategoryMandatoryStatus([]);

      expect(component.splitConfig.category.is_mandatory).toBeFalse();

      expect(formControlSpy.clearValidators).toHaveBeenCalled();
      expect(formControlSpy.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should not change category field mandatory value when categories are available', () => {
      component.splitConfig.project.is_visible = false;
      component.splitConfig.category.is_mandatory = true;

      spyOn(component.splitExpensesFormArray.at(0), 'get').and.returnValue(formControlSpy);
      spyOn(component.splitExpensesFormArray.at(1), 'get').and.returnValue(formControlSpy);

      component.updateCategoryMandatoryStatus(orgCategoryData1);

      expect(component.splitConfig.category.is_mandatory).toBeTrue();
      expect(formControlSpy.clearValidators).not.toHaveBeenCalled();
      expect(formControlSpy.updateValueAndValidity).not.toHaveBeenCalled();
    });

    it('should not change category field mandatory value when the category field mandatory value is already false', () => {
      component.splitConfig.category.is_mandatory = false;

      spyOn(component.splitExpensesFormArray.at(0), 'get').and.returnValue(formControlSpy);
      spyOn(component.splitExpensesFormArray.at(1), 'get').and.returnValue(formControlSpy);

      component.updateCategoryMandatoryStatus([]);

      expect(component.splitConfig.category.is_mandatory).toBeFalse();
      expect(formControlSpy.clearValidators).not.toHaveBeenCalled();
      expect(formControlSpy.updateValueAndValidity).not.toHaveBeenCalled();
    });

    it('should initially clear category field required validator for the first 2 splits if cateogy is mandatory and there are no categories available', () => {
      component.splitConfig.category.is_mandatory = true;

      const splitExpenseForm1 = new UntypedFormGroup({
        category: new UntypedFormControl('', Validators.required),
      });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm1]);

      spyOn(component.splitExpensesFormArray.at(0), 'get').and.returnValue(formControlSpy);

      component.updateCategoryMandatoryStatus([]);

      expect(component.splitConfig.category.is_mandatory).toBeFalse();
      expect(formControlSpy.clearValidators).toHaveBeenCalled();
      expect(formControlSpy.updateValueAndValidity).toHaveBeenCalled();
    });
  });

  describe('add():', () => {
    beforeEach(() => {
      component.splitConfig = cloneDeep(splitConfig);
      component.txnFields = txnFieldData;
    });

    afterEach(() => {
      destroy$.next();
      destroy$.complete();
    });

    it('should add the form control to the form array', () => {
      spyOn(component, 'getTotalSplitAmount');
      spyOn(component, 'customDateValidator').and.returnValue(null);
      spyOn(component, 'setupFilteredCategories');
      const amount = 2000;
      const currency = 'INR';
      const percentage = 50;
      component.transaction = txnData;

      component.add(amount, currency, percentage);
      expect(component.splitExpensesFormArray.length).toEqual(1);
      expect(component.splitExpensesFormArray.controls[0].value).toEqual(splitExpense9);
      expect(component.customDateValidator).toHaveBeenCalledTimes(1);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });

    it('should add the form control to the form array when no arg is provided in case the expense is split in three', () => {
      spyOn(component, 'getTotalSplitAmount');
      spyOn(component, 'customDateValidator').and.returnValue(null);

      component.transaction = txnData;
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(5000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);

      component.add();
      expect(component.splitExpensesFormArray.length).toEqual(3);
      expect(component.splitExpensesFormArray.controls[2].value).toEqual(splitExpense8);
      expect(component.customDateValidator).toHaveBeenCalledTimes(1);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });

    it('should add a new form group to splitExpensesFormArray', () => {
      spyOn(component, 'getActiveCategories').and.returnValue(of([]));
      spyOn(component, 'getFilteredCategories').and.returnValue(of([]));
      const initialLength = component.splitExpensesFormArray.length;
      component.add(50, 'USD', 50);
      expect(component.splitExpensesFormArray.length).toBe(initialLength + 1);
    });

    it('should set default date to today if no transaction date', () => {
      spyOn(component, 'getActiveCategories').and.returnValue(of([]));
      spyOn(component, 'getFilteredCategories').and.returnValue(of([]));
      component.splitExpensesFormArray.clear();
      component.transaction = { ...txnData2, spent_at: null };
      component.add(50, 'USD', 50);

      const formGroup = component.splitExpensesFormArray.at(0);
      const expectedDate = dayjs(new Date()).format('YYYY-MM-DD');
      expect(formGroup.get('spent_at').value).toBe(expectedDate);
    });

    it('should set default date to transaction date if available', () => {
      spyOn(component, 'getActiveCategories').and.returnValue(of([]));
      spyOn(component, 'getFilteredCategories').and.returnValue(of([]));
      component.splitExpensesFormArray.clear();
      component.transaction = txnData2;
      component.add(50, 'USD', 50);

      const formGroup = component.splitExpensesFormArray.at(0);
      expect(formGroup.get('spent_at').value).toBe('2023-02-08');
    });

    it('should add category control if category is visible in splitConfig', () => {
      component.add(50, 'USD', 50);
      const formGroup = component.splitExpensesFormArray.at(0);
      expect(formGroup.get('category')).toBeTruthy();
    });

    it('should not add category control if category is not visible in splitConfig', () => {
      component.splitConfig = component.splitConfig = {
        ...cloneDeep(splitConfig),
        category: { ...splitConfig.category, is_visible: false },
      };
      component.add(50, 'USD', 50);
      const formGroup = component.splitExpensesFormArray.at(0);
      expect(formGroup.get('category')).toBeFalsy();
    });

    it('should add project control if project is visible in splitConfig', () => {
      component.add(50, 'USD', 50);
      const formGroup = component.splitExpensesFormArray.at(0);
      expect(formGroup.get('project')).toBeTruthy();
    });

    it('should add cost center control if costCenter is visible in splitConfig', () => {
      component.add(50, 'USD', 50);
      const formGroup = component.splitExpensesFormArray.at(0);
      expect(formGroup.get('cost_center')).toBeTruthy();
    });

    it('should add purpose control if purpose exists in txnFields', () => {
      spyOn(component, 'getActiveCategories').and.returnValue(of([]));
      spyOn(component, 'getFilteredCategories').and.returnValue(of([]));
      component.add(50, 'USD', 50);
      const formGroup = component.splitExpensesFormArray.at(0);
      expect(formGroup.get('purpose')).toBeTruthy();
    });

    it('should update totalSplitAmount after adding new form group', () => {
      spyOn(component, 'getActiveCategories').and.returnValue(of([]));
      spyOn(component, 'getFilteredCategories').and.returnValue(of([]));
      spyOn(component, 'getTotalSplitAmount');
      component.add(50, 'USD', 50);
      expect(component.getTotalSplitAmount).toHaveBeenCalled();
    });
  });

  describe('handleInitialconfig()', () => {
    beforeEach(() => {
      component.splitExpensesFormArray = new UntypedFormArray([]);
      component.filteredCategoriesArray = [];
      component.costCenterDisabledStates = [];
      component.categories$ = of([]);
      component.splitConfig = cloneDeep(splitConfig);
      spyOn(component, 'setupFilteredCategories');
      spyOn(component, 'onCategoryChange');
    });

    it('should initialize category and cost center settings for the first split when category is visible', () => {
      component.splitExpensesFormArray.push(
        new UntypedFormGroup({
          category: new UntypedFormControl(null),
          project: new UntypedFormControl(null),
        }),
      );

      component.handleInitialconfig(true);

      expect(component.setupFilteredCategories).not.toHaveBeenCalled();
      expect(component.filteredCategoriesArray[0]).toBe(component.categories$);
      expect(component.filteredCategoriesArray[1]).toBe(component.categories$);
      expect(component.costCenterDisabledStates[1]).toBeFalse();
    });

    it('should set up categories and call onCategoryChange when the first split has a category', () => {
      component.splitExpensesFormArray.push(
        new UntypedFormGroup({
          category: new UntypedFormControl('some-category'),
          project: new UntypedFormControl(null),
        }),
      );

      component.handleInitialconfig(true);

      expect(component.filteredCategoriesArray[0]).toBe(component.categories$);
      expect(component.onCategoryChange).toHaveBeenCalledWith(0);
      expect(component.filteredCategoriesArray[1]).toBe(component.categories$);
      expect(component.costCenterDisabledStates[1]).toBeFalse();
    });

    it('should update categories and cost center settings when more than two splits exist', () => {
      component.splitExpensesFormArray.push(new UntypedFormGroup({}));
      component.splitExpensesFormArray.push(new UntypedFormGroup({}));
      component.splitExpensesFormArray.push(new UntypedFormGroup({}));

      component.handleInitialconfig(false);

      expect(component.filteredCategoriesArray.length).toBe(1);
      expect(component.filteredCategoriesArray[0]).toBe(component.categories$);
      expect(component.costCenterDisabledStates[0]).toBeFalse();
    });

    it('should call setupFilteredCategories when the first split has a project value', () => {
      component.splitExpensesFormArray.push(
        new UntypedFormGroup({
          category: new UntypedFormControl(null),
          project: new UntypedFormControl('some-project'),
        }),
      );

      component.handleInitialconfig(true);

      expect(component.setupFilteredCategories).toHaveBeenCalledWith(0);
      expect(component.filteredCategoriesArray[1]).toBe(component.categories$);
      expect(component.costCenterDisabledStates[1]).toBeFalse();
    });
  });

  describe('setupFilteredCategories():', () => {
    beforeEach(() => {
      spyOn(component, 'getFilteredCategories').and.returnValue(of([]));
      spyOn(component, 'resetInvalidCategoryIfNotAllowed');
      spyOn(component, 'handleCategoryValidation');
      component.splitConfig = cloneDeep(splitConfig);

      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl('Test Project'),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(5000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(null),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });

      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);
    });

    afterEach(() => {
      destroy$.next();
      destroy$.complete();
    });

    it('should setup filtered categories for a given index when project control exists', () => {
      component.setupFilteredCategories(0);

      expect(component.getFilteredCategories).toHaveBeenCalledWith(
        jasmine.objectContaining({
          projectControl: component.splitExpensesFormArray.at(0).get('project'),
          services: {
            launchDarklyService,
            projectsService,
          },
        }),
      );

      expect(component.handleCategoryValidation).toHaveBeenCalledWith(0, component.splitExpensesFormArray.at(0));
      expect(component.resetInvalidCategoryIfNotAllowed).toHaveBeenCalledWith(
        0,
        component.splitExpensesFormArray.at(0),
      );
    });

    it('should not setup filtered categories if project control does not exist', () => {
      component.setupFilteredCategories(1);
      expect(component.getFilteredCategories).not.toHaveBeenCalled();
    });

    it('should call resetInvalidCategoryIfNotAllowed even if getFilteredCategories returns an empty observable', () => {
      component.setupFilteredCategories(0);
      expect(component.resetInvalidCategoryIfNotAllowed).toHaveBeenCalled();
    });
  });

  describe('getFilteredCategories():', () => {
    beforeEach(() => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(testProjectV2),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(5000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(null),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });

      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);

      launchDarklyService.getVariation.and.returnValue(of(true));
      projectsService.getbyId.and.returnValue(of(testProjectV2));
      projectsService.getAllowedOrgCategoryIds.and.returnValue(allowedActiveCategories);
    });

    it('should return formatted categories when project ID is null', (done) => {
      spyOn(component, 'formatCategories').and.callThrough();
      component
        .getFilteredCategories({
          projectControl: component.splitExpensesFormArray.at(0).get('project'),
          getActiveCategories: () => of(allowedActiveCategories),
          isProjectCategoryRestrictionsEnabled$: of(true),
          services: { launchDarklyService, projectsService },
        })
        .subscribe((categories) => {
          expect(component.formatCategories).toHaveBeenCalledWith(allowedActiveCategories);
          expect(categories).toEqual(allowedActiveCategoriesListOptions);
          done();
        });
    });

    it('should call getAllowedCategories if project ID exists', (done) => {
      component
        .getFilteredCategories({
          projectControl: component.splitExpensesFormArray.at(0).get('project'),
          getActiveCategories: () => of(orgCategoryData1),
          isProjectCategoryRestrictionsEnabled$: of(true),
          services: { launchDarklyService, projectsService },
        })
        .subscribe(() => {
          expect(launchDarklyService.getVariation).toHaveBeenCalledWith(
            'show_project_mapped_categories_in_split_expense',
            false,
          );
          expect(projectsService.getbyId).toHaveBeenCalled();
          expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalled();
          done();
        });
    });

    it('should return active categories if feature flag is disabled and project restrictions are not enabled', (done) => {
      launchDarklyService.getVariation.and.returnValue(of(false));
      component
        .getFilteredCategories({
          projectControl: component.splitExpensesFormArray.at(0).get('project'),
          getActiveCategories: () => of(allowedActiveCategories),
          isProjectCategoryRestrictionsEnabled$: of(false),
          services: { launchDarklyService, projectsService },
        })
        .subscribe((categories) => {
          expect(categories).toEqual(allowedActiveCategoriesListOptions);
          done();
        });
    });
  });

  describe('getAllowedCategories():', () => {
    beforeEach(() => {
      projectsService.getbyId.and.returnValue(of(testProjectV2));
      projectsService.getAllowedOrgCategoryIds.and.returnValue(allowedActiveCategories);
    });

    it('should return active categories if both showProjectMappedCategories and isProjectCategoryRestrictionsEnabled are false', (done) => {
      component
        .getAllowedCategories(expectedProjectsResponse[0].project_id.toString(), orgCategoryData1, false, false, {
          projectsService,
        })
        .subscribe((categories) => {
          expect(categories).toEqual(orgCategoryData1);
          expect(projectsService.getbyId).not.toHaveBeenCalled();
          expect(projectsService.getAllowedOrgCategoryIds).not.toHaveBeenCalled();
          done();
        });
    });

    it('should call getbyId and getAllowedOrgCategoryIds when project mapping or category restrictions are enabled', (done) => {
      component
        .getAllowedCategories(expectedProjectsResponse[0].project_id.toString(), orgCategoryData1, true, true, {
          projectsService,
        })
        .subscribe(() => {
          expect(projectsService.getbyId).toHaveBeenCalledWith(expectedProjectsResponse[0].project_id.toString());
          expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledWith(testProjectV2, orgCategoryData1, true);
          done();
        });
    });
  });

  describe('resetInvalidCategoryIfNotAllowed()', () => {
    beforeEach(() => {
      component.filteredCategoriesArray = [of(categorieListRes)];
      component.splitConfig = cloneDeep(splitConfig);
      spyOn(component, 'onCategoryChange');
    });

    it('should reset category if it is not in the allowed list', () => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(null),
        project: new UntypedFormControl(null),
        cost_center: new UntypedFormControl(null),
        purpose: new UntypedFormControl(null),
      });

      splitExpenseForm1.get('category').setValue({ label: 'invalid-category', id: 99999 });
      component.resetInvalidCategoryIfNotAllowed(0, splitExpenseForm1);
      splitExpenseForm1.get('category').updateValueAndValidity();
      expect(splitExpenseForm1.get('category').value).toBeNull();
      expect(component.onCategoryChange).toHaveBeenCalledOnceWith(0);
    });

    it('should not reset category if it is in the allowed list', () => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(null),
        project: new UntypedFormControl(null),
        cost_center: new UntypedFormControl(null),
        purpose: new UntypedFormControl(null),
      });

      const validCategory = categorieListRes[0];
      splitExpenseForm1.get('category').setValue(validCategory.value);

      component.resetInvalidCategoryIfNotAllowed(0, splitExpenseForm1);
      splitExpenseForm1.get('category').updateValueAndValidity();
      expect(splitExpenseForm1.get('category').value).toEqual(jasmine.objectContaining({ id: 129140 }));
      expect(component.onCategoryChange).not.toHaveBeenCalledOnceWith(0);
    });
  });

  describe('formatCategories()', () => {
    it('should format categories correctly', (done: DoneFn) => {
      const categories: OrgCategory[] = [
        {
          code: '42',
          created_at: new Date('2023-01-09T16:54:09.929Z'),
          displayName: 'Marketing Outreach',
          enabled: true,
          fyle_category: null,
          id: 226659,
          name: 'Marketing Outreach',
          org_id: 'orrjqbDbeP9p',
          sub_category: 'Marketing',
          updated_at: new Date('2023-01-09T16:54:09.929Z'),
        },
        {
          code: '43',
          created_at: new Date('2023-01-10T10:00:00.000Z'),
          displayName: 'Sales',
          enabled: true,
          fyle_category: null,
          id: 226660,
          name: 'Sales',
          org_id: 'orrjqbDbeP9p',
          sub_category: 'Business',
          updated_at: new Date('2023-01-10T10:00:00.000Z'),
        },
      ];

      const expectedOutput = [
        { label: 'Marketing Outreach', value: categories[0] },
        { label: 'Sales', value: categories[1] },
      ];

      component.formatCategories(categories).subscribe((result) => {
        expect(result).toEqual(expectedOutput);
        done();
      });
    });

    it('should return an empty array if input categories are empty', (done: DoneFn) => {
      component.formatCategories([]).subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });
  });

  describe('showDisabledMessage()', () => {
    beforeEach(() => {
      spyOn(component, 'showPopoverModal').and.callThrough();
      component.splitConfig = cloneDeep(splitConfig);
      component.categoryDisableMsg = 'No category is assigned. Please contact admin for further help.';
    });

    it('should show correct message for category type when msg is empty', () => {
      component.categoryDisableMsg = '';
      component.showDisabledMessage('category');
      expect(component.showPopoverModal).toHaveBeenCalledWith('No category is available for the selected project.');
    });

    it('should show correct message when type is category and msg is not empty', () => {
      component.showDisabledMessage('category');
      expect(component.showPopoverModal).toHaveBeenCalledWith(
        'No category is assigned. Please contact admin for further help.',
      );
    });

    it('should show correct message for cost center type', () => {
      component.showDisabledMessage('cost center');
      expect(component.showPopoverModal).toHaveBeenCalledWith('No cost center is available for the selected category.');
    });
  });

  describe('showPopoverModal()', () => {
    it('should create and present a popover with the given message', async () => {
      const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present']);
      popoverController.create.and.resolveTo(popoverSpy);

      await component.showPopoverModal('Test message');

      expect(popoverController.create).toHaveBeenCalledWith({
        component: FyMsgPopoverComponent,
        componentProps: { msg: 'Test message' },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.present).toHaveBeenCalled();
    });
  });

  describe('openReviewSplitExpenseModal()', () => {
    it('should create and present the review split expense modal', async () => {
      const ReviewSplitExpenseModalSpy = jasmine.createSpyObj('ReviewSplitExpenseModal', ['present', 'onWillDismiss']);
      ReviewSplitExpenseModalSpy.onWillDismiss.and.resolveTo({ data: { action: 'close' } });
      modalController.create.and.resolveTo(ReviewSplitExpenseModalSpy);

      component.isReviewModalOpen = false;

      spyOn(expensesService.splitExpensesData$, 'next').and.callThrough();

      await component.openReviewSplitExpenseModal([txnData2, txnData4]);

      expect(modalController.create).toHaveBeenCalledWith({
        component: ReviewSplitExpenseComponent,
        componentProps: { splitExpenses: [txnData2, txnData4] },
        mode: 'ios',
        presentingElement: await modalController.getTop(),
        cssClass: 'review-split-expense-modal',
      });
      expect(expensesService.splitExpensesData$.next).toHaveBeenCalledWith({
        expenses: [txnData2, txnData4],
      });
      await ReviewSplitExpenseModalSpy.onWillDismiss();
      expect(component.isReviewModalOpen).toBeFalse();
    });

    it('should not open modal if one is already open', async () => {
      component.isReviewModalOpen = true;

      spyOn(expensesService.splitExpensesData$, 'next');

      await component.openReviewSplitExpenseModal([txnData2]);

      expect(modalController.create).not.toHaveBeenCalled();
      expect(expensesService.splitExpensesData$.next).not.toHaveBeenCalled();
    });
  });

  describe('handleNavigationAfterReview()', () => {
    it('should navigate to my_expenses if reportId does not exist', () => {
      component.handleNavigationAfterReview('close', platformExpenseDataWithoutReportId);
      expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'my_expenses']);
    });

    it('should navigate to my_view_report if reportId exists', () => {
      component.reportId = 'rp96APY6Efph';
      component.handleNavigationAfterReview('close', expenseData);
      expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'my_view_report', { id: 'rp96APY6Efph' }]);
    });

    it('should navigate to the correct expense route based on expense category', () => {
      component.handleNavigationAfterReview('navigate', mileageExpense);
      expect(router.navigate).toHaveBeenCalledWith([
        '/',
        'enterprise',
        'add_edit_mileage',
        { id: 'txzPPNvxs98T', persist_filters: true, fromSplitExpenseReview: true },
      ]);
    });
  });

  describe('onCategoryChange()', () => {
    beforeEach(() => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(5000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-02-08'),
        category: new UntypedFormControl(''),
        project: new UntypedFormControl(''),
        cost_center: new UntypedFormControl(''),
        purpose: new UntypedFormControl(''),
      });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);
      component.splitConfig = cloneDeep(splitConfig);
      component.txnFields = cloneDeep(txnFieldData);
    });

    it('should return early if costCenter is not visible', () => {
      component.splitConfig.costCenter.is_visible = false;
      spyOn(component.splitExpensesFormArray.at(0), 'get');

      component.onCategoryChange(0);

      expect(component.splitExpensesFormArray.at(0).get).not.toHaveBeenCalled();
    });

    it('should return early if category value is null', () => {
      component.splitConfig.costCenter.is_visible = true;
      const formSpy = spyOn(component.splitExpensesFormArray.at(0), 'get').and.returnValue({
        value: null,
      } as any);

      component.onCategoryChange(0);

      expect(formSpy).toHaveBeenCalledWith('category');
      expect(formSpy).toHaveBeenCalledWith('cost_center');
    });

    it('should disable cost center if category is not allowed', () => {
      component.splitExpensesFormArray.at(0).get('category').patchValue(expectedFilterOrgCategory);
      component.onCategoryChange(0);
      expect(component.costCenterDisabledStates[0]).toBeTrue();
    });

    it('should not disable cost center if category is allowed', () => {
      component.txnFields.cost_center_id.org_category_ids = [16557, 16558, 16559, 16560, 16561, 226659];
      component.splitExpensesFormArray.at(0).get('category').patchValue(expectedFilterOrgCategory[0]);
      component.onCategoryChange(0);
      expect(component.costCenterDisabledStates[0]).toBeFalse();
    });
  });

  describe('remove()', () => {
    it('should remove the expense at the 1st index', () => {
      spyOn(component, 'getTotalSplitAmount');

      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(10000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(5000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });
      const mockOrgCategory1: OrgCategory = {
        id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        org_id: 'org_1',
        name: 'Category1',
        code: 'CAT1',
        fyle_category: 'FyleCat1',
        sub_category: 'SubCat1',
        enabled: true,
        displayName: 'Category1',
      };

      const mockOrgCategory2: OrgCategory = {
        id: 2,
        created_at: new Date(),
        updated_at: new Date(),
        org_id: 'org_1',
        name: 'Category2',
        code: 'CAT2',
        fyle_category: 'FyleCat2',
        sub_category: 'SubCat2',
        enabled: true,
        displayName: 'Category2',
      };
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);
      component.filteredCategoriesArray = [
        of([{ label: 'Category1', value: mockOrgCategory1 }]),
        of([{ label: 'Category2', value: mockOrgCategory2 }]),
      ];
      component.costCenterDisabledStates = [true, false];

      component.remove(1);

      expect(component.splitExpensesFormArray.length).toBe(1);
      expect(component.splitExpensesFormArray.controls[0].value.amount).toBe(10000);
      expect(component.splitExpensesFormArray.controls[0].value.percentage).toBe(60);
      expect(component.filteredCategoriesArray.length).toBe(1);
      expect(component.costCenterDisabledStates.length).toBe(1);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });

    it('should recalculate the amount and percentage for the last split expense form when there are more than 2 splits', () => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(9000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(4000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(26.667),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const splitExpenseForm3 = new UntypedFormGroup({
        amount: new UntypedFormControl(2000),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(13.333),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      component.splitExpensesFormArray = new UntypedFormArray([
        splitExpenseForm1,
        splitExpenseForm2,
        splitExpenseForm3,
      ]);
      component.amount = 15000;
      component.remove(2);
      expect(component.splitExpensesFormArray.length).toBe(2);
      expect(component.splitExpensesFormArray.controls[0].value.amount).toBe(9000);
      expect(component.splitExpensesFormArray.controls[0].value.percentage).toBe(60);
      expect(component.splitExpensesFormArray.controls[1].value.amount).toBe(6000);
      expect(component.splitExpensesFormArray.controls[1].value.percentage).toBe(40);
    });
  });

  describe('splitEvenly():', () => {
    it('should split the amount evenly between the number of splits', () => {
      spyOn(component, 'getTotalSplitAmount');
      //@ts-ignore
      spyOn(component, 'setEvenSplit');
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(327.5),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(50),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });
      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(327.5),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(50),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);
      component.amount = 655;
      const evenAmount = 327.5;
      const evenPercentage = 50;
      const lastSplitIndex = 1;
      const lastSplitAmount = 327.5;
      const lastSplitPercentage = 50;

      component.splitEvenly();
      expect(component.splitExpensesFormArray.length - 1).toBe(lastSplitIndex);
      //@ts-ignore
      expect(component.setEvenSplit).toHaveBeenCalledWith(
        evenAmount,
        evenPercentage,
        lastSplitAmount,
        lastSplitPercentage,
      );
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });
  });

  describe('setEvenSplit()', () => {
    it('should set the amount and percentage for the last split when last split is true', () => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(327.5),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(50),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });
      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(327.5),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(50),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);
      component.amount = 655;
      const evenAmount = 327.5;
      const evenPercentage = 50;
      const lastSplitIndex = 1;
      const lastSplitAmount = 327.5;
      const lastSplitPercentage = 50;

      //@ts-ignore
      component.setEvenSplit(evenAmount, evenPercentage, lastSplitAmount, lastSplitPercentage);
      expect(component.splitExpensesFormArray.controls[lastSplitIndex].value.amount).toBe(evenAmount);
      expect(component.splitExpensesFormArray.controls[lastSplitIndex].value.percentage).toBe(evenPercentage);
    });

    it('should set amount and parcentage accordingly when isLastSplit is false', () => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(218.333),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(33.333),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });
      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(218.333),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(33.333),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const splitExpenseForm3 = new UntypedFormGroup({
        amount: new UntypedFormControl(218.333),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(33.334),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const evenAmount = 218.333;
      const evenPercentage = 33.333;
      const lastSplitAmount = 218.334;
      const lastSplitIndex = 2;
      const lastSplitPercentage = 33.334;

      component.splitExpensesFormArray = new UntypedFormArray([
        splitExpenseForm1,
        splitExpenseForm2,
        splitExpenseForm3,
      ]);
      component.amount = 655;
      //@ts-ignore
      component.setEvenSplit(evenAmount, evenPercentage, lastSplitAmount, lastSplitPercentage);
      expect(component.splitExpensesFormArray.controls[lastSplitIndex].value.amount).toBe(lastSplitAmount);
      expect(component.splitExpensesFormArray.controls[lastSplitIndex].value.percentage).toBe(lastSplitPercentage);
    });
  });

  describe('isEvenlySplit():', () => {
    it('should return true if the split expenses are evenly split', () => {
      component.amount = 1000;
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(500),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(50),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(500),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(50),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);
      //@ts-ignore
      const result = component.isEvenlySplit();
      expect(result).toBeTrue();
    });

    it('should return false if the split expenses are not evenly split', () => {
      component.amount = 1000;
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(800),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(80),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const splitExpenseForm2 = new UntypedFormGroup({
        amount: new UntypedFormControl(200),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(20),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });
      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, splitExpenseForm2]);
      //@ts-ignore
      const result = component.isEvenlySplit();
      expect(result).toBeFalse();
    });

    it('should consider splits with a difference of 0.01 as evenly split', () => {
      component.splitExpensesFormArray = new UntypedFormArray([
        new UntypedFormGroup({
          amount: new UntypedFormControl(10.0),
          currency: new UntypedFormControl('INR'),
          percentage: new UntypedFormControl(20),
          spent_at: new UntypedFormControl('2023-01-11'),
          category: new UntypedFormControl(''),
        }),
        new UntypedFormGroup({
          amount: new UntypedFormControl(10.01),
          currency: new UntypedFormControl('INR'),
          percentage: new UntypedFormControl(20),
          spent_at: new UntypedFormControl('2023-01-11'),
          category: new UntypedFormControl(''),
        }),
      ]);
      //@ts-ignore
      const isEvenSplit = component.isEvenlySplit();
      expect(isEvenSplit).toBeTrue();
    });
  });

  describe('generateSplitEtxnFromFg():', () => {
    beforeEach(() => {
      const mockTxn = cloneDeep(txnData4);
      mockTxn.to_dt = new Date('2023-02-16T17:00:00.000Z');
      component.transaction = mockTxn;
      dateService.getUTCDate.and.returnValues(new Date('2023-08-04'), new Date('2023-08-07'));
      spyOn(component, 'setUpSplitExpenseBillable').and.returnValue(true);
      spyOn(component, 'setUpSplitExpenseTax').and.returnValue(23);
      const mockDependentCustomProps = mockTxn.custom_properties.slice(0, 2);
      component.dependentCustomProperties$ = of(mockDependentCustomProps);
      platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
      spyOn(component, 'correctDates');
      spyOn(component, 'setTransactionDate').and.returnValue(new Date('2023-08-04'));
      timezoneService.convertAllDatesToProperLocale.and.returnValue(txnCustomPropertiesData);
      component.splitConfig = cloneDeep(splitConfig);
    });

    it('should return split expense object with all the fields if project is enable and cost center is disable', () => {
      component.splitConfig.project.is_visible = true;
      component.splitConfig.costCenter.is_visible = false;

      const splitExpenseForm1 = splitExpenseDataWithProject;

      component.generateSplitEtxnFromFg(splitExpenseForm1).subscribe((splitExpense) => {
        expect(dateService.getUTCDate).toHaveBeenCalledTimes(2);
        expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-13T17:00:00.000Z'));
        expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-16T17:00:00.000Z'));
        expect(component.setUpSplitExpenseBillable).toHaveBeenCalledOnceWith(splitExpenseForm1);
        expect(component.setUpSplitExpenseTax).toHaveBeenCalledOnceWith(splitExpenseForm1);
        expect(splitExpense).toEqual(modifiedTxnData5);
      });
    });

    it('should return split expense object with all the fields if project is enable and cost center is disable and splitExpenseValue.project is undefined', () => {
      component.splitConfig.project.is_visible = true;
      component.splitConfig.costCenter.is_visible = false;

      const splitExpenseForm1 = splitExpenseDataWithProject2;

      component.generateSplitEtxnFromFg(splitExpenseForm1).subscribe((splitExpense) => {
        expect(dateService.getUTCDate).toHaveBeenCalledTimes(2);
        expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-13T17:00:00.000Z'));
        expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-16T17:00:00.000Z'));
        expect(component.setUpSplitExpenseBillable).toHaveBeenCalledOnceWith(splitExpenseForm1);
        expect(component.setUpSplitExpenseTax).toHaveBeenCalledOnceWith(splitExpenseForm1);
        expect(splitExpense).toEqual(modifiedTxnData4);
      });
    });

    it('should return split expense object with all the fields if cost centers is enable and project is disable', () => {
      component.splitConfig.costCenter.is_visible = true;
      component.splitConfig.project.is_visible = false;

      const splitExpenseForm1 = splitExpenseDataWithCostCenter;

      component.generateSplitEtxnFromFg(splitExpenseForm1).subscribe((splitExpense) => {
        expect(dateService.getUTCDate).toHaveBeenCalledTimes(2);
        expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-13T17:00:00.000Z'));
        expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-16T17:00:00.000Z'));
        expect(component.setUpSplitExpenseBillable).toHaveBeenCalledOnceWith(splitExpenseForm1);
        expect(component.setUpSplitExpenseTax).toHaveBeenCalledOnceWith(splitExpenseForm1);
        expect(splitExpense).toEqual(modifiedTxnData6);
      });
    });

    it('should return split expense object with all the fields if cost centers is enable and project is disable and splitExpenseValue.cost_centers is undefined', () => {
      component.splitConfig.costCenter.is_visible = true;
      component.splitConfig.project.is_visible = false;

      const splitExpenseForm1 = splitExpenseDataWithCostCenter2;
      component.dependentCustomProperties$ = of(null);

      component.generateSplitEtxnFromFg(splitExpenseForm1).subscribe((splitExpense) => {
        expect(dateService.getUTCDate).toHaveBeenCalledTimes(2);
        expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-13T17:00:00.000Z'));
        expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-16T17:00:00.000Z'));
        expect(component.setUpSplitExpenseBillable).toHaveBeenCalledOnceWith(splitExpenseForm1);
        expect(component.setUpSplitExpenseTax).toHaveBeenCalledOnceWith(splitExpenseForm1);
        expect(splitExpense).toEqual(modifiedTxnData7);
      });
    });
  });

  describe('setTransactionDate():', () => {
    let mockDate: Date;
    let mockUTCDate: Date;
    beforeEach(() => {
      mockDate = new Date('2023-08-03');
      mockUTCDate = new Date('2023-08-04');
      component.transaction = txnData4;
      dateService.getUTCDate.and.returnValue(mockDate);
      timezoneService.convertToUtc.and.returnValue(mockUTCDate);
    });

    it('should set spent_at to the date provided in split expense form', () => {
      const mockSplitExpenseForm = cloneDeep(splitExpense1);
      const txnDateRes = component.setTransactionDate(mockSplitExpenseForm, '-05:00:00');
      expect(txnDateRes).toEqual(mockUTCDate);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date(mockSplitExpenseForm.spent_at));
      expect(timezoneService.convertToUtc).toHaveBeenCalledOnceWith(mockDate, '-05:00:00');
    });

    it('should set spent_at to transaction date if split expense form date is empty', () => {
      const mockSplitExpenseForm = cloneDeep(splitExpense1);
      mockSplitExpenseForm.spent_at = '';
      const txnDateRes = component.setTransactionDate(mockSplitExpenseForm, '-05:00:00');
      expect(txnDateRes).toEqual(mockUTCDate);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(txnData4.spent_at);
      expect(timezoneService.convertToUtc).toHaveBeenCalledOnceWith(mockDate, '-05:00:00');
    });

    it('should set spent_at to today if transaction date is also not provided', () => {
      const mockSplitExpenseForm = cloneDeep(splitExpense1);
      mockSplitExpenseForm.spent_at = '';
      const mockTxn = cloneDeep(txnData4);
      mockTxn.spent_at = null;
      component.transaction = mockTxn;

      const txnDateRes = component.setTransactionDate(mockSplitExpenseForm, '-05:00:00');
      expect(txnDateRes).toEqual(mockUTCDate);
      expect(timezoneService.convertToUtc).toHaveBeenCalledOnceWith(mockDate, '-05:00:00');
    });
  });

  it('setSplitExpenseValuesBasedOnProject(): should set project_id, project_name and category id in split expense', () => {
    const mockTransaction = cloneDeep(txnData4);
    mockTransaction.category_id = 122269;
    component.transaction = mockTransaction;
    const splitTxn = cloneDeep(txnData4);
    const project = cloneDeep(expectedProjectsResponse[0]);
    component.setSplitExpenseValuesBasedOnProject(splitTxn, project, true);
    expect(splitTxn.project_id).toEqual(project.project_id);
    expect(splitTxn.project_name).toEqual(project.project_name);
  });

  describe('setSplitExpenseProjectHelper():', () => {
    it('should call setSplitExpenseValuesBasedOnProject() if project is present in split expense form', () => {
      spyOn(component, 'setSplitExpenseValuesBasedOnProject');
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.category_id = 122269;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithProject);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);

      expect(component.setSplitExpenseValuesBasedOnProject).toHaveBeenCalledOnceWith(splitTxn, project, true);
    });

    it('should not call setSplitExpenseValuesBasedOnProject() if project is not present in split expense form', () => {
      spyOn(component, 'setSplitExpenseValuesBasedOnProject');
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.category_id = 122269;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, false);
      expect(component.setSplitExpenseValuesBasedOnProject).not.toHaveBeenCalled();
    });

    it('should set cost center to null in split expense if category is present in split expense form and category is not mapped to that cost center', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.category_id = 122269;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.cost_center_id).toBeNull();
      expect(splitTxn.cost_center_name).toBeNull();
    });

    it('should set cost center to null in split expense if cost center is null', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.category_id = 122269;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter: null }, true);
      expect(splitTxn.cost_center_id).toBeNull();
      expect(splitTxn.cost_center_name).toBeNull();
    });

    it('should set category_id in split expense if category is present in split expense form and category is not mapped to that cost center', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.category_id = 122269;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.category_id).toEqual(mockSplitExpenseForm.category.id);
      expect(splitTxn.org_category).toEqual(mockSplitExpenseForm.category.name);
    });

    it('should set category_id and project_id in split expense if category is present in split expense form and category is mapped to project', () => {
      const mockTransaction = cloneDeep(txnData4);
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      project.project_org_category_ids = [184692];
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.category_id).toEqual(mockSplitExpenseForm.category.id);
      expect(splitTxn.org_category).toEqual(mockSplitExpenseForm.category.name);
      expect(splitTxn.project_id).toEqual(project.project_id);
      expect(splitTxn.project_name).toEqual(project.project_name);
    });

    it('should not set category_id in split expense if category is not present in transaction and split expense form', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.category_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      mockSplitExpenseForm.category = null;
      const splitTxn = cloneDeep(txnData4);
      splitTxn.category_id = null;
      const project = cloneDeep(expectedProjectsResponse[0]);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter: null }, true);

      expect(splitTxn.category_id).toBeNull();
    });
  });

  it('getUnspecifiedCategory(): should set unspecifiedCategory', fakeAsync(() => {
    categoriesService.getCategoryByName.and.returnValue(of(unspecifiedCategory));
    component.getUnspecifiedCategory();
    tick(100);
    expect(component.unspecifiedCategory).toEqual(unspecifiedCategory);
    expect(categoriesService.getCategoryByName).toHaveBeenCalledOnceWith('Unspecified');
  }));

  describe('setCategoryAndProjectHelper():', () => {
    beforeEach(() => {
      spyOn(component, 'setSplitExpenseProjectHelper');
    });

    it('should call setSplitExpenseProjectHelper to set correct project as per category provided', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.project_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithProject);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setCategoryAndProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(component.setSplitExpenseProjectHelper).toHaveBeenCalledOnceWith(
        mockSplitExpenseForm,
        splitTxn,
        { project, costCenter },
        true,
      );
    });

    it('should set category id and project id equal to values in the form', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.project_id = null;
      mockTransaction.category_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter2);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setCategoryAndProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.category_id).toEqual(mockSplitExpenseForm.category.id);
      expect(splitTxn.project_id).toBeNull();
    });

    it('should set category id and project id equal to original expense', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.project_id = null;
      mockTransaction.category_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpense1);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setCategoryAndProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.category_id).toEqual(mockTransaction.category_id);
      expect(splitTxn.project_id).toEqual(mockTransaction.project_id);
    });

    it('should set cost center if present in split expense form or in transaction', () => {
      const mockTransaction = cloneDeep(txnData4);
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      const splitTxn = cloneDeep(txnData4);
      splitTxn.cost_center_id = null;
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setCategoryAndProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.cost_center_id).toEqual(mockSplitExpenseForm.cost_center.id);
    });
  });

  it('correctDates(): should convert from_dt and to_dt to UTC', () => {
    const utcDate = new Date('2023-08-04');
    timezoneService.convertToUtc.and.returnValues(utcDate, utcDate);
    const mockTxn = cloneDeep(txnData4);
    component.correctDates(mockTxn, '-05:00:00');
    expect(timezoneService.convertToUtc).toHaveBeenCalledTimes(2);
    expect(mockTxn.from_dt).toEqual(utcDate);
    expect(mockTxn.to_dt).toEqual(utcDate);
  });

  describe('setupCategoryAndProject(): ', () => {
    beforeEach(() => {
      component.txnFields = cloneDeep(expenseFieldObjData);
      spyOn(component, 'setCategoryAndProjectHelper');
    });

    it('should call setCategoryAndProjectHelper with project as null if project is not defined in split expense form and original expense', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.project_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter2);
      const splitTxn = cloneDeep(txnData4);
      component.setupCategoryAndProject(splitTxn, mockSplitExpenseForm, true);
      expect(component.setCategoryAndProjectHelper).toHaveBeenCalledOnceWith(
        mockSplitExpenseForm,
        splitTxn,
        { project: null, costCenter: expenseFieldObjData.cost_center_id },
        true,
      );
    });

    it('should call setCategoryAndProjectHelper with split form project if project is defined in split expense form', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.project_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithProject);
      const splitTxn = cloneDeep(txnData4);
      component.setupCategoryAndProject(splitTxn, mockSplitExpenseForm, true);
      expect(component.setCategoryAndProjectHelper).toHaveBeenCalledOnceWith(
        mockSplitExpenseForm,
        splitTxn,
        { project: mockSplitExpenseForm.project, costCenter: expenseFieldObjData.cost_center_id },
        true,
      );
    });

    it('should call setCategoryAndProjectHelper with selected project if project is present in original expense but project is not present in split form', () => {
      component.selectedProject = cloneDeep(expectedProjectsResponse[0]);
      const mockTransaction = cloneDeep(txnData4);
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithProject);
      mockSplitExpenseForm.project = null;
      const splitTxn = cloneDeep(txnData4);
      component.setupCategoryAndProject(splitTxn, mockSplitExpenseForm, true);
      expect(component.setCategoryAndProjectHelper).toHaveBeenCalledOnceWith(
        mockSplitExpenseForm,
        splitTxn,
        { project: component.selectedProject, costCenter: expenseFieldObjData.cost_center_id },
        true,
      );
    });

    it('should call setCategoryAndProjectHelper with split form project if project is present in split form but project_category_ids is null', () => {
      component.selectedProject = cloneDeep(expectedProjectsResponse[0]);
      const mockTransaction = cloneDeep(txnData4);
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithProject);
      mockSplitExpenseForm.project.project_org_category_ids = null;
      const splitTxn = cloneDeep(txnData4);
      component.setupCategoryAndProject(splitTxn, mockSplitExpenseForm, true);
      expect(component.setCategoryAndProjectHelper).toHaveBeenCalledOnceWith(
        mockSplitExpenseForm,
        splitTxn,
        { project: mockSplitExpenseForm.project, costCenter: expenseFieldObjData.cost_center_id },
        true,
      );
    });
  });

  describe('createSplitTxns():', () => {
    beforeEach(() => {
      splitExpenseService.createSplitTxns.and.returnValue(of(txnList));
      spyOn(component, 'setupCategoryAndProject');
      component.isProjectCategoryRestrictionsEnabled$ = of(true);
    });

    it('should call createSplitTxns method and return the transactions created by split API', () => {
      const splitExpenseForm1 = new UntypedFormGroup({
        amount: new UntypedFormControl(120),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(60),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      const otherSplitExpenseForm = new UntypedFormGroup({
        amount: new UntypedFormControl(800),
        currency: new UntypedFormControl('INR'),
        percentage: new UntypedFormControl(40),
        spent_at: new UntypedFormControl('2023-01-11'),
        category: new UntypedFormControl(''),
      });

      component.splitExpensesFormArray = new UntypedFormArray([splitExpenseForm1, otherSplitExpenseForm]);
      const splitExpenses = cloneDeep(txnList);
      component.createSplitTxns(splitExpenses).subscribe((res) => {
        expect(res).toEqual(txnList);
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          component.transaction,
          component.totalSplitAmount,
          splitExpenses,
          component.expenseFields,
          component.homeCurrency,
        );
        expect(component.setupCategoryAndProject).toHaveBeenCalledTimes(2);
        expect(component.setupCategoryAndProject).toHaveBeenCalledWith(txnList[0], splitExpenseForm1.value, true);
        expect(component.setupCategoryAndProject).toHaveBeenCalledWith(txnList[1], otherSplitExpenseForm.value, true);
      });
    });
  });

  describe('save():', () => {
    beforeEach(() => {
      const mockSplitExpForm = formBuilder.group({
        amount: [23, Validators.required],
        currency: ['USD'],
        percentage: [50],
        spent_at: [new Date(), Validators.compose([Validators.required, component.customDateValidator])],
      });
      component.splitExpensesFormArray = new UntypedFormArray([mockSplitExpForm]);
      spyOn(component, 'generateSplitEtxnFromFg').and.returnValue(of(txnList[0]));
      spyOn(component, 'uploadFiles').and.returnValue(of(fileObjectData1));
      spyOn(component, 'correctTotalSplitAmount');
      const mockTransaction = cloneDeep(txnList[0]);
      component.transaction = mockTransaction;
      // @ts-ignore
      spyOn(component, 'isEvenlySplit').and.returnValue(true);
      component.fileObjs = fileObject6;
      component.categoryList = transformedOrgCategories;
      spyOn(component, 'createSplitTxns').and.returnValue(of(txnList));
      spyOn(component, 'handlePolicyAndMissingFieldsCheck').and.returnValue(
        of({
          action: 'continue',
          comments: { '0': 'test comment' },
        }),
      );
      spyOn(component, 'handleSplitExpense');
      component.fileUrls = fileObjectData1;
    });

    it('should show error message and return if amount is not equal to totalSplitAmount', fakeAsync(() => {
      component.amount = 2000;
      component.totalSplitAmount = 3000;

      component.save();

      expect(component.showErrorBlock).toBeTrue();
      expect(component.errorMessage).toEqual('Split amount cannot be more than 2000.');
      // Tick is used to wait for the error block to disappear after 2500ms
      tick(2500);
      expect(component.showErrorBlock).toBeFalse();
    }));

    it('should show an error message and return if the expense amount is less than 0.01', fakeAsync(() => {
      component.amount = 2000;
      component.totalSplitAmount = 2000;
      component.isCorporateCardsEnabled$ = of(false);
      const mockSplitExpForm = formBuilder.group({
        amount: [-23, Validators.required],
        currency: ['USD'],
        percentage: [50],
        spent_at: [new Date(), Validators.compose([Validators.required, component.customDateValidator])],
      });
      component.splitExpensesFormArray = new UntypedFormArray([mockSplitExpForm]);

      component.save();

      expect(component.showErrorBlock).toBeTrue();
      expect(component.errorMessage).toEqual('Amount should be greater than 0.01');
      // Tick is used to wait for the error block to disappear after 2500ms
      tick(2500);
      expect(component.showErrorBlock).toBeFalse();
    }));

    it('should perform split expense and check policies and mandatory fields', () => {
      component.amount = 2000;
      component.totalSplitAmount = 2000;
      component.isCorporateCardsEnabled$ = of(true);
      component.save();

      expect(component.generateSplitEtxnFromFg).toHaveBeenCalledOnceWith(component.splitExpensesFormArray.value[0]);
      expect(component.handlePolicyAndMissingFieldsCheck).toHaveBeenCalledOnceWith(txnList);
      expect(trackingService.splittingExpense).toHaveBeenCalledOnceWith({
        Asset: 'Mobile',
        'Is Evenly Split': true,
        'Is part of report': false,
        'Report ID': null,
        'User Role': 'spender',
        'Expense State': 'DRAFT',
      });
      expect(component.handleSplitExpense).toHaveBeenCalledOnceWith({ '0': 'test comment' });
    });

    it('should throw error if policy check API call fails', fakeAsync(() => {
      component.amount = 2000;
      component.totalSplitAmount = 2000;
      component.isCorporateCardsEnabled$ = of(true);
      component.handlePolicyAndMissingFieldsCheck = jasmine
        .createSpy()
        .and.returnValue(throwError(() => new Error('Policy Violation checks were failed!')));
      spyOn(component, 'toastWithoutCTA');
      splitExpenseService.transformSplitTo.and.returnValue(splitPayloadData1);

      try {
        component.save();
        tick(100);
      } catch (err) {
        expect(err).toEqual(new Error('Policy Violation checks were failed!'));
        expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
          'We were unable to split your expense. Please try again later.',
          ToastType.FAILURE,
          'msb-failure-with-camera-icon-for-split-exp',
        );
        expect(trackingService.splittingExpense).toHaveBeenCalledOnceWith({
          Asset: 'Mobile',
          'Is Evenly Split': true,
          'Is part of report': false,
          'Report ID': null,
          'User Role': 'spender',
          'Expense State': 'DRAFT',
        });
        expect(component.handleSplitExpense).not.toHaveBeenCalled();
      }
    }));

    it('should set all fields as touched if splitExpensesFormArray is invalid', () => {
      const mockSplitExpForm = formBuilder.group({
        amount: [, Validators.required],
        currency: ['USD'],
        percentage: [50],
        spent_at: [new Date(), Validators.compose([Validators.required, component.customDateValidator])],
      });
      component.splitExpensesFormArray = new UntypedFormArray([mockSplitExpForm]);
      spyOn(component.splitExpensesFormArray, 'markAllAsTouched');

      component.save();

      expect(component.splitExpensesFormArray.markAllAsTouched).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSplitExpense():', () => {
    beforeEach(() => {
      component.reportId = 'rpeq1B17R8gWZ';
      component.unspecifiedCategory = unspecifiedCategory;
      spyOn(component, 'showSuccessToast');
      splitExpenseService.splitExpense.and.returnValue(of({ data: txnList }));
      splitExpenseService.postSplitExpenseComments.and.returnValue(of([]));
      component.formattedSplitExpense = txnList;
      component.fileObjs = fileObject6;
      component.transaction = txnData4;
    });

    it('should call splitExpense API post comments and show success toast', () => {
      component.handleSplitExpense({});

      expect(splitExpenseService.splitExpense).toHaveBeenCalledOnceWith(
        component.formattedSplitExpense,
        component.fileObjs,
        component.transaction,
        {
          reportId: component.reportId,
          unspecifiedCategory: component.unspecifiedCategory,
        },
      );
      expect(splitExpenseService.postSplitExpenseComments).toHaveBeenCalledOnceWith(
        ['txAzvMhbD71q', 'txzLsDY1IAAw'],
        {},
      );
      expect(component.showSuccessToast).toHaveBeenCalledTimes(1);
    });

    it('should throw an error and show failure toast if splitExpense API fails', fakeAsync(() => {
      splitExpenseService.splitExpense.and.returnValue(throwError(() => new Error('Split Expense API failed!')));
      spyOn(component, 'toastWithoutCTA');

      try {
        component.handleSplitExpense({});
        tick(100);
      } catch (err) {
        expect(err).toEqual(new Error('Split Expense API failed!'));
        expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
          'We were unable to split your expense. Please try again later.',
          ToastType.FAILURE,
          'msb-failure-with-camera-icon-for-split-exp',
        );
        expect(splitExpenseService.postSplitExpenseComments).not.toHaveBeenCalled();
        expect(component.showSuccessToast).not.toHaveBeenCalled();
      }
    }));

    it('should throw an error and show failure toast if postSplitExpenseComments API fails', fakeAsync(() => {
      splitExpenseService.postSplitExpenseComments.and.returnValue(
        throwError(() => new Error('Post Split Expense Comments API failed!')),
      );
      spyOn(component, 'toastWithoutCTA');

      try {
        component.handleSplitExpense({});
        tick(100);
      } catch (err) {
        expect(err).toEqual(new Error('Post Split Expense Comments API failed!'));
        expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
          'We were unable to split your expense. Please try again later.',
          ToastType.FAILURE,
          'msb-failure-with-camera-icon-for-split-exp',
        );
        expect(component.showSuccessToast).not.toHaveBeenCalled();
      }
    }));

    it('should not call postSplitExpenseComments API if there are no comments', () => {
      component.handleSplitExpense(null);

      expect(splitExpenseService.postSplitExpenseComments).not.toHaveBeenCalled();
      expect(component.showSuccessToast).toHaveBeenCalledTimes(1);
    });
  });

  describe('showSplitExpensePolicyViolationsAndMissingFields():', () => {
    beforeEach(() => {
      splitExpenseService.filteredPolicyViolations.and.returnValue({ '0': filteredSplitPolicyViolationsData });
      splitExpenseService.filteredMissingFieldsViolations.and.returnValue({ '1': filteredMissingFieldsViolationsData });
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
      component.transaction = cloneDeep(txnData4);
    });

    it('should open policy violations modal', async () => {
      const fyCriticalPolicyViolationPopOverSpy = jasmine.createSpyObj('fyCriticalPolicyViolationPopOver', [
        'present',
        'onWillDismiss',
      ]);
      fyCriticalPolicyViolationPopOverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'continue',
        },
      });
      modalController.create.and.resolveTo(fyCriticalPolicyViolationPopOverSpy);

      const result = await component.showSplitExpensePolicyViolationsAndMissingFields(
        txnList,
        { '0': policyViolation1 },
        null,
      );
      expect(splitExpenseService.filteredPolicyViolations).toHaveBeenCalledOnceWith({ '0': policyViolation1 });
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: SplitExpensePolicyViolationComponent,
        componentProps: {
          policyViolations: { '0': filteredSplitPolicyViolationsData },
          isPartOfReport: false,
        },
        mode: 'ios',
        ...modalProperties.getModalDefaultProperties(),
        presentingElement: await modalController.getTop(),
      });
      expect(result).toEqual({
        action: 'continue',
      });
    });

    it('should open policy violations modal with isPartOfReport as true if report is attached', async () => {
      component.reportId = 'rpeq1B17R8gWZ';
      const fyCriticalPolicyViolationPopOverSpy = jasmine.createSpyObj('fyCriticalPolicyViolationPopOver', [
        'present',
        'onWillDismiss',
      ]);
      fyCriticalPolicyViolationPopOverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'continue',
        },
      });
      modalController.create.and.resolveTo(fyCriticalPolicyViolationPopOverSpy);

      const result = await component.showSplitExpensePolicyViolationsAndMissingFields(
        txnList,
        { '0': policyViolation1 },
        null,
      );
      expect(splitExpenseService.filteredPolicyViolations).toHaveBeenCalledOnceWith({ '0': policyViolation1 });
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: SplitExpensePolicyViolationComponent,
        componentProps: {
          policyViolations: { '0': filteredSplitPolicyViolationsData },
          isPartOfReport: true,
        },
        mode: 'ios',
        ...modalProperties.getModalDefaultProperties(),
        presentingElement: await modalController.getTop(),
      });
      expect(result).toEqual({
        action: 'continue',
      });
    });

    it('should open missing fields modal', async () => {
      const missingFieldsViolations = { '1': transformedSplitExpenseMissingFieldsData4 };
      splitExpenseService.filteredMissingFieldsViolations.and.returnValue({
        '1': filteredMissingFieldsViolationsData2,
      });
      spyOn(component, 'showMissingFieldsModal').and.callThrough();
      const result = await component.showSplitExpensePolicyViolationsAndMissingFields(
        txnList,
        { '0': policyViolation1 },
        missingFieldsViolations,
      );

      expect(component.showMissingFieldsModal).toHaveBeenCalled();
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Expense cannot be split',
          leftAlign: true,
          message:
            'Splitting this expense will result in incomplete expenses, which cannot be added to a expense report.',
          secondaryMsg: 'Please remove the expense from the expense report and split it again.',
          primaryCta: {
            text: 'Got it',
          },
        },
        cssClass: 'pop-up-in-center',
      });

      expect(result).toBeNull();
    });
  });

  describe('handlePolicyAndMissingFieldsCheck():', () => {
    beforeEach(() => {
      component.reportId = 'rpeq1B17R8gWZ';
      component.unspecifiedCategory = unspecifiedCategory;
      component.expenseFields = expenseFieldResponse;
      const splitEtxns = cloneDeep(txnList);
      spyOn(component, 'showSplitExpensePolicyViolationsAndMissingFields').and.resolveTo({
        action: 'continue',
        comments: { '0': 'test comment' },
      });
      policyService.checkIfViolationsExist.and.returnValue(true);
      splitExpenseService.checkIfMissingFieldsExist.and.returnValue(true);
      splitExpenseService.handlePolicyAndMissingFieldsCheck.and.returnValue(
        of({
          policyViolations: splitPolicyExp1,
          missingFields: SplitExpenseMissingFieldsData,
        }),
      );
      spyOn(component, 'transformViolationData').and.returnValue({ '0': policyViolation1 });
      spyOn(component, 'transformMandatoryFieldsData').and.returnValue({
        '1': transformedSplitExpenseMissingFieldsData,
      });
    });

    it('should call handlePolicyAndMissingFieldsCheck and showSplitExpensePolicyViolationsAndMissingFields if policy violations exist', (done) => {
      const splitEtxns = cloneDeep(txnList);
      component.handlePolicyAndMissingFieldsCheck(splitEtxns).subscribe(() => {
        expect(policyService.checkIfViolationsExist).toHaveBeenCalledOnceWith({ '0': policyViolation1 });
        expect(splitExpenseService.checkIfMissingFieldsExist).toHaveBeenCalledOnceWith({
          '1': transformedSplitExpenseMissingFieldsData,
        });
        expect(splitExpenseService.handlePolicyAndMissingFieldsCheck).toHaveBeenCalledOnceWith(
          splitEtxns,
          component.fileObjs,
          component.transaction,
          {
            reportId: component.reportId,
            unspecifiedCategory: component.unspecifiedCategory,
          },
        );
        expect(component.transformViolationData).toHaveBeenCalledOnceWith(splitEtxns, splitPolicyExp1);
        expect(component.transformMandatoryFieldsData).toHaveBeenCalledOnceWith(
          splitEtxns,
          SplitExpenseMissingFieldsData,
        );
        expect(component.showSplitExpensePolicyViolationsAndMissingFields).toHaveBeenCalledOnceWith(
          splitEtxns,
          { '0': policyViolation1 },
          { '1': transformedSplitExpenseMissingFieldsData },
        );
        done();
      });
    });

    it('should call handlePolicyAndMissingFieldsCheck and showSplitExpensePolicyViolationsAndMissingFields if policy violations exist and missing fields does not exist', (done) => {
      const splitEtxns = cloneDeep(txnList);
      splitExpenseService.handlePolicyAndMissingFieldsCheck.and.returnValue(
        of({
          policyViolations: splitPolicyExp1,
          missingFields: {},
        }),
      );
      component.handlePolicyAndMissingFieldsCheck(splitEtxns).subscribe((_res) => {
        expect(policyService.checkIfViolationsExist).toHaveBeenCalledOnceWith({ '0': policyViolation1 });
        expect(splitExpenseService.checkIfMissingFieldsExist).not.toHaveBeenCalled();
        expect(splitExpenseService.handlePolicyAndMissingFieldsCheck).toHaveBeenCalledOnceWith(
          splitEtxns,
          component.fileObjs,
          component.transaction,
          {
            reportId: component.reportId,
            unspecifiedCategory: component.unspecifiedCategory,
          },
        );
        expect(component.transformViolationData).toHaveBeenCalledOnceWith(splitEtxns, splitPolicyExp1);
        expect(component.transformMandatoryFieldsData).not.toHaveBeenCalled();
        expect(component.showSplitExpensePolicyViolationsAndMissingFields).toHaveBeenCalledOnceWith(
          splitEtxns,
          { '0': policyViolation1 },
          null,
        );
        done();
      });
    });

    it('should return action as continue if policy violations and missing fields does not exist', (done) => {
      const splitEtxns = cloneDeep(txnList);
      splitEtxns[0].category_id = null;
      splitEtxns[0].custom_properties[0].id = component.expenseFields[0].id;
      policyService.checkIfViolationsExist.and.returnValue(false);
      splitExpenseService.checkIfMissingFieldsExist.and.returnValue(false);
      splitExpenseService.handlePolicyAndMissingFieldsCheck.and.returnValue(
        of({
          policyViolations: splitPolicyExp1,
          missingFields: {},
        }),
      );
      component.handlePolicyAndMissingFieldsCheck(splitEtxns).subscribe((res) => {
        expect(policyService.checkIfViolationsExist).toHaveBeenCalledOnceWith({ '0': policyViolation1 });
        expect(splitExpenseService.checkIfMissingFieldsExist).not.toHaveBeenCalled();
        expect(splitExpenseService.handlePolicyAndMissingFieldsCheck).toHaveBeenCalledOnceWith(
          splitEtxns,
          component.fileObjs,
          component.transaction,
          {
            reportId: component.reportId,
            unspecifiedCategory: component.unspecifiedCategory,
          },
        );
        expect(component.transformViolationData).toHaveBeenCalledOnceWith(splitEtxns, splitPolicyExp1);
        expect(component.transformMandatoryFieldsData).not.toHaveBeenCalled();
        expect(component.showSplitExpensePolicyViolationsAndMissingFields).not.toHaveBeenCalled();
        expect(res).toEqual({ action: 'continue', comments: null });
        done();
      });
    });
  });

  describe('generateInputFieldInfo', () => {
    beforeEach(() => {
      component.splitExpensesFormArray = new UntypedFormArray([
        new UntypedFormGroup({
          category: new UntypedFormControl({ name: 'Travel' }),
          cost_center: new UntypedFormControl({ name: 'Finance' }),
          project: new UntypedFormControl({ project_name: 'Project A' }),
        }),
      ]);
      component.splitConfig = cloneDeep(splitConfig);
      component.txnFields = txnFieldData;
    });

    it('should generate input field info correctly when all fields are visible', () => {
      const result = component.generateInputFieldInfo(0);

      expect(result).toEqual({
        Category: 'Travel',
        Location: 'Finance',
        Project: 'Project A',
      });
    });

    it('should handle missing category field', () => {
      component.splitExpensesFormArray.at(0).patchValue({ category: null });
      const result = component.generateInputFieldInfo(0);
      expect(result.Category).toBe('-');
    });

    it('should handle missing cost center field', () => {
      component.splitExpensesFormArray.at(0).patchValue({ cost_center: null });
      const result = component.generateInputFieldInfo(0);
      expect(result.Location).toBe('-');
    });

    it('should handle missing project field', () => {
      component.splitExpensesFormArray.at(0).patchValue({ project: null });
      const result = component.generateInputFieldInfo(0);
      expect(result.Project).toBe('-');
    });

    it('should exclude fields if they are not visible in splitConfig', () => {
      component.splitConfig.category.is_visible = false;
      component.splitConfig.costCenter.is_visible = false;
      component.splitConfig.project.is_visible = false;

      const result = component.generateInputFieldInfo(0);
      expect(result).toEqual({});
    });
  });

  describe('addCostCenterIdToTxnFields', () => {
    it('should return early if cost_center_id is already present in txnFields', () => {
      component.txnFields = cloneDeep(txnFieldData);
      component.addCostCenterIdToTxnFields();
      expect(component.txnFields.cost_center_id).toEqual(txnFieldData.cost_center_id);
    });

    it('should assign cost_center_id if it is not present in txnFields and exists in expenseFields', () => {
      component.txnFields = cloneDeep(expenseFieldObjData);
      component.splitConfig = cloneDeep(splitConfig);
      component.expenseFields = transformedResponse;
      component.addCostCenterIdToTxnFields();
      expect(component.txnFields.cost_center_id).toBe(transformedResponse[4]);
      expect(component.splitConfig.costCenter.is_mandatory).toBe(transformedResponse[4].is_mandatory);
    });
  });

  it('transformViolationData(): should return amount, type, currency and violation data', () => {
    const etxn = cloneDeep([txnData4]);
    spyOn(component, 'generateInputFieldInfo').and.returnValue({
      Category: 'Travel',
      'Cost Center': 'Finance',
      Project: 'Project A',
    });
    const mockPolicyViolation = cloneDeep(splitPolicyExp1);

    const res = component.transformViolationData(etxn, mockPolicyViolation);
    expect(res).toEqual({
      '0': policyViolationData6,
    });
  });

  it('transformMandatoryFieldsData(): should return amount, currency and missing fields data', () => {
    const etxn = cloneDeep([txnData4]);
    spyOn(component, 'generateInputFieldInfo').and.returnValue({
      Category: 'Travel',
      'Cost Center': 'Finance',
      Project: 'Project A',
    });
    const mockMissingFields = cloneDeep(SplitExpenseMissingFieldsData);

    const res = component.transformMandatoryFieldsData(etxn, mockMissingFields);
    expect(res).toEqual({
      '0': transformedSplitExpenseMissingFieldsData3,
    });
  });

  it('correctTotalSplitAmount(): should adjust total split amount incase the sum of splits does not match the actual amount', () => {
    component.formattedSplitExpense = cloneDeep(txnList);
    component.formattedSplitExpense[0].amount = 23.459;
    component.formattedSplitExpense[1].amount = 23.459;
    component.transaction = cloneDeep(txnData4);
    component.transaction.amount = 46.918685;
    component.correctTotalSplitAmount();
    expect(component.formattedSplitExpense[1].amount).toEqual(23.459685);
  });
});
