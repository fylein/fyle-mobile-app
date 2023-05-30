import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { AuthService } from './auth.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { DataTransformService } from './data-transform.service';
import { apiCardV2Transactions } from '../mock-data/ccc-api-response';
import { expectedECccResponse } from '../mock-data/corporate-card-expense-unflattened.data';
import { uniqueCardsParam } from '../mock-data/unique-cards.data';
import { cardAggregateStatParam } from '../mock-data/card-aggregate-stat.data';
import { DateService } from './date.service';
import { expectedUniqueCardStats } from '../mock-data/unique-cards-stats.data';
import { apiAssignedCardDetailsRes } from '../mock-data/stats-response.data';
import { expectedAssignedCCCStats } from '../mock-data/ccc-expense.details.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { eCCCApiResponse } from '../mock-data/corporate-card-expense-flattened.data';
import { platformCorporateCard } from '../mock-data/platform-corporate-card.data';

describe('CorporateCreditCardExpenseService', () => {
  let cccExpenseService: CorporateCreditCardExpenseService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let dataTransformService: DataTransformService;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        CorporateCreditCardExpenseService,
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
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        DataTransformService,
        DateService,
      ],
    });

    cccExpenseService = TestBed.inject(CorporateCreditCardExpenseService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    dataTransformService = TestBed.inject(DataTransformService);
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
  });

  it('should be created', () => {
    expect(cccExpenseService).toBeTruthy();
  });

  it('markPersonal(): should mark an expense as personal', (done) => {
    apiService.post.and.returnValue(of(null));
    const testId = 'ccceJN3PWAR94U';

    cccExpenseService.markPersonal(testId).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith('/corporate_credit_card_expenses/' + testId + '/personal');
      done();
    });
  });

  it('dismissCreditTransaction(): should dismiss a transaction as corporate credit card expense', (done) => {
    apiService.post.and.returnValue(of(null));
    const testId = 'ccceRhYsN8Fj78';

    cccExpenseService.dismissCreditTransaction(testId).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith('/corporate_credit_card_expenses/' + testId + '/ignore');
      done();
    });
  });

  it('getEccceByGroupId(): should get Corporate Credit Card expenses by group ID', (done) => {
    apiService.get.and.returnValue(of(eCCCApiResponse));
    spyOn(dataTransformService, 'unflatten').and.returnValue(expectedECccResponse[0]);

    const testID = 'ccceYIJhT8Aj6U';

    cccExpenseService.getEccceByGroupId(testID).subscribe((res) => {
      expect(res).toEqual(expectedECccResponse);
      expect(apiService.get).toHaveBeenCalledOnceWith('/extended_corporate_credit_card_expenses', {
        params: {
          group_id: testID,
        },
      });
      expect(dataTransformService.unflatten).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getAssignedCards(): should get all assigned cards', (done) => {
    const queryParams = 'in.(COMPLETE,DRAFT)';
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    apiV2Service.get.and.returnValue(of(apiAssignedCardDetailsRes));
    spyOn(cccExpenseService, 'constructInQueryParamStringForV2').and.returnValue(queryParams);

    cccExpenseService.getAssignedCards().subscribe((res) => {
      expect(res).toEqual(expectedAssignedCCCStats);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith(
        '/expenses_and_ccce/stats?aggregates=count(tx_id),sum(tx_amount)&scalar=true&dimension_1_1=corporate_credit_card_bank_name,corporate_credit_card_account_number,tx_state&tx_state=' +
          queryParams +
          '&corporate_credit_card_account_number=not.is.null&debit=is.true&tx_org_user_id=eq.' +
          apiEouRes.ou.id,
        {}
      );
      expect(cccExpenseService.constructInQueryParamStringForV2).toHaveBeenCalledOnceWith(['COMPLETE', 'DRAFT']);
      done();
    });
  });

  it('getExpenseDetailsInCards(): should get expense details in card', () => {
    const result = cccExpenseService.getExpenseDetailsInCards(uniqueCardsParam, cardAggregateStatParam);

    expect(result).toEqual(expectedUniqueCardStats);
  });

  it('getv2CardTransactions(): should get all card transactions', (done) => {
    apiV2Service.get.and.returnValue(of(apiCardV2Transactions));

    const param = {
      offset: 0,
      queryParams: {},
      limit: 2,
    };

    cccExpenseService.getv2CardTransactions(param).subscribe((res) => {
      expect(res).toEqual(apiCardV2Transactions);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/corporate_card_transactions', {
        params: {
          offset: 0,
          limit: 2,
          order: 'txn_dt.desc,id.desc',
        },
      });
      done();
    });
  });

  it('getCorporateCards(): should get all corporate cards', (done) => {
    const apiResponse = {
      data: [platformCorporateCard],
      count: 1,
    };
    spenderPlatformV1ApiService.get.and.returnValue(of(apiResponse));

    cccExpenseService.getCorporateCards().subscribe((res) => {
      expect(res).toEqual([platformCorporateCard]);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/corporate_cards');
      done();
    });
  });
});
