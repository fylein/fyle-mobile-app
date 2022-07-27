import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { cloneDeep } from 'lodash';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { OfflineService } from './offline.service';
import { ReceiptService } from './receipt.service';
import { ReportService } from './report.service';
import { StatusService } from './status.service';
import { StorageService } from './storage.service';
import { TrackingService } from './tracking.service';
import { TransactionService } from './transaction.service';

import { TransactionsOutboxService } from './transactions-outbox.service';
import { transactionOutboxData } from './data-extraction-queue-bulk-fyle-sample';

fdescribe('TransactionsOutboxService', () => {
  let service: TransactionsOutboxService;
  let storageService: jasmine.SpyObj<StorageService>;
  let dataExtractionQueueBulkFyleSample = transactionOutboxData.dataQueue;
  let sampleBulkFyleQueue = transactionOutboxData.sampleBulkFyleQueue;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['fixDates']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['upsert', 'matchCCCExpense']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post', 'uploadUrl', 'uploadComplete', 'base64Upload']);
    const statusServiceSpy = jasmine.createSpyObj('StatusService', ['post']);
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['put', 'post']);
    const receiptServiceSpy = jasmine.createSpyObj('ReceiptService', ['linkReceiptWithExpense']);
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['addTransactions']);
    const offlineServiceSpy = jasmine.createSpyObj('OfflineService', ['getHomeCurrency']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'addToExistingReportAddEditExpense',
      'syncError',
    ]);

    dataExtractionQueueBulkFyleSample = transactionOutboxData.dataQueue;
    sampleBulkFyleQueue = transactionOutboxData.sampleBulkFyleQueue;

    TestBed.configureTestingModule({
      providers: [
        TransactionsOutboxService,
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: StatusService,
          useValue: statusServiceSpy,
        },
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
        {
          provide: ReceiptService,
          useValue: receiptServiceSpy,
        },
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: OfflineService,
          useValue: offlineServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
    });
    service = TestBed.inject(TransactionsOutboxService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('is able to determine if a file is a pdf or not', () => {
    expect(service.isPDF('pdf')).toBeTrue();
    expect(service.isPDF('application/pdf')).toBeTrue();
    expect(service.isPDF('asdasdasd')).toBeFalse();
  });

  it('can check if data extraction is pending for a particular expense', () => {
    service.dataExtractionQueue = dataExtractionQueueBulkFyleSample;

    expect(service.isDataExtractionPending('txxpF3eoBNaK')).toBeTrue();
    expect(service.isDataExtractionPending('txxpF3eosNaK')).toBeFalse();
  });

  it('should be able to save the data extraction queue', async () => {
    service.dataExtractionQueue = dataExtractionQueueBulkFyleSample;
    await service.saveDataExtractionQueue();
    expect(storageService.set).toHaveBeenCalledWith('data_extraction_queue', dataExtractionQueueBulkFyleSample);
  });

  it('can remove entries from data extraction queue', async () => {
    service.dataExtractionQueue = dataExtractionQueueBulkFyleSample;
    let clonedQueue = cloneDeep(dataExtractionQueueBulkFyleSample);
    clonedQueue = clonedQueue.filter((c) => c.transaction.id !== dataExtractionQueueBulkFyleSample[0].transaction.id);
    await service.removeDataExtractionEntry(dataExtractionQueueBulkFyleSample[0].transaction.id);
    expect(storageService.set).toHaveBeenCalledWith('data_extraction_queue', clonedQueue);
  });

  it('can save to transaction outbox', async () => {
    service.queue = sampleBulkFyleQueue;
    await service.saveQueue();
    expect(storageService.set).toHaveBeenCalledWith('outbox', sampleBulkFyleQueue);
  });

  it('can restore upload queue and data extraction queue from local storage', async () => {
    storageService.get.withArgs('outbox').and.returnValue(Promise.resolve(sampleBulkFyleQueue));
    storageService.get
      .withArgs('data_extraction_queue')
      .and.returnValue(Promise.resolve(dataExtractionQueueBulkFyleSample));
    await service.restoreQueue();
    expect(service.queue).toEqual(sampleBulkFyleQueue);
    expect(service.dataExtractionQueue).toEqual(dataExtractionQueueBulkFyleSample);
  });

  it('can set upload queue and data extraction queue to empty arrays if they are undefined', async () => {
    service.queue = [];
    service.dataExtractionQueue = [];
    await service.restoreQueue();
    expect(service.queue).toEqual([]);
    expect(service.dataExtractionQueue).toEqual([]);
  });

  it('can set root properly', () => {
    service.setRoot('https://app.fylehq.com');
    expect(service.ROOT_ENDPOINT).toEqual('https://app.fylehq.com');
  });

  it('should be able to add data extraction entry', async () => {
    service.queue = [];
    service.dataExtractionQueue = [];
    const transaction = {
      source_account_id: 'acconhTEKPHHR',
      skip_reimbursement: true,
      source: 'MOBILE_DASHCAM_BULK',
      txn_dt: '2022-07-22T14:43:25.102Z',
      currency: 'INR',
    };

    const dataUrls = [
      {
        thumbnail: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
        type: 'image',
        url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
      },
    ];
    await service.addDataExtractionEntry(transaction, dataUrls);
    expect(storageService.set).toHaveBeenCalledWith('data_extraction_queue', [
      {
        transaction,
        dataUrls,
      },
    ]);
  });
});
