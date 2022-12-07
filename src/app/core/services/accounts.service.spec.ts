import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { AccountType } from '../enums/account-type.enum';
import {
  account1Data,
  account2Data,
  paymentModeDataAdvance,
  paymentModeDataCCC,
  paymentModeDataCCCWithoutAccountProperty,
  paymentModeDataMultipleAdvance,
  paymentModeDataMultipleAdvWithoutOrigAmt,
  paymentModeDataPersonal,
  paymentModesData,
  unflattenedAccount1Data,
  unflattenedAccount2Data,
  unflattenedAccount3Data,
  unflattenedAccount4Data,
  unflattenedTransactionCCC,
  unflattenedTransactionPersonal,
  unflattenedTxnWithoutSourceAccountIdData,
} from '../test-data/accounts.service.spec.data';
import { AccountsService } from './accounts.service';
import { ApiService } from './api.service';
import { DataTransformService } from './data-transform.service';

const account1 = account1Data;

const unflattenedAccount1 = unflattenedAccount1Data;

const account2 = account2Data;

const unflattenedAccount2 = unflattenedAccount2Data;

const accountsCallResponse1 = [account1, account2];

const etxnCCC = unflattenedTransactionCCC;

const paymentModeCCC = paymentModeDataCCC;

const etxnPersonal = unflattenedTransactionPersonal;

const paymentModePersonal = paymentModeDataPersonal;

const paymentModeAdvance = paymentModeDataAdvance;

const paymentModes = paymentModesData;

const unflattenedTxnWithoutSourceAccountId = unflattenedTxnWithoutSourceAccountIdData;

const paymentModeDataCCCWithoutAccProperty = paymentModeDataCCCWithoutAccountProperty;

const paymentModeMultipleAdvance = paymentModeDataMultipleAdvance;

const unflattenedAccount3 = unflattenedAccount3Data;

const paymentModeMultipleAdvWithoutOrigAmt = paymentModeDataMultipleAdvWithoutOrigAmt;

const unflattenedAccount4 = unflattenedAccount4Data;

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

  it('should be able to check if etxn has same payment mode', () => {
    expect(accountsService.checkIfEtxnHasSamePaymentMode(etxnCCC, paymentModeCCC)).toEqual(true);
  });

  it('should be able to check if etxn has same personal account payment mode', () => {
    expect(accountsService.checkIfEtxnHasSamePaymentMode(etxnPersonal, paymentModePersonal)).toEqual(false);
  });

  it('should be able to get etxn selected payment mode with source account id', () => {
    expect(accountsService.getEtxnSelectedPaymentMode(unflattenedTransactionCCC, paymentModes)).toEqual(paymentModeCCC);
  });

  it('should be able to get etxn selected payment mode null without source account id', () => {
    expect(accountsService.getEtxnSelectedPaymentMode(unflattenedTxnWithoutSourceAccountId, paymentModes)).toEqual(
      null
    );
  });

  it('should be able to get account type from payment mode', () => {
    expect(accountsService.getAccountTypeFromPaymentMode(paymentModeCCC)).toEqual(AccountType.CCC);
  });

  it('should be able to get company account type from payment mode', () => {
    expect(accountsService.getAccountTypeFromPaymentMode(paymentModeDataPersonal)).toEqual(AccountType.COMPANY);
  });

  it('should be able to set account properties', () => {
    expect(accountsService.setAccountProperties(paymentModeDataCCCWithoutAccProperty, AccountType.CCC, false)).toEqual(
      paymentModeDataCCC
    );
  });

  it('should be able to set account properties for advance account', () => {
    expect(accountsService.setAccountProperties(unflattenedAccount2Data, AccountType.ADVANCE, false)).toEqual(
      paymentModeAdvance
    );
  });

  it('should be able to set account properties for multiple advance account', () => {
    expect(accountsService.setAccountProperties(unflattenedAccount3, AccountType.ADVANCE, true)).toEqual(
      paymentModeMultipleAdvance
    );
  });

  it('should be able to set account properties for multiple advance account as default without account', () => {
    expect(accountsService.setAccountProperties(null, AccountType.ADVANCE, true)).toEqual(null);
  });

  it('should be able to set account properties for multiple advance account as default without orig amount', () => {
    expect(accountsService.setAccountProperties(unflattenedAccount4, AccountType.ADVANCE, true)).toEqual(
      paymentModeMultipleAdvWithoutOrigAmt
    );
  });
});
