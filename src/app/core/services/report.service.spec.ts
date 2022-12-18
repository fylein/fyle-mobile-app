import { TestBed } from '@angular/core/testing';

import { ReportService } from './report.service';
import { NetworkService } from './network.service';
import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { DateService } from './date.service';
import { DataTransformService } from './data-transform.service';
import { TransactionService } from './transaction.service';
import { StorageService } from './storage.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { DatePipe } from '@angular/common';
import { UserEventService } from './user-event.service';
import { PermissionsService } from './permissions.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { PAGINATION_SIZE } from 'src/app/constants';

import { apiAllReportsResponse, apiEouResponse } from '../test-data/reports.service.spec.data';

fdescribe('ReportService', () => {
  let reportService: ReportService;
  let dataTransformService: DataTransformService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let spenderPlatformApiService: jasmine.SpyObj<SpenderPlatformApiService>;
  let permissionsService: jasmine.SpyObj<PermissionsService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let launchDarklyService: LaunchDarklyService;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get', 'post']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkSpy', ['isOnline']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['clearCache']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventServive', ['clearTaskCache', 'onLogout']);
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformService', ['post']);
    const permissionsServiceSpy = jasmine.createSpyObj('PermissionService', ['getAllowedActions']);

    TestBed.configureTestingModule({
      providers: [
        ReportService,
        DatePipe,
        DataTransformService,
        LaunchDarklyService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiv2ServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
        {
          provide: SpenderPlatformApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
        {
          provide: PermissionsService,
          useValue: permissionsServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });

    reportService = TestBed.inject(ReportService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiv2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService);
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
    permissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
  });

  it('should be created', () => {
    expect(reportService).toBeTruthy();
  });

  it('should get all reports', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(dateService.fixDates(apiEouResponse)));
    const testParamsConfig = {
      offset: 0,
      limit: 200,
      queryParams: {
        rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
      },
    };
  });
});
