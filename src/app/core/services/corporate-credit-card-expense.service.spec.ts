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
import { cardAggregateStatParam } from '../mock-data/card-aggregate-stats.data';
import { DateService } from './date.service';
import { expectedUniqueCardStats } from '../mock-data/unique-cards-stats.data';
import { apiAssignedCardDetailsRes } from '../mock-data/stats-response.data';
import { expectedAssignedCCCStats, mastercardCCCStats } from '../mock-data/ccc-expense.details.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { eCCCApiResponse } from '../mock-data/corporate-card-expense-flattened.data';
import { mastercardRTFCard, statementUploadedCard } from '../mock-data/platform-corporate-card.data';
import { StatsResponse } from '../models/v2/stats-response.model';
import { bankFeedSourcesData } from '../mock-data/bank-feed-sources.data';
import { statementUploadedCardDetail } from '../mock-data/platform-corporate-card-detail-data';
import { ccTransactionResponseData, ccTransactionResponseData1 } from '../mock-data/corporate-card-response.data';

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
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get', 'getStats']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);

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
    spenderPlatformV1ApiService.post.and.returnValue(of(ccTransactionResponseData1));
    const id = 'btxnSte7sVQCM8';
    const payload = {
      id,
    };
    cccExpenseService.markPersonal(id).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_card_transactions/mark_personal', {
        data: payload,
      });
      done();
    });
  });

  it('dismissCreditTransaction(): should dismiss a transaction as corporate credit card expense', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of(ccTransactionResponseData));
    const id = 'btxnBdS2Kpvzhy';
    const payload = {
      id,
    };
    cccExpenseService.dismissCreditTransaction(id).subscribe(() => {
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_card_transactions/ignore', {
        data: payload,
      });
      done();
    });
  });

  it('getAssignedCards(): should get all assigned cards', (done) => {
    const queryParams = 'in.(COMPLETE,DRAFT)';
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    apiV2Service.getStats.and.returnValue(of(new StatsResponse(apiAssignedCardDetailsRes)));
    spyOn(cccExpenseService, 'constructInQueryParamStringForV2').and.returnValue(queryParams);

    cccExpenseService.getAssignedCards().subscribe((res) => {
      expect(res).toEqual(expectedAssignedCCCStats);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(apiV2Service.getStats).toHaveBeenCalledOnceWith(
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

  it('getPlatformCorporateCardDetails(): should get corporate card details', () => {
    const result = cccExpenseService.getPlatformCorporateCardDetails(
      [statementUploadedCard],
      mastercardCCCStats.cardDetails
    );

    expect(result).toEqual(statementUploadedCardDetail);
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
      data: [mastercardRTFCard],
      count: 1,
    };
    spenderPlatformV1ApiService.get.and.returnValue(of(apiResponse));

    cccExpenseService.getCorporateCards().subscribe((res) => {
      expect(res).toEqual([mastercardRTFCard]);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/corporate_cards');
      done();
    });
  });

  it('getBankFeedSources(): should get all the bank feed sources', () => {
    const res = cccExpenseService.getBankFeedSources();
    expect(res).toEqual(bankFeedSourcesData);
  });
});
