import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { FileService } from 'src/app/core/services/file.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { SnackbarPropertiesService } from '../../../core/services/snackbar-properties.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { ExpensesCardComponent } from './expenses-card.component';
import { PopoverController, ModalController, Platform } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ExpenseState } from '../../pipes/expense-state.pipe';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { of, take } from 'rxjs';
import { expenseFieldsMapResponse2 } from 'src/app/core/mock-data/expense-fields-map.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { DateFormatPipe } from 'src/app/shared/pipes/date-format.pipe';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { fileObjectAdv, fileObjectData } from 'src/app/core/mock-data/file-object.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { cloneDeep } from 'lodash';
import * as dayjs from 'dayjs';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { DebugElement, EventEmitter } from '@angular/core';
import { expenseData, expenseResponseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { ExpensesService as SharedExpenseService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { platformExpenseData, platformExpenseWithExtractedData } from 'src/app/core/mock-data/platform/v1/expense.data';
import {
  transformedExpenseData,
  transformedExpenseWithExtractedData,
} from 'src/app/core/mock-data/transformed-expense.data';

describe('ExpensesCardComponent', () => {
  let component: ExpensesCardComponent;
  let fixture: ComponentFixture<ExpensesCardComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let sharedExpenseService: jasmine.SpyObj<SharedExpenseService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let fileService: jasmine.SpyObj<FileService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let transactionsOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let platform: jasmine.SpyObj<Platform>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let componentElement: DebugElement;

  beforeEach(waitForAsync(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['transformExpense']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById', 'attachReceiptToExpense']);
    const sharedExpenseServiceSpy = jasmine.createSpyObj('SharedExpenseService', [
      'isExpenseInDraft',
      'isCriticalPolicyViolatedExpense',
      'getVendorDetails',
    ]);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', [
      'downloadUrl',
      'getReceiptDetails',
      'readFile',
      'getImageTypeFromDataUrl',
      'getAttachmentType',
      'post',
    ]);

    fileServiceSpy.downloadUrl.and.returnValue(of('/assets/svg/list-plus.svg'));
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const transactionsOutboxServiceSpy = jasmine.createSpyObj('TransactionsOutboxService', [
      'isDataExtractionPending',
      'isSyncInProgress',
      'fileUpload',
    ]);
    const expenseStateSpy = jasmine.createSpyObj('ExpenseState', ['transform']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const platformSpy = jasmine.createSpyObj('Platform', ['is']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['addAttachment', 'showToastMessage']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const dateFormatPipeSpy = jasmine.createSpyObj('DateFormatPipe', ['transform']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);

    TestBed.configureTestingModule({
      declarations: [ExpensesCardComponent, DateFormatPipe, HumanizeCurrencyPipe, ExpenseState],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, MatCheckboxModule, FormsModule],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: SharedExpenseService, useValue: sharedExpenseServiceSpy },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: TransactionsOutboxService, useValue: transactionsOutboxServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ExpenseFieldsService, useValue: expenseFieldsServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: DateFormatPipe, useValue: dateFormatPipeSpy },
        { provide: HumanizeCurrencyPipe, useValue: humanizeCurrencyPipeSpy },
        { provide: ExpenseState, useValue: expenseStateSpy },
      ],
    }).compileComponents();

    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    transactionsOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    sharedExpenseService = TestBed.inject(SharedExpenseService) as jasmine.SpyObj<SharedExpenseService>;

    orgSettingsService.get.and.returnValue(of(orgSettingsGetData));
    transactionsOutboxService.isSyncInProgress.and.returnValue(true);
    expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse2));
    sharedExpenseService.getVendorDetails.and.returnValue('asd');
    currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
    sharedExpenseService.isCriticalPolicyViolatedExpense.and.returnValue(false);
    platform.is.and.returnValue(true);
    fileService.getReceiptDetails.and.returnValue(fileObjectAdv[0].type);
    transactionsOutboxService.isDataExtractionPending.and.returnValue(true);
    expensesService.getExpenseById.and.returnValue(of(platformExpenseData));
    transactionService.transformExpense.and.returnValue(transformedExpenseData);
    networkService.isOnline.and.returnValue(of(true));
    sharedExpenseService.isExpenseInDraft.and.returnValue(true);

    networkService.connectivityWatcher.and.returnValue(new EventEmitter());
    fixture = TestBed.createComponent(ExpensesCardComponent);
    component = fixture.componentInstance;

    component.receiptIcon = 'assets/svg/file-pdf.svg';
    component.isOutboxExpense = true;
    component.selectedElements = expenseResponseData;
    component.expense = cloneDeep(expenseData);
    component.isConnected$ = of(true);
    component.isSycing$ = of(true);
    component.isPerDiem = true;
    component.isSelectionModeEnabled = false;
    component.expenseIndex = 1;
    componentElement = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isSelected getter', () => {
    it('should return true if the expense is selected', () => {
      component.selectedElements = expenseResponseData;
      component.expense = {
        ...expenseData,
        id: 'txcSFe6efB6R',
      };
      expect(component.isSelected).toBeTrue();
    });

    it('should return false if the expense is not selected', () => {
      component.selectedElements = expenseResponseData;
      component.expense = {
        ...expenseData,
        id: null,
      };
      expect(component.isSelected).toBeFalse();
    });

    it('should return false if there are no selectedElements', () => {
      component.selectedElements = null;
      component.expense = {
        ...expenseData,
        id: 'txcSFe6efB6R',
      };
      expect(component.isSelected).toBeFalse();
    });
  });

  describe('onGoToTransaction():', () => {
    it('should emit an event when onGoToTransaction is called', () => {
      spyOn(component.goToTransaction, 'emit');
      component.onGoToTransaction();
      expect(component.goToTransaction.emit).toHaveBeenCalledOnceWith({
        expense: component.expense,
        expenseIndex: component.expenseIndex,
      });
    });

    it('should not emit an event when isSelectionModeEnabled is true', () => {
      component.isSelectionModeEnabled = true;
      spyOn(component.goToTransaction, 'emit');
      component.onGoToTransaction();
      expect(component.goToTransaction.emit).not.toHaveBeenCalledTimes(1);
    });
  });

  describe('getReceipt', () => {
    it('should set the receipt icon to mileage when the fyle catergory is mileage', () => {
      component.expense = cloneDeep(expenseData);
      component.expense.category.name = 'mileage';
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/mileage.svg');
    });

    it('should set the receipt icon to calendar when the fyle catergory is per diem', () => {
      component.expense = cloneDeep(expenseData);
      component.expense.category.name = 'per diem';
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/calendar.svg');
    });

    it('should set the receipt icon to add-receipt when there are no file ids', () => {
      component.expense = {
        ...cloneDeep(expenseData),
        file_ids: null,
      };
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/list-plus.svg');
    });

    it('should set the receipt icon to add-receipt when there are no file ids', () => {
      component.isFromReports = true;
      component.isFromPotentialDuplicates = true;
      component.expense = {
        ...expenseData,
        file_ids: null,
      };
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/list.svg');
    });

    it('should set isReceiptPresent to true if not a mileage or per diem expense and file ids present', () => {
      component.expense = {
        ...cloneDeep(expenseData),
        file_ids: ['testfileid'],
      };
      component.getReceipt();
      fixture.detectChanges();
      expect(component.isReceiptPresent).toBeTrue();
    });
  });

  describe('checkIfScanIsCompleted():', () => {
    it('should check if scan is complete and return true if the transaction amount is not null and no other data is present', () => {
      component.expense = {
        ...expenseData,
        amount: 100,
        claim_amount: null,
        extracted_data: null,
      };
      const result = component.checkIfScanIsCompleted();
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if the transaction user amount is present and no extracted data is available', () => {
      component.expense = {
        ...expenseData,
        amount: null,
        claim_amount: 7500,
        extracted_data: null,
      };
      const result = component.checkIfScanIsCompleted();
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if the required extracted data is present', () => {
      component.expense = {
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
      const result = component.checkIfScanIsCompleted();
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should return true if the scan has expired', () => {
      component.expense = {
        ...expenseData,
        amount: null,
        claim_amount: null,
        extracted_data: null,
      };
      const oneDaysAfter = dayjs(component.expense.created_at).add(1, 'day').toDate();
      jasmine.clock().mockDate(oneDaysAfter);

      const result = component.checkIfScanIsCompleted();
      expect(result).toBeTrue();
    });
  });

  describe('pollDataExtractionStatus():', () => {
    it('should call the callback when data extraction is not pending', fakeAsync(() => {
      transactionsOutboxService.isDataExtractionPending.and.returnValue(false);
      const callbackSpy = jasmine.createSpy('callback');
      component.pollDataExtractionStatus(callbackSpy);
      tick(5000);
      expect(callbackSpy).toHaveBeenCalledTimes(1);
    }));

    it('should keep polling when data extraction is pending', fakeAsync(() => {
      const callbackSpy = jasmine.createSpy('callback');

      transactionsOutboxService.isDataExtractionPending.and.returnValue(true);

      component.pollDataExtractionStatus(callbackSpy);
      tick(1000); // wait for the initial setTimeout call

      expect(transactionsOutboxService.isDataExtractionPending).toHaveBeenCalledTimes(1);
      expect(callbackSpy).not.toHaveBeenCalledTimes(1);

      // simulate data extraction not pending
      transactionsOutboxService.isDataExtractionPending.and.returnValue(false);
      tick(5000); // wait for the next setTimeout call

      expect(transactionsOutboxService.isDataExtractionPending).toHaveBeenCalledTimes(2);
      expect(callbackSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('handleScanStatus():', () => {
    it('should handle status when the syncing is in progress and the extracted data is present', () => {
      component.isOutboxExpense = false;
      component.homeCurrency = 'INR';
      component.expense.id = 'txO6d6eiB4JF';
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      const isScanCompletedSpy = spyOn(component, 'checkIfScanIsCompleted').and.returnValue(false);
      expensesService.getExpenseById.and.returnValue(of(platformExpenseWithExtractedData));
      transactionService.transformExpense.and.returnValue(transformedExpenseWithExtractedData);
      component.isScanInProgress = true;
      spyOn(component, 'pollDataExtractionStatus').and.callFake((callback) => {
        callback();
      });

      transactionsOutboxService.isDataExtractionPending.and.returnValue(true);

      component.handleScanStatus();

      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(isScanCompletedSpy).toHaveBeenCalledTimes(1);
      expect(transactionsOutboxService.isDataExtractionPending).toHaveBeenCalledOnceWith('txO6d6eiB4JF');
      expect(component.pollDataExtractionStatus).toHaveBeenCalledTimes(1);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(component.expense.id);
      expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseWithExtractedData);
      expect(component.isScanCompleted).toBeTrue();
      expect(component.isScanInProgress).toBeFalse();
      expect(component.expense.extracted_data).toEqual(transformedExpenseWithExtractedData.tx.extracted_data);
    });

    it('should handle status when the sync is in progress and there is no extracted data present', () => {
      component.isOutboxExpense = false;
      component.expense.id = 'txvslh8aQMbu';
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      const isScanCompletedSpy = spyOn(component, 'checkIfScanIsCompleted').and.returnValue(false);
      expensesService.getExpenseById.and.returnValue(of(platformExpenseData));
      transactionService.transformExpense.and.returnValue(transformedExpenseData);
      component.isScanInProgress = true;
      const pollDataSpy = spyOn(component, 'pollDataExtractionStatus').and.callFake((callback) => {
        callback();
      });

      transactionsOutboxService.isDataExtractionPending.and.returnValue(true);

      component.handleScanStatus();

      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(component.checkIfScanIsCompleted).toHaveBeenCalledTimes(1);
      expect(isScanCompletedSpy).toHaveBeenCalledTimes(1);
      expect(transactionsOutboxService.isDataExtractionPending).toHaveBeenCalledOnceWith('txvslh8aQMbu');
      expect(pollDataSpy).toHaveBeenCalledTimes(1);
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(component.expense.id);
      expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
      expect(component.isScanCompleted).toBeFalse();
      expect(component.isScanInProgress).toBeFalse();
    });

    it('should handle status when the scanning is not in progress', () => {
      component.isOutboxExpense = false;
      component.homeCurrency = 'USD';
      const orguserSettRes = {
        ...orgUserSettingsData,
        insta_fyle_settings: {
          allowed: false,
          enabled: false,
          static_camera_overlay_enabled: true,
          extract_fields: ['AMOUNT', 'CURRENCY', 'CATEGORY', 'TXN_DT'],
        },
      };
      orgUserSettingsService.get.and.returnValue(of(orguserSettRes));
      component.handleScanStatus();
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(component.isScanCompleted).toBeTrue();
      expect(component.isScanInProgress).toBeFalse();
    });
  });

  describe('canShowPaymentModeIcon', () => {
    it('should show payment mode icon if it is a personal expense and is reimbersable', () => {
      component.expense = cloneDeep(expenseData);
      component.expense.is_reimbursable = true;
      component.expense.source_account.type = AccountType.PERSONAL_CASH_ACCOUNT;

      component.canShowPaymentModeIcon();
      fixture.detectChanges();
      expect(component.showPaymentModeIcon).toBeTrue();
    });

    it('should not show payment mode icon if it is a personal expense and is not reimbersable', () => {
      component.expense = {
        ...expenseData,
        is_reimbursable: false,
      };
      component.canShowPaymentModeIcon();
      fixture.detectChanges();
      expect(component.showPaymentModeIcon).toBeFalse();
    });

    it('should not show payment mode icon if it is not a personal expense and is reimbersable', () => {
      component.expense = {
        ...expenseData,
        source_account: {
          id: 'testId',
          type: AccountType.COMPANY_EXPENSE_ACCOUNT,
        },
        is_reimbursable: true,
      };
      component.canShowPaymentModeIcon();
      fixture.detectChanges();
      expect(component.showPaymentModeIcon).toBeFalse();
    });
  });

  describe('onInit', () => {
    it('should set ProjectEnabled to true if the  projects are allowed and enabled and get the home currency', (done) => {
      currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
      component.isProjectEnabled$.subscribe((isEnabled) => {
        expect(isEnabled).toBeTrue();
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        done();
      });
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
    });

    it('should set showDt to isFirstOfflineExpense when tx_id is falsy', () => {
      component.expense = {
        ...expenseData,
        id: null,
      };
      component.isFirstOfflineExpense = true;
      component.ngOnInit();
      expect(component.showDt).toBeTrue();
    });

    it('should set showDt based on date comparison when previousExpenseTxnDate is truthy', () => {
      component.expense = {
        ...expenseData,
        id: 'tx12341',
        spent_at: null,
      };
      component.previousExpenseTxnDate = new Date('2023-01-28T17:00:00');
      component.previousExpenseCreatedAt = null;

      component.ngOnInit();

      expect(component.showDt).toBeTrue();
    });

    it('should set showDt based on date comparison when previousExpenseCreatedAt is truthy', () => {
      component.expense = {
        ...expenseData,
        id: 'tx12341',
      };
      component.previousExpenseTxnDate = null;
      component.previousExpenseCreatedAt = new Date('2023-01-29T07:29:02.966116');

      component.ngOnInit();
      expect(component.showDt).toBeTrue();
    });

    it('should set isMileageExpense to true of the fyle category is mileage', () => {
      component.expense = {
        ...cloneDeep(expenseData),
        id: 'tx12341',
        spent_at: null,
      };
      component.expense.category.name = 'mileage';
      component.ngOnInit();
      expect(component.isMileageExpense).toBeTrue();
    });

    it('should set isPerDiem to true if the fyle category is per diem', () => {
      component.expense = {
        ...cloneDeep(expenseData),
        id: 'tx12341',
        spent_at: null,
      };
      component.expense.category.name = 'per diem';
      component.ngOnInit();
      expect(component.isPerDiem).toBeTrue();
    });

    it('should set isPolicyViolated correctly on ngOnInit', () => {
      spyOn(component, 'setIsPolicyViolated').and.callThrough();
      component.ngOnInit();
      expect(component.setIsPolicyViolated).toHaveBeenCalled();
    });

    it('should set isPolicyViolated to false when isManualFlagFeatureEnabled is false and expense is not flagged', () => {
      component.isManualFlagFeatureEnabled = false;
      component.expense = {
        ...expenseData,
        is_manually_flagged: false,
        is_policy_flagged: false,
      };
      component.setIsPolicyViolated();
      expect(component.isPolicyViolated).toBeFalse();
    });

    it('should set isPolicyViolated to true when isManualFlagFeatureEnabled is false but expense is policy flagged', () => {
      component.isManualFlagFeatureEnabled = false;
      component.expense = {
        ...expenseData,
        is_manually_flagged: false,
        is_policy_flagged: true,
      };
      component.setIsPolicyViolated();
      expect(component.isPolicyViolated).toBeTrue();
    });

    it('should set isPolicyViolated to false when isManualFlagFeatureEnabled is true but expense is not manually flagged and not policy flagged', () => {
      component.isManualFlagFeatureEnabled = true;
      component.expense = {
        ...expenseData,
        is_manually_flagged: false,
        is_policy_flagged: false,
      };
      component.setIsPolicyViolated();
      expect(component.isPolicyViolated).toBeFalse();
    });

    it('should set isPolicyViolated to true when isManualFlagFeatureEnabled is true and expense is manually flagged', () => {
      component.isManualFlagFeatureEnabled = true;
      component.expense = {
        ...expenseData,
        is_manually_flagged: true,
        is_policy_flagged: false,
      };
      component.setIsPolicyViolated();
      expect(component.isPolicyViolated).toBeTrue();
    });

    it('should set isPolicyViolated to true when isManualFlagFeatureEnabled is true and expense is policy flagged but not manually flagged', () => {
      component.isManualFlagFeatureEnabled = true;
      component.expense = {
        ...expenseData,
        is_manually_flagged: false,
        is_policy_flagged: true,
      };
      component.setIsPolicyViolated();
      expect(component.isPolicyViolated).toBeTrue();
    });

    it('should set isPolicyViolated to true when isManualFlagFeatureEnabled is true and expense is both manually flagged and policy flagged', () => {
      component.isManualFlagFeatureEnabled = true;
      component.expense = {
        ...expenseData,
        is_manually_flagged: true,
        is_policy_flagged: true,
      };
      component.setIsPolicyViolated();
      expect(component.isPolicyViolated).toBeTrue();
    });

    it('should call other methods', fakeAsync(() => {
      component.isIos = true;
      spyOn(component, 'canShowPaymentModeIcon');
      spyOn(component, 'getReceipt');
      spyOn(component, 'handleScanStatus');
      spyOn(component, 'setOtherData');
      component.ngOnInit();
      tick(500);
      expect(component.canShowPaymentModeIcon).toHaveBeenCalledTimes(1);
      expect(component.getReceipt).toHaveBeenCalledTimes(1);
      expect(component.handleScanStatus).toHaveBeenCalledTimes(1);
      expect(component.setOtherData).toHaveBeenCalledTimes(1);
    }));
  });

  describe('setOtherData():', () => {
    it('should set icon to card if the source account type is corporate credit card', () => {
      component.expense = {
        ...cloneDeep(expenseData),
        matched_corporate_card_transaction_ids: ['btxnMy43OZokde'],
      };
      component.expense.source_account.type = AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('card');
    });

    it('should set icon to card if the source account type is corporate credit card but matched_corporate_card_transaction_ids is not present', () => {
      component.expense = cloneDeep(expenseData);
      component.expense.matched_corporate_card_transaction_ids = [];
      component.expense.source_account.type = AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('card');
    });

    it('should set icon to fy-reimbersable if the source account type is not a corporate credit card and if the reimbersement is not skipped', () => {
      component.expense = cloneDeep(expenseData);
      component.expense.matched_corporate_card_transaction_ids = [];
      component.expense.source_account.type = AccountType.PERSONAL_CASH_ACCOUNT;
      component.expense.is_reimbursable = true;

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('cash');
    });

    it('should set icon to fy-non-reimbersable if the source account type is not a corporate credit card and if the reimbersement is skipped', () => {
      component.expense = cloneDeep(expenseData);
      component.expense.is_reimbursable = false;
      component.expense.source_account.type = AccountType.PERSONAL_CASH_ACCOUNT;

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('cash-slash');
    });
  });

  it('onSetMultiselectMode(): should emit the multiselect mode event if the selection mode is enabled', () => {
    const emitSpy = spyOn(component.setMultiselectMode, 'emit');
    component.isSelectionModeEnabled = false;
    component.onSetMultiselectMode();
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense);
  });

  it('onTapTransaction(): should emit the selected card card click event when the selection mode is enabled ', () => {
    const emitSpy = spyOn(component.cardClickedForSelection, 'emit');
    component.isSelectionModeEnabled = true;
    component.onTapTransaction();
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense);
  });

  it('matchReceiptWithEtxn(): match the receipt with the transactions', () => {
    const mockFileObject = cloneDeep(fileObjectData);
    component.matchReceiptWithEtxn(mockFileObject);
    expect(component.expense.file_ids).toBeDefined();
    expect(component.expense.file_ids).toContain(mockFileObject.id);
    expect(mockFileObject.transaction_id).toBe(component.expense.id);
  });

  describe('canAddAttchment():', () => {
    it('should return true when none of the conditions are met', () => {
      component.isFromViewReports = false;
      component.isMileageExpense = false;
      component.expense.file_ids = null;
      component.isFromPotentialDuplicates = false;
      component.isSelectionModeEnabled = false;
      const result = component.canAddAttachment();
      expect(result).toBeTrue();
    });

    it('should return false when isFromViewReports is true', () => {
      component.isFromViewReports = true;
      component.isMileageExpense = false;
      component.expense.file_ids = null;
      component.isFromPotentialDuplicates = false;
      component.isSelectionModeEnabled = false;
      const result = component.canAddAttachment();
      expect(result).toBeFalse();
    });
  });

  describe('attachReceipt(): ', () => {
    it('should attach the receipt to the thumbnail when receipt is not a pdf', fakeAsync(() => {
      const dataUrl = '/assets/svg/list-plus.svg';
      const attachmentType = 'png';
      const receiptDetailsaRes = {
        dataUrl,
        type: 'image/png',
        actionSource: 'upload',
      };
      const fileObj: FileObject = {
        name: '000.jpeg',
        receipt_coordinates: {
          x: 100,
          y: 200,
          width: 300,
          height: 400,
        },
        id: 'fiHPZUiichAS',
        purpose: '',
      };

      fileService.getAttachmentType.and.returnValue(attachmentType);
      transactionsOutboxService.fileUpload.and.resolveTo(fileObj);
      expensesService.attachReceiptToExpense.and.returnValue(of(platformExpenseData));

      spyOn(component, 'matchReceiptWithEtxn').and.callThrough();

      component.attachReceipt(receiptDetailsaRes);
      tick(500);
      expect(component.inlineReceiptDataUrl).toBe(dataUrl);
      expect(fileService.getAttachmentType).toHaveBeenCalledOnceWith(receiptDetailsaRes.type);
      expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(dataUrl, attachmentType);
      expect(component.matchReceiptWithEtxn).toHaveBeenCalledOnceWith(fileObj);
      expect(expensesService.attachReceiptToExpense).toHaveBeenCalledOnceWith(component.expense.id, fileObj.id);
      expect(component.attachmentUploadInProgress).toBeFalse();
      tick(500);
    }));
  });

  describe('onFileUPload()', () => {
    it('should add attachment when file is selected', fakeAsync(() => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
      const mockFile = new File(['file contents'], 'test.png', { type: 'image/png' });
      fileService.readFile.and.resolveTo(dataUrl);
      const mockNativeElement = {
        files: [mockFile],
      };

      spyOn(component, 'attachReceipt');

      component.onFileUpload(mockNativeElement as any);
      fixture.detectChanges();
      tick(500);
      expect(fileService.readFile).toHaveBeenCalledOnceWith(mockFile);
      expect(trackingService.addAttachment).toHaveBeenCalledOnceWith({ type: 'image/png' });
      expect(component.attachReceipt).toHaveBeenCalledOnceWith({
        type: 'image/png',
        dataUrl,
        actionSource: 'gallery_upload',
      });
    }));

    it('should show size limit exceeded popover if the file size is more than 5MB', fakeAsync(() => {
      const mockFile = new File(['file contents'], 'test.png', { type: 'image/png' });
      Object.defineProperty(mockFile, 'size', { value: 5000001 });
      const mockNativeElement = {
        files: [mockFile],
      };

      spyOn(component, 'showSizeLimitExceededPopover');

      component.onFileUpload(mockNativeElement as any);
      expect(component.showSizeLimitExceededPopover).toHaveBeenCalledTimes(1);
    }));
  });

  it('showSizeLimitExceededPopover', fakeAsync(() => {
    const popOverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present']);
    popoverController.create.and.resolveTo(popOverSpy);
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
    expect(popOverSpy.present).toHaveBeenCalledTimes(1);
  }));

  describe('addAttachments():', () => {
    it('should call onFileUpload method on iOS when file input is clicked', fakeAsync(() => {
      const event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
      };
      component.isIos = true;

      const dummyNativeElement = document.createElement('input');

      component.fileUpload = {
        nativeElement: dummyNativeElement,
      };

      const nativeElement1 = component.fileUpload.nativeElement as HTMLInputElement;
      spyOn(component, 'onFileUpload').and.stub();
      spyOn(component, 'canAddAttachment').and.returnValue(true);
      spyOn(nativeElement1, 'click').and.callThrough();

      component.addAttachments(event as any);
      fixture.detectChanges();
      tick(500);
      nativeElement1.dispatchEvent(new Event('change'));
      expect(component.onFileUpload).toHaveBeenCalledOnceWith(dummyNativeElement);
      tick(500);
      nativeElement1.dispatchEvent(new Event('click'));
      expect(nativeElement1.click).toHaveBeenCalledTimes(1);
    }));

    it('when device not an Ios it should open the camera popover', fakeAsync(() => {
      const event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
      };
      component.isIos = false;
      const receiptDetails = {
        type: 'png',
        dataUrl: ' data.dataUrl',
        actionSource: 'camera',
        option: 'camera',
      };
      spyOn(component, 'canAddAttachment').and.returnValue(true);
      const popOverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.resolveTo(popOverSpy);
      popOverSpy.onWillDismiss.and.resolveTo(receiptDetails);

      component.addAttachments(event as any);
      fixture.detectChanges();
      tick(500);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: CameraOptionsPopupComponent,
        cssClass: 'camera-options-popover',
      });
      expect(popOverSpy.present).toHaveBeenCalledTimes(1);
      expect(popOverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
    }));

    it('should call attachReceipt and show a success toast when receiptDetails is set and option is camera', fakeAsync(() => {
      const event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
      };
      const emitSpy = spyOn(component.showCamera, 'emit');
      const receiptDetails = {
        type: 'png',
        dataUrl: 'mockDataUrl.png',
        actionSource: 'camera',
      };

      const dataRes = {
        data: {
          type: 'png',
          dataUrl: 'mockDataUrl.png',
          actionSource: 'camera',
          option: 'camera',
        },
      };

      component.isIos = false;
      spyOn(component, 'attachReceipt');
      spyOn(component, 'canAddAttachment').and.returnValue(true);
      const popOverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.resolveTo(popOverSpy);
      popOverSpy.onWillDismiss.and.resolveTo(dataRes);
      const captureReceiptModalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      modalController.create.and.resolveTo(captureReceiptModalSpy);
      captureReceiptModalSpy.onWillDismiss.and.resolveTo(dataRes);
      fileService.getImageTypeFromDataUrl.and.returnValue('png');

      component.addAttachments(event as any);
      tick(500);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: CaptureReceiptComponent,
        componentProps: {
          isModal: true,
          allowGalleryUploads: false,
          allowBulkFyle: false,
        },
        cssClass: 'hide-modal',
      });
      expect(component.canAddAttachment).toHaveBeenCalledTimes(1);
      expect(captureReceiptModalSpy.present).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(true);
      expect(captureReceiptModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      tick(500);
      expect(emitSpy).toHaveBeenCalledWith(false);
      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(component.attachReceipt).toHaveBeenCalledOnceWith(receiptDetails);
      expect(fileService.getImageTypeFromDataUrl).toHaveBeenCalledOnceWith(dataRes.data.dataUrl);

      const message = 'Receipt added to Expense successfully';
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarProperties.setSnackbarProperties('success', { message }),
        panelClass: ['msb-success-with-camera-icon'],
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
    }));
  });

  it('setupNetworkWatcher(): should setup the network watcher', fakeAsync(() => {
    networkService.isOnline.and.returnValue(of(true));
    const eventEmitterMock = new EventEmitter<boolean>();
    networkService.connectivityWatcher.and.returnValue(eventEmitterMock);

    component.setupNetworkWatcher();
    component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
      expect(connectionStatus).toBeTrue();
    });
  }));

  it('dismiss(): hould emit the dismissed event with the expense object when called', () => {
    const emitSpy = spyOn(component.dismissed, 'emit');

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
      preventDefault: jasmine.createSpy('preventDefault'),
    };

    component.dismiss(event as any);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense);
  });

  describe('isZeroAmountPerDiemOrMileage():', () => {
    it('should check if scan is complete and return true if it is per diem expense with amount 0', () => {
      component.expense = {
        ...cloneDeep(expenseData),
        amount: 0,
      };
      component.expense.category.name = 'Per Diem';
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if it is per diem expense with user amount 0', () => {
      component.expense = {
        ...cloneDeep(expenseData),
        amount: null,
        claim_amount: 0,
      };
      component.expense.category.name = 'Per Diem';
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if it is mileage expense with amount 0', () => {
      component.expense = {
        ...cloneDeep(expenseData),
        amount: 0,
      };
      component.expense.category.name = 'Mileage';
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should return false if org category is null', () => {
      component.expense = cloneDeep(expenseData);
      component.expense.category.name = null;
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeFalse();
    });
  });
});
