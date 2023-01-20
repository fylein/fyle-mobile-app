import { TestBed } from '@angular/core/testing';
import { of, from } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { DataTransformService } from './data-transform.service';
import {
  apiTransactionCountResponse,
  apiSingleTransactionResponse,
  eCCCApiResponse,
  expectedECccResponse,
  expectedSingleTransaction,
  searchCCCTxnResponse,
  expectedSearchTxn,
} from '../test-data/corporate-credit-card-expense.spec.data';
import { uniqueCardsParam } from '../mock-data/unique-cards.data';
import { cardAggregateStatParam } from '../mock-data/card-aggregate-stat.data';
import { DateService } from './date.service';
import { expectedUniqueCardStats } from '../mock-data/unique-cards-stats.data';
import { apiAssignedCardDetailsRes } from '../mock-data/stats-response.data';
import { expectedAssignedCCCStats } from '../mock-data/ccc-expense.details.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';

describe('CorporateCreditCardExpenseService', () => {
  let cccExpenseService: CorporateCreditCardExpenseService;
  let dateService: DateService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

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
        DataTransformService,
        DateService,
      ],
    });

    cccExpenseService = TestBed.inject(CorporateCreditCardExpenseService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
  });

  it('should be created', () => {
    expect(cccExpenseService).toBeTruthy();
  });

  it('getv2CardTransactionsCount(): should get transaction counts', (done) => {
    apiV2Service.get.and.returnValue(of(apiTransactionCountResponse));
    const testParams = {
      state: 'in.(IN_PROGRESS,SETTLED)',
    };

    const result = cccExpenseService.getv2CardTransactionsCount(testParams);
    result.subscribe((res) => {
      expect(res).toEqual(apiTransactionCountResponse.count);
      expect(apiV2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getv2CardTransaction(): should give a single transaction from ID', (done) => {
    apiV2Service.get.and.returnValue(of(apiSingleTransactionResponse));

    const testID = 'ccceRhYsN8Fj78';

    const result = cccExpenseService.getv2CardTransaction(testID);
    result.subscribe((res) => {
      expect(res).toEqual(dateService.fixDates(expectedSingleTransaction));
      expect(apiV2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('markPersonal(): should mark an expense as personal', (done) => {
    apiService.post.and.returnValue(of(null));
    const testId = 'ccceJN3PWAR94U';
    const result = cccExpenseService.markPersonal(testId);
    result.subscribe((res) => {
      expect(apiService.post).toHaveBeenCalledWith('/corporate_credit_card_expenses/' + testId + '/personal');
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('unmarkPersonal(): should unmark an expense as personal', (done) => {
    apiService.post.and.returnValue(of(null));
    const testId = 'ccceJN3PWAR94U';
    const result = cccExpenseService.unmarkPersonal(testId);
    result.subscribe((res) => {
      expect(apiService.post).toHaveBeenCalledWith('/corporate_credit_card_expenses/' + testId + '/unmark_personal');
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('dismissCreditTransaction(): should dismiss a transaction as corporate credit card expense', (done) => {
    apiService.post.and.returnValue(of(null));
    const testId = 'ccceRhYsN8Fj78';
    const result = cccExpenseService.dismissCreditTransaction(testId);
    result.subscribe((res) => {
      expect(apiService.post).toHaveBeenCalledWith('/corporate_credit_card_expenses/' + testId + '/ignore');
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('undoDismissedCreditTransaction(): should undo dismiss a transaction as corporate credit card expense', (done) => {
    apiService.post.and.returnValue(of(null));
    const testId = 'ccceRhYsN8Fj78';
    const result = cccExpenseService.undoDismissedCreditTransaction(testId);
    result.subscribe((res) => {
      expect(apiService.post).toHaveBeenCalledWith('/corporate_credit_card_expenses/' + testId + '/undo_ignore');
      expect(apiService.post).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getEccceByGroupId(): should get Corporate Credit Card expenses by group ID', (done) => {
    apiService.get.and.returnValue(of(eCCCApiResponse));

    const testID = 'ccceYIJhT8Aj6U';

    const result = cccExpenseService.getEccceByGroupId(testID);

    result.subscribe((res) => {
      expect(res).toEqual(expectedECccResponse);
      expect(apiService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getAssignedCards(): should get all assigned cards', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    apiV2Service.get.and.returnValue(of(apiAssignedCardDetailsRes));

    const result = cccExpenseService.getAssignedCards();
    result.subscribe((res) => {
      expect(res).toEqual(expectedAssignedCCCStats);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(apiV2Service.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getExpenseDetailsInCards(): should get expense details in card', () => {
    const result = cccExpenseService.getExpenseDetailsInCards(uniqueCardsParam, cardAggregateStatParam);

    expect(result).toEqual(expectedUniqueCardStats);
  });

  it('getAllv2CardTransactions(): should get all transactions from using search', (done) => {
    apiV2Service.get.and.returnValue(of(searchCCCTxnResponse));
    const params = {
      queryParams: {
        state: 'in.(INITIALIZED)',
      },
      order: 'txn_dt.desc',
    };

    const result = cccExpenseService.getAllv2CardTransactions(params);
    result.subscribe((res) => {
      expect(res).toEqual(expectedSearchTxn);
      expect(apiV2Service.get).toHaveBeenCalledTimes(2);
      done();
    });
  });
});
