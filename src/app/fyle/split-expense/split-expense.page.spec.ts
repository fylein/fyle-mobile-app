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
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  createSourceTxn,
  splitExpenseTxn1,
  splitExpenseTxn2,
  splitTxn2,
  splitTxns,
  txnAmount1,
  txnAmount2,
  txnList,
} from 'src/app/core/mock-data/transaction.data';
import { splitTransactionData1 } from 'src/app/core/mock-data/public-policy-expense.data';
import { ExpenseFieldsObj } from 'src/app/core/models/v1/expense-fields-obj.model';
import { SplitExpense } from 'src/app/core/models/split-expense.model';
import { txnFieldData } from 'src/app/core/mock-data/expense-field-obj.data';
import { OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import {
  fileObject6,
  fileObject7,
  fileObject8,
  splitExpFile2,
  splitExpFile3,
  splitExpFileObj,
} from 'src/app/core/mock-data/file-object.data';
import { fileTxns, fileTxns2, fileTxns3, fileTxns4, fileTxns5, fileTxns6 } from 'src/app/core/mock-data/file-txn.data';
import { splitExpense1, splitExpense2 } from 'src/app/core/mock-data/split-expense-data';
import { fileData2 } from 'src/app/core/mock-data/file.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

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
                txnFields: '["tx3qwe4ty","tx6sd7gh","txD3cvb6"]',
                fileObjs: ['{"url: mockUrl"}'],
                selectedCCCTransaction: 'tx3qwe4ty',
                selectedReportId: 'rpt3qwe4ty',
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

  describe('getTotalSplitAmount', () => {
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

  describe('setUpSplitExpenseBillable', () => {
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

  it('getCategoryList(): get the category list', () => {
    const categories: OrgCategoryListItem[] = [
      {
        label: 'Accounts Payable - Employees',
        value: expectedOrgCategoriesPaginated[0],
      },
      {
        label: 'Capitalized Software Costs',
        value: expectedOrgCategoriesPaginated[1],
      },
      {
        label: 'COGS-Billable Hours',
        value: expectedOrgCategoriesPaginated[2],
      },
      {
        label: 'samp category',
        value: expectedOrgCategoriesPaginated[3],
      },
    ];
    component.categories$ = of(categories);
    component.getCategoryList();
    expect(component.categoryList).toEqual(expectedOrgCategoriesPaginated);
  });

  describe('createAndLinkTxnsWithFiles():', () => {
    it('should link transaction with files when the receipt is attached and, the txn state is COMPLETE but the report id is not present', fakeAsync(() => {
      const splitExpData = splitExpenseTxn1;
      component.transaction = txnAmount1;
      component.totalSplitAmount = 436342.464;
      splitExpenseService.createSplitTxns.and.returnValue(of(splitExpenseTxn1));

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
      component.splitExpenseTxn = [fileTxns2];
      const mockCompleteTxnIds = ['txPazncEIY9Q', 'tx12SqYytrm'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of(fileObject7));
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          txnAmount1,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.getBase64Content).toHaveBeenCalledOnceWith(fileObject6);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns3);
        expect(result).toEqual(mockCompleteTxnIds);
      });
      tick(500);
    }));

    it('should link transaction with files when the receipt is attached,the txn state is COMPLETE and the report id is present', fakeAsync(() => {
      const splitExpData = splitExpenseTxn1;
      component.transaction = txnAmount1;
      component.reportId = 'rpba4MnwQ0FO';
      component.totalSplitAmount = 436342.464;
      splitExpenseService.createSplitTxns.and.returnValue(of(splitExpenseTxn1));

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
      component.splitExpenseTxn = [fileTxns2];
      const mockCompleteTxnIds = ['txPazncEIY9Q', 'tx12SqYytrm'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of(fileObject7));
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          txnAmount1,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.getBase64Content).toHaveBeenCalledOnceWith(fileObject6);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(reportService.addTransactions).toHaveBeenCalledOnceWith(component.reportId, mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns3);
        expect(result).toEqual(mockCompleteTxnIds);
      });
      tick(500);
    }));

    it('should link transaction to files when the receipt is not attached and report id is not present', fakeAsync(() => {
      const splitExpData = splitExpenseTxn1;
      component.fileObjs = [];
      component.transaction = txnAmount1;
      component.reportId = '';
      component.createAndLinkTxnsWithFiles(splitExpData);
      component.transaction = txnAmount1;
      splitExpenseService.createSplitTxns.and.returnValue(of(splitExpenseTxn1));
      component.splitExpenseTxn = fileTxns2.txns;
      component.totalSplitAmount = 436342.464;

      const mockCompleteTxnIds = ['txPazncEIY9Q', 'tx12SqYytrm'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of([null]));
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledWith(
          txnAmount1,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledTimes(2);
        expect(splitExpenseService.getBase64Content).not.toHaveBeenCalled();
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns4);
        expect(result).toEqual(mockCompleteTxnIds);
      });
      tick(500);
    }));

    it('should link transaction to files when the receipt is not attached and report is not present', fakeAsync(() => {
      const splitExpData = splitExpenseTxn1;
      component.fileObjs = [];
      component.transaction = txnAmount1;
      component.reportId = 'rpba4MnwQ0FO';
      component.createAndLinkTxnsWithFiles(splitExpData);
      component.transaction = txnAmount1;
      splitExpenseService.createSplitTxns.and.returnValue(of(splitExpenseTxn1));
      component.splitExpenseTxn = fileTxns2.txns;
      component.totalSplitAmount = 436342.464;
      splitExpenseService.linkTxnWithFiles.and.returnValue(of([null]));
      reportService.addTransactions.and.returnValue(of(fileData2));

      const mockCompleteTxnIds = ['txPazncEIY9Q', 'tx12SqYytrm'];
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledWith(
          txnAmount1,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledTimes(2);
        expect(splitExpenseService.getBase64Content).not.toHaveBeenCalled();
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(reportService.addTransactions).toHaveBeenCalledOnceWith(component.reportId, mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns4);
        expect(result).toEqual(mockCompleteTxnIds);
      });
      tick(500);
    }));

    it('should link transaction with files when the receipt is attached,the txn state is COMPLETE and the report id is present and the expense is split in three', fakeAsync(() => {
      const splitExpData = splitExpenseTxn2;
      component.fileObjs = fileObject8;
      component.transaction = txnAmount2;
      component.reportId = 'rpPNBrdR9NaE';
      component.totalSplitAmount = 6000;
      reportService.addTransactions.and.returnValue(of(fileData2));
      splitExpenseService.createSplitTxns.and.returnValue(of(splitExpenseTxn2));
      splitExpenseService.getBase64Content.and.returnValue(
        of([
          {
            id: 'fiI9e9ZytdXM',
            name: '000.jpeg',
            content: 'someData',
          },
        ])
      );
      component.splitExpenseTxn = [fileTxns5];
      const mockCompleteTxnIds = ['txmsakgYZeCV', 'tx78mWdbfw1N', 'txwyRuUnVCbo'];
      splitExpenseService.linkTxnWithFiles.and.returnValue(of(fileObject8));
      component.createAndLinkTxnsWithFiles(splitExpData).subscribe((result) => {
        expect(splitExpenseService.createSplitTxns).toHaveBeenCalledOnceWith(
          txnAmount2,
          component.totalSplitAmount,
          splitExpData
        );
        expect(splitExpenseService.getBase64Content).toHaveBeenCalledOnceWith(fileObject8);
        expect(component.completeTxnIds).toEqual(mockCompleteTxnIds);
        expect(reportService.addTransactions).toHaveBeenCalledOnceWith(component.reportId, mockCompleteTxnIds);
        expect(splitExpenseService.linkTxnWithFiles).toHaveBeenCalledOnceWith(fileTxns6);
        expect(result).toEqual(mockCompleteTxnIds);
      });
      tick(500);
    }));
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
      expect(component.toastWithCTA).toHaveBeenCalledOnceWith(toastMessage);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });

    it('should show success toast along wiht the number of splits when all the expenses are not added to report', () => {
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

    it('should show success toast when all the expenses were split successflully but report id was not present', () => {
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

  it('getAttachedFiles: should get all the attached files', () => {
    const transactionId = 'fizBwnXhyZTp';
    fileService.findByTransactionId.and.returnValue(of(fileObject8));
    component.getAttachedFiles(transactionId).subscribe((result) => {
      expect(result).toEqual(fileObject8);
      expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith(transactionId);
    });
  });

  it('getActiveCategories(): should get the active categories', () => {
    categoriesService.getAll.and.returnValue(of(filterOrgCategoryParam));
    categoriesService.filterRequired.and.returnValue(expectedFilterOrgCategory);
    component.getActiveCategories().subscribe((res) => {
      expect(res).toEqual(expectedFilterOrgCategory);
      expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      expect(categoriesService.filterRequired).toHaveBeenCalledOnceWith(filterOrgCategoryParam);
    });
  });
});
