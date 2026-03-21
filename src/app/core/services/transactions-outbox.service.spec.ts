import { HttpErrorResponse } from '@angular/common/http';
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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PlatformApiError } from '../models/platform/platform-api-error.model';
import { CurrencyService } from './currency.service';
import { ParsedReceipt } from '../models/parsed_receipt.model';
import { throwError } from 'rxjs';

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
  let currencyService: jasmine.SpyObj<CurrencyService>;
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
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['post', 'syncError']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);

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
        { provide: CurrencyService, useValue: currencyServiceSpy },
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
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
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

  describe('parseReceipt():', () => {
    const extractUrl = `${rootUrl}/data_extractor/extract`;
    const mockParsedReceipt: ParsedReceipt = {
      data: {
        amount: 100,
        currency: 'USD',
        date: new Date('2024-01-15'),
        vendor_name: 'Test Vendor',
      },
    };

    it('should POST to data_extractor/extract with 000.jpeg when fileType is not pdf', fakeAsync(async () => {
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      const data = 'base64encodedImage';
      const promise = transactionsOutboxService.parseReceipt(data);

      tick();
      const req = httpMock.expectOne(extractUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.files[0].name).toBe('000.jpeg');
      expect(req.request.body.files[0].content).toBe(data);
      expect(req.request.body.suggested_currency).toBe('USD');
      req.flush(mockParsedReceipt);

      const result = await promise;
      expect(result).toEqual(mockParsedReceipt);
    }));

    it('should POST with 000.pdf when fileType is pdf', fakeAsync(async () => {
      currencyService.getHomeCurrency.and.returnValue(of('INR'));
      const data = 'base64encodedPdf';
      const promise = transactionsOutboxService.parseReceipt(data, 'pdf');

      tick();
      const req = httpMock.expectOne(extractUrl);
      expect(req.request.body.files[0].name).toBe('000.pdf');
      expect(req.request.body.files[0].content).toBe(data);
      expect(req.request.body.suggested_currency).toBe('INR');
      req.flush(mockParsedReceipt);

      const result = await promise;
      expect(result).toEqual(mockParsedReceipt);
    }));

    it('should include suggested_currency from getHomeCurrency in request when getHomeCurrency succeeds', fakeAsync(async () => {
      currencyService.getHomeCurrency.and.returnValue(of('EUR'));
      const promise = transactionsOutboxService.parseReceipt('data');

      tick();
      const req = httpMock.expectOne(extractUrl);
      expect(req.request.body.suggested_currency).toBe('EUR');
      req.flush(mockParsedReceipt);

      await promise;
    }));

    it('should still POST and resolve when getHomeCurrency fails (suggested_currency null)', fakeAsync(async () => {
      currencyService.getHomeCurrency.and.returnValue(throwError(() => new Error('currency error')));
      const promise = transactionsOutboxService.parseReceipt('data');

      tick();
      const req = httpMock.expectOne(extractUrl);
      expect(req.request.body.suggested_currency).toBeNull();
      req.flush(mockParsedReceipt);

      const result = await promise;
      expect(result).toEqual(mockParsedReceipt);
    }));

    it('should resolve with response as ParsedReceipt', fakeAsync(async () => {
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      const promise = transactionsOutboxService.parseReceipt('x');

      tick();
      const req = httpMock.expectOne(extractUrl);
      req.flush(mockParsedReceipt);

      const result = await promise;
      expect(result).toEqual(mockParsedReceipt);
      expect(result.data.amount).toBe(100);
      expect(result.data.vendor_name).toBe('Test Vendor');
    }));
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

  describe('handleSyncError():', () => {
    it('should call trackingService.syncError with error object and errorMessage when error has PlatformApiError shape with data', () => {
      const apiError: PlatformApiError<{ code: string }> = {
        data: { code: 'VALIDATION_ERROR' },
        error: 'Bad Request',
        message: 'Invalid payload',
      };
      const err = new HttpErrorResponse({
        error: apiError,
        status: 400,
        statusText: 'Bad Request',
        url: `${rootUrl}/api/expenses`,
      });

      (transactionsOutboxService as any).handleSyncError(err);

      expect(trackingService.syncError).toHaveBeenCalledOnceWith({
        error: {
          data: { code: 'VALIDATION_ERROR' },
          message: 'Invalid payload',
          error: 'Bad Request',
        },
        errorMessage: err.message,
      });
    });

    it('should call trackingService.syncError with undefined data when error has no data', () => {
      const apiError = { error: 'Forbidden', message: 'Access denied' };
      const err = new HttpErrorResponse({
        error: apiError,
        status: 403,
        statusText: 'Forbidden',
        url: `${rootUrl}/api/expenses`,
      });

      (transactionsOutboxService as any).handleSyncError(err);

      expect(trackingService.syncError).toHaveBeenCalledOnceWith({
        error: {
          data: undefined,
          message: 'Access denied',
          error: 'Forbidden',
        },
        errorMessage: err.message,
      });
    });

    it('should call trackingService.syncError with undefined error fields when err.error is null', () => {
      const err = new HttpErrorResponse({
        error: null,
        status: 500,
        statusText: 'Internal Server Error',
        url: `${rootUrl}/api/expenses`,
      });

      (transactionsOutboxService as any).handleSyncError(err);

      expect(trackingService.syncError).toHaveBeenCalledOnceWith({
        error: {
          data: undefined,
          message: undefined,
          error: undefined,
        },
        errorMessage: err.message,
      });
    });
  });
});
