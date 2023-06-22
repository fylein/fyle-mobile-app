import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { DateService } from 'src/app/core/services/date.service';
import { FileService } from 'src/app/core/services/file.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { SplitExpenseService } from 'src/app/core/services/split-expense.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ReportService } from 'src/app/core/services/report.service';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { SplitExpensePage } from './split-expense.page';
import {
  AbstractControlOptions,
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
import { of } from 'rxjs';
import {
  expectedFilterOrgCategory,
  expectedOrgCategoriesPaginated,
  filterOrgCategoryParam,
} from 'src/app/core/mock-data/org-category.data';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { FyAlertInfoComponent } from 'src/app/shared/components/fy-alert-info/fy-alert-info.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { expenseFieldWithBillable } from 'src/app/core/mock-data/expense-field.data';
import {
  amtTxn3,
  createSourceTxn,
  sourceSplitTxn,
  sourceTxn2,
  splitExpenseTxn1,
  splitExpenseTxn1_1,
  splitExpenseTxn2,
  splitExpenseTxn2_2,
  splitExpenseTxn2_3,
  splitExpenseTxn3,
  splitPurposeTxn,
  splitTxn2,
  splitTxns,
  txnAmount1,
  txnAmount2,
  txnData,
  txnList,
} from 'src/app/core/mock-data/transaction.data';
import { splitTransactionData1 } from 'src/app/core/mock-data/public-policy-expense.data';
import { ExpenseFieldsObj } from 'src/app/core/models/v1/expense-fields-obj.model';
import { SplitExpense } from 'src/app/core/models/split-expense.model';
import { txnFieldData } from 'src/app/core/mock-data/expense-field-obj.data';
import { OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import {
  fileObjectData5,
  fileObject6,
  fileObject7,
  fileObject8,
  fileObjectAdv,
  fileObjectAdv1,
  fileObjectData4,
  splitExpFile2,
  splitExpFile3,
  splitExpFileObj,
  thumbnailUrlMockData,
} from 'src/app/core/mock-data/file-object.data';
import {
  fileTxns,
  fileTxns2,
  fileTxns3,
  fileTxns4,
  fileTxns5,
  fileTxns6,
  fileTxns7,
} from 'src/app/core/mock-data/file-txn.data';
import {
  splitExpense1,
  splitExpense2,
  splitExpense3,
  splitExpense4,
  splitExpense5,
  splitExpense6,
  splitExpense7,
} from 'src/app/core/mock-data/split-expense-data';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { dependentFieldValues } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import {
  allowedActiveCategories,
  allowedActiveCategoriesListOptions,
  testActiveCategoryList,
  testActiveCategoryListOptions,
  testProjectV2,
} from 'src/app/core/test-data/projects.spec.data';
import { fileData2 } from 'src/app/core/mock-data/file.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { formattedTxnViolations } from 'src/app/core/mock-data/formatted-policy-violation.data';
import { SplitExpensePolicyViolationComponent } from 'src/app/shared/components/split-expense-policy-violation/split-expense-policy-violation.component';
import {
  policyViolationData3,
  policyVoilationData2,
  splitPolicyExp4,
} from 'src/app/core/mock-data/policy-violation.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import * as dayjs from 'dayjs';
import { unflattenedAccount2Data, unflattenedAccount3Data } from 'src/app/core/test-data/accounts.service.spec.data';
import { categorieListRes } from 'src/app/core/mock-data/org-category-list-item.data';

describe('SplitExpensePage', () => {
  let component: SplitExpensePage;
  let fixture: ComponentFixture<SplitExpensePage>;
  let formBuilder: jasmine.SpyObj<FormBuilder>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let dateService: jasmine.SpyObj<DateService>;
  let splitExpenseService: jasmine.SpyObj<SplitExpenseService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let fileService: jasmine.SpyObj<FileService>;
  let navController: jasmine.SpyObj<NavController>;
  let router: jasmine.SpyObj<Router>;
  let transactionsOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let reportService: jasmine.SpyObj<ReportService>;
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
  let activateRouteMock: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getAll', 'filterRequired']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['getUTCDate', 'addDaysToDate']);
    const splitExpenseServiceSpy = jasmine.createSpyObj('SplitExpenseService', [
      'createSplitTxns',
      'createSplitTxns',
      'linkTxnWithFiles',
      'formatPolicyViolations',
      'checkForPolicyViolations',
      'getBase64Content',
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['delete', 'matchCCCExpense']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['findByTransactionId']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const transactionsOutboxServiceSpy = jasmine.createSpyObj('TransactionsOutboxService', ['fileUpload']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['addTransactions']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['showToastMessage', 'splittingExpense']);
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
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TransactionsOutboxService, useValue: transactionsOutboxServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
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
              },
            },
          },
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
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    transactionsOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
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

      expect(splitExpenseForm1.controls.amount.value).toEqual(120);
      expect(splitExpenseForm1.controls.percentage.value).toEqual(6);

      component.onChangeAmount(otherSplitExpenseForm, 1);
      tick(500);
      expect(component.splitExpensesFormArray.controls[1].value.amount).toEqual(1880);
      expect(component.splitExpensesFormArray.controls[1].value.percentage).toEqual(94);
      expect(otherSplitExpenseForm.controls.amount.value).toEqual(1880);
      expect(otherSplitExpenseForm.controls.percentage.value).toEqual(94);
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

      expect(otherSplitExpenseForm.controls.amount.value).toEqual(80);
      expect(otherSplitExpenseForm.controls.percentage.value).toEqual(4);

      component.onChangeAmount(splitExpenseForm1, 0);
      tick(500);
      expect(component.splitExpensesFormArray.controls[0].value.amount).toEqual(1920);
      expect(component.splitExpensesFormArray.controls[0].value.percentage).toEqual(96);
      expect(splitExpenseForm1.controls.amount.value).toEqual(1920);
      expect(splitExpenseForm1.controls.percentage.value).toEqual(96);
      expect(otherSplitExpenseForm.controls.percentage.value).toEqual(4);
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
      component.transaction = splitTransactionData1;
      const result = component.setUpSplitExpenseTax(splitExpense2);
      expect(result).toEqual(202.386);
    });

    it('should return the tax amount when the expense is split by tax and the tax amount has a falsy value', () => {
      const splitTransactionData = {
        ...splitTransactionData1,
        tax_amount: 0,
      };
      component.transaction = splitTransactionData;
      const result = component.setUpSplitExpenseTax(splitExpense1);
      expect(result).toBe(0);
    });
  });

  describe('uploadNewFiles(): ', () => {
    it('should upload new files when the type is an image', (done) => {
      const mockFileObject = {
        ...fileObjectData5,
        name: '000.jpeg',
      };
      const files = fileObjectAdv;
      const dataUrl = fileObjectAdv[0].url;
      const attachmentType = 'image';
      transactionsOutboxService.fileUpload.and.resolveTo(mockFileObject);

      component.uploadNewFiles(files).subscribe((result) => {
        expect(result).toEqual([mockFileObject]);
        expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(dataUrl, attachmentType);
        done();
      });
    });

    it('should upload new files when the type is a png', (done) => {
      const mockFile = {
        ...fileObjectAdv[0],
        type: 'png',
      };
      const files = [mockFile];
      const dataUrl = fileObjectAdv[0].url;
      const attachmentType = 'image';
      transactionsOutboxService.fileUpload.and.resolveTo(fileObjectData5);

      component.uploadNewFiles(files).subscribe((result) => {
        expect(result).toEqual([fileObjectData5]);
        expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(dataUrl, attachmentType);
        done();
      });
    });

    it('should upload new files when the type is a pdf', (done) => {
      const files = [fileObjectAdv1];
      const mockFileObject = {
        ...fileObjectData5,
        name: '000.pdf',
      };
      const dataUrl = fileObjectAdv1.url;
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
      component.transaction = splitTxns;
      component.uploadFiles(fileObjectData4).subscribe((result) => {
        expect(component.fileObjs).toEqual([fileObjectData4]);
        expect(result).toEqual([fileObjectData4]);
        expect(component.uploadNewFiles).toHaveBeenCalledOnceWith(fileObjectData4);
        done();
      });
    });

    it('should return the attached files when the transaction id is specified', (done) => {
      spyOn(component, 'getAttachedFiles').and.returnValue(of(fileObject8));
      const FileObject9: FileObject[] = thumbnailUrlMockData.map((fileObject) => ({
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

  describe('createAndLinkTxnsWithFiles():', () => {
    it('should link transaction with files when the receipt is attached and, the txn state is COMPLETE but the report id is not present', (done) => {
      const splitExpData = [splitExpenseTxn1, splitExpenseTxn1_1];
      component.transaction = txnAmount1;
      component.reportId = null;
      component.totalSplitAmount = 436342.464;
      splitExpenseService.createSplitTxns.and.returnValue(of(fileTxns3.txns));

      component.fileObjs = fileObject6;
      splitExpenseService.getBase64Content.and.returnValue(
        of([
          {
            id: 'fiI9e9ZytdXM',
            name: '000.jpeg',
            content: 'someData',
          },
        ])
      );

      const mockCompleteTxnIds = ['txPazncEIY9Q', 'tx12SqYytrm'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of(fileObject7));
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          txnAmount1,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.getBase64Content).toHaveBeenCalledOnceWith(fileObject6);
        expect(component.splitExpenseTxn).toEqual(fileTxns3.txns);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns3);
        expect(result).toEqual(mockCompleteTxnIds);
        done();
      });
    });

    it('should link transaction with files when the receipt is attached,the txn state is COMPLETE and the report id is present', (done) => {
      const splitExpData = [splitExpenseTxn1, splitExpenseTxn1_1];
      component.transaction = txnAmount1;
      component.reportId = 'rpba4MnwQ0FO';
      component.totalSplitAmount = 436342.464;
      splitExpenseService.createSplitTxns.and.returnValue(of(fileTxns3.txns));

      component.fileObjs = fileObject6;
      reportService.addTransactions.and.returnValue(of(fileData2));
      splitExpenseService.getBase64Content.and.returnValue(
        of([
          {
            id: 'fiI9e9ZytdXM',
            name: '000.jpeg',
            content: 'someData',
          },
        ])
      );

      const mockCompleteTxnIds = ['txPazncEIY9Q', 'tx12SqYytrm'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of(fileObject7));
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          txnAmount1,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.getBase64Content).toHaveBeenCalledOnceWith(fileObject6);
        expect(component.splitExpenseTxn).toEqual(fileTxns3.txns);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(reportService.addTransactions).toHaveBeenCalledOnceWith(component.reportId, mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns3);
        expect(result).toEqual(mockCompleteTxnIds);
        done();
      });
    });

    it('should link transaction to files when the receipt is not attached and report id is not present', (done) => {
      const splitExpData = [splitExpenseTxn1, splitExpenseTxn1_1];
      component.fileObjs = [];
      component.reportId = null;
      component.transaction = txnAmount1;
      splitExpenseService.createSplitTxns.and.returnValue(of(fileTxns4.txns));
      component.totalSplitAmount = 436342.464;

      const mockCompleteTxnIds = ['txPazncEIY9Q', 'tx12SqYytrm'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of([null]));
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledWith(
          txnAmount1,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledTimes(1);
        expect(splitExpenseService.getBase64Content).not.toHaveBeenCalled();
        expect(component.splitExpenseTxn).toEqual(fileTxns4.txns);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns4);
        expect(result).toEqual(mockCompleteTxnIds);
        done();
      });
    });

    it('should link transaction to files when the receipt is not attached and report is present', (done) => {
      const splitExpData = [splitExpenseTxn1, splitExpenseTxn1_1];
      component.fileObjs = [];
      component.transaction = txnAmount1;
      component.reportId = 'rpba4MnwQ0FO';

      splitExpenseService.createSplitTxns.and.returnValue(of(fileTxns4.txns));
      component.totalSplitAmount = 436342.464;
      splitExpenseService.linkTxnWithFiles.and.returnValue(of([null]));
      reportService.addTransactions.and.returnValue(of(fileData2));

      const mockCompleteTxnIds = ['txPazncEIY9Q', 'tx12SqYytrm'];
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          txnAmount1,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.getBase64Content).not.toHaveBeenCalled();
        expect(component.splitExpenseTxn).toEqual(fileTxns4.txns);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(reportService.addTransactions).toHaveBeenCalledOnceWith(component.reportId, mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns4);
        expect(result).toEqual(mockCompleteTxnIds);
        done();
      });
    });

    it('should link transaction with files when the receipt is attached,the txn state is COMPLETE and the report id is present and the expense is split in three', (done) => {
      const splitExpData = [splitExpenseTxn2, splitExpenseTxn2_2, splitExpenseTxn2_3];
      component.fileObjs = fileObject8;
      component.transaction = txnAmount2;
      component.reportId = 'rpPNBrdR9NaE';
      component.totalSplitAmount = 6000;
      reportService.addTransactions.and.returnValue(of(fileData2));
      splitExpenseService.createSplitTxns.and.returnValue(of(fileTxns6.txns));
      splitExpenseService.getBase64Content.and.returnValue(
        of([
          {
            id: 'fiI9e9ZytdXM',
            name: '000.jpeg',
            content: 'someData',
          },
        ])
      );
      const mockCompleteTxnIds = ['txmsakgYZeCV', 'tx78mWdbfw1N', 'txwyRuUnVCbo'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of(fileObject8));
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          txnAmount2,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.getBase64Content).toHaveBeenCalledOnceWith(fileObject8);
        expect(component.splitExpenseTxn).toEqual(fileTxns6.txns);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(reportService.addTransactions).toHaveBeenCalledOnceWith(component.reportId, mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns6);
        expect(result).toEqual(mockCompleteTxnIds);
        done();
      });
    });

    it('should link transaction with files when only one of the txn state is COMPLETE and should only add this transaction to report', (done) => {
      const splitExpData = splitExpenseTxn3;
      component.transaction = amtTxn3;

      component.reportId = 'rpPNBrdR9NaE';
      component.totalSplitAmount = 635;
      reportService.addTransactions.and.returnValue(of(fileTxns7.txns));
      splitExpenseService.createSplitTxns.and.returnValue(of(fileTxns7.txns));

      const mockCompleteTxnIds = ['txegSZ66da1T'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of([null]));

      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          amtTxn3,
          component.totalSplitAmount,
          splitExpData
        );
        expect(component.splitExpenseTxn).toEqual(fileTxns7.txns);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(reportService.addTransactions).toHaveBeenCalledOnceWith(component.reportId, mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns7);
        expect(result).toEqual(['tx5qtWJTXRcj', 'txegSZ66da1T']);
        done();
      });
    });
  });

  it('toastWithCTA(): should display the toast with CTA', () => {
    const toastMessage = 'Your expense was split successfully. All the split expenses were added to the report';
    const toastMessageData = {
      message: toastMessage,
      redirectionText: 'View Report',
    };

    matSnackBar.openFromComponent.and.returnValue({
      onAction: () => ({
        subscribe: (callback: () => void) => {
          callback();
        },
      }),
    } as MatSnackBarRef<ToastMessageComponent>);

    component.toastWithCTA(toastMessage);

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarProperties.setSnackbarProperties('success', toastMessageData),
      panelClass: ['msb-success-with-camera-icon'],
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: toastMessage });
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'my_view_report',
      { id: component.reportId, navigateBack: true },
    ]);
  });

  it('toastWithoutCTA(): should display the toast without CTA', () => {
    const message = 'Your expense was split successfully. All the split expenses were added to the report';
    const toastType = 'success';
    const panelClassData = 'msb-success-with-camera-icon';
    component.toastWithoutCTA(message, toastType, panelClassData);
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarProperties.setSnackbarProperties(toastType, { message }),
      panelClass: [panelClassData],
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
  });

  describe('showSuccessToast()', () => {
    it('should show success toast when all the expenses are added to report', () => {
      component.reportId = 'rpPNBrdR9NaE';
      component.completeTxnIds = ['txmsakgYZeCV', 'tx78mWdbfw1N', 'txwyRuUnVCbo'];
      component.splitExpenseTxn = fileTxns5.txns;
      const toastMessage = 'Your expense was split successfully. All the split expenses were added to report';
      spyOn(component, 'toastWithCTA');
      component.showSuccessToast();
      expect(component.completeTxnIds.length).toEqual(component.splitExpenseTxn.length);
      expect(component.toastWithCTA).toHaveBeenCalledOnceWith(toastMessage);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });

    it('should show success toast along with the number of splits when all the expenses are not added to report', () => {
      component.reportId = 'rpPNBrdR9NaE';
      component.completeTxnIds = ['txmsakgYZeCV', 'tx78mWdbfw1N'];
      component.splitExpenseTxn = fileTxns5.txns;
      const toastMessage = 'Your expense was split successfully. 2 out of 3 expenses were added to report.';
      spyOn(component, 'toastWithCTA');
      component.showSuccessToast();
      expect(component.toastWithCTA).toHaveBeenCalledOnceWith(toastMessage);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });

    it('should show success toast when all the expenses are not added to report', () => {
      component.reportId = 'rpPNBrdR9NaE';
      component.completeTxnIds = [];
      component.splitExpenseTxn = fileTxns2.txns;
      const toastMessage = 'Your expense was split successfully. Review split expenses to add it to the report.';
      spyOn(component, 'toastWithoutCTA');
      component.showSuccessToast();
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(toastMessage, 'information', 'msb-info');
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });

    it('should show success toast when all the expenses were split successflully but report id was not present and redirect it to my_expenses page', () => {
      component.completeTxnIds = ['txmsakgYZeCV', 'tx78mWdbfw1N', 'txwyRuUnVCbo'];
      component.splitExpenseTxn = fileTxns5.txns;
      const toastMessage = 'Your expense was split successfully.';
      spyOn(component, 'toastWithoutCTA');
      component.showSuccessToast();
      expect(component.toastWithoutCTA).toHaveBeenCalledOnceWith(
        toastMessage,
        'success',
        'msb-success-with-camera-icon'
      );
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });
  });

  it('getAttachedFiles(): should get all the attached files', (done) => {
    const transactionId = 'fizBwnXhyZTp';
    fileService.findByTransactionId.and.returnValue(of(fileObject8));
    component.getAttachedFiles(transactionId).subscribe((result) => {
      expect(result).toEqual(fileObject8);
      expect(component.fileObjs).toEqual(fileObject8);
      expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith(transactionId);
      done();
    });
  });

  it('showSplitExpenseViolations(): should show the expense violations when the expense is split', async () => {
    const violations = formattedTxnViolations;
    spyOn(component, 'showSuccessToast');
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
    const result = await component.showSplitExpenseViolations(violations);
    expect(result).toBeUndefined();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: SplitExpensePolicyViolationComponent,
      componentProps: {
        policyViolations: violations,
      },
      mode: 'ios',
      presentingElement: await modalController.getTop(),
      ...properties,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    expect(component.showSuccessToast).toHaveBeenCalledTimes(1);
  });

  describe('handleSplitExpensePolicyViolations():', () => {
    it('should handle polciy violations when the expense is split', () => {
      const violations = policyVoilationData2;
      spyOn(component, 'showSplitExpenseViolations');
      policyService.checkIfViolationsExist.and.returnValue(true);
      splitExpenseService.formatPolicyViolations.and.returnValue(formattedTxnViolations);
      component.handleSplitExpensePolicyViolations(violations);
      expect(component.showSplitExpenseViolations).toHaveBeenCalledOnceWith(formattedTxnViolations);
    });

    it('should show success toast when the expense is split and there are no violations', () => {
      policyService.checkIfViolationsExist.and.returnValue(false);
      spyOn(component, 'showSuccessToast');
      component.handleSplitExpensePolicyViolations(policyViolationData3);
      expect(component.showSuccessToast).toHaveBeenCalledTimes(1);
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

      orgSettingsService.get.and.returnValue(of(orgSettingsGetData));
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));

      dependentFieldsService.getDependentFieldValuesForBaseField.and.returnValue(of(dependentFieldValues));

      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      dateService.addDaysToDate.and.returnValue(new Date());

      spyOn(component, 'getActiveCategories').and.callThrough();
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
      expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledOnceWith(testProjectV2, testActiveCategoryList);

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
  });

  describe('setValuesForCCC():', () => {
    it('should set the values for CCC split expenses when coporate credit cards is enabled', () => {
      dateService.addDaysToDate.and.returnValue(new Date());
      component.amount = 2000;
      spyOn(component, 'setAmountAndCurrency').and.callThrough();
      spyOn(component, 'add').and.callThrough();
      spyOn(component, 'getTotalSplitAmount').and.callThrough();
      const mockUnFlattenedDate = {
        ...unflattenedAccount2Data,
        amount: 2000,
        currency: 'INR',
      };
      const currencyObj = mockUnFlattenedDate;
      const homeCurrency = 'INR';
      const isCorporateCardsEnabled = true;

      const amount1 = 1200;
      const amount2 = 800;
      const percentage1 = 60;
      const percentage2 = 40;

      const today = new Date();
      const minDate = new Date('Jan 1, 2001');
      const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const expectedMinDate = `${minDate.getFullYear()}-${minDate.getMonth() + 1}-${minDate.getDate()}`;
      const expectedMaxDate = `${maxDate.getFullYear()}-${maxDate.getMonth() + 1}-${maxDate.getDate()}`;

      component.setValuesForCCC(currencyObj, homeCurrency, isCorporateCardsEnabled);
      expect(component.setAmountAndCurrency).toHaveBeenCalledWith(currencyObj, homeCurrency);
      expect(component.add).toHaveBeenCalledWith(amount1, 'INR', percentage1, null);
      expect(component.add).toHaveBeenCalledWith(amount2, 'INR', percentage2, null);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(3);
      expect(dateService.addDaysToDate).toHaveBeenCalledTimes(1);
      expect(component.minDate).toEqual(expectedMinDate);
    });

    it('should set the values to null if coporate credit cards is disabled and the amount is less than 0.0001', () => {
      dateService.addDaysToDate.and.returnValue(new Date());
      component.amount = 0.00001;
      spyOn(component, 'setAmountAndCurrency').and.callThrough();
      spyOn(component, 'add').and.callThrough();
      spyOn(component, 'getTotalSplitAmount').and.callThrough();
      const mockUnFlattenedDate = {
        ...unflattenedAccount2Data,
        amount: 0.00001,
        currency: 'INR',
      };
      const currencyObj = mockUnFlattenedDate;
      const homeCurrency = 'INR';
      const isCorporateCardsEnabled = false;

      const amount1 = null;
      const amount2 = null;
      //as these will be null only if amount is not present
      const percentage1 = 60;
      const percentage2 = 40;

      const today = new Date();
      const minDate = new Date('Jan 1, 2001');
      const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const expectedMinDate = `${minDate.getFullYear()}-${minDate.getMonth() + 1}-${minDate.getDate()}`;
      const expectedMaxDate = `${maxDate.getFullYear()}-${maxDate.getMonth() + 1}-${maxDate.getDate()}`;

      component.setValuesForCCC(currencyObj, homeCurrency, isCorporateCardsEnabled);
      expect(component.setAmountAndCurrency).toHaveBeenCalledWith(currencyObj, homeCurrency);
      expect(component.add).toHaveBeenCalledWith(amount1, 'INR', percentage1, null);
      expect(component.add).toHaveBeenCalledWith(amount2, 'INR', percentage2, null);
      expect(component.getTotalSplitAmount).toHaveBeenCalledTimes(3);
      expect(dateService.addDaysToDate).toHaveBeenCalledTimes(1);
      expect(component.minDate).toEqual(expectedMinDate);
    });
  });

  describe('setAmountAndCurrency():', () => {
    it('should set the amount and currency when orig currency and amount are present', () => {
      const currencyObj = unflattenedAccount3Data;
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
        ...unflattenedAccount3Data,
        currency: null,
        orig_currency: null,
      };
      const homeCurrency = orgData1[0].currency;
      component.setAmountAndCurrency(mockCurrencyObj, homeCurrency);
      expect(component.amount).toBe(800000);
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
      tomorrow.setDate(tomorrow.getDate() + 2);
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
      expect(isEvenSplit).toBe(true);
    });
  });
});
