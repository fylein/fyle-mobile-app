import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { AccountsService } from './accounts.service';
import { ApiService } from './api.service';
import { DataTransformService } from './data-transform.service';

const account1 = {
  acc_id: 'accfziaxbGFVW',
  acc_created_at: '2018-10-08T07:04:42.753Z',
  acc_updated_at: '2022-04-27T08:57:52.221Z',
  acc_name: 'Personal Account',
  acc_type: 'PERSONAL_ACCOUNT',
  acc_currency: 'INR',
  acc_target_balance_amount: 0,
  acc_current_balance_amount: 0e-13,
  acc_tentative_balance_amount: -5620222.5860540000395,
  acc_category: null,
  ou_id: 'ouCI4UQ2G0K1',
  ou_org_id: 'orrjqbDbeP9p',
  us_email: 'ajain@fyle.in',
  us_full_name: 'abhishek',
  org_id: null,
  org_domain: null,
  advance_purpose: null,
  advance_number: null,
  orig_currency: null,
  currency: null,
  orig_amount: null,
  amount: null,
  advance_id: null,
};

const unflattenedAccount1 = {
  acc: {
    id: 'accfziaxbGFVW',
    created_at: '2018-10-08T07:04:42.753Z',
    updated_at: '2022-04-27T08:57:52.221Z',
    name: 'Personal Account',
    type: 'PERSONAL_ACCOUNT',
    currency: 'INR',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: -5620222.586054,
    category: null,
  },
  ou: {
    id: 'ouCI4UQ2G0K1',
    org_id: 'orrjqbDbeP9p',
  },
  us: { email: 'ajain@fyle.in', full_name: 'abhishek' },
  org: { id: null, domain: null },
  advance: {
    purpose: null,
    // eslint-disable-next-line id-blacklist
    number: null,
    id: null,
  },
  orig: { currency: null, amount: null },
  currency: null,
  amount: null,
};

const account2 = {
  acc_id: 'acct0IxPgGvLa',
  acc_created_at: '2018-11-05T18:35:59.912Z',
  acc_updated_at: '2021-09-29T19:35:23.965Z',
  acc_name: 'Advance Account',
  acc_type: 'PERSONAL_ADVANCE_ACCOUNT',
  acc_currency: 'INR',
  acc_target_balance_amount: 0,
  acc_current_balance_amount: 0.0,
  acc_tentative_balance_amount: 0.0,
  acc_category: null,
  ou_id: 'ouCI4UQ2G0K1',
  ou_org_id: 'orrjqbDbeP9p',
  us_email: 'ajain@fyle.in',
  us_full_name: 'abhishek',
  org_id: null,
  org_domain: null,
  advance_purpose: 'ddsfd',
  advance_number: 'A/2020/03/T/2',
  orig_currency: null,
  currency: 'INR',
  orig_amount: null,
  amount: 800000,
  advance_id: 'advT96eCXZtCo',
};

const unflattenedAccount2 = {
  acc: {
    id: 'acct0IxPgGvLa',
    created_at: '2018-11-05T18:35:59.912Z',
    updated_at: '2021-09-29T19:35:23.965Z',
    name: 'Advance Account',
    type: 'PERSONAL_ADVANCE_ACCOUNT',
    currency: 'INR',
    target_balance_amount: 0,
    current_balance_amount: 0,
    tentative_balance_amount: 0,
    category: null,
  },
  ou: { id: 'ouCI4UQ2G0K1', org_id: 'orrjqbDbeP9p' },
  us: { email: 'ajain@fyle.in', full_name: 'abhishek' },
  org: { id: null, domain: null },
  // eslint-disable-next-line id-blacklist
  advance: { purpose: 'ddsfd', number: 'A/2020/03/T/2', id: 'advT96eCXZtCo' },
  orig: { currency: null, amount: null },
  currency: 'INR',
  amount: 800000,
};

const accountsCallResponse1 = [account1, account2];

describe('AccountsService', () => {
  let accountsService: AccountsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let fyCurrencyPipe: jasmine.SpyObj<FyCurrencyPipe>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);

    TestBed.configureTestingModule({
      providers: [
        AccountsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
        {
          provide: FyCurrencyPipe,
          useValue: fyCurrencyPipeSpy,
        },
      ],
    });

    accountsService = TestBed.inject(AccountsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    fyCurrencyPipe = TestBed.inject(FyCurrencyPipe) as jasmine.SpyObj<FyCurrencyPipe>;
  });

  it('should be created', () => {
    expect(accountsService).toBeTruthy();
  });

  it('should be able to fetch data from api in proper format', (done) => {
    apiService.get.and.returnValue(of(accountsCallResponse1));
    dataTransformService.unflatten.withArgs(account1).and.returnValue(unflattenedAccount1);
    dataTransformService.unflatten.withArgs(account2).and.returnValue(unflattenedAccount2);

    accountsService.getEMyAccounts().subscribe((res) => {
      expect(res[0]).toEqual(unflattenedAccount1);
      expect(res[1]).toEqual(unflattenedAccount2);
      expect(res.length === 2);
      done();
    });
  });
});
