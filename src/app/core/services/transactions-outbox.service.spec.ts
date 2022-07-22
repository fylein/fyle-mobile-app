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

const dataExtractionQueueBulkFyleSample = [
  {
    transaction: {
      created_at: '2022-07-22T08:52:18.244Z',
      updated_at: '2022-07-22T08:52:18.244Z',
      id: 'txxpF3eoBNaK',
      source: 'MOBILE_DASHCAM_BULK',
      org_user_id: 'ouCI4UQ2G0K1',
      creator_id: 'ouCI4UQ2G0K1',
      txn_dt: '2022-07-22T06:30:00.000Z',
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: null,
      currency: null,
      admin_amount: null,
      user_amount: null,
      orig_amount: null,
      orig_currency: null,
      tax: null,
      tax_amount: null,
      tax_group_id: null,
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: null,
      vendor_id: null,
      platform_vendor_id: null,
      project_id: null,
      billable: null,
      skip_reimbursement: false,
      state: 'DRAFT',
      external_id: null,
      cost_center_id: null,
      payment_id: null,
      source_account_id: 'acconhTEKPHHR',
      org_category_id: 5380,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2022/07/T/47',
      split_group_id: 'txxpF3eoBNaK',
      split_group_user_amount: null,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: false,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Unspecified',
      mileage_calculated_distance: null,
      mileage_calculated_amount: null,
      mileage_vehicle_type: null,
      mileage_rate: null,
      mileage_is_round_trip: null,
      hotel_is_breakfast_provided: null,
      flight_journey_travel_class: null,
      flight_return_travel_class: null,
      train_travel_class: null,
      bus_travel_class: null,
      taxi_travel_class: null,
      per_diem_rate_id: null,
      activity_policy_pending: null,
      activity_details: null,
      custom_properties: null,
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
    dataUrls: [
      {
        thumbnail: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
        type: 'image',
        url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
      },
    ],
  },
  {
    transaction: {
      created_at: '2022-07-22T08:52:18.554Z',
      updated_at: '2022-07-22T08:52:18.554Z',
      id: 'txaFCMravH6E',
      source: 'MOBILE_DASHCAM_BULK',
      org_user_id: 'ouCI4UQ2G0K1',
      creator_id: 'ouCI4UQ2G0K1',
      txn_dt: '2022-07-22T06:30:00.000Z',
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: null,
      currency: null,
      admin_amount: null,
      user_amount: null,
      orig_amount: null,
      orig_currency: null,
      tax: null,
      tax_amount: null,
      tax_group_id: null,
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: null,
      vendor_id: null,
      platform_vendor_id: null,
      project_id: null,
      billable: null,
      skip_reimbursement: false,
      state: 'DRAFT',
      external_id: null,
      cost_center_id: null,
      payment_id: null,
      source_account_id: 'acconhTEKPHHR',
      org_category_id: 5380,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2022/07/T/48',
      split_group_id: 'txaFCMravH6E',
      split_group_user_amount: null,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: false,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Unspecified',
      mileage_calculated_distance: null,
      mileage_calculated_amount: null,
      mileage_vehicle_type: null,
      mileage_rate: null,
      mileage_is_round_trip: null,
      hotel_is_breakfast_provided: null,
      flight_journey_travel_class: null,
      flight_return_travel_class: null,
      train_travel_class: null,
      bus_travel_class: null,
      taxi_travel_class: null,
      per_diem_rate_id: null,
      activity_policy_pending: null,
      activity_details: null,
      custom_properties: null,
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
    dataUrls: [
      {
        thumbnail: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
        type: 'image',
        url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
      },
    ],
  },
  {
    transaction: {
      created_at: '2022-07-22T08:52:19.162Z',
      updated_at: '2022-07-22T08:52:19.162Z',
      id: 'txclGDPfFv9b',
      source: 'MOBILE_DASHCAM_BULK',
      org_user_id: 'ouCI4UQ2G0K1',
      creator_id: 'ouCI4UQ2G0K1',
      txn_dt: '2022-07-22T06:30:00.000Z',
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: null,
      currency: null,
      admin_amount: null,
      user_amount: null,
      orig_amount: null,
      orig_currency: null,
      tax: null,
      tax_amount: null,
      tax_group_id: null,
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: null,
      vendor_id: null,
      platform_vendor_id: null,
      project_id: null,
      billable: null,
      skip_reimbursement: false,
      state: 'DRAFT',
      external_id: null,
      cost_center_id: null,
      payment_id: null,
      source_account_id: 'acconhTEKPHHR',
      org_category_id: 5380,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2022/07/T/52',
      split_group_id: 'txclGDPfFv9b',
      split_group_user_amount: null,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: false,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Unspecified',
      mileage_calculated_distance: null,
      mileage_calculated_amount: null,
      mileage_vehicle_type: null,
      mileage_rate: null,
      mileage_is_round_trip: null,
      hotel_is_breakfast_provided: null,
      flight_journey_travel_class: null,
      flight_return_travel_class: null,
      train_travel_class: null,
      bus_travel_class: null,
      taxi_travel_class: null,
      per_diem_rate_id: null,
      activity_policy_pending: null,
      activity_details: null,
      custom_properties: null,
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
    dataUrls: [
      {
        thumbnail: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
        type: 'image',
        url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
      },
    ],
  },
  {
    transaction: {
      created_at: '2022-07-22T08:52:18.989Z',
      updated_at: '2022-07-22T08:52:18.989Z',
      id: 'txD3hsVZHrKr',
      source: 'MOBILE_DASHCAM_BULK',
      org_user_id: 'ouCI4UQ2G0K1',
      creator_id: 'ouCI4UQ2G0K1',
      txn_dt: '2022-07-22T06:30:00.000Z',
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: null,
      currency: null,
      admin_amount: null,
      user_amount: null,
      orig_amount: null,
      orig_currency: null,
      tax: null,
      tax_amount: null,
      tax_group_id: null,
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: null,
      vendor_id: null,
      platform_vendor_id: null,
      project_id: null,
      billable: null,
      skip_reimbursement: false,
      state: 'DRAFT',
      external_id: null,
      cost_center_id: null,
      payment_id: null,
      source_account_id: 'acconhTEKPHHR',
      org_category_id: 5380,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2022/07/T/49',
      split_group_id: 'txD3hsVZHrKr',
      split_group_user_amount: null,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: false,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Unspecified',
      mileage_calculated_distance: null,
      mileage_calculated_amount: null,
      mileage_vehicle_type: null,
      mileage_rate: null,
      mileage_is_round_trip: null,
      hotel_is_breakfast_provided: null,
      flight_journey_travel_class: null,
      flight_return_travel_class: null,
      train_travel_class: null,
      bus_travel_class: null,
      taxi_travel_class: null,
      per_diem_rate_id: null,
      activity_policy_pending: null,
      activity_details: null,
      custom_properties: null,
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
    dataUrls: [
      {
        thumbnail: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
        type: 'image',
        url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
      },
    ],
  },
  {
    transaction: {
      created_at: '2022-07-22T08:52:18.991Z',
      updated_at: '2022-07-22T08:52:18.991Z',
      id: 'txZvLH5TgNZ6',
      source: 'MOBILE_DASHCAM_BULK',
      org_user_id: 'ouCI4UQ2G0K1',
      creator_id: 'ouCI4UQ2G0K1',
      txn_dt: '2022-07-22T06:30:00.000Z',
      status_id: null,
      vendor: null,
      platform_vendor: null,
      category: null,
      amount: null,
      currency: null,
      admin_amount: null,
      user_amount: null,
      orig_amount: null,
      orig_currency: null,
      tax: null,
      tax_amount: null,
      tax_group_id: null,
      report_id: null,
      reported_at: null,
      num_files: 0,
      invoice_number: null,
      purpose: null,
      vendor_id: null,
      platform_vendor_id: null,
      project_id: null,
      billable: null,
      skip_reimbursement: false,
      state: 'DRAFT',
      external_id: null,
      cost_center_id: null,
      payment_id: null,
      source_account_id: 'acconhTEKPHHR',
      org_category_id: 5380,
      physical_bill: null,
      policy_state: null,
      manual_flag: null,
      policy_flag: null,
      expense_number: 'E/2022/07/T/50',
      split_group_id: 'txZvLH5TgNZ6',
      split_group_user_amount: null,
      extracted_data: null,
      proposed_exchange_rate: null,
      exchange_rate: null,
      exchange_rate_diff_percentage: null,
      mandatory_fields_present: false,
      user_reason_for_duplicate_expenses: null,
      distance: null,
      distance_unit: null,
      from_dt: null,
      to_dt: null,
      num_days: null,
      fyle_category: 'Unspecified',
      mileage_calculated_distance: null,
      mileage_calculated_amount: null,
      mileage_vehicle_type: null,
      mileage_rate: null,
      mileage_is_round_trip: null,
      hotel_is_breakfast_provided: null,
      flight_journey_travel_class: null,
      flight_return_travel_class: null,
      train_travel_class: null,
      bus_travel_class: null,
      taxi_travel_class: null,
      per_diem_rate_id: null,
      activity_policy_pending: null,
      activity_details: null,
      custom_properties: null,
      physical_bill_at: null,
      policy_amount: null,
      locations: [],
    },
    dataUrls: [
      {
        thumbnail: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
        type: 'image',
        url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
      },
    ],
  },
];

const sampleBulkFyleQueue = [
  {
    transaction: {
      source_account_id: 'acconhTEKPHHR',
      skip_reimbursement: true,
      source: 'MOBILE_DASHCAM_BULK',
      txn_dt: '2022-07-22T14:43:25.092Z',
      currency: 'INR',
    },
    dataUrls: [
      {
        thumbnail: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
        type: 'image',
        url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
      },
    ],
    comments: null,
    reportId: null,
    applyMagic: true,
  },
  {
    transaction: {
      source_account_id: 'acconhTEKPHHR',
      skip_reimbursement: true,
      source: 'MOBILE_DASHCAM_BULK',
      txn_dt: '2022-07-22T14:43:25.102Z',
      currency: 'INR',
    },
    dataUrls: [
      {
        thumbnail: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
        type: 'image',
        url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANS',
      },
    ],
    comments: null,
    reportId: null,
    applyMagic: true,
  },
];

fdescribe('TransactionsOutboxService', () => {
  let service: TransactionsOutboxService;
  let storageService: jasmine.SpyObj<StorageService>;

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

  it('should be able to save the data extraction queue', (done) => {
    service.dataExtractionQueue = dataExtractionQueueBulkFyleSample;
    service.saveDataExtractionQueue().then(() => {
      expect(storageService.set).toHaveBeenCalledWith('data_extraction_queue', dataExtractionQueueBulkFyleSample);
      done();
    });
  });

  it('can remove entries from data extraction queue', (done) => {
    service.dataExtractionQueue = dataExtractionQueueBulkFyleSample;
    let clonedQueue = cloneDeep(dataExtractionQueueBulkFyleSample);
    clonedQueue = clonedQueue.filter((c) => c.transaction.id !== dataExtractionQueueBulkFyleSample[0].transaction.id);
    service.removeDataExtractionEntry(dataExtractionQueueBulkFyleSample[0].transaction.id).then(() => {
      expect(storageService.set).toHaveBeenCalledWith('data_extraction_queue', clonedQueue);
      done();
    });
  });

  it('can save to transaction outbox', (done) => {
    service.queue = sampleBulkFyleQueue;
    service.saveQueue().then(() => {
      expect(storageService.set).toHaveBeenCalledWith('outbox', sampleBulkFyleQueue);
      done();
    });
  });

  it('can restore upload queue and data extraction queue from local storage', (done) => {
    storageService.get.withArgs('outbox').and.returnValue(Promise.resolve(sampleBulkFyleQueue));
    storageService.get
      .withArgs('data_extraction_queue')
      .and.returnValue(Promise.resolve(dataExtractionQueueBulkFyleSample));
    service.restoreQueue().then(() => {
      expect(service.queue).toEqual(sampleBulkFyleQueue);
      expect(service.dataExtractionQueue).toEqual(dataExtractionQueueBulkFyleSample);
      done();
    });
  });

  it('can set upload queue and data extraction queue to empty arrays if they are undefined', (done) => {
    service.queue = [];
    service.dataExtractionQueue = [];
    service.restoreQueue().then(() => {
      expect(service.queue).toEqual([]);
      expect(service.dataExtractionQueue).toEqual([]);
      done();
    });
  });
});
