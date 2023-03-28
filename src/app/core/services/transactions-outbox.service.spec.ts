import { HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { noop } from 'lodash';
import { from } from 'rxjs';
import { expenseList2 } from '../mock-data/expense.data';
import { fileObjectData1 } from '../mock-data/file-object.data';
import { txnData2 } from '../mock-data/transaction.data';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { ReportService } from './report.service';
import { StatusService } from './status.service';
import { StorageService } from './storage.service';
import { TrackingService } from './tracking.service';
import { TransactionService } from './transaction.service';

import { TransactionsOutboxService } from './transactions-outbox.service';

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

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['getUTCDate']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['post', 'matchCCCExpense']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['post']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['post']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['post']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['post']);

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
    transactionsOutboxService.queue = ['txdzGV1TZEg3'];
    storageService.set.and.returnValue(Promise.resolve(null));
    transactionsOutboxService.saveQueue();
    expect(storageService.set).toHaveBeenCalledOnceWith('outbox', transactionsOutboxService.queue);
  });

  it('saveDataExtractionQueue(): should save data extraction queue', () => {
    transactionsOutboxService.dataExtractionQueue = ['txdzGV1TZEg3'];
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
    const txnId = 'txNVtsqF8Siq';
    it('should return true if data extraction is pending', () => {
      transactionsOutboxService.dataExtractionQueue = [{ transaction: txnData2 }];
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
    const entry = {
      transaction: txnData2,
      dataUrls: fileObjectData1,
    };
    transactionsOutboxService.dataExtractionQueue = [entry];
    spyOn(transactionsOutboxService, 'saveDataExtractionQueue').and.returnValue(Promise.resolve());
    await transactionsOutboxService.removeDataExtractionEntry(txnData2, fileObjectData1);
    expect(transactionsOutboxService.saveDataExtractionQueue).toHaveBeenCalledTimes(1);
    expect(transactionsOutboxService.dataExtractionQueue.length).toEqual(0);
  });

  it('addDataExtractionEntry():', () => {
    spyOn(transactionsOutboxService, 'saveDataExtractionQueue').and.returnValue(Promise.resolve());
    transactionsOutboxService.addDataExtractionEntry(txnData2, fileObjectData1);
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
    const entry = {
      transaction: txnData2,
      dataUrls: fileObjectData1,
    };
    transactionsOutboxService.queue = [entry];
    spyOn(transactionsOutboxService, 'saveQueue').and.returnValue(Promise.resolve());
    transactionsOutboxService.removeEntry(entry);
    expect(transactionsOutboxService.saveQueue).toHaveBeenCalledTimes(1);
    expect(transactionsOutboxService.queue.length).toEqual(0);
  });

  it('addEntry(): should add entry to queue', () => {
    spyOn(transactionsOutboxService, 'saveQueue').and.returnValue(Promise.resolve());
    transactionsOutboxService.addEntry(txnData2, fileObjectData1, false);
    expect(transactionsOutboxService.queue.length).toEqual(1);
    expect(transactionsOutboxService.saveQueue).toHaveBeenCalledTimes(1);
  });

  it('addEntryAndSync(): should add entry to queue and sync', () => {
    const entry = {
      transaction: txnData2,
      dataUrls: fileObjectData1,
    };
    transactionsOutboxService.queue = [entry];
    spyOn(transactionsOutboxService, 'addEntry').and.returnValue(Promise.resolve());
    spyOn(transactionsOutboxService, 'syncEntry').and.returnValue(Promise.resolve());
    transactionsOutboxService.addEntryAndSync(txnData2, fileObjectData1, null, null, false);
    expect(transactionsOutboxService.addEntry).toHaveBeenCalledOnceWith(txnData2, fileObjectData1, null, null, false);
    expect(transactionsOutboxService.syncEntry).toHaveBeenCalledOnceWith(entry);
    expect(transactionsOutboxService.queue.length).toEqual(0);
  });

  it('getPendingTransactions(): should return pending transactions', () => {
    const entry = {
      transaction: txnData2,
      dataUrls: fileObjectData1,
    };
    transactionsOutboxService.queue = [entry];
    const res = transactionsOutboxService.getPendingTransactions();
    expect(res.length).toEqual(1);
    expect(res).toEqual(
      transactionsOutboxService.queue.map((entry) => ({ ...entry.transaction, dataUrls: entry.dataUrls }))
    );
  });

  it('deleteOfflineExpense(): should delete offline expense', () => {
    const entry = {
      transaction: txnData2,
      dataUrls: fileObjectData1,
    };
    transactionsOutboxService.queue = [entry];
    spyOn(transactionsOutboxService, 'saveQueue').and.returnValue(Promise.resolve());
    transactionsOutboxService.deleteOfflineExpense(0);
    expect(transactionsOutboxService.saveQueue).toHaveBeenCalledTimes(1);
    expect(transactionsOutboxService.queue.length).toEqual(0);
  });

  it('deleteBulkOfflineExpenses(): should delete bulk offline expenses', () => {
    spyOn(transactionsOutboxService, 'deleteOfflineExpense').withArgs(0).and.returnValue(null);
    const pendingTransactions = [expenseList2[0]];
    const deleteExpenses = [expenseList2[0]];
    transactionsOutboxService.deleteBulkOfflineExpenses(pendingTransactions, deleteExpenses);
    expect(transactionsOutboxService.deleteOfflineExpense).toHaveBeenCalledOnceWith(0);
  });

  describe('matchIfRequired(): ', () => {
    it('should return null when cccId is not present', async () => {
      const transactionId = 'txBphgnCHHeO';
      const res = await transactionsOutboxService.matchIfRequired(transactionId, null);
      expect(res).toBeNull();
    });
  });
});
