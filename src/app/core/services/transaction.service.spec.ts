import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PAGINATION_SIZE } from 'src/app/constants';
import { etxncData, expenseDataFlagged, expenseDataUnflagged } from '../mock-data/expense.data';
import { AccountsService } from './accounts.service';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { NetworkService } from './network.service';
import { OrgSettingsService } from './org-settings.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { PaymentModesService } from './payment-modes.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { StorageService } from './storage.service';
import { TimezoneService } from './timezone.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';
import { UtilityService } from './utility.service';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let networkService: jasmine.SpyObj<NetworkService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let authService: jasmine.SpyObj<AuthService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: jasmine.SpyObj<DateService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let spenderPlatformApiService: jasmine.SpyObj<SpenderPlatformApiService>;
  let fileService: jasmine.SpyObj<FileService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let paymentModesService: jasmine.SpyObj<PaymentModesService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let accountsService: jasmine.SpyObj<AccountsService>;

  beforeEach(() => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['isOnline']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'set']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', [
      'fixDates',
      'fixDatesV2',
      'getThisMonthRange',
      'getThisWeekRange',
      'getLastMonthRange',
    ]);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const timezoneServiceSpy = jasmine.createSpyObj('TimezoneService', [
      'convertAllDatesToProperLocale',
      'convertToUtc',
    ]);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['discardRedundantCharacters']);
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformApiService', ['post']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['clearTaskCache']);
    const paymentModesServiceSpy = jasmine.createSpyObj('PaymentModesService', ['getDefaultAccount']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const accountsServiceSpy = jasmine.createSpyObj('AccountsService', ['getEMyAccounts']);

    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiV2ServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: PaymentModesService,
          useValue: paymentModesServiceSpy,
        },
        {
          provide: SpenderPlatformApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: TimezoneService,
          useValue: timezoneServiceSpy,
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: AccountsService,
          useValue: accountsServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });

    transactionService = TestBed.inject(TransactionService);
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    timezoneService = TestBed.inject(TimezoneService) as jasmine.SpyObj<TimezoneService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
  });

  it('should be created', () => {
    expect(transactionService).toBeTruthy();
  });

  it('clearCache(): should clear cache', (done) => {
    transactionService.clearCache().subscribe((res) => {
      expect(res).toBeFalsy();
      done();
    });
  });

  it('manualFlag(): should manually flag a transaction', (done) => {
    const transactionID = 'tx5fBcPBAxLv';
    apiService.post.and.returnValue(of(expenseDataFlagged));

    transactionService.manualFlag(transactionID).subscribe((res) => {
      expect(res).toEqual(expenseDataFlagged);
      expect(apiService.post).toHaveBeenCalledWith('/transactions/' + transactionID + '/manual_flag');
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('manualUnflag(): should manually unflag a transaction', (done) => {
    const transactionID = 'tx5fBcPBAxLv';
    apiService.post.and.returnValue(of(expenseDataUnflagged));

    transactionService.manualUnflag(transactionID).subscribe((res) => {
      expect(res).toEqual(expenseDataUnflagged);
      expect(apiService.post).toHaveBeenCalledWith('/transactions/' + transactionID + '/manual_unflag');
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('delete(): should delete a transaction', (done) => {
    const transactionID = 'tx5fBcPBAxLv';
    apiService.delete.and.returnValue(of(expenseDataUnflagged));

    transactionService.delete(transactionID).subscribe((res) => {
      expect(res).toEqual(expenseDataUnflagged);
      expect(apiService.delete).toHaveBeenCalledWith('/transactions/' + transactionID);
      expect(apiService.delete).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getETxnc(): should get list of extended transactions', (done) => {
    apiV2Service.get.and.returnValue(of(etxncData));

    const params = {
      offset: 0,
      limit: 1,
      params: {
        tx_org_user_id: 'eq.ouX8dwsbLCLv',
        tx_report_id: 'eq.rpFvmTgyeBjN',
        order: 'tx_txn_dt.desc,tx_id.desc',
      },
    };

    transactionService.getETxnc(params).subscribe((res) => {
      expect(res).toEqual(etxncData.data);
      expect(apiV2Service.get).toHaveBeenCalledWith('/expenses', {
        ...params,
      });
      expect(apiV2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getExpenseV2(): should get expense from ID', (done) => {
    apiV2Service.get.and.returnValue(of(etxncData));

    const transactionID = 'tx5fBcPBAxLv';

    transactionService.getExpenseV2(transactionID).subscribe((res) => {
      expect(res).toEqual(etxncData.data[0]);
      expect(apiV2Service.get).toHaveBeenCalledWith('/expenses', {
        params: {
          tx_id: `eq.${transactionID}`,
        },
      });
      expect(apiV2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getDefaultVehicleType(): should get default vehicle type', (done) => {
    const defaultVehicleType = 'two_wheeler';
    storageService.get.and.returnValue(new Promise((resolve) => resolve(defaultVehicleType)));

    transactionService.getDefaultVehicleType().subscribe((res) => {
      expect(res).toEqual(defaultVehicleType);
      done();
    });
  });

  it('getTransactionByExpenseNumber(): should get transaction by expense number', (done) => {
    const expenseNumber = 'E/2022/11/T/62';
    apiService.get.and.returnValue(of(expenseDataUnflagged));

    transactionService.getTransactionByExpenseNumber(expenseNumber).subscribe((res) => {
      expect(res).toEqual(expenseDataUnflagged);
      expect(apiService.get).toHaveBeenCalledWith('/transactions', {
        params: {
          expense_number: expenseNumber,
        },
      });
      expect(apiService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
