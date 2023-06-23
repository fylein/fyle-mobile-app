import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TransactionService } from 'src/app/core/services/transaction.service';
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
import { expenseData1, expenseList, expenseList2 } from 'src/app/core/mock-data/expense.data';
import { apiExpenseRes } from 'src/app/core/mock-data/expense.data';
import { expenseFieldsMapResponse2 } from 'src/app/core/mock-data/expense-fields-map.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { DateFormatPipe } from 'src/app/shared/pipes/date-format.pipe';
import { FileObject } from 'src/app/core/models/file-obj.model';
import {
  fileObjectAdv,
  fileObjectAdv1,
  fileObjectData,
  fileObjectData1,
} from 'src/app/core/mock-data/file-object.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { fileData1 } from 'src/app/core/mock-data/file.data';
import { cloneDeep, stubFalse } from 'lodash';
import * as dayjs from 'dayjs';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { CameraOptionsPopupComponent } from 'src/app/fyle/add-edit-expense/camera-options-popup/camera-options-popup.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { DebugElement, EventEmitter } from '@angular/core';

const thumbnailUrlMockData1: FileObject[] = [
  {
    id: 'fiwJ0nQTBpYH',
    purpose: 'THUMBNAILx200x200',
    url: '/assets/images/add-to-list.png',
  },
];

