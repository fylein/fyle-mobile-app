import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { expenseList2 } from '../mock-data/expense.data';
import { fileObject4, fileObjectData1 } from '../mock-data/file-object.data';
import { editUnflattenedTransaction, txnData2 } from '../mock-data/transaction.data';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { ReportService } from './report.service';
import { StatusService } from './status.service';
import { StorageService } from './storage.service';
import { TrackingService } from './tracking.service';
import { TransactionService } from './transaction.service';

import { TransactionsOutboxService } from './transactions-outbox.service';
import { outboxQueueData1 } from '../mock-data/outbox-queue.data';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { parsedReceiptData1, parsedReceiptData2 } from '../mock-data/parsed-receipt.data';
import { fileData1 } from '../mock-data/file.data';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from './snackbar-properties.service';
import { Router } from '@angular/router';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

describe('TransactionsOutboxService', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let transactionsOutboxService: TransactionsOutboxService;
  let storageService: jasmine.SpyObj<StorageService>;
  let dateService: jasmine.SpyObj<DateService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let fileService: jasmine.SpyObj<FileService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let reportService: jasmine.SpyObj<ReportService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  const singleCaptureCountInSession = 0;
  let httpMock: HttpTestingController;
  let httpTestingController: HttpTestingController;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['getUTCDate', 'fixDates']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['post', 'matchCCCExpense', 'upsert']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post', 'uploadUrl', 'uploadComplete']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['post']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['post']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['post', 'showToastMessage']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['post']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TransactionsOutboxService,
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: StatusService, useValue: statusServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
    transactionsOutboxService = TestBed.inject(TransactionsOutboxService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    httpMock = TestBed.inject(HttpTestingController);
    httpTestingController = TestBed.inject(HttpTestingController);
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    transactionsOutboxService.setRoot(rootUrl);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(transactionsOutboxService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(transactionsOutboxService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('singleCaptureCount(): should return outbox transactions', () => {
    expect(transactionsOutboxService.singleCaptureCount).toBe(singleCaptureCountInSession);
  });

  it('incrementSingleCaptureCount(): should increment single capture count', () => {
    transactionsOutboxService.incrementSingleCaptureCount();
    expect(transactionsOutboxService.singleCaptureCount).toEqual(singleCaptureCountInSession + 1);
  });

  it('showSnackBarToast(): should show snackbar with relevant properties', () => {
    const properties = {
      data: {
        icon: 'tick-square-filled',
        showCloseButton: true,
        message: 'Message',
      },
      duration: 3000,
    };
    snackbarProperties.setSnackbarProperties.and.returnValue(properties);

    transactionsOutboxService.showSnackBarToast({ message: 'Message' }, 'success', ['panel-class']);

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...properties,
      panelClass: ['panel-class'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', { message: 'Message' });
  });

  it('showAddToReportSuccessToast(): should show success message on adding expense to report', () => {
    const modalSpy = jasmine.createSpyObj('expensesAddedToReportSnackBar', ['onAction']);
    modalSpy.onAction.and.returnValue(of(true));
    matSnackBar.openFromComponent.and.returnValue(modalSpy);

    transactionsOutboxService.showAddToReportSuccessToast('rpFE5X1Pqi9P', 'Expense added to report successfully');
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
      ToastContent: 'Expense added to report successfully',
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'Expense added to report successfully',
      redirectionText: 'View Report',
    });
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'my_view_report',
      { id: 'rpFE5X1Pqi9P', navigateBack: true },
    ]);
  });

  it('saveQueue(): should save queue', () => {
    const mockQueue = cloneDeep(outboxQueueData1);
    transactionsOutboxService.queue = mockQueue;
    storageService.set.and.returnValue(Promise.resolve(null));
    transactionsOutboxService.saveQueue();
    expect(storageService.set).toHaveBeenCalledOnceWith('outbox', transactionsOutboxService.queue);
  });

  it('saveDataExtractionQueue(): should save data extraction queue', () => {
    const mockQueue = cloneDeep(outboxQueueData1);
    transactionsOutboxService.dataExtractionQueue = mockQueue;
    storageService.set.and.returnValue(Promise.resolve(null));
    transactionsOutboxService.saveDataExtractionQueue();
    expect(storageService.set).toHaveBeenCalledOnceWith(
      'data_extraction_queue',
      transactionsOutboxService.dataExtractionQueue
    );
  });

  describe('isSyncInProgress', () => {
    it('should return true if sync is in progress', () => {
      transactionsOutboxService.syncInProgress = true;
      const res = transactionsOutboxService.isSyncInProgress();
      expect(res).toBeTrue();
    });

    it('should return false if sync is not in progress', () => {
      transactionsOutboxService.syncInProgress = false;
      const res = transactionsOutboxService.isSyncInProgress();
      expect(res).toBeFalse();
    });
  });

  describe('isPDF():', () => {
    it('should return true if file is pdf', () => {
      const fileType = 'application/pdf';
      const res = transactionsOutboxService.isPDF(fileType);
      expect(res).toBeTrue();
    });

    it('should return false if file is not pdf', () => {
      const fileType = 'image/png';
      const res = transactionsOutboxService.isPDF(fileType);
      expect(res).toBeFalse();
    });
  });

  describe('isDataExtractionPending():', () => {
    const txnId = 'tx3qHxFNgRcZ';
    it('should return true if data extraction is pending', () => {
      const mockQueue = cloneDeep(outboxQueueData1);
      transactionsOutboxService.dataExtractionQueue = mockQueue;
      const res = transactionsOutboxService.isDataExtractionPending(txnId);
      expect(res).toBeTrue();
    });

    it('should return false if data extraction is not pending', () => {
      transactionsOutboxService.dataExtractionQueue = [];
      const res = transactionsOutboxService.isDataExtractionPending(txnId);
      expect(res).toBeFalse();
    });
  });

  it('removeDataExtractionEntry():', async () => {
    const mockQueue = cloneDeep(outboxQueueData1);
    transactionsOutboxService.dataExtractionQueue = mockQueue;
    spyOn(transactionsOutboxService, 'saveDataExtractionQueue').and.returnValue(Promise.resolve());
    await transactionsOutboxService.removeDataExtractionEntry(txnData2, [
      { url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' },
    ]);
    expect(transactionsOutboxService.saveDataExtractionQueue).toHaveBeenCalledTimes(1);
    expect(transactionsOutboxService.dataExtractionQueue.length).toEqual(0);
  });

  it('addDataExtractionEntry():', () => {
    spyOn(transactionsOutboxService, 'saveDataExtractionQueue').and.returnValue(Promise.resolve());
    transactionsOutboxService.addDataExtractionEntry(txnData2, [
      { url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' },
    ]);
    expect(transactionsOutboxService.dataExtractionQueue.length).toEqual(1);
    expect(transactionsOutboxService.saveDataExtractionQueue).toHaveBeenCalledTimes(1);
  });

  it('uploadData(): should upload data', (done) => {
    const fileId = 'fiHPZUiichAS';
    const uploadUrl = `${rootUrl}/files/${fileId}/upload_url`;
    const blob = new Blob(['mock-file-content'], { type: 'text/plain' });
    const contentType = 'text/plain';
    const uploadedUrl = 'https://mock-url';

    transactionsOutboxService.uploadData(uploadUrl, blob, contentType).subscribe((response) => {
      expect(response).toBeTruthy();
      done();
    });

    const req = httpTestingController.expectOne(uploadUrl);
    expect(req.request.method).toEqual('PUT');
    req.flush(uploadedUrl);
  });

  it('removeEntry(): should remove entry from queue', () => {
    const mockQueue = cloneDeep(outboxQueueData1);
    transactionsOutboxService.queue = mockQueue;
    spyOn(transactionsOutboxService, 'saveQueue').and.returnValue(Promise.resolve());
    transactionsOutboxService.removeEntry(outboxQueueData1[0]);
    expect(transactionsOutboxService.saveQueue).toHaveBeenCalledTimes(1);
    expect(transactionsOutboxService.queue.length).toEqual(0);
  });

  it('addEntry(): should add entry to queue', () => {
    spyOn(transactionsOutboxService, 'saveQueue').and.returnValue(Promise.resolve());
    transactionsOutboxService.addEntry(txnData2, [
      { url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' },
    ]);
    expect(transactionsOutboxService.queue.length).toEqual(1);
    expect(transactionsOutboxService.saveQueue).toHaveBeenCalledTimes(1);
  });

  describe('addEntryAndSync():', () => {
    beforeEach(() => {
      const mockQueue = cloneDeep(outboxQueueData1);
      transactionsOutboxService.queue = mockQueue;
      spyOn(transactionsOutboxService, 'addEntry').and.returnValue(Promise.resolve());
      spyOn(transactionsOutboxService, 'syncEntry').and.returnValue(Promise.resolve(outboxQueueData1[0]));
    });

    it('should add entry to queue and sync', () => {
      transactionsOutboxService.addEntryAndSync(
        txnData2,
        [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' }],
        null,
        null,
        false
      );
      expect(transactionsOutboxService.addEntry).toHaveBeenCalledOnceWith(
        txnData2,
        [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' }],
        null,
        null,
        false
      );
      expect(transactionsOutboxService.syncEntry).toHaveBeenCalledOnceWith(outboxQueueData1[0]);
      expect(transactionsOutboxService.queue.length).toEqual(0);
    });

    it('should add entry to queue and sync if applyMagic params is not provided', () => {
      transactionsOutboxService.addEntryAndSync(
        txnData2,
        [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' }],
        null,
        null
      );
      expect(transactionsOutboxService.addEntry).toHaveBeenCalledOnceWith(
        txnData2,
        [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' }],
        null,
        null,
        false
      );
      expect(transactionsOutboxService.syncEntry).toHaveBeenCalledOnceWith(outboxQueueData1[0]);
      expect(transactionsOutboxService.queue.length).toEqual(0);
    });
  });

  it('getPendingTransactions(): should return pending transactions', () => {
    const mockQueue = cloneDeep(outboxQueueData1);
    transactionsOutboxService.queue = mockQueue;
    const res = transactionsOutboxService.getPendingTransactions();
    expect(res.length).toEqual(1);
    expect(res).toEqual(
      transactionsOutboxService.queue.map((entry) => ({ ...entry.transaction, dataUrls: entry.dataUrls }))
    );
  });

  it('deleteOfflineExpense(): should delete offline expense', () => {
    const mockQueue = cloneDeep(outboxQueueData1);
    transactionsOutboxService.queue = mockQueue;
    spyOn(transactionsOutboxService, 'saveQueue').and.returnValue(Promise.resolve());
    transactionsOutboxService.deleteOfflineExpense(0);
    expect(transactionsOutboxService.saveQueue).toHaveBeenCalledTimes(1);
    expect(transactionsOutboxService.queue.length).toEqual(0);
  });

  it('deleteBulkOfflineExpenses(): should delete bulk offline expenses', () => {
    spyOn(transactionsOutboxService, 'deleteOfflineExpense').and.returnValues(null);
    const pendingTransactions = [expenseList2[0]];
    const deleteExpenses = expenseList2;
    transactionsOutboxService.deleteBulkOfflineExpenses(pendingTransactions, deleteExpenses);
    expect(transactionsOutboxService.deleteOfflineExpense).toHaveBeenCalledTimes(2);
    expect(transactionsOutboxService.deleteOfflineExpense).toHaveBeenCalledWith(0);
    expect(transactionsOutboxService.deleteOfflineExpense).toHaveBeenCalledWith(-1);
  });

  describe('matchIfRequired(): ', () => {
    it('should return null when cccId is not present', async () => {
      const transactionId = 'txBphgnCHHeO';
      const res = await transactionsOutboxService.matchIfRequired(transactionId, null);
      expect(res).toBeNull();
    });

    it('should match with CCC expense and return null if cccId is present', async () => {
      const transactionId = 'txBphgnCHHeO';
      const cccId = 'ccceWauzF1A3oS';
      transactionService.matchCCCExpense.and.returnValue(of(null));
      const res = await transactionsOutboxService.matchIfRequired(transactionId, cccId);
      expect(res).toBeNull();
    });
  });

  describe('restoreQueue():', () => {
    it('should restore queue', fakeAsync(() => {
      const mockQueue = cloneDeep(outboxQueueData1);
      storageService.get.and.resolveTo(mockQueue);
      dateService.fixDates.and.returnValue(mockQueue[0].transaction);
      transactionsOutboxService.restoreQueue();
      tick(100);

      expect(storageService.get).toHaveBeenCalledWith('outbox');
      expect(storageService.get).toHaveBeenCalledWith('data_extraction_queue');
      expect(transactionsOutboxService.queue).toEqual(mockQueue);
      expect(dateService.fixDates).toHaveBeenCalledTimes(2);
      expect(dateService.fixDates).toHaveBeenCalledWith(mockQueue[0].transaction);
    }));

    it('should restore queue and return empty array if queue is not present', fakeAsync(() => {
      storageService.get.and.resolveTo(null);
      transactionsOutboxService.restoreQueue();
      tick(100);

      expect(storageService.get).toHaveBeenCalledWith('outbox');
      expect(storageService.get).toHaveBeenCalledWith('data_extraction_queue');
      expect(transactionsOutboxService.queue).toEqual([]);
      expect(dateService.fixDates).not.toHaveBeenCalled();
    }));
  });

  it('processDataExtractionEntry(): should process data extraction entry', fakeAsync(() => {
    const mockQueue = cloneDeep([...outboxQueueData1, ...outboxQueueData1, ...outboxQueueData1]);
    transactionsOutboxService.dataExtractionQueue = cloneDeep(mockQueue);
    transactionService.upsert.and.returnValue(of(editUnflattenedTransaction));
    spyOn(transactionsOutboxService, 'parseReceipt').and.returnValues(
      Promise.resolve(parsedReceiptData1),
      Promise.resolve({ data: undefined }),
      Promise.resolve(parsedReceiptData2)
    );
    spyOn(transactionsOutboxService, 'removeDataExtractionEntry').and.resolveTo();
    spyOn(transactionsOutboxService, 'addEntryAndSync').and.resolveTo(outboxQueueData1[0]);

    transactionsOutboxService.processDataExtractionEntry();
    tick(100);

    expect(transactionsOutboxService.parseReceipt).toHaveBeenCalledTimes(3);
    expect(transactionService.upsert).toHaveBeenCalledTimes(2);
    expect(transactionsOutboxService.removeDataExtractionEntry).toHaveBeenCalledTimes(3);
  }));
});
