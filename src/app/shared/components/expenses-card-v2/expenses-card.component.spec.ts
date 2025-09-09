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
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { ExpensesCardComponent } from './expenses-card.component';
import { PopoverController, ModalController, Platform } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ExpenseState } from '../../pipes/expense-state.pipe';
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { of, take, throwError } from 'rxjs';
import { expenseFieldsMapResponse2 } from 'src/app/core/mock-data/expense-fields-map.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { DateFormatPipe } from 'src/app/shared/pipes/date-format.pipe';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { fileObjectAdv } from 'src/app/core/mock-data/file-object.data';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { CurrencySymbolPipe } from 'src/app/shared/pipes/currency-symbol.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { EventEmitter } from '@angular/core';
import {
  expenseData,
  expenseResponseData,
  platformExpenseDataWithPendingGasCharge,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { AccountType } from 'src/app/core/models/platform/v1/account.model';
import { ExpensesService as SharedExpenseService } from 'src/app/core/services/platform/v1/shared/expenses.service';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { platformExpenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { transformedExpenseData } from 'src/app/core/mock-data/transformed-expense.data';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { TranslocoService } from '@jsverse/transloco';
import { mandatoryExpenseFields } from 'src/app/core/mock-data/expense-field.data';
import { getTranslocoModule } from 'src/app/core/testing/transloco-testing.utils';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';

describe('ExpensesCardComponent', () => {
  let component: ExpensesCardComponent;
  let fixture: ComponentFixture<ExpensesCardComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let sharedExpenseService: jasmine.SpyObj<SharedExpenseService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
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
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['transformExpense']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseById', 'attachReceiptToExpense']);
    const sharedExpenseServiceSpy = jasmine.createSpyObj('SharedExpenseService', [
      'isExpenseInDraft',
      'isCriticalPolicyViolatedExpense',
      'getVendorDetails',
      'isPendingGasCharge',
    ]);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
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
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', [
      'getAllMap',
      'getMandatoryExpenseFields',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const dateFormatPipeSpy = jasmine.createSpyObj('DateFormatPipe', ['transform']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);
    TestBed.configureTestingModule({
    imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatIconTestingModule,
        MatCheckboxModule,
        FormsModule,
        getTranslocoModule(),
        ExpensesCardComponent,
        DateFormatPipe,
        HumanizeCurrencyPipe,
        ExpenseState,
        ExactCurrencyPipe,
        CurrencySymbolPipe,
        FyCurrencyPipe,
    ],
    providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: SharedExpenseService, useValue: sharedExpenseServiceSpy },
        { provide: PlatformEmployeeSettingsService, useValue: platformEmployeeSettingsServiceSpy },
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
        { provide: CurrencySymbolPipe, useValue: jasmine.createSpyObj('CurrencySymbolPipe', ['transform']) },
        { provide: ExactCurrencyPipe, useValue: jasmine.createSpyObj('ExactCurrencyPipe', ['transform']) },
        { provide: FyCurrencyPipe, useValue: jasmine.createSpyObj('FyCurrencyPipe', ['transform']) },
    ],
}).compileComponents();

    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
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
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    orgSettingsService.get.and.returnValue(of(orgSettingsGetData));
    transactionsOutboxService.isSyncInProgress.and.returnValue(true);
    expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse2));
    expenseFieldsService.getMandatoryExpenseFields.and.returnValue(of(mandatoryExpenseFields));
    sharedExpenseService.getVendorDetails.and.returnValue('asd');
    currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
    sharedExpenseService.isCriticalPolicyViolatedExpense.and.returnValue(false);
    platform.is.and.returnValue(true);
    fileService.getReceiptDetails.and.returnValue(fileObjectAdv[0].type);
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
    fixture.componentRef.setInput('expense', cloneDeep(expenseData));
    component.isConnected$ = of(true);
    component.isPerDiem = true;
    component.isSelectionModeEnabled = false;
    component.expenseIndex = 1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.expense).toBeDefined();
  });

  describe('isSelected getter', () => {
    it('should return true if the expense is selected', () => {
      component.selectedElements = expenseResponseData;
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        id: 'txcSFe6efB6R',
      });
      expect(component.isSelected).toBeTrue();
    });

    it('should return false if the expense is not selected', () => {
      component.selectedElements = expenseResponseData;
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        id: null,
      });
      expect(component.isSelected).toBeFalse();
    });

    it('should return false if there are no selectedElements', () => {
      component.selectedElements = null;
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        id: 'txcSFe6efB6R',
      });
      expect(component.isSelected).toBeFalse();
    });
  });

  describe('onGoToTransaction():', () => {
    it('should emit an event when onGoToTransaction is called', () => {
      spyOn(component.goToTransaction, 'emit');
      component.onGoToTransaction();
      expect(component.goToTransaction.emit).toHaveBeenCalledOnceWith({
        expense: component.expense(),
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
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        category: {
          ...expenseData.category,
          name: 'mileage',
        },
      });
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/mileage.svg');
    });

    it('should set the receipt icon to calendar when the fyle catergory is per diem', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        category: {
          ...expenseData.category,
          name: 'per diem',
        },
      });
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/calendar.svg');
    });

    it('should set the receipt icon to add-receipt when there are no file ids', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        file_ids: null,
      });
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/list-plus.svg');
    });

    it('should set the receipt icon to add-receipt when there are no file ids', () => {
      component.isFromReports = true;
      component.isFromPotentialDuplicates = true;
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        file_ids: null,
      });
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/list.svg');
    });

    it('should set isReceiptPresent to true if not a mileage or per diem expense and file ids present', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        file_ids: ['testfileid'],
      });
      component.getReceipt();
      fixture.detectChanges();
      expect(component.isReceiptPresent).toBeTrue();
    });
  });

  describe('checkIfScanIsCompleted():', () => {
    it('should check if scan is complete and return true if the transaction amount is not null and no other data is present', () => {
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        amount: 100,
        claim_amount: null,
        extracted_data: null,
      });
      const result = component.checkIfScanIsCompleted(component.expense());
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if the transaction user amount is present and no extracted data is available', () => {
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        amount: null,
        claim_amount: 7500,
        extracted_data: null,
      });
      const result = component.checkIfScanIsCompleted(component.expense());
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if the required extracted data is present', () => {
      fixture.componentRef.setInput('expense', {
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
      });
      const result = component.checkIfScanIsCompleted(component.expense());
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should return true if the scan has expired', () => {
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        amount: null,
        claim_amount: null,
        extracted_data: null,
      });
      const oneDaysAfter = dayjs(component.expense().created_at).add(1, 'day').toDate();
      jasmine.clock().mockDate(oneDaysAfter);

      const result = component.checkIfScanIsCompleted(component.expense());
      expect(result).toBeTrue();
    });
  });

  describe('canShowPaymentModeIcon', () => {
    it('should show payment mode icon if it is a personal expense and is reimbersable', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        is_reimbursable: true,
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_CASH_ACCOUNT,
        },
      });

      component.canShowPaymentModeIcon();
      fixture.detectChanges();
      expect(component.showPaymentModeIcon).toBeTrue();
    });

    it('should not show payment mode icon if it is a personal expense and is not reimbersable', () => {
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        is_reimbursable: false,
      });
      component.canShowPaymentModeIcon();
      fixture.detectChanges();
      expect(component.showPaymentModeIcon).toBeFalse();
    });

    it('should not show payment mode icon if it is not a personal expense and is reimbersable', () => {
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        source_account: {
          id: 'testId',
          type: AccountType.COMPANY_EXPENSE_ACCOUNT,
        },
        is_reimbursable: true,
      });
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
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        id: null,
      });
      component.isFirstOfflineExpense = true;
      component.ngOnInit();
      expect(component.showDt).toBeTrue();
    });

    it('should set showDt based on date comparison when previousExpenseTxnDate is truthy', () => {
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        id: 'tx12341',
        spent_at: null,
      });
      component.previousExpenseTxnDate = new Date('2023-01-28T17:00:00');
      component.previousExpenseCreatedAt = null;

      component.ngOnInit();

      expect(component.showDt).toBeTrue();
    });

    it('should set showDt based on date comparison when previousExpenseCreatedAt is truthy', () => {
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        id: 'tx12341',
        category: {
          ...expenseData.category,
          name: 'Per Diem',
        },
      });
      component.previousExpenseCreatedAt = new Date('2023-01-29T07:29:02.966116');

      component.ngOnInit();
      expect(component.showDt).toBeTrue();
    });

    it('should set isMileageExpense to true of the fyle category is mileage', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        id: 'tx12341',
        spent_at: null,
        category: {
          ...expenseData.category,
          name: 'Mileage',
        },
      });
      component.ngOnInit();
      expect(component.isMileageExpense).toBeTrue();
    });

    it('should set isPerDiem to true if the fyle category is per diem', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        id: 'tx12341',
        spent_at: null,
        category: {
          ...expenseData.category,
          name: 'Per Diem',
        },
      });
      component.ngOnInit();
      expect(component.isPerDiem).toBeTrue();
    });

    it('should set isPolicyViolated correctly on ngOnInit', () => {
      spyOn(component, 'setIsPolicyViolated').and.callThrough();
      component.ngOnInit();
      expect(component.setIsPolicyViolated).toHaveBeenCalledTimes(1);
    });

    it('should call other methods', fakeAsync(() => {
      component.isIos = true;
      spyOn(component, 'canShowPaymentModeIcon');
      spyOn(component, 'getReceipt');
      spyOn(component, 'setOtherData');
      component.ngOnInit();
      tick(500);
      expect(component.canShowPaymentModeIcon).toHaveBeenCalledTimes(1);
      expect(component.getReceipt).toHaveBeenCalledTimes(1);
      expect(component.setOtherData).toHaveBeenCalledTimes(1);
    }));
  });

  describe('setIsPolicyViolated()', () => {
    it('should set isPolicyViolated to false expense is not policy flagged', () => {
      fixture.componentRef.setInput('expense', {
        ...expenseData,
        is_policy_flagged: false,
      });
      component.setIsPolicyViolated();
      expect(component.isPolicyViolated).toBeFalse();
    });
  });

  describe('setOtherData():', () => {
    it('should set icon to card if the source account type is corporate credit card', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        matched_corporate_card_transaction_ids: ['btxnMy43OZokde'],
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
        },
      });

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('card');
    });

    it('should set icon to card if the source account type is corporate credit card but matched_corporate_card_transaction_ids is not present', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        matched_corporate_card_transaction_ids: [],
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
        },
      });

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('card');
    });

    it('should set icon to fy-reimbersable if the source account type is not a corporate credit card and if the reimbersement is not skipped', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        matched_corporate_card_transaction_ids: [],
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_CASH_ACCOUNT,
        },
        is_reimbursable: true,
      });

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('cash');
    });

    it('should set icon to fy-non-reimbersable if the source account type is not a corporate credit card and if the reimbersement is skipped', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        is_reimbursable: false,
        source_account: {
          ...expenseData.source_account,
          type: AccountType.PERSONAL_CASH_ACCOUNT,
        },
      });

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('cash-slash');
    });
  });

  it('onSetMultiselectMode(): should emit the multiselect mode event if the selection mode is enabled', () => {
    const emitSpy = spyOn(component.setMultiselectMode, 'emit');
    component.isSelectionModeEnabled = false;
    component.onSetMultiselectMode();
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense());
  });

  it('onTapTransaction(): should emit the selected card card click event when the selection mode is enabled ', () => {
    const emitSpy = spyOn(component.cardClickedForSelection, 'emit');
    component.isSelectionModeEnabled = true;
    component.onTapTransaction();
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense());
  });

  // it('matchReceiptWithEtxn(): match the receipt with the transactions', () => {
  //   const mockFileObject = cloneDeep(fileObjectData);
  //   component.matchReceiptWithEtxn(mockFileObject);
  //   expect(component.expense().file_ids).toBeDefined();
  //   expect(component.expense().file_ids).toContain(mockFileObject.id);
  //   expect(mockFileObject.transaction_id).toBe(component.expense().id);
  // });

  describe('canAddAttchment():', () => {
    it('should return true when none of the conditions are met', () => {
      component.isFromViewReports = false;
      component.isMileageExpense = false;
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        file_ids: null,
      });
      component.isFromPotentialDuplicates = false;
      component.isSelectionModeEnabled = false;
      const result = component.canAddAttachment();
      expect(result).toBeTrue();
    });

    it('should return false when isFromViewReports is true', () => {
      component.isFromViewReports = true;
      component.isMileageExpense = false;
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        file_ids: null,
      });
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

      component.attachReceipt(receiptDetailsaRes);
      tick(500);
      expect(component.inlineReceiptDataUrl).toBe(dataUrl);
      expect(fileService.getAttachmentType).toHaveBeenCalledOnceWith(receiptDetailsaRes.type);
      expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(dataUrl, attachmentType);
      expect(expensesService.attachReceiptToExpense).toHaveBeenCalledOnceWith(component.expense().id, fileObj.id);
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

    it('should show size limit exceeded popover if the file size is more than 11MB', fakeAsync(() => {
      const mockFile = new File(['file contents'], 'test.png', { type: 'image/png' });
      Object.defineProperty(mockFile, 'size', { value: 11534337 });
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
    component.showSizeLimitExceededPopover(11534337);

    tick(500);
    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Size limit exceeded',
        message: 'The uploaded file is greater than 11MB in size. Please reduce the file size and try again.',
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

      const message = 'Receipt added to expense successfully';
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

  it('dismiss(): should emit the dismissed event with the expense object when called', () => {
    const emitSpy = spyOn(component.dismissed, 'emit');

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
      preventDefault: jasmine.createSpy('preventDefault'),
    };

    component.dismiss(event as any);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense());
  });

  describe('isZeroAmountPerDiemOrMileage():', () => {
    it('should check if scan is complete and return true if it is per diem expense with amount 0', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        amount: 0,
        category: {
          ...expenseData.category,
          name: 'Per Diem',
        },
      });
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if it is per diem expense with user amount 0', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        amount: null,
        claim_amount: 0,
        category: {
          ...expenseData.category,
          name: 'Per Diem',
        },
      });
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if it is mileage expense with amount 0', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        amount: 0,
        category: {
          ...expenseData.category,
          name: 'Mileage',
        },
      });
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should return false if org category is null', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        category: {
          ...expenseData.category,
          name: null,
        },
      });
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeFalse();
    });
  });

  describe('Pending Gas Charge Functionality', () => {
    it('should return true when expense is a pending gas charge', () => {
      const mockExpense = cloneDeep(platformExpenseDataWithPendingGasCharge);

      sharedExpenseService.isPendingGasCharge.and.returnValue(true);

      const result = sharedExpenseService.isPendingGasCharge(mockExpense);

      expect(result).toBeTrue();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should return false when expense is not a pending gas charge', () => {
      const mockExpense = cloneDeep(expenseData);

      sharedExpenseService.isPendingGasCharge.and.returnValue(false);

      const result = sharedExpenseService.isPendingGasCharge(mockExpense);

      expect(result).toBeFalse();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should set isPendingGasCharge property correctly', () => {
      const mockExpense = cloneDeep(platformExpenseDataWithPendingGasCharge);

      sharedExpenseService.isPendingGasCharge.and.returnValue(true);

      fixture.componentRef.setInput('expense', mockExpense);
      component.ngOnInit();

      expect(component.isPendingGasCharge()).toBeTrue();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should set isPendingGasCharge to false for non-pending gas charge', () => {
      const mockExpense = cloneDeep(expenseData);

      sharedExpenseService.isPendingGasCharge.and.returnValue(false);

      fixture.componentRef.setInput('expense', mockExpense);
      component.ngOnInit();

      expect(component.isPendingGasCharge()).toBeFalse();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });
  });

  describe('setExpenseDetails():', () => {
    it('should set category and expense type flags correctly', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        category: {
          name: 'Mileage',
          code: 'mileage',
          id: 1,
          display_name: 'Mileage',
          sub_category: null,
          system_category: 'Mileage',
        },
      });

      spyOn(component, 'setIsPolicyViolated');
      spyOn(component, 'canShowPaymentModeIcon');
      spyOn(component, 'getReceipt');
      spyOn(component, 'setOtherData');

      component.setExpenseDetails();

      expect(component.category).toBe('mileage');
      expect(component.isMileageExpense).toBeTrue();
      expect(component.isPerDiem).toBeFalse();
      expect(component.setIsPolicyViolated).toHaveBeenCalledTimes(1);
      expect(component.canShowPaymentModeIcon).toHaveBeenCalledTimes(1);
      expect(component.getReceipt).toHaveBeenCalledTimes(1);
      expect(component.setOtherData).toHaveBeenCalledTimes(1);
    });

    it('should set per diem flag correctly', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        category: {
          name: 'Per Diem',
          code: 'per_diem',
          id: 2,
          display_name: 'Per Diem',
          sub_category: null,
          system_category: 'Per Diem',
        },
      });

      component.setExpenseDetails();

      expect(component.category).toBe('per diem');
      expect(component.isMileageExpense).toBeFalse();
      expect(component.isPerDiem).toBeTrue();
    });

    it('should set showDt to true when expense has no id and isFirstOfflineExpense is true', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        id: null,
      });
      component.isFirstOfflineExpense = true;

      component.setExpenseDetails();

      expect(component.showDt).toBeTrue();
    });

    it('should set showDt to false when expense has no id and isFirstOfflineExpense is false', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        id: null,
      });
      component.isFirstOfflineExpense = false;

      component.setExpenseDetails();

      expect(component.showDt).toBeFalse();
    });

    it('should set showDt based on date comparison when previousExpenseTxnDate is provided', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        id: 'tx123',
        spent_at: new Date('2023-01-15'),
      });
      component.previousExpenseTxnDate = new Date('2023-01-14');
      component.previousExpenseCreatedAt = null;

      component.setExpenseDetails();

      expect(component.showDt).toBeTrue();
    });

    it('should set showDt to false when dates are the same', () => {
      const sameDate = new Date('2023-01-15');
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        id: 'tx123',
        spent_at: sameDate,
      });
      component.previousExpenseTxnDate = sameDate;
      component.previousExpenseCreatedAt = null;

      component.setExpenseDetails();

      expect(component.showDt).toBeFalse();
    });

    it('should use created_at when spent_at is not available', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        id: 'tx123',
        spent_at: null,
        created_at: new Date('2023-01-15'),
      });
      component.previousExpenseCreatedAt = new Date('2023-01-14');
      component.previousExpenseTxnDate = null;

      component.setExpenseDetails();

      expect(component.showDt).toBeTrue();
    });
  });

  describe('ensureMandatoryFieldsMap():', () => {
    it('should fetch from API when cached map is incomplete', () => {
      const cachedMap = { 1: 'Project' };
      const apiResponse = [
        {
          id: 1,
          field_name: 'Project',
          code: 'project',
          column_name: 'project_id',
          created_at: new Date(),
          default_value: null,
          field_type: 'SELECT',
          is_mandatory: true,
          is_reimbursable: true,
          is_visible: true,
          org_id: 'org123',
          updated_at: new Date(),
          parent_field_id: null,
          placeholder: 'Select Project',
          is_custom: false,
          is_enabled: true,
          org_category_ids: [1, 2, 3],
          seq: 1,
          type: 'SELECT',
        },
        {
          id: 2,
          field_name: 'Cost Center',
          code: 'cost_center',
          column_name: 'cost_center_id',
          created_at: new Date(),
          default_value: null,
          field_type: 'SELECT',
          is_mandatory: true,
          is_reimbursable: true,
          is_visible: true,
          org_id: 'org123',
          updated_at: new Date(),
          parent_field_id: null,
          placeholder: 'Select Cost Center',
          is_custom: false,
          is_enabled: true,
          org_category_ids: [1, 2, 3],
          seq: 2,
          type: 'SELECT',
        },
        {
          id: 3,
          field_name: 'Department',
          code: 'department',
          column_name: 'department_id',
          created_at: new Date(),
          default_value: null,
          field_type: 'SELECT',
          is_mandatory: true,
          is_reimbursable: true,
          is_visible: true,
          org_id: 'org123',
          updated_at: new Date(),
          parent_field_id: null,
          placeholder: 'Select Department',
          is_custom: false,
          is_enabled: true,
          org_category_ids: [1, 2, 3],
          seq: 3,
          type: 'SELECT',
        },
      ];
      component.missingMandatoryFields = {
        receipt: false,
        currency: false,
        amount: false,
        expense_field_ids: [1, 2, 3],
      };

      spyOn(component as any, 'getCachedMandatoryFieldsMap').and.returnValue(cachedMap);
      spyOn(component as any, 'setCachedMandatoryFieldsMap');
      spyOn(component as any, 'getMissingMandatoryFieldNames').and.returnValue([
        'Project',
        'Cost Center',
        'Department',
      ]);
      spyOn(component as any, 'processMissingFieldsForDisplay');
      expenseFieldsService.getMandatoryExpenseFields.and.returnValue(of(apiResponse));

      (component as any).ensureMandatoryFieldsMap();

      expect(expenseFieldsService.getMandatoryExpenseFields).toHaveBeenCalledTimes(2);
      expect(component.mandatoryFieldsMap).toEqual({ 1: 'Project', 2: 'Cost Center', 3: 'Department' });
      expect((component as any).setCachedMandatoryFieldsMap).toHaveBeenCalledWith({
        1: 'Project',
        2: 'Cost Center',
        3: 'Department',
      });
    });

    it('should handle API error and fallback to cached map', () => {
      const cachedMap = { 1: 'Project' };
      component.missingMandatoryFields = {
        receipt: false,
        currency: false,
        amount: false,
        expense_field_ids: [1, 2],
      };

      spyOn(component as any, 'getCachedMandatoryFieldsMap').and.returnValue(cachedMap);
      spyOn(component as any, 'getMissingMandatoryFieldNames').and.returnValue(['Project']);
      spyOn(component as any, 'processMissingFieldsForDisplay');
      expenseFieldsService.getMandatoryExpenseFields.and.returnValue(throwError(() => new Error('API Error')));

      (component as any).ensureMandatoryFieldsMap();

      expect(component.mandatoryFieldsMap).toEqual(cachedMap);
      expect((component as any).processMissingFieldsForDisplay).toHaveBeenCalledTimes(1);
    });

    it('should handle empty API response', () => {
      const cachedMap = { 1: 'Project' };
      component.missingMandatoryFields = {
        receipt: false,
        currency: false,
        amount: false,
        expense_field_ids: [1, 2],
      };

      spyOn(component as any, 'getCachedMandatoryFieldsMap').and.returnValue(cachedMap);
      spyOn(component as any, 'getMissingMandatoryFieldNames').and.returnValue(['Project']);
      spyOn(component as any, 'processMissingFieldsForDisplay');
      expenseFieldsService.getMandatoryExpenseFields.and.returnValue(of(null));

      (component as any).ensureMandatoryFieldsMap();

      expect(component.mandatoryFieldsMap).toEqual(cachedMap);
      expect((component as any).processMissingFieldsForDisplay).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMissingMandatoryFieldNames():', () => {
    it('should return empty array when missingMandatoryFields is null', () => {
      component.missingMandatoryFields = null;
      component.mandatoryFieldsMap = { 1: 'Project', 2: 'Cost Center' };

      const result = (component as any).getMissingMandatoryFieldNames();

      expect(result).toEqual([]);
    });

    it('should include receipt field when missing', () => {
      component.missingMandatoryFields = {
        receipt: true,
        currency: false,
        amount: false,
        expense_field_ids: [],
      };
      component.mandatoryFieldsMap = {};

      const result = (component as any).getMissingMandatoryFieldNames();

      expect(result).toContain('receipt');
    });

    it('should include currency field when missing', () => {
      component.missingMandatoryFields = {
        receipt: false,
        currency: true,
        amount: false,
        expense_field_ids: [],
      };
      component.mandatoryFieldsMap = {};

      const result = (component as any).getMissingMandatoryFieldNames();

      expect(result).toContain('currency');
    });

    it('should include amount field when missing', () => {
      component.missingMandatoryFields = {
        receipt: false,
        currency: false,
        amount: true,
        expense_field_ids: [],
      };
      component.mandatoryFieldsMap = {};

      const result = (component as any).getMissingMandatoryFieldNames();

      expect(result).toContain('amount');
    });

    it('should include expense field names from map', () => {
      component.missingMandatoryFields = {
        receipt: false,
        currency: false,
        amount: false,
        expense_field_ids: [1, 2],
      };
      component.mandatoryFieldsMap = { 1: 'Project', 2: 'Cost Center' };

      const result = (component as any).getMissingMandatoryFieldNames();

      expect(result).toEqual(['Project', 'Cost Center']);
    });

    it('should combine all missing fields', () => {
      component.missingMandatoryFields = {
        receipt: true,
        currency: false,
        amount: true,
        expense_field_ids: [1, 2],
      };
      component.mandatoryFieldsMap = { 1: 'Project', 2: 'Cost Center' };

      const result = (component as any).getMissingMandatoryFieldNames();

      expect(result).toEqual(['receipt', 'amount', 'Project', 'Cost Center']);
    });

    it('should skip expense field IDs that are not in the map', () => {
      component.missingMandatoryFields = {
        receipt: false,
        currency: false,
        amount: false,
        expense_field_ids: [1, 2, 3],
      };
      component.mandatoryFieldsMap = { 1: 'Project' };

      const result = (component as any).getMissingMandatoryFieldNames();

      expect(result).toEqual(['Project']);
    });
  });

  describe('processMissingFieldsForDisplay():', () => {
    it('should handle empty missing field names', () => {
      component.missingMandatoryFieldNames = [];

      (component as any).processMissingFieldsForDisplay();

      expect(component.missingFieldsDisplayText).toBe('');
      expect(component.remainingFieldsCount).toBe(0);
    });

    it('should process single field name', () => {
      component.missingMandatoryFieldNames = ['Project'];

      (component as any).processMissingFieldsForDisplay();

      expect(component.missingFieldsDisplayText).toBe('project');
      expect(component.remainingFieldsCount).toBe(0);
    });

    it('should truncate long field names with ellipsis', () => {
      component.missingMandatoryFieldNames = ['VeryLongFieldNameThatNeedsTruncation'];

      (component as any).processMissingFieldsForDisplay(20, 10);

      expect(component.missingFieldsDisplayText).toBe('verylon...');
      expect(component.remainingFieldsCount).toBe(0);
    });

    it('should handle multiple fields within character limit', () => {
      component.missingMandatoryFieldNames = ['Project', 'Cost Center', 'Department'];

      (component as any).processMissingFieldsForDisplay(30, 12);

      expect(component.missingFieldsDisplayText).toBe('project, cost center');
      expect(component.remainingFieldsCount).toBe(1);
    });

    it('should truncate when exceeding character limit', () => {
      component.missingMandatoryFieldNames = ['Project', 'Cost Center', 'Department', 'Location', 'Category'];

      (component as any).processMissingFieldsForDisplay(20, 12);

      expect(component.missingFieldsDisplayText).toBe('project, cost center');
      expect(component.remainingFieldsCount).toBe(3);
    });
  });

  describe('getCachedMandatoryFieldsMap():', () => {
    it('should return parsed JSON from localStorage', () => {
      const testMap = { 1: 'Project', 2: 'Cost Center' };
      localStorage.setItem('mandatory_expense_fields_cache', JSON.stringify(testMap));

      const result = (component as any).getCachedMandatoryFieldsMap();

      expect(result).toEqual(testMap);
    });

    it('should return empty object when localStorage is empty', () => {
      localStorage.removeItem('mandatory_expense_fields_cache');

      const result = (component as any).getCachedMandatoryFieldsMap();

      expect(result).toEqual({});
    });

    it('should return empty object when localStorage has invalid JSON', () => {
      localStorage.setItem('mandatory_expense_fields_cache', 'invalid-json');

      const result = (component as any).getCachedMandatoryFieldsMap();

      expect(result).toEqual({});
    });
  });

  describe('setCachedMandatoryFieldsMap():', () => {
    it('should store map in localStorage', () => {
      const testMap = { 1: 'Project', 2: 'Cost Center' };
      spyOn(localStorage, 'setItem');

      (component as any).setCachedMandatoryFieldsMap(testMap);

      expect(localStorage.setItem).toHaveBeenCalledWith('mandatory_expense_fields_cache', JSON.stringify(testMap));
    });

    it('should handle localStorage errors gracefully', () => {
      const testMap = { 1: 'Project' };
      spyOn(localStorage, 'setItem').and.throwError('Quota exceeded');

      expect(() => {
        (component as any).setCachedMandatoryFieldsMap(testMap);
      }).not.toThrow();
    });
  });

  describe('onFileUpload():', () => {
    it('should process file upload successfully', fakeAsync(async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
      const mockNativeElement = { files: [mockFile] };
      const dataUrl = 'data:image/png;base64,test';

      fileService.readFile.and.resolveTo(dataUrl);
      spyOn(component, 'attachReceipt');
      spyOn(component, 'showSizeLimitExceededPopover');

      await component.onFileUpload(mockNativeElement as any);
      tick();

      expect(fileService.readFile).toHaveBeenCalledWith(mockFile);
      expect(trackingService.addAttachment).toHaveBeenCalledWith({ type: 'image/png' });
      expect(component.attachReceipt).toHaveBeenCalledWith({
        type: 'image/png',
        dataUrl,
        actionSource: 'gallery_upload',
      });
      expect(component.showSizeLimitExceededPopover).not.toHaveBeenCalled();
    }));

    it('should show size limit popover for large files', fakeAsync(async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(mockFile, 'size', { value: 12 * 1024 * 1024 }); // 12MB
      const mockNativeElement = { files: [mockFile] };

      spyOn(component, 'attachReceipt');
      spyOn(component, 'showSizeLimitExceededPopover');

      await component.onFileUpload(mockNativeElement as any);
      tick();

      expect(component.showSizeLimitExceededPopover).toHaveBeenCalledWith(11 * 1024 * 1024);
      expect(component.attachReceipt).not.toHaveBeenCalled();
    }));
  });

  describe('attachReceipt():', () => {
    it('should attach receipt successfully', fakeAsync(() => {
      const receiptDetails = {
        type: 'image/png',
        dataUrl: 'data:image/png;base64,test',
        actionSource: 'camera',
      };
      const fileObj = { id: 'file123', name: 'test.png' };

      fileService.getAttachmentType.and.returnValue('png');
      transactionsOutboxService.fileUpload.and.resolveTo(fileObj);
      expensesService.attachReceiptToExpense.and.returnValue(of(platformExpenseData));

      component.attachReceipt(receiptDetails);
      tick();

      expect(component.attachmentUploadInProgress).toBeFalse();
      expect(fileService.getAttachmentType).toHaveBeenCalledWith('image/png');
      expect(transactionsOutboxService.fileUpload).toHaveBeenCalledWith(receiptDetails.dataUrl, 'png');
      expect(expensesService.attachReceiptToExpense).toHaveBeenCalledWith(component.expense().id, fileObj.id);
      expect(component.isReceiptPresent).toBeTrue();
      expect(component.attachmentUploadInProgress).toBeFalse();
    }));

    it('should set inline receipt data URL for non-PDF files', fakeAsync(() => {
      const receiptDetails = {
        type: 'image/png',
        dataUrl: 'data:image/png;base64,test',
        actionSource: 'camera',
      };
      const fileObj = { id: 'file123', name: 'test.png' };

      fileService.getAttachmentType.and.returnValue('png');
      transactionsOutboxService.fileUpload.and.resolveTo(fileObj);
      expensesService.attachReceiptToExpense.and.returnValue(of(platformExpenseData));

      component.attachReceipt(receiptDetails);
      tick();

      expect(component.inlineReceiptDataUrl).toBe(receiptDetails.dataUrl);
    }));

    it('should not set inline receipt data URL for PDF files', fakeAsync(() => {
      const receiptDetails = {
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,test',
        actionSource: 'camera',
      };
      const fileObj = { id: 'file123', name: 'test.pdf' };

      fileService.getAttachmentType.and.returnValue('pdf');
      transactionsOutboxService.fileUpload.and.resolveTo(fileObj);
      expensesService.attachReceiptToExpense.and.returnValue(of(platformExpenseData));

      component.attachReceipt(receiptDetails);
      tick();

      expect(component.inlineReceiptDataUrl).toBeFalse();
    }));
  });

  describe('setupNetworkWatcher():', () => {
    it('should setup network watcher correctly', fakeAsync(() => {
      const mockEventEmitter = new EventEmitter<boolean>();
      networkService.connectivityWatcher.and.returnValue(mockEventEmitter);
      networkService.isOnline.and.returnValue(of(true));

      component.setupNetworkWatcher();

      expect(networkService.connectivityWatcher).toHaveBeenCalled();
      expect(networkService.isOnline).toHaveBeenCalled();

      component.isConnected$.pipe(take(1)).subscribe((isConnected) => {
        expect(isConnected).toBeTrue();
      });
      tick();
    }));
  });

  describe('showSizeLimitExceededPopover():', () => {
    it('should create and present popover with correct properties', fakeAsync(async () => {
      const maxFileSize = 11 * 1024 * 1024;
      const popOverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present']);
      popoverController.create.and.resolveTo(popOverSpy);

      await component.showSizeLimitExceededPopover(maxFileSize);
      tick();

      expect(popoverController.create).toHaveBeenCalledWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Size limit exceeded',
          message: 'The uploaded file is greater than 11MB in size. Please reduce the file size and try again.',
          primaryCta: {
            text: 'OK',
          },
        },
        cssClass: 'pop-up-in-center',
      });
      expect(popOverSpy.present).toHaveBeenCalledTimes(1);
    }));
  });

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

      const message = 'Receipt added to expense successfully';
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

  it('dismiss(): should emit the dismissed event with the expense object when called', () => {
    const emitSpy = spyOn(component.dismissed, 'emit');

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
      preventDefault: jasmine.createSpy('preventDefault'),
    };

    component.dismiss(event as any);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense());
  });

  describe('isZeroAmountPerDiemOrMileage():', () => {
    it('should check if scan is complete and return true if it is per diem expense with amount 0', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        amount: 0,
        category: {
          ...expenseData.category,
          name: 'Per Diem',
        },
      });
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if it is per diem expense with user amount 0', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        amount: null,
        claim_amount: 0,
        category: {
          ...expenseData.category,
          name: 'Per Diem',
        },
      });
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if it is mileage expense with amount 0', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        amount: 0,
        category: {
          ...expenseData.category,
          name: 'Mileage',
        },
      });
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeTrue();
    });

    it('should return false if org category is null', () => {
      fixture.componentRef.setInput('expense', {
        ...cloneDeep(expenseData),
        category: {
          ...expenseData.category,
          name: null,
        },
      });
      const result = component.isZeroAmountPerDiemOrMileage();
      expect(result).toBeFalse();
    });
  });

  describe('Pending Gas Charge Functionality', () => {
    it('should return true when expense is a pending gas charge', () => {
      const mockExpense = cloneDeep(platformExpenseDataWithPendingGasCharge);

      sharedExpenseService.isPendingGasCharge.and.returnValue(true);

      const result = sharedExpenseService.isPendingGasCharge(mockExpense);

      expect(result).toBeTrue();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should return false when expense is not a pending gas charge', () => {
      const mockExpense = cloneDeep(expenseData);

      sharedExpenseService.isPendingGasCharge.and.returnValue(false);

      const result = sharedExpenseService.isPendingGasCharge(mockExpense);

      expect(result).toBeFalse();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should set isPendingGasCharge property correctly', () => {
      const mockExpense = cloneDeep(platformExpenseDataWithPendingGasCharge);

      sharedExpenseService.isPendingGasCharge.and.returnValue(true);

      fixture.componentRef.setInput('expense', mockExpense);
      component.ngOnInit();

      expect(component.isPendingGasCharge()).toBeTrue();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should set isPendingGasCharge to false for non-pending gas charge', () => {
      const mockExpense = cloneDeep(expenseData);

      sharedExpenseService.isPendingGasCharge.and.returnValue(false);

      fixture.componentRef.setInput('expense', mockExpense);
      component.ngOnInit();

      expect(component.isPendingGasCharge()).toBeFalse();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });
  });

  describe('ensureMandatoryFieldsMap - Cache Hit Test', () => {
    it('should use cached map when all required field IDs are present', () => {
      const cachedMap = { 1: 'Project', 2: 'Cost Center' };
      component.missingMandatoryFields = {
        receipt: false,
        currency: false,
        amount: false,
        expense_field_ids: [1, 2],
      };

      spyOn(component as any, 'getCachedMandatoryFieldsMap').and.returnValue(cachedMap);
      spyOn(component as any, 'getMissingMandatoryFieldNames').and.returnValue(['Project', 'Cost Center']);
      spyOn(component as any, 'processMissingFieldsForDisplay');

      (component as any).ensureMandatoryFieldsMap();

      expect(component.mandatoryFieldsMap).toEqual(cachedMap);
      expect(component.missingMandatoryFieldNames).toEqual(['Project', 'Cost Center']);
      expect((component as any).processMissingFieldsForDisplay).toHaveBeenCalledTimes(1);
    });
  });

  describe('addAttachments - Early Return Test', () => {
    it('should not proceed when canAddAttachment returns false', fakeAsync(() => {
      const event = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
      };

      spyOn(component, 'canAddAttachment').and.returnValue(false);
      spyOn(component, 'onFileUpload');

      component.addAttachments(event as any);
      tick();

      expect(component.canAddAttachment).toHaveBeenCalledTimes(1);
      expect(component.onFileUpload).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    }));
  });

  describe('Pending Gas Charge Functionality', () => {
    it('should return true when expense is a pending gas charge', () => {
      const mockExpense = cloneDeep(platformExpenseDataWithPendingGasCharge);

      sharedExpenseService.isPendingGasCharge.and.returnValue(true);

      const result = sharedExpenseService.isPendingGasCharge(mockExpense);

      expect(result).toBeTrue();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should return false when expense is not a pending gas charge', () => {
      const mockExpense = cloneDeep(expenseData);

      sharedExpenseService.isPendingGasCharge.and.returnValue(false);

      const result = sharedExpenseService.isPendingGasCharge(mockExpense);

      expect(result).toBeFalse();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should set isPendingGasCharge property correctly', () => {
      const mockExpense = cloneDeep(platformExpenseDataWithPendingGasCharge);

      sharedExpenseService.isPendingGasCharge.and.returnValue(true);

      fixture.componentRef.setInput('expense', mockExpense);
      component.ngOnInit();

      expect(component.isPendingGasCharge()).toBeTrue();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });

    it('should set isPendingGasCharge to false for non-pending gas charge', () => {
      const mockExpense = cloneDeep(expenseData);

      sharedExpenseService.isPendingGasCharge.and.returnValue(false);

      fixture.componentRef.setInput('expense', mockExpense);
      component.ngOnInit();

      expect(component.isPendingGasCharge()).toBeFalse();
      expect(sharedExpenseService.isPendingGasCharge).toHaveBeenCalledWith(mockExpense);
    });
  });
});

