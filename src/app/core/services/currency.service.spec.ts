import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { OrgService } from './org.service';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { apiAllCurrencies } from '../mock-data/currency.data';
import { of } from 'rxjs';
import { orgData1 } from '../mock-data/org.data';
import * as dayjs from 'dayjs';

describe('CurrencyService', () => {
  let currencyService: CurrencyService;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgService: jasmine.SpyObj<OrgService>;
  const dt = new Date();

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg']);
    TestBed.configureTestingModule({
      providers: [
        CurrencyService,
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: OrgService,
          useValue: orgServiceSpy,
        },
      ],
    });
    currencyService = TestBed.inject(CurrencyService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
  });

  it('should be created', () => {
    expect(currencyService).toBeTruthy();
  });

  it('getAll(): should return all currencies', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    apiService.get.and.returnValue(of(apiAllCurrencies));

    currencyService.getAll().subscribe((res) => {
      expect(res).toEqual(apiAllCurrencies);
      expect(apiService.get).toHaveBeenCalledOnceWith('/currency/all', {
        params: {
          org_id: apiEouRes && apiEouRes.ou && apiEouRes.ou.org_id,
        },
      });
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getHomeCurrency(): should get the home currency for the org', (done) => {
    orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));

    currencyService.getHomeCurrency().subscribe((res) => {
      expect(res).toEqual(orgData1[0].currency);
      done();
    });
  });

  it('getAmountWithCurrencyFraction(): should return amount with currency', () => {
    jasmine.createSpy('getNumberOfCurrencyDigits').and.returnValue(2);
    expect(currencyService.getAmountWithCurrencyFraction(145.5, 'USD')).toEqual(145.5);
  });

  describe('getExchangeRate():', () => {
    it('should get the exchange rate', (done) => {
      apiService.get.and.returnValue(
        of({
          exchange_rate: 82.708499,
        })
      );

      const txnID = 'tx6Oe6FaYDZl';

      currencyService.getExchangeRate('USD', 'INR', new Date(), txnID).subscribe((res) => {
        expect(res).toEqual(82.708499);
        expect(apiService.get).toHaveBeenCalledOnceWith('/currency/exchange', {
          params: {
            from: 'USD',
            to: 'INR',
            dt: dayjs(dt).format('YYYY-MM-D'),
            tx6Oe6FaYDZl: 'tx6Oe6FaYDZl',
          },
        });
        done();
      });
    });

    it('should get the exchange rate when date and transaction ID not specified', (done) => {
      apiService.get.and.returnValue(
        of({
          exchange_rate: 82.708499,
        })
      );

      currencyService.getExchangeRate('USD', 'INR').subscribe((res) => {
        expect(res).toEqual(82.708499);
        expect(apiService.get).toHaveBeenCalledOnceWith('/currency/exchange', {
          params: {
            from: 'USD',
            to: 'INR',
            dt: dayjs(dt).format('YYYY-MM-D'),
          },
        });
        done();
      });
    });
  });
});
