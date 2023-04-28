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
import { orgSettingsGetData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { of } from 'rxjs';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import { apiExpenseRes } from 'src/app/core/mock-data/expense.data';
import { expenseFieldsMapResponse2 } from 'src/app/core/mock-data/expense-fields-map.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { DateFormatPipe } from 'src/app/shared/pipes/date-format.pipe';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { fileObject5, fileObjectAdv, fileObjectData, fileObjectData1 } from 'src/app/core/mock-data/file-object.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { fileData1 } from 'src/app/core/mock-data/file.data';
import { cloneDeep } from 'lodash';
import * as dayjs from 'dayjs';

const thumbnailUrlMockData1: FileObject[] = [
  {
    id: 'fiwJ0nQTBpYH',
    purpose: 'THUMBNAILx200x200',
    url: '/assets/images/add-to-list.png',
  },
];

fdescribe('ExpensesCardComponent', () => {
  let component: ExpensesCardComponent;
  let fixture: ComponentFixture<ExpensesCardComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let fileService: jasmine.SpyObj<FileService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let platform: jasmine.SpyObj<Platform>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;

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
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const transactionOutboxServiceSpy = jasmine.createSpyObj([
      'isDataExtractionPending',
      'isSyncInProgress',
      'fileUpload',
    ]);
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
      declarations: [ExpensesCardComponent, DateFormatPipe, HumanizeCurrencyPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, MatCheckboxModule, FormsModule],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: TransactionsOutboxService, useValue: transactionOutboxServiceSpy },
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
      ],
    }).compileComponents();

    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;

    orgSettingsService.get.and.returnValue(of(orgSettingsGetData));
    transactionOutboxService.isSyncInProgress.and.returnValue(true);
    expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse2));
    transactionService.getVendorDetails.and.returnValue('asd');
    currencyService.getHomeCurrency.and.returnValue(of(orgData1[0].currency));
    transactionService.getIsCriticalPolicyViolated.and.returnValue(false);
    platform.is.and.returnValue(true);
    fileService.getReceiptDetails.and.returnValue(fileObjectAdv[0].type);
    transactionOutboxService.isDataExtractionPending.and.returnValue(true);
    transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
    networkService.isOnline.and.returnValue(of(true));
    transactionService.getIsDraft.and.returnValue(true);

    fixture = TestBed.createComponent(ExpensesCardComponent);
    component = fixture.componentInstance;

    Object.freeze(expenseData1);

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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event when onGoToTransaction is called', () => {
    spyOn(component.goToTransaction, 'emit');
    component.onGoToTransaction();
    expect(component.goToTransaction.emit).toHaveBeenCalledWith({
      etxn: component.expense,
      etxnIndex: component.etxnIndex,
    });
  });

  it('should not emit an event when isSelectionModeEnabled is true', () => {
    component.isSelectionModeEnabled = true;
    spyOn(component.goToTransaction, 'emit');
    component.onGoToTransaction();
    expect(component.goToTransaction.emit).not.toHaveBeenCalled();
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
      const fileObjid = fileObjectData.id;
      const attachmentType = 'png';
      fileService.downloadUrl.and.returnValue(of('/assets/images/add-to-list.png'));
      component.setThumbnail(fileObjid, attachmentType);
      fixture.detectChanges();
      tick(500);
      expect(component.receiptThumbnail).toEqual(thumbnailUrlMockData1[0].url);
      expect(fileService.downloadUrl).toHaveBeenCalledOnceWith(fileObjid);
    }));
  });

  it('matchReceiptWithEtxn(): match the receipt with the transactions', () => {
    component.matchReceiptWithEtxn(fileObjectData);
    expect(component.expense.tx_file_ids).toContain(fileObjectData.id);
    expect(fileObjectData.transaction_id).toBe(component.expense.tx_id);
  });

  // describe("attachReceipt(): ", () => {
  //   it('should attatch the receipt to the thumbnail when receipt is not a pdf',fakeAsync(()=>{
  //     fileService.getAttachmentType.and.returnValue('image');
  //     transactionOutboxService.fileUpload.and.returnValue(Promise.resolve(null));
  //     fileService.post.and.returnValue(of(fileObjectData));

  //     spyOn(component, 'matchReceiptWithEtxn').and.callThrough();
  //     spyOn(component, 'setThumbnail').and.callThrough();
  //     const dataUrl = 'assets/card.png';
  //     component.attachReceipt({ dataUrl, type: 'image/png', actionSource: 'gallery_upload' });
  //     tick(500);
  //     expect(component.attachmentUploadInProgress).toBeTrue();
  //     expect(component.inlineReceiptDataUrl).toBe(dataUrl);
  //     expect(transactionOutboxService.fileUpload).toHaveBeenCalledWith(dataUrl, 'png');
  //     expect(component.matchReceiptWithEtxn).toHaveBeenCalledWith(fileObjectData);
  //     expect(fileService.post).toHaveBeenCalledWith(fileObjectData);
  //     tick(500);
  //     expect(component.attachmentUploadInProgress).toBeFalse();
  //     expect(component.setThumbnail).toHaveBeenCalledWith(fileObjectData.id, 'png');
  //   }));
  // });

  //  describe("attachReceipt(): ", () => {
  //     it('should attach the receipt to the thumbnail when receipt is not a pdf', fakeAsync(() => {
  //       // Arrange
  //       const dataUrl = '/assets/images/add-to-list.png';
  //       const attachmentType = 'png';

  //       // Stub out dependencies
  //       fileService.getAttachmentType.and.returnValue(attachmentType);
  //       transactionOutboxService.fileUpload.and.returnValue(Promise.resolve(fileObjectData));
  //       fileService.post.and.returnValue(of(fileObjectData));

  //       // Spy on methods
  //       spyOn(component, 'matchReceiptWithEtxn').and.callThrough();
  //       spyOn(component, 'setThumbnail').and.callThrough();

  //       // Act
  //       component.attachReceipt({ dataUrl, type: 'image/png', actionSource: 'upload' });
  //       tick(500);

  //       // Assert
  //       expect(component.attachmentUploadInProgress).toBeTrue();
  //       expect(component.inlineReceiptDataUrl).toBe(dataUrl);
  //       expect(transactionOutboxService.fileUpload).toHaveBeenCalledWith(dataUrl, attachmentType);
  //       expect(component.matchReceiptWithEtxn).toHaveBeenCalledWith(fileObjectData);
  //       expect(fileService.post).toHaveBeenCalledWith(fileObjectData);
  //       expect(component.setThumbnail).toHaveBeenCalledWith(fileObjectData.id, attachmentType);
  //       console.log('sas');
  //       console.log(component.setThumbnail);
  //       expect(component.attachmentUploadInProgress).toBeFalse();
  //       tick(500);
  //     }));
  //   });

  it('should emit the dismissed event with the expense object when called', () => {
    const emitSpy = spyOn(component.dismissed, 'emit');

    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
      preventDefault: jasmine.createSpy('preventDefault'),
    };

    component.dismiss(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledOnceWith(component.expense);
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

  it('checkIfScanIsCompleted(): should check of scan is complete and return true if all the conditions are met', () => {
    component.expense = {
      ...expenseData1,
      tx_amount: 100,
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
    expect(result).toBe(true);
  });

  describe('pollDataExtractionStatus', () => {
    it('should call the callback when data extraction is not pending', fakeAsync(() => {
      transactionOutboxService.isDataExtractionPending.and.returnValue(false);
      const callbackSpy = jasmine.createSpy('callback');
      component.pollDataExtractionStatus(callbackSpy);
      tick(5000);
      expect(callbackSpy).toHaveBeenCalled();
    }));

    it('should keep polling when data extraction is pending', fakeAsync(() => {
      const callbackSpy = jasmine.createSpy('callback');

      transactionOutboxService.isDataExtractionPending.and.returnValue(true);

      component.pollDataExtractionStatus(callbackSpy);
      tick(1000); // wait for the initial setTimeout call

      expect(transactionOutboxService.isDataExtractionPending).toHaveBeenCalledTimes(1);
      expect(callbackSpy).not.toHaveBeenCalled();

      // simulate data extraction not pending
      transactionOutboxService.isDataExtractionPending.and.returnValue(false);
      tick(5000); // wait for the next setTimeout call

      expect(transactionOutboxService.isDataExtractionPending).toHaveBeenCalledTimes(2);
      expect(callbackSpy).toHaveBeenCalledTimes(1);
    }));
  });
});

// xit("getReceipt", () => { });
// xit("checkIfScanIsCompleted", () => { });
// xit("handleScanStatus", () => { });
// xit("canShowPaymentModeIcon", () => { });
// xit("setOtherData", () => { });
// xit("addAttachments", () => { });
// xit("setupNetworkWatcher", () => { });
// xit("dismiss", () => { });