describe('ExpensesCardComponent - Mandatory Fields and Caching', () => {
  let component: ExpensesCardComponent;
  let fixture: ComponentFixture<ExpensesCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ExpensesCardComponent],
    providers: [
        { provide: TransactionService, useValue: {} },
        { provide: SharedExpenseService, useValue: {} },
        { provide: PlatformEmployeeSettingsService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: PopoverController, useValue: {} },
        { provide: NetworkService, useValue: {} },
        { provide: TransactionsOutboxService, useValue: {} },
        { provide: ModalController, useValue: {} },
        { provide: Platform, useValue: { is: (): boolean => false } },
        { provide: MatSnackBar, useValue: {} },
        { provide: SnackbarPropertiesService, useValue: { setSnackbarProperties: (): object => ({}) } },
        { provide: TrackingService, useValue: { addAttachment: (): void => { }, showToastMessage: (): void => { } } },
        { provide: CurrencyService, useValue: { getHomeCurrency: (): void => { } } },
        {
            provide: ExpenseFieldsService,
            useValue: { getAllMap: (): void => { }, getMandatoryExpenseFields: (): void => { } },
        },
        { provide: OrgSettingsService, useValue: { get: (): void => { } } },
        { provide: ExpensesService, useValue: {} },
        { provide: TranslocoService, useValue: { translate: (): string => '' } },
    ],
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesCardComponent);
    component = fixture.componentInstance;
    // Set up a default map for testing
    component.mandatoryFieldsMap = { 1: 'Project', 2: 'Cost Center', 3: 'Department' };
  });

  it('should set and get cached mandatory fields map correctly', () => {
    const testMap = { 1: 'Project', 2: 'Cost Center' };
    // @ts-ignore
    component.setCachedMandatoryFieldsMap(testMap);
    // @ts-ignore
    const result = component.getCachedMandatoryFieldsMap();
    expect(result).toEqual(testMap);
  });

  it('should return empty object for invalid cached JSON', () => {
    localStorage.setItem('mandatory_expense_fields_cache', 'not-json');
    // @ts-ignore
    const result = component.getCachedMandatoryFieldsMap();
    expect(result).toEqual({});
  });

  it('should return correct missing mandatory field names', () => {
    component.missingMandatoryFields = {
      receipt: true,
      currency: false,
      amount: true,
      expense_field_ids: [1, 2],
    };
    component.mandatoryFieldsMap = { 1: 'Project', 2: 'Cost Center' };
    // @ts-ignore
    const names = component.getMissingMandatoryFieldNames();
    expect(names).toEqual(['receipt', 'amount', 'Project', 'Cost Center']);
  });

  it('should process missing fields for display with ellipsis and limits', () => {
    component.missingMandatoryFieldNames = [
      'VeryLongFieldNameThatNeedsEllipsis',
      'Short',
      'AnotherLongFieldName',
      'ExtraField',
    ];
    // @ts-ignore
    component.processMissingFieldsForDisplay(20, 10);
    // Should only include as many as fit, with ellipsis, and set remainingFieldsCount
    expect(component.missingFieldsDisplayText).toContain('verylon..., short');
    expect(component.remainingFieldsCount).toBeGreaterThanOrEqual(1);
  });
});
