import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { expenseList2 } from '../mock-data/expense.data';
import { txnData2 } from '../mock-data/transaction.data';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
import { StatusService } from './status.service';
import { StorageService } from './storage.service';
import { TrackingService } from './tracking.service';
import { TransactionService } from './transaction.service';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { TransactionsOutboxService } from './transactions-outbox.service';
import { outboxQueueData1 } from '../mock-data/outbox-queue.data';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { SpenderReportsService } from './platform/v1/spender/reports.service';
import { parsedResponseData1 } from '../mock-data/parsed-response.data';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('TransactionsOutboxService', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let transactionsOutboxService: TransactionsOutboxService;
  let storageService: jasmine.SpyObj<StorageService>;
  let dateService: jasmine.SpyObj<DateService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let fileService: jasmine.SpyObj<FileService>;
  let statusService: jasmine.SpyObj<StatusService>;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  const singleCaptureCountInSession = 0;
  let httpMock: HttpTestingController;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['getUTCDate', 'fixDates']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['post', 'matchCCCExpense', 'upsert']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpensesById']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post', 'uploadUrl', 'uploadComplete']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['post']);
    const spenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', ['post']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['post']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        TransactionsOutboxService,
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: StatusService, useValue: statusServiceSpy },
        { provide: SpenderReportsService, useValue: spenderReportsServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: PlatformEmployeeSettingsService, useValue: platformEmployeeSettingsServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    transactionsOutboxService = TestBed.inject(TransactionsOutboxService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    httpMock = TestBed.inject(HttpTestingController);
    httpTestingController = TestBed.inject(HttpTestingController);
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

  it('saveQueue(): should save queue', () => {
    const mockQueue = cloneDeep(outboxQueueData1);
    transactionsOutboxService.queue = mockQueue;
    storageService.set.and.resolveTo(null);
    transactionsOutboxService.saveQueue();
    expect(storageService.set).toHaveBeenCalledOnceWith('outbox', transactionsOutboxService.queue);
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
    spyOn(transactionsOutboxService, 'saveQueue').and.resolveTo();
    transactionsOutboxService.removeEntry(outboxQueueData1[0]);
    expect(transactionsOutboxService.saveQueue).toHaveBeenCalledTimes(1);
    expect(transactionsOutboxService.queue.length).toEqual(0);
  });

  it('addEntry(): should add entry to queue', () => {
    spyOn(transactionsOutboxService, 'saveQueue').and.resolveTo();
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
      spyOn(transactionsOutboxService, 'addEntry').and.resolveTo();
      spyOn(transactionsOutboxService, 'syncEntry').and.resolveTo(outboxQueueData1[0]);
    });

    it('should add entry to queue and sync', () => {
      transactionsOutboxService.addEntryAndSync(
        txnData2,
        [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' }],
        null,
      );
      expect(transactionsOutboxService.addEntry).toHaveBeenCalledOnceWith(
        txnData2,
        [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' }],
        null,
      );
      expect(transactionsOutboxService.syncEntry).toHaveBeenCalledOnceWith(outboxQueueData1[0]);
      expect(transactionsOutboxService.queue.length).toEqual(0);
    });

    it('should add entry to queue and sync if applyMagic params is not provided', () => {
      transactionsOutboxService.addEntryAndSync(
        txnData2,
        [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' }],
        null,
      );
      expect(transactionsOutboxService.addEntry).toHaveBeenCalledOnceWith(
        txnData2,
        [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg', type: 'image/jpeg' }],
        null,
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
      transactionsOutboxService.queue.map((entry) => ({ ...entry.transaction, dataUrls: entry.dataUrls })),
    );
  });

  it('deleteOfflineExpense(): should delete offline expense', () => {
    const mockQueue = cloneDeep(outboxQueueData1);
    transactionsOutboxService.queue = mockQueue;
    spyOn(transactionsOutboxService, 'saveQueue').and.resolveTo();
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
      expect(transactionsOutboxService.queue).toEqual(mockQueue);
      expect(dateService.fixDates).toHaveBeenCalledTimes(1);
      expect(dateService.fixDates).toHaveBeenCalledWith(mockQueue[0].transaction);
    }));

    it('should restore queue and return empty array if queue is not present', fakeAsync(() => {
      storageService.get.and.resolveTo(null);
      transactionsOutboxService.restoreQueue();
      tick(100);

      expect(storageService.get).toHaveBeenCalledWith('outbox');
      expect(transactionsOutboxService.queue).toEqual([]);
      expect(dateService.fixDates).not.toHaveBeenCalled();
    }));
  });

  describe('getExpenseDate():', () => {
    it('should return transaction date if txn_dt is present', () => {
      const txnDate = new Date('2023-02-15T06:30:00.000Z');
      const mockQueue = cloneDeep(outboxQueueData1[0]);
      mockQueue.transaction.txn_dt = txnDate;
      const res = transactionsOutboxService.getExpenseDate(mockQueue, parsedResponseData1);
      expect(res).toEqual(txnDate);
    });

    it('should return extracted date if txn_dt is not present', () => {
      const mockQueue = cloneDeep(outboxQueueData1[0]);
      mockQueue.transaction.txn_dt = null;
      const res = transactionsOutboxService.getExpenseDate(mockQueue, parsedResponseData1);
      expect(res).toEqual(parsedResponseData1.date);
    });

    it('should return today date if txn_dt and extracted date is not present', () => {
      const mockQueue = cloneDeep(outboxQueueData1[0]);
      mockQueue.transaction.txn_dt = null;
      const mockParsedResponse = cloneDeep(parsedResponseData1);
      mockParsedResponse.date = null;
      const res = transactionsOutboxService.getExpenseDate(mockQueue, mockParsedResponse);
      const expectedDate = new Date();
      expect(res.getTime()).toEqual(expectedDate.getTime());
    });
  });
});