describe('ExpensesCardComponent', () => {
  let component: ExpensesCardComponent;
  let fixture: ComponentFixture<ExpensesCardComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
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
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', [
      'getETxnUnflattened',
      'getIsDraft',
      'getIsCriticalPolicyViolated',
      'getVendorDetails',
    ]);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', [
      'getFilesWithThumbnail',
      'downloadThumbnailUrl',
      'downloadUrl',
      'getReceiptDetails',
      'readFile',
      'getImageTypeFromDataUrl',
      'getAttachmentType',
      'post',
    ]);

    fileServiceSpy.getFilesWithThumbnail.and.returnValue(of(fileObjectData1));
    fileServiceSpy.downloadThumbnailUrl.and.returnValue(of(thumbnailUrlMockData1));
    fileServiceSpy.downloadUrl.and.returnValue(of('/assets/images/add-to-list.png'));
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

    orgSettingsService.get.and.returnValue(of(orgSettingsGetData));
    transactionsOutboxService.isSyncInProgress.and.returnValue(true);
    expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse2));
    transactionService.getVendorDetails.and.returnValue('asd');
    currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
    transactionService.getIsCriticalPolicyViolated.and.returnValue(false);
    platform.is.and.returnValue(true);
    fileService.getReceiptDetails.and.returnValue(fileObjectAdv[0].type);
    transactionsOutboxService.isDataExtractionPending.and.returnValue(true);
    transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
    networkService.isOnline.and.returnValue(of(true));
    transactionService.getIsDraft.and.returnValue(true);

    networkService.connectivityWatcher.and.returnValue(new EventEmitter());
    fixture = TestBed.createComponent(ExpensesCardComponent);
    component = fixture.componentInstance;

    component.receiptIcon = 'assets/svg/pdf.svg';
    component.isOutboxExpense = true;
    component.selectedElements = apiExpenseRes;
    component.expense = cloneDeep(expenseData1);
    component.isConnected$ = of(true);
    component.isSycing$ = of(true);
    component.isPerDiem = true;
    component.receiptThumbnail = 'assets/svg/pdf.svg';
    component.isSelectionModeEnabled = false;
    component.etxnIndex = 1;
    componentElement = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isSelected getter', () => {
    it('should return true if the expense is selected', () => {
      component.selectedElements = apiExpenseRes;
      component.expense = {
        ...expenseData1,
        tx_id: 'tx3nHShG60zq',
      };
      expect(component.isSelected).toBeTrue();
    });

    it('should return false if the expense is not selected', () => {
      component.selectedElements = apiExpenseRes;
      component.expense = {
        ...expenseData1,
        tx_id: null,
      };
      expect(component.isSelected).toBeFalse();
    });
  });

  describe('onGoToTransaction():', () => {
    it('should emit an event when onGoToTransaction is called', () => {
      spyOn(component.goToTransaction, 'emit');
      component.onGoToTransaction();
      expect(component.goToTransaction.emit).toHaveBeenCalledOnceWith({
        etxn: component.expense,
        etxnIndex: component.etxnIndex,
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
    it('should get the receipts when the file ids are present and the length of the thumbnail files array is greater that 0', fakeAsync(() => {
      fileService.getFilesWithThumbnail.and.returnValue(of([fileObjectData]));
      fileService.downloadThumbnailUrl.and.returnValue(of(thumbnailUrlMockData1));
      component.expense = {
        ...expenseData1,
        tx_file_ids: ['fiGLwwPtYD8X'],
      };
      component.getReceipt();
      fixture.detectChanges();
      tick(500);
      expect(component.receiptThumbnail).toEqual(thumbnailUrlMockData1[0].url);
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledOnceWith(component.expense.tx_id);
      expect(fileService.downloadThumbnailUrl).toHaveBeenCalledOnceWith('fiHPZUiichAS');
    }));

    it('should get the receipts when the file ids are present and there are no thumbnail files and set the icon to fy-expense when type is not pdf', fakeAsync(() => {
      const mockDownloadUrl = {
        url: 'mock-url',
      };
      fileService.getFilesWithThumbnail.and.returnValue(of([]));
      fileService.downloadUrl.and.returnValue(of(mockDownloadUrl.url));
      fileService.getReceiptDetails.and.returnValue('mock-url');

      component.expense = {
        ...expenseData1,
        tx_file_ids: ['fiGLwwPtYD8X'],
      };
      component.getReceipt();
      fixture.detectChanges();
      tick(500);
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledOnceWith(component.expense.tx_id);
      expect(fileService.downloadUrl).toHaveBeenCalledOnceWith('fiGLwwPtYD8X');
      expect(fileService.getReceiptDetails).toHaveBeenCalledOnceWith('mock-url');
      expect(component.receiptIcon).toEqual('assets/svg/fy-expense.svg');
    }));

    it('should get the receipts when the file ids are present and there are no thumbnail files and set the icon to fy-pdf when type is pdf', fakeAsync(() => {
      const mockDownloadUrl = {
        url: 'mock-url',
      };

      const thumbnailUrlMockRes = {
        ...thumbnailUrlMockData1,
        url: '/assets/mock-url.pdf',
      };
      fileService.getFilesWithThumbnail.and.returnValue(of([]));
      fileService.downloadThumbnailUrl.and.returnValue(of(thumbnailUrlMockRes));
      fileService.downloadUrl.and.returnValue(of(mockDownloadUrl.url));
      fileService.getReceiptDetails.and.returnValue('pdf');

      component.expense = {
        ...expenseData1,
        tx_file_ids: ['fiGLwwPtYD8Y'],
      };
      component.getReceipt();
      fixture.detectChanges();
      tick(500);
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledOnceWith(component.expense.tx_id);
      expect(fileService.downloadUrl).toHaveBeenCalledOnceWith('fiGLwwPtYD8Y');
      expect(fileService.getReceiptDetails).toHaveBeenCalledOnceWith('mock-url');
      expect(component.receiptIcon).toEqual('assets/svg/pdf.svg');
    }));

    it('should set the receipt icon to fy-mileage when the fyle catergory is mileage', () => {
      component.expense = {
        ...expenseData1,
        tx_fyle_category: 'mileage',
      };
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/fy-mileage.svg');
    });

    it('should set the receipt icon to fy-calendar when the fyle catergory is per diem', () => {
      component.expense = {
        ...expenseData1,
        tx_fyle_category: 'per diem',
      };
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/fy-calendar.svg');
    });

    it('should set the receipt icon to add-receipt when there are no file ids', () => {
      component.expense = {
        ...expenseData1,
        tx_file_ids: null,
      };
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/add-receipt.svg');
    });

    it('should set the receipt icon to add-receipt when there are no file ids', () => {
      component.isFromReports = true;
      component.isFromPotentialDuplicates = true;
      component.expense = {
        ...expenseData1,
        tx_file_ids: null,
      };
      component.getReceipt();
      fixture.detectChanges();
      expect(component.receiptIcon).toEqual('assets/svg/fy-expense.svg');
    });
  });

  describe('checkIfScanIsCompleted():', () => {
    it('should check if scan is complete and return true if the transaction amount is not null and no other data is present', () => {
      component.expense = {
        ...expenseData1,
        tx_amount: 100,
        tx_user_amount: null,
        tx_extracted_data: null,
      };
      const result = component.checkIfScanIsCompleted();
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if the transaction user amount is present and no extracted data is available', () => {
      component.expense = {
        ...expenseData1,
        tx_amount: null,
        tx_user_amount: 7500,
        tx_extracted_data: null,
      };
      const result = component.checkIfScanIsCompleted();
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should check if scan is complete and return true if the required extracted data is present', () => {
      component.expense = {
        ...expenseData1,
        tx_amount: null,
        tx_user_amount: null,
        tx_extracted_data: {
          amount: 84.12,
          currency: 'USD',
          category: 'Professional Services',
          date: null,
          vendor: null,
          invoice_dt: null,
        },
      };
      const result = component.checkIfScanIsCompleted();
      fixture.detectChanges();
      expect(result).toBeTrue();
    });

    it('should return true if the scan has expired', () => {
      component.expense = {
        ...expenseData1,
        tx_amount: null,
        tx_user_amount: null,
        tx_extracted_data: null,
      };
      const oneDaysAfter = dayjs(component.expense.tx_created_at).add(1, 'day').toDate();
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
    it('should handle status when the syncing is in progress and the extracted adata is present', fakeAsync(() => {
      component.isOutboxExpense = false;
      component.homeCurrency = 'INR';
      const unflattenRes = {
        ...unflattenedTxnData,
        tx_id: 'tx5fBcPBAxLv',
        tx: {
          extracted_data: {
            amount: 2500,
            currency: 'INR',
            category: 'Software',
            date: null,
            vendor: null,
            invoice_dt: null,
          },
        },
      };
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      const isScanCompletedSpy = spyOn(component, 'checkIfScanIsCompleted').and.returnValue(false);
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenRes));
      component.isScanInProgress = true;
      spyOn(component, 'pollDataExtractionStatus').and.callFake((callback) => {
        callback();
      });

      transactionsOutboxService.isDataExtractionPending.and.returnValue(true);
      tick(500);
      component.handleScanStatus();
      fixture.detectChanges();
      tick(500);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(isScanCompletedSpy).toHaveBeenCalledTimes(1);
      expect(transactionsOutboxService.isDataExtractionPending).toHaveBeenCalledOnceWith('tx5fBcPBAxLv');
      expect(component.pollDataExtractionStatus).toHaveBeenCalledTimes(1);
      tick(500);
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(component.expense.tx_id);
      expect(component.isScanCompleted).toBeTrue();
      expect(component.isScanInProgress).toBeFalse();
      expect(component.expense.tx_extracted_data).toEqual(unflattenRes.tx.extracted_data);
    }));

    it('should handle status when the sync is in progress and there is no extracted data present', fakeAsync(() => {
      component.isOutboxExpense = false;
      const unflattenRes = {
        ...unflattenedTxnData,
        tx_id: 'tx5fBcPBAxLv',
        tx: {
          extracted_data: null,
        },
      };
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      const isScanCompletedSpy = spyOn(component, 'checkIfScanIsCompleted').and.returnValue(false);
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenRes));
      component.isScanInProgress = true;
      const pollDataSpy = spyOn(component, 'pollDataExtractionStatus').and.callFake((callback) => {
        callback();
      });

      transactionsOutboxService.isDataExtractionPending.and.returnValue(true);
      tick(500);
      component.handleScanStatus();
      fixture.detectChanges();
      tick(500);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(component.checkIfScanIsCompleted).toHaveBeenCalledTimes(1);
      expect(isScanCompletedSpy).toHaveBeenCalledTimes(1);
      expect(transactionsOutboxService.isDataExtractionPending).toHaveBeenCalledOnceWith('tx5fBcPBAxLv');
      expect(pollDataSpy).toHaveBeenCalledTimes(1);
      tick(500);
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(component.expense.tx_id);
      expect(component.isScanCompleted).toBeFalse();
      expect(component.isScanInProgress).toBeFalse();
    }));

    it('should handle status when the scanning is not in progress', fakeAsync(() => {
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
      fixture.detectChanges();
      tick(500);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(component.isScanCompleted).toBeTrue();
      expect(component.isScanInProgress).toBeFalse();
    }));
  });

  describe('canShowPaymentModeIcon', () => {
    it('should show payment mode icon if it is a personal expense and is reimbersable', () => {
      component.expense = {
        ...expenseData1,
        tx_skip_reimbursement: false,
      };
      component.canShowPaymentModeIcon();
      fixture.detectChanges();
      expect(component.showPaymentModeIcon).toBeTrue();
    });

    it('should not show payment mode icon if it is a personal expense and is not reimbersable', () => {
      component.expense = {
        ...expenseData1,
        tx_skip_reimbursement: true,
      };
      component.canShowPaymentModeIcon();
      fixture.detectChanges();
      expect(component.showPaymentModeIcon).toBeFalse();
    });

    it('should not show payment mode icon if it is not a personal expense and is reimbersable', () => {
      component.expense = {
        ...expenseData1,
        source_account_type: 'COMPANY_ACCOUNT',
        tx_skip_reimbursement: false,
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
        ...expenseData1,
        tx_id: null,
      };
      component.isFirstOfflineExpense = true;
      component.ngOnInit();
      expect(component.showDt).toBeTrue();
    });

    it('should set showDt based on date comparison when previousExpenseTxnDate is truthy', () => {
      component.expense = {
        ...expenseData1,
        tx_id: 'tx12341',
        tx_txn_dt: null,
      };
      component.previousExpenseTxnDate = new Date('2023-01-28T17:00:00');
      component.previousExpenseCreatedAt = null;

      component.ngOnInit();

      expect(component.showDt).toBeTrue();
    });

    it('should set showDt based on date comparison when previousExpenseCreatedAt is truthy', () => {
      component.expense = {
        ...expenseData1,
        tx_id: 'tx12341',
      };
      component.previousExpenseTxnDate = null;
      component.previousExpenseCreatedAt = new Date('2023-01-29T07:29:02.966116');

      component.ngOnInit();
      expect(component.showDt).toBeTrue();
    });

    it('should set isMileageExpense to true of the fyle category is mileage', () => {
      component.expense = {
        ...expenseData1,
        tx_id: 'tx12341',
        tx_txn_dt: null,
        tx_fyle_category: 'mileage',
      };
      component.ngOnInit();
      expect(component.isMileageExpense).toBeTrue();
    });

    it('should set isPerDiem to true if the fyle category is per diem', () => {
      component.expense = {
        ...expenseData1,
        tx_id: 'tx12341',
        tx_txn_dt: null,
        tx_fyle_category: 'per diem',
      };
      component.ngOnInit();
      expect(component.isPerDiem).toBeTrue();
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
    it('should set icon to fy-matched if the source account type is corporate credit card', () => {
      component.expense = {
        ...expenseData1,
        source_account_type: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
        tx_corporate_credit_card_expense_group_id: 'cccet1B17R8gWZ',
      };

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('fy-matched');
    });

    it('should set icon to fy-unmatched if the source account type is corporate credit card but expense group id is not present', () => {
      component.expense = {
        ...expenseData1,
        source_account_type: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
      };

      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('fy-unmatched');
    });

    it('should set icon to fy-reimbersable if the source account type is not a corporate credit card and if the reimbersement is not skipped', () => {
      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('fy-reimbursable');
    });

    it('should set icon to fy-non-reimbersable if the source account type is not a corporate credit card and if the reimbersement is skipped', () => {
      component.expense = {
        ...expenseData1,
        tx_skip_reimbursement: true,
      };
      component.setOtherData();
      fixture.detectChanges();
      expect(component.paymentModeIcon).toEqual('fy-non-reimbursable');
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
    component.matchReceiptWithEtxn(fileObjectData);
    expect(component.expense.tx_file_ids).toBeDefined();
    expect(component.expense.tx_file_ids).toContain(fileObjectData.id);
    expect(fileObjectData.transaction_id).toBe(component.expense.tx_id);
  });

  describe('canAddAttchment():', () => {
    it('should return true when none of the conditions are met', () => {
      component.isFromViewReports = false;
      component.isMileageExpense = false;
      component.expense.tx_file_ids = null;
      component.isFromPotentialDuplicates = false;
      component.isSelectionModeEnabled = false;
      const result = component.canAddAttachment();
      expect(result).toBeTrue();
    });

    it('should return false when isFromViewReports is true', () => {
      component.isFromViewReports = true;
      component.isMileageExpense = false;
      component.expense.tx_file_ids = null;
      component.isFromPotentialDuplicates = false;
      component.isSelectionModeEnabled = false;
      const result = component.canAddAttachment();
      expect(result).toBeFalse();
    });
  });

  describe('attachReceipt(): ', () => {
    it('should attach the receipt to the thumbnail when receipt is not a pdf', fakeAsync(() => {
      const dataUrl = '/assets/images/add-to-list.png';
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
      transactionsOutboxService.fileUpload.and.returnValue(Promise.resolve(fileObj));
      fileService.post.and.returnValue(of(fileObjectData));

      spyOn(component, 'matchReceiptWithEtxn').and.callThrough();
      spyOn(component, 'setThumbnail').and.callThrough();

      component.attachReceipt(receiptDetailsaRes);
      tick(500);
      expect(component.inlineReceiptDataUrl).toBe(dataUrl);
      expect(fileService.getAttachmentType).toHaveBeenCalledOnceWith(receiptDetailsaRes.type);
      expect(transactionsOutboxService.fileUpload).toHaveBeenCalledOnceWith(dataUrl, attachmentType);
      expect(component.matchReceiptWithEtxn).toHaveBeenCalledOnceWith(fileObj);
      expect(fileService.post).toHaveBeenCalledOnceWith(fileObj);
      expect(component.setThumbnail).toHaveBeenCalledOnceWith(fileObjectData.id, attachmentType);
      expect(component.attachmentUploadInProgress).toBeFalse();
      tick(500);
    }));
  });

  it('onFileUpload(): should add attachment when file is selected', fakeAsync(() => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
    const mockFile = new File(['file contents'], 'test.png', { type: 'image/png' });
    fileService.readFile.and.returnValue(Promise.resolve(dataUrl));
    const mockNativeElement = {
      files: [mockFile],
    } as unknown as HTMLInputElement;

    spyOn(component, 'attachReceipt');

    component.onFileUpload(mockNativeElement);
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
      spyOn(nativeElement1, 'click').and.callThrough();

      component.addAttachments(event);
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
      popoverController.create.and.returnValue(Promise.resolve(popOverSpy));
      popOverSpy.onWillDismiss.and.returnValue(Promise.resolve(receiptDetails));

      component.addAttachments(event);
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
      popoverController.create.and.returnValue(Promise.resolve(popOverSpy));
      popOverSpy.onWillDismiss.and.returnValue(Promise.resolve(dataRes));
      const captureReceiptModalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      modalController.create.and.returnValue(Promise.resolve(captureReceiptModalSpy));
      captureReceiptModalSpy.onWillDismiss.and.returnValue(Promise.resolve(dataRes));
      fileService.getImageTypeFromDataUrl.and.returnValue('png');

      component.addAttachments(event);
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

  describe('setThumbnail():', () => {
    it('should set the thumbnail', fakeAsync(() => {
      const fileObjid = fileObjectData.id;
      const attachmentType = 'pdf';
      fileService.downloadUrl.and.returnValue(of('mock-url'));
      component.setThumbnail(fileObjid, attachmentType);
      fixture.detectChanges();
      tick(500);
      expect(component.receiptIcon).toEqual('assets/svg/pdf.svg');
      expect(fileService.downloadUrl).toHaveBeenCalledOnceWith(fileObjid);
    }));

    it('should set the receipt thumbnail to download url when the attatchment tyoe is not pdf', fakeAsync(() => {
      component.receiptIcon = undefined;
      const fileObjid = fileObjectData.id;
      const attachmentType = 'png';
      fileService.downloadUrl.and.returnValue(of('/assets/images/add-to-list.png'));
      component.setThumbnail(fileObjid, attachmentType);
      fixture.detectChanges();
      tick(500);
      expect(component.receiptThumbnail).toEqual(thumbnailUrlMockData1[0].url);
      expect(component.receiptIcon).toBeUndefined();
      expect(fileService.downloadUrl).toHaveBeenCalledOnceWith(fileObjid);
    }));
  });

  it('setupNetworkWatcher(): should setup the network watcher', fakeAsync(() => {
    networkService.isOnline.and.returnValue(of(true));
    const eventEmitterMock = new EventEmitter<boolean>();
    networkService.connectivityWatcher.and.returnValue(eventEmitterMock);

    component.setupNetworkWatcher();
    component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
      expect(connectionStatus).toEqual(true);
    });
  }));

  it('dismiss(): hould emit the dismissed event with the expense object when called', () => {
    const emitSpy = spyOn(component.dismissed, 'emit');

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
      preventDefault: jasmine.createSpy('preventDefault'),
    };

    component.dismiss(event);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense);
  });
});
