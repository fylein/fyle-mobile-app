import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { DateService } from 'src/app/core/services/date.service';
import { FileService } from 'src/app/core/services/file.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { SplitExpenseService } from 'src/app/core/services/split-expense.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { SplitExpensePage } from './split-expense.page';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { IconModule } from 'src/app/shared/icon/icon.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterTestingModule } from '@angular/router/testing';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { of, throwError } from 'rxjs';
import {
  expectedFilterOrgCategory,
  expectedOrgCategoriesPaginated,
  filterOrgCategoryParam,
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
  splitExpense3,
  splitExpense4,
  splitExpense5,
  splitExpense6,
  splitExpense7,
  splitExpenseDataWithCostCenter,
  splitExpenseDataWithCostCenter2,
  splitExpenseDataWithProject,
  splitExpenseDataWithProject2,
} from 'src/app/core/mock-data/split-expense.data';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
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
import { policyViolation1, policyViolationData5 } from 'src/app/core/mock-data/policy-violation.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { unflattenedAccount3Data } from 'src/app/core/test-data/accounts.service.spec.data';
import { categorieListRes } from 'src/app/core/mock-data/org-category-list-item.data';
import { cloneDeep } from 'lodash';
import {
  splitExpenseFormData1,
  splitExpenseFormData2,
  splitExpenseFormData3,
  splitExpenseFormData5,
  splitExpenseFormData6,
  splitExpenseFormData7,
} from 'src/app/core/mock-data/split-expense-form.data';
import { costCentersData3, expectedCCdata } from 'src/app/core/mock-data/cost-centers.data';
import {
  currencyObjData1,
  currencyObjData2,
  currencyObjData3,
  currencyObjData4,
} from 'src/app/core/mock-data/currency-obj.data';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { costCenterExpenseField, expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { txnCustomPropertiesData } from 'src/app/core/mock-data/txn-custom-properties.data';
import { filteredSplitPolicyViolationsData } from 'src/app/core/mock-data/filtered-split-policy-violations.data';
import { filteredMissingFieldsViolationsData } from 'src/app/core/mock-data/filtered-missing-fields-violations.data';
import {
  transformedSplitExpenseMissingFieldsData,
  transformedSplitExpenseMissingFieldsData2,
} from 'src/app/core/mock-data/transformed-split-expense-missing-fields.data';
import { splitPolicyExp1 } from 'src/app/core/mock-data/split-expense-policy.data';
import { SplitExpenseMissingFieldsData } from 'src/app/core/mock-data/split-expense-missing-fields.data';
import { splitPayloadData1 } from 'src/app/core/mock-data/split-payload.data';
import { platformExpenseWithExtractedData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { orgSettingsWithProjectCategoryRestrictions } from 'src/app/core/mock-data/org-settings.data';

describe('SplitExpensePage', () => {
  let component: SplitExpensePage;
  let fixture: ComponentFixture<SplitExpensePage>;
  let formBuilder: jasmine.SpyObj<FormBuilder>;
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
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;
  let activateRouteMock: ActivatedRoute;

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
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById']);
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
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'getTop']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['getAllowedCostCenters', 'get']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', [
      'getDependentFieldValuesForBaseField',
    ]);
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', ['getVariation']);
    const projectsServiceSpy = jasmine.createSpyObj('ProjectsService', ['getbyId', 'getAllowedOrgCategoryIds']);
    const timezoneServiceSpy = jasmine.createSpyObj('TimezoneService', [
      'convertToUtc',
      'convertAllDatesToProperLocale',
    ]);

    TestBed.configureTestingModule({
      declarations: [SplitExpensePage, FyAlertInfoComponent],
      imports: [
        IonicModule.forRoot(),
        IconModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule,
        RouterTestingModule,
        MatIconTestingModule,
      ],
      providers: [
        FormBuilder,
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
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: DependentFieldsService, useValue: dependentFieldsServiceSpy },
        { provide: LaunchDarklyService, useValue: launchDarklyServiceSpy },
        { provide: ProjectsService, useValue: projectsServiceSpy },
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                currencyObj: '{"currency":"USD","symbol":"$","id":"USD"}',
                splitType: 'projects',
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SplitExpensePage);
    component = fixture.componentInstance;

    formBuilder = TestBed.inject(FormBuilder) as jasmine.SpyObj<FormBuilder>;
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
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    timezoneService = TestBed.inject(TimezoneService) as jasmine.SpyObj<TimezoneService>;
    activateRouteMock = TestBed.inject(ActivatedRoute);

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
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(120),
        currency: new FormControl('INR'),
        percentage: new FormControl(60),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const otherSplitExpenseForm = new FormGroup({
        amount: new FormControl(800),
        currency: new FormControl('INR'),
        percentage: new FormControl(40),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      Object.defineProperty(splitExpenseForm1.controls.amount, '_pendingChange', { value: true });
      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, otherSplitExpenseForm]);

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
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(1200),
        currency: new FormControl('INR'),
        percentage: new FormControl(60),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const otherSplitExpenseForm = new FormGroup({
        amount: new FormControl(80),
        currency: new FormControl('INR'),
        percentage: new FormControl(40),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      Object.defineProperty(otherSplitExpenseForm.controls.amount, '_pendingChange', { value: true });
      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, otherSplitExpenseForm]);

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
      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, otherSplitExpenseForm]);

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
      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, otherSplitExpenseForm]);

      component.onChangePercentage(otherSplitExpenseForm, 1);

      expect(splitExpenseForm1.controls.percentage.value).toEqual(4);
      expect(splitExpenseForm1.controls.amount.value).toEqual(80);
      expect(otherSplitExpenseForm.controls.percentage.value).toEqual(96);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    }));
  });

  describe('getTotalSplitAmount():', () => {
    it('should calculate total split amount and remaining amount correctly when there are two form groups', () => {
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(473.4),
        currency: new FormControl('INR'),
        percentage: new FormControl(60),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(315.6),
        currency: new FormControl('INR'),
        percentage: new FormControl(40),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      component.amount = 789;

      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2]);

      component.getTotalSplitAmount();

      expect(component.totalSplitAmount).toEqual(789);
      expect(component.remainingAmount).toEqual(0);
    });

    it('should calculate total split amount and remaining amount correctly when the expense is not evenly split in three', () => {
      component.amount = 25000;
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(10000),
        currency: new FormControl('INR'),
        percentage: new FormControl(60),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(5000),
        currency: new FormControl('INR'),
        percentage: new FormControl(40),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const splitExpenseForm3 = new FormGroup({
        amount: new FormControl(null),
        currency: new FormControl(null),
        percentage: new FormControl(null),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2, splitExpenseForm3]);
      component.getTotalSplitAmount();
      expect(component.totalSplitAmount).toEqual(15000);
      expect(component.remainingAmount).toEqual(10000);
    });
  });

  describe('setUpSplitExpenseBillable():', () => {
    it('should setup split expense to billable when the expense is split by project and the transaction fileds have the billable property present', () => {
      component.txnFields = txnFieldData;
      const result = component.setUpSplitExpenseBillable(splitExpense1);
      expect(result).toBeFalse();
    });

    it('should return false when the transaction in not billable and the expense is split by category', () => {
      component.transaction = txnList[0];
      const result = component.setUpSplitExpenseBillable(splitExpense2);
      expect(result).toBeFalse();
    });

    it('should return true whan the transaction is billable and the expense is split by category', () => {
      component.transaction = splitTxns[0];
      const result = component.setUpSplitExpenseBillable(splitExpense2);
      expect(result).toBeTrue();
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
    const panelClassData = 'msb-success-with-camera-icon';
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

    it('should show success toast and navigate to view report page if expenses are splitted in report', () => {
      component.reportId = 'rpPNBrdR9NaE';
      const toastMessage = 'Expense split successfully.';
      component.showSuccessToast();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_view_report', { id: 'rpPNBrdR9NaE' }]);
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        toastMessage,
        ToastType.SUCCESS,
        'msb-success-with-camera-icon'
      );
    });

    it('should show success toast and navigate to my expenses page if unreported expenses are splitted', () => {
      component.reportId = null;
      const toastMessage = 'Expense split successfully.';
      component.showSuccessToast();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        toastMessage,
        ToastType.SUCCESS,
        'msb-success-with-camera-icon'
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

  describe('getSplitExpenseHeader():', () => {
    beforeEach(() => {
      component.txnFields = txnFieldData;
    });

    it('should set splitExpenseHeader to category when the expense is split by category', () => {
      component.splitType = 'categories';
      component.getSplitExpenseHeader();
      expect(component.splitExpenseHeader).toEqual('category');
    });

    it('should set splitExpenseHeader to project name when the expense is split by project', () => {
      component.splitType = 'projects';
      component.getSplitExpenseHeader();
      expect(component.splitExpenseHeader).toEqual('Project');
    });

    it('should set splitExpenseHeader to cost center name when the expense is split by cost centers', () => {
      component.splitType = 'cost centers';
      component.getSplitExpenseHeader();
      expect(component.splitExpenseHeader).toEqual('Location');
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      categoriesService.getAll.and.returnValue(of(testActiveCategoryList));
      categoriesService.filterRequired.and.returnValue(testActiveCategoryList);

      projectsService.getbyId.and.returnValue(of(testProjectV2));
      projectsService.getAllowedOrgCategoryIds.and.returnValue(allowedActiveCategories);

      orgSettingsService.get.and.returnValue(of(orgSettingsWithProjectCategoryRestrictions));
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));

      dependentFieldsService.getDependentFieldValuesForBaseField.and.returnValue(of(dependentFieldValues));

      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      dateService.addDaysToDate.and.returnValue(new Date());

      spyOn(component, 'getActiveCategories').and.callThrough();
      launchDarklyService.getVariation.and.returnValue(of(false));
      component.transaction = cloneDeep(txnData);
      dateService.addDaysToDate.and.returnValue(new Date('2023-01-11'));
      spyOn(component, 'getUnspecifiedCategory');
    });

    it('should should show all categories if show_project_mapped_categories_in_split_expense flag is false', () => {
      launchDarklyService.getVariation.and.returnValue(of(false));

      component.ionViewWillEnter();

      expect(launchDarklyService.getVariation).toHaveBeenCalledOnceWith(
        'show_project_mapped_categories_in_split_expense',
        false
      );
      expect(component.getActiveCategories).toHaveBeenCalledTimes(1);

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
        false
      );
      expect(component.getActiveCategories).toHaveBeenCalledTimes(1);

      expect(projectsService.getbyId).toHaveBeenCalledOnceWith(component.transaction.project_id);
      expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledOnceWith(
        testProjectV2,
        testActiveCategoryList,
        true
      );

      component.categories$.subscribe((categories) => {
        expect(categories).toEqual(allowedActiveCategoriesListOptions);
      });
    });

    it('should show all categories if show_project_mapped_categories_in_split_expense flag is true but expense does not have a project', () => {
      launchDarklyService.getVariation.and.returnValue(of(true));
      activateRouteMock.snapshot.params.txn = '{"project_id": null}';

      component.ionViewWillEnter();

      expect(launchDarklyService.getVariation).toHaveBeenCalledOnceWith(
        'show_project_mapped_categories_in_split_expense',
        false
      );
      expect(component.getActiveCategories).toHaveBeenCalledTimes(1);

      expect(projectsService.getbyId).not.toHaveBeenCalled();
      expect(projectsService.getAllowedOrgCategoryIds).not.toHaveBeenCalled();

      component.categories$.subscribe((categories) => {
        expect(categories).toEqual(testActiveCategoryListOptions);
      });
    });

    it('should set dependentCustomProperties$ correctly if splitType is projects and parentFieldId is defined', () => {
      activateRouteMock.snapshot.params.txnFields = JSON.stringify(txnFieldData);
      component.ionViewWillEnter();

      component.dependentCustomProperties$.subscribe((dependentCustomProperties) => {
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          txnData.custom_properties,
          184692
        );
        expect(dependentCustomProperties).toEqual(dependentFieldValues);
      });
    });

    it('should set dependentCustomProperties$ to NULL if splitType is projects and parentFieldId is undefined', () => {
      component.ionViewWillEnter();

      component.dependentCustomProperties$.subscribe((dependentCustomProperties) => {
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          txnData.custom_properties,
          undefined
        );
        expect(dependentCustomProperties).toBeNull();
      });
    });

    it('should set dependentCustomProperties$ correctly if splitType is cost centers', () => {
      activateRouteMock.snapshot.params.splitType = 'cost centers';

      component.ionViewWillEnter();

      component.dependentCustomProperties$.subscribe((dependentCustomProperties) => {
        expect(dependentFieldsService.getDependentFieldValuesForBaseField).toHaveBeenCalledOnceWith(
          txnData.custom_properties,
          undefined
        );
        expect(dependentCustomProperties).toBeNull();
      });
    });

    it('should set costCenters$ correctly if splitType is cost centers', () => {
      const mockCostCenters = costCentersData3.slice(0, 2);
      orgUserSettingsService.getAllowedCostCenters.and.returnValue(of(mockCostCenters));
      activateRouteMock.snapshot.params.splitType = 'cost centers';

      component.ionViewWillEnter();

      component.costCenters$.subscribe((costCenters) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
        expect(orgUserSettingsService.getAllowedCostCenters).toHaveBeenCalledOnceWith(orgUserSettingsData);
        expect(costCenters).toEqual(expectedCCdata);
      });
    });

    it('should set costCenters$ to empty array if cost_centers are not enabled in orgSettings', () => {
      const mockOrgSettings = cloneDeep(orgSettingsGetData);
      mockOrgSettings.cost_centers.enabled = false;
      orgSettingsService.get.and.returnValue(of(mockOrgSettings));
      activateRouteMock.snapshot.params.splitType = 'cost centers';

      component.ionViewWillEnter();

      component.costCenters$.subscribe((costCenters) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
        expect(orgUserSettingsService.getAllowedCostCenters).not.toHaveBeenCalled();
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
  });

  describe('setValuesForCCC():', () => {
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
        orig_amount: null,
        orig_currency: null,
      };
      const homeCurrency = orgData1[0].currency;
      component.setAmountAndCurrency(mockCurrencyObj, homeCurrency);
      expect(component.amount).toBe(800000);
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
      const control = new FormControl('2023-06-15');
      const result = component.customDateValidator(control);
      expect(result).toBeNull();
    });

    it('should return an error object when the date is after the upper bound of the valid range', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      const control = new FormControl(tomorrow.toISOString().substring(0, 10));
      const result = component.customDateValidator(control);
      expect(result).toEqual({ invalidDateSelection: true });
    });
  });

  describe('add():', () => {
    it('should set the date of when the expense was created if not provided while splitting an expense and all', () => {
      spyOn(component, 'getTotalSplitAmount');
      spyOn(component, 'customDateValidator').and.returnValue(null);
      const amount = 2000;
      const currency = 'INR';
      const percentage = 50;
      component.splitType = 'categories';
      component.transaction = txnData;

      component.add(amount, currency, percentage);
      expect(component.splitExpensesFormArray.length).toEqual(1);
      expect(component.splitExpensesFormArray.controls[0].value).toEqual(splitExpense3);
      expect(component.customDateValidator).toHaveBeenCalledTimes(1);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });

    it('should set the date of when the expense was created to today if not provided while splitting an expense', () => {
      spyOn(component, 'getTotalSplitAmount');
      spyOn(component, 'customDateValidator').and.returnValue(null);
      const amount = 2000;
      const currency = 'INR';
      const percentage = 50;
      const txnDate = null;

      component.splitType = 'categories';
      component.transaction = null;

      component.add(amount, currency, percentage, txnDate);
      expect(component.splitExpensesFormArray.length).toEqual(1);
      expect(component.splitExpensesFormArray.controls[0].value).toEqual(splitExpense4);
      expect(component.customDateValidator).toHaveBeenCalledTimes(1);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });

    it('should add the form control to the form array when the split type is projects', () => {
      spyOn(component, 'getTotalSplitAmount');
      spyOn(component, 'customDateValidator').and.returnValue(null);
      const amount = 2000;
      const currency = 'INR';
      const percentage = 50;
      component.splitType = 'projects';
      component.transaction = txnData;

      component.add(amount, currency, percentage);
      expect(component.splitExpensesFormArray.length).toEqual(1);
      expect(component.splitExpensesFormArray.controls[0].value).toEqual(splitExpense5);
      expect(component.customDateValidator).toHaveBeenCalledTimes(1);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });

    it('should add the form control to the form array when the split type is cost centers', () => {
      spyOn(component, 'getTotalSplitAmount');
      spyOn(component, 'customDateValidator').and.returnValue(null);
      const amount = 2000;
      const currency = 'INR';
      const percentage = 50;
      component.splitType = 'cost centers';
      component.transaction = txnData;

      component.add(amount, currency, percentage);
      expect(component.splitExpensesFormArray.length).toEqual(1);
      expect(component.splitExpensesFormArray.controls[0].value).toEqual(splitExpense6);
      expect(component.customDateValidator).toHaveBeenCalledTimes(1);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });

    it('should add the form control to the form array when no arg is provided in case the expense is split in three', () => {
      spyOn(component, 'getTotalSplitAmount');
      spyOn(component, 'customDateValidator').and.returnValue(null);

      component.splitType = 'categories';
      component.transaction = txnData;
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(10000),
        currency: new FormControl('INR'),
        percentage: new FormControl(60),
        txn_dt: new FormControl('2023-02-08'),
        category: new FormControl(''),
      });

      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(5000),
        currency: new FormControl('INR'),
        percentage: new FormControl(40),
        txn_dt: new FormControl('2023-02-08'),
        category: new FormControl(''),
      });
      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2]);

      component.add();
      expect(component.splitExpensesFormArray.length).toEqual(3);
      expect(component.splitExpensesFormArray.controls[2].value).toEqual(splitExpense7);
      expect(component.customDateValidator).toHaveBeenCalledTimes(1);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove()', () => {
    it('should remove the expense at the 1st index', () => {
      spyOn(component, 'getTotalSplitAmount');
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(10000),
        currency: new FormControl('INR'),
        percentage: new FormControl(60),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(5000),
        currency: new FormControl('INR'),
        percentage: new FormControl(40),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2]);
      component.remove(1);

      expect(component.splitExpensesFormArray.length).toBe(1);
      expect(component.splitExpensesFormArray.controls[0].value.amount).toBe(10000);
      expect(component.splitExpensesFormArray.controls[0].value.percentage).toBe(60);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });

    it('should recalculate the amount and percentage for the last split expense form when there are more than 2 splits', () => {
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(9000),
        currency: new FormControl('INR'),
        percentage: new FormControl(60),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(4000),
        currency: new FormControl('INR'),
        percentage: new FormControl(26.667),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const splitExpenseForm3 = new FormGroup({
        amount: new FormControl(2000),
        currency: new FormControl('INR'),
        percentage: new FormControl(13.333),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2, splitExpenseForm3]);
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
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(327.5),
        currency: new FormControl('INR'),
        percentage: new FormControl(50),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(327.5),
        currency: new FormControl('INR'),
        percentage: new FormControl(50),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2]);
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
        lastSplitPercentage
      );
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(1);
    });
  });

  describe('setEvenSplit()', () => {
    it('should set the amount and percentage for the last split when last split is true', () => {
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(327.5),
        currency: new FormControl('INR'),
        percentage: new FormControl(50),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(327.5),
        currency: new FormControl('INR'),
        percentage: new FormControl(50),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2]);
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
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(218.333),
        currency: new FormControl('INR'),
        percentage: new FormControl(33.333),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(218.333),
        currency: new FormControl('INR'),
        percentage: new FormControl(33.333),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const splitExpenseForm3 = new FormGroup({
        amount: new FormControl(218.333),
        currency: new FormControl('INR'),
        percentage: new FormControl(33.334),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const evenAmount = 218.333;
      const evenPercentage = 33.333;
      const lastSplitAmount = 218.334;
      const lastSplitIndex = 2;
      const lastSplitPercentage = 33.334;

      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2, splitExpenseForm3]);
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
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(500),
        currency: new FormControl('INR'),
        percentage: new FormControl(50),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(500),
        currency: new FormControl('INR'),
        percentage: new FormControl(50),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2]);
      //@ts-ignore
      const result = component.isEvenlySplit();
      expect(result).toBeTrue();
    });

    it('should return false if the split expenses are not evenly split', () => {
      component.amount = 1000;
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(800),
        currency: new FormControl('INR'),
        percentage: new FormControl(80),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const splitExpenseForm2 = new FormGroup({
        amount: new FormControl(200),
        currency: new FormControl('INR'),
        percentage: new FormControl(20),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });
      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, splitExpenseForm2]);
      //@ts-ignore
      const result = component.isEvenlySplit();
      expect(result).toBeFalse();
    });

    it('should consider splits with a difference of 0.01 as evenly split', () => {
      component.splitExpensesFormArray = new FormArray([
        new FormGroup({
          amount: new FormControl(10.0),
          currency: new FormControl('INR'),
          percentage: new FormControl(20),
          txn_dt: new FormControl('2023-01-11'),
          category: new FormControl(''),
        }),
        new FormGroup({
          amount: new FormControl(10.01),
          currency: new FormControl('INR'),
          percentage: new FormControl(20),
          txn_dt: new FormControl('2023-01-11'),
          category: new FormControl(''),
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
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      spyOn(component, 'correctDates');
      spyOn(component, 'setTransactionDate').and.returnValue(new Date('2023-08-04'));
      timezoneService.convertAllDatesToProperLocale.and.returnValue(txnCustomPropertiesData);
    });

    it('should return split expense object with all the fields if splitType is projects', () => {
      component.splitType = 'projects';
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

    it('should return split expense object with all the fields if splitType is projects and splitExpenseValue.project is undefined', () => {
      component.splitType = 'projects';
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

    it('should return split expense object with all the fields if splitType is cost centers', () => {
      component.splitType = 'cost centers';
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

    it('should return split expense object with all the fields if splitType is cost centers and splitExpenseValue.cost_centers is undefined', () => {
      component.splitType = 'cost centers';
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

    it('should set txn_dt to the date provided in split expense form', () => {
      const mockSplitExpenseForm = cloneDeep(splitExpense1);
      const txnDateRes = component.setTransactionDate(mockSplitExpenseForm, '-05:00:00');
      expect(txnDateRes).toEqual(mockUTCDate);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date(mockSplitExpenseForm.txn_dt));
      expect(timezoneService.convertToUtc).toHaveBeenCalledOnceWith(mockDate, '-05:00:00');
    });

    it('should set txn_dt to transaction date if split expense form date is empty', () => {
      const mockSplitExpenseForm = cloneDeep(splitExpense1);
      mockSplitExpenseForm.txn_dt = '';
      const txnDateRes = component.setTransactionDate(mockSplitExpenseForm, '-05:00:00');
      expect(txnDateRes).toEqual(mockUTCDate);
      expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(txnData4.txn_dt);
      expect(timezoneService.convertToUtc).toHaveBeenCalledOnceWith(mockDate, '-05:00:00');
    });

    it('should set txn_dt to today if transaction date is also not provided', () => {
      const mockSplitExpenseForm = cloneDeep(splitExpense1);
      mockSplitExpenseForm.txn_dt = '';
      const mockTxn = cloneDeep(txnData4);
      mockTxn.txn_dt = null;
      component.transaction = mockTxn;

      const txnDateRes = component.setTransactionDate(mockSplitExpenseForm, '-05:00:00');
      expect(txnDateRes).toEqual(mockUTCDate);
      expect(timezoneService.convertToUtc).toHaveBeenCalledOnceWith(mockDate, '-05:00:00');
    });
  });

  it('setSplitExpenseValuesBasedOnProject(): should set project_id, project_name and category id in split expense', () => {
    const mockTransaction = cloneDeep(txnData4);
    mockTransaction.org_category_id = 122269;
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
      mockTransaction.org_category_id = 122269;
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
      mockTransaction.org_category_id = 122269;
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
      mockTransaction.org_category_id = 122269;
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
      mockTransaction.org_category_id = 122269;
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
      mockTransaction.org_category_id = 122269;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.org_category_id).toEqual(mockSplitExpenseForm.category.id);
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
      expect(splitTxn.org_category_id).toEqual(mockSplitExpenseForm.category.id);
      expect(splitTxn.org_category).toEqual(mockSplitExpenseForm.category.name);
      expect(splitTxn.project_id).toEqual(project.project_id);
      expect(splitTxn.project_name).toEqual(project.project_name);
    });

    it('should not set category_id in split expense if category is not present in transaction and split expense form', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.org_category_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter);
      mockSplitExpenseForm.category = null;
      const splitTxn = cloneDeep(txnData4);
      splitTxn.org_category_id = null;
      const project = cloneDeep(expectedProjectsResponse[0]);
      component.setSplitExpenseProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter: null }, true);

      expect(splitTxn.org_category_id).toBeNull();
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
        true
      );
    });

    it('should set category id and project id equal to values in the form', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.project_id = null;
      mockTransaction.org_category_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpenseDataWithCostCenter2);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setCategoryAndProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.org_category_id).toEqual(mockSplitExpenseForm.category.id);
      expect(splitTxn.project_id).toBeNull();
    });

    it('should set category id and project id equal to original expense', () => {
      const mockTransaction = cloneDeep(txnData4);
      mockTransaction.project_id = null;
      mockTransaction.org_category_id = null;
      component.transaction = mockTransaction;
      const mockSplitExpenseForm = cloneDeep(splitExpense1);
      const splitTxn = cloneDeep(txnData4);
      const project = cloneDeep(expectedProjectsResponse[0]);
      const costCenter = cloneDeep(costCenterExpenseField);
      component.setCategoryAndProjectHelper(mockSplitExpenseForm, splitTxn, { project, costCenter }, true);
      expect(splitTxn.org_category_id).toEqual(mockTransaction.org_category_id);
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
        true
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
        true
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
        true
      );
    });

    it('should call setCategoryAndProjectHelper with split form project if project is present in split form but project_org_category_ids is null', () => {
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
        true
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
      const splitExpenseForm1 = new FormGroup({
        amount: new FormControl(120),
        currency: new FormControl('INR'),
        percentage: new FormControl(60),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      const otherSplitExpenseForm = new FormGroup({
        amount: new FormControl(800),
        currency: new FormControl('INR'),
        percentage: new FormControl(40),
        txn_dt: new FormControl('2023-01-11'),
        category: new FormControl(''),
      });

      component.splitExpensesFormArray = new FormArray([splitExpenseForm1, otherSplitExpenseForm]);
      const splitExpenses = cloneDeep(txnList);
      component.createSplitTxns(splitExpenses).subscribe((res) => {
        expect(res).toEqual(txnList);
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          component.transaction,
          component.totalSplitAmount,
          splitExpenses,
          component.expenseFields
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
        txn_dt: [new Date(), Validators.compose([Validators.required, component.customDateValidator])],
      });
      component.splitExpensesFormArray = new FormArray([mockSplitExpForm]);
      spyOn(component, 'generateSplitEtxnFromFg').and.returnValue(of(txnList[0]));
      spyOn(component, 'uploadFiles').and.returnValue(of(fileObjectData1));
      spyOn(component, 'correctTotalSplitAmount');
      const mockTransaction = cloneDeep(txnList[0]);
      component.transaction = mockTransaction;
      // @ts-ignore
      spyOn(component, 'isEvenlySplit').and.returnValue(true);
      component.fileObjs = fileObject6;
      component.categoryList = transformedOrgCategories;
      component.splitType = 'projects';
      spyOn(component, 'createSplitTxns').and.returnValue(of(txnList));
      spyOn(component, 'handlePolicyAndMissingFieldsCheck').and.returnValue(
        of({
          action: 'continue',
          comments: { '0': 'test comment' },
        })
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
        txn_dt: [new Date(), Validators.compose([Validators.required, component.customDateValidator])],
      });
      component.splitExpensesFormArray = new FormArray([mockSplitExpForm]);

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
        Type: 'projects',
        'Is Evenly Split': true,
        Asset: 'Mobile',
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
          'msb-failure-with-camera-icon'
        );
        expect(trackingService.splittingExpense).toHaveBeenCalledOnceWith({
          Type: 'projects',
          'Is Evenly Split': true,
          Asset: 'Mobile',
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
        txn_dt: [new Date(), Validators.compose([Validators.required, component.customDateValidator])],
      });
      component.splitExpensesFormArray = new FormArray([mockSplitExpForm]);
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
        }
      );
      expect(splitExpenseService.postSplitExpenseComments).toHaveBeenCalledOnceWith(
        ['txAzvMhbD71q', 'txzLsDY1IAAw'],
        {}
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
          'msb-failure-with-camera-icon'
        );
        expect(splitExpenseService.postSplitExpenseComments).not.toHaveBeenCalled();
        expect(component.showSuccessToast).not.toHaveBeenCalled();
      }
    }));

    it('should throw an error and show failure toast if postSplitExpenseComments API fails', fakeAsync(() => {
      splitExpenseService.postSplitExpenseComments.and.returnValue(
        throwError(() => new Error('Post Split Expense Comments API failed!'))
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
          'msb-failure-with-camera-icon'
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

    it('should open policy violations and missing fields modal', async () => {
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
        { '1': transformedSplitExpenseMissingFieldsData }
      );
      expect(splitExpenseService.filteredPolicyViolations).toHaveBeenCalledOnceWith({ '0': policyViolation1 });
      expect(splitExpenseService.filteredMissingFieldsViolations).toHaveBeenCalledOnceWith({
        '1': transformedSplitExpenseMissingFieldsData,
      });
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: SplitExpensePolicyViolationComponent,
        componentProps: {
          policyViolations: { '0': filteredSplitPolicyViolationsData },
          missingFieldsViolations: { '1': filteredMissingFieldsViolationsData },
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

    it('should open policy violations and missing fields modal with isPartOfReport as true if report is attached', async () => {
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
        null
      );
      expect(splitExpenseService.filteredPolicyViolations).toHaveBeenCalledOnceWith({ '0': policyViolation1 });
      expect(splitExpenseService.filteredMissingFieldsViolations).not.toHaveBeenCalled();
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: SplitExpensePolicyViolationComponent,
        componentProps: {
          policyViolations: { '0': filteredSplitPolicyViolationsData },
          missingFieldsViolations: null,
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
        })
      );
      spyOn(component, 'transformViolationData').and.returnValue({ '0': policyViolation1 });
      spyOn(component, 'transformMandatoryFieldsData').and.returnValue({
        '1': transformedSplitExpenseMissingFieldsData,
      });
    });

    it('should call handlePolicyAndMissingFieldsCheck and showSplitExpensePolicyViolationsAndMissingFields if policy violations exist', (done) => {
      const splitEtxns = cloneDeep(txnList);
      component.handlePolicyAndMissingFieldsCheck(splitEtxns).subscribe((res) => {
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
          }
        );
        expect(component.transformViolationData).toHaveBeenCalledOnceWith(splitEtxns, splitPolicyExp1);
        expect(component.transformMandatoryFieldsData).toHaveBeenCalledOnceWith(
          splitEtxns,
          SplitExpenseMissingFieldsData
        );
        expect(component.showSplitExpensePolicyViolationsAndMissingFields).toHaveBeenCalledOnceWith(
          splitEtxns,
          { '0': policyViolation1 },
          { '1': transformedSplitExpenseMissingFieldsData }
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
        })
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
          }
        );
        expect(component.transformViolationData).toHaveBeenCalledOnceWith(splitEtxns, splitPolicyExp1);
        expect(component.transformMandatoryFieldsData).not.toHaveBeenCalled();
        expect(component.showSplitExpensePolicyViolationsAndMissingFields).toHaveBeenCalledOnceWith(
          splitEtxns,
          { '0': policyViolation1 },
          null
        );
        done();
      });
    });

    it('should return action as continue if policy violations and missing fields does not exist', (done) => {
      const splitEtxns = cloneDeep(txnList);
      splitEtxns[0].org_category_id = null;
      splitEtxns[0].custom_properties[0].id = component.expenseFields[0].id;
      policyService.checkIfViolationsExist.and.returnValue(false);
      splitExpenseService.checkIfMissingFieldsExist.and.returnValue(false);
      splitExpenseService.handlePolicyAndMissingFieldsCheck.and.returnValue(
        of({
          policyViolations: splitPolicyExp1,
          missingFields: {},
        })
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
          }
        );
        expect(component.transformViolationData).toHaveBeenCalledOnceWith(splitEtxns, splitPolicyExp1);
        expect(component.transformMandatoryFieldsData).not.toHaveBeenCalled();
        expect(component.showSplitExpensePolicyViolationsAndMissingFields).not.toHaveBeenCalled();
        expect(res).toEqual({ action: 'continue', comments: null });
        done();
      });
    });
  });

  describe('getViolationName():', () => {
    beforeEach(() => {
      component.splitExpensesFormArray = new FormArray([splitExpenseFormData7]);
    });

    it('should return category name if split type is category', () => {
      component.splitType = 'categories';

      expect(component.getViolationName(0)).toEqual('Food');
    });

    it('should return project name if split type is project', () => {
      component.splitType = 'projects';

      expect(component.getViolationName(0)).toEqual('Project 1');
    });

    it('should return cost center name if split type is cost center', () => {
      component.splitType = 'cost centers';

      expect(component.getViolationName(0)).toEqual('Cost Center 1');
    });
  });

  it('transformViolationData(): should return amount, type, currency and violation data', () => {
    const etxn = cloneDeep([txnData4]);
    spyOn(component, 'getViolationName').and.returnValue('Food');
    const mockPolicyViolation = cloneDeep(splitPolicyExp1);

    const res = component.transformViolationData(etxn, mockPolicyViolation);
    expect(res).toEqual({
      '0': policyViolationData5,
    });
  });

  it('transformMandatoryFieldsData(): should return amount, type, currency and missing fields data', () => {
    const etxn = cloneDeep([txnData4]);
    spyOn(component, 'getViolationName').and.returnValue('Food');
    const mockMissingFields = cloneDeep(SplitExpenseMissingFieldsData);
    component.splitType = 'category';

    const res = component.transformMandatoryFieldsData(etxn, mockMissingFields);
    expect(res).toEqual({
      '0': transformedSplitExpenseMissingFieldsData2,
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
