import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs/internal/observable/of';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { AccountType } from '../enums/account-type.enum';
import {
  account1Data,
  account2Data,
  extnObjData,
  extnObjWithSourceData,
  multiplePaymentModesData,
  multiplePaymentModesWithCompanyAccData,
  multiplePaymentModesWithoutAdvData,
  multiplePaymentModesWithoutCCCAccData,
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

const multiplePaymentModes = multiplePaymentModesData;

const extnObj = extnObjData;

const multiplePaymentModesWithCompanyAcc = multiplePaymentModesWithCompanyAccData;

const multiplePaymentModesWithoutAdv = multiplePaymentModesWithoutAdvData;

const multiplePaymentModesWithoutCCCAcc = multiplePaymentModesWithoutCCCAccData;

const extnObjWithSource = extnObjWithSourceData;

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
    fyCurrencyPipe.transform.and.returnValue('$223,146,386.93');
    expect(accountsService.setAccountProperties(unflattenedAccount2Data, AccountType.ADVANCE, false)).toEqual(
      paymentModeAdvance
    );
    expect(fyCurrencyPipe.transform).toHaveBeenCalledWith(223146386.93, 'USD');
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

  it('should be able to filter the accounts with sufficient balance', () => {
    expect(accountsService.filterAccountsWithSufficientBalance(multiplePaymentModes, true)).toEqual(
      multiplePaymentModes
    );
  });

  it('should be able to get allowed accounts', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(multiplePaymentModesWithoutAdv, allowedPaymentModes, false, extnObj, false)
    ).toEqual(multiplePaymentModesWithCompanyAcc);
  });

  it('should be able to get allowed accounts with source in etxn obj', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(
        multiplePaymentModesWithoutAdv,
        allowedPaymentModes,
        false,
        extnObjWithSource,
        false
      )
    ).toEqual(multiplePaymentModesWithCompanyAcc);
  });

  it('should be able to get allowed accounts without passing isMileageOrPerDiem param', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(multiplePaymentModesWithoutAdv, allowedPaymentModes, false, extnObj)
    ).toEqual(multiplePaymentModesWithCompanyAcc);
  });

  it('should be able to get allowed accounts without passing etxn param', () => {
    const allowedPaymentModes = ['PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', 'PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(accountsService.getAllowedAccounts(multiplePaymentModesWithoutAdv, allowedPaymentModes, false)).toEqual(
      multiplePaymentModesWithCompanyAcc
    );
  });

  it('should be able to get allowed accounts for mileage and per diem', () => {
    const allowedPaymentModes = ['PERSONAL_ACCOUNT', 'COMPANY_ACCOUNT'];
    expect(
      accountsService.getAllowedAccounts(multiplePaymentModesWithoutAdv, allowedPaymentModes, false, extnObj, true)
    ).toEqual(multiplePaymentModesWithoutCCCAcc);
  });
});
