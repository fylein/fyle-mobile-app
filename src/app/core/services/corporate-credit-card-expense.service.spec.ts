import { TestBed } from '@angular/core/testing';
import { of, from } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { DataTransformService } from './data-transform.service';
import {
  apiResponseTransaction,
  expectedTransactionResponseFromAPI,
  apiTransactionCountResponse,
  apiAuthEouResponse,
  apiExpAndCCC,
  expectedCardResponse,
  apiAssignedAcc,
  eCCCApiResponse,
  expectedUnifyExpenses,
  expectedECccResponse,
  uniqueCardsReponse,
  statsResponse,
} from '../test-data/corporate-credit-card-expense.spec.data';

fdescribe('CorporateCreditCardExpenseService', () => {
  let cccExpenseService: CorporateCreditCardExpenseService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformServiceSpy', ['unflatten']);

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
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
      ],
    });

    cccExpenseService = TestBed.inject(CorporateCreditCardExpenseService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
  });

  it('should be created', () => {
    expect(cccExpenseService).toBeTruthy();
  });

  it('should get transaction counts', (done) => {
    apiV2Service.get.and.returnValue(of(apiTransactionCountResponse));
    const testParams = {
      state: 'in.(IN_PROGRESS,SETTLED)',
    };

    const result = cccExpenseService.getv2CardTransactionsCount(testParams);
    result.subscribe((res) => {
      expect(res).toEqual(apiTransactionCountResponse.count);
      done();
    });
  });

  xit('should give a single transaction from ID', (done) => {
    apiV2Service.get.and.returnValue(of(apiResponseTransaction.data));

    const testID = 'ccceWauzF1A3oS';

    const result = cccExpenseService.getv2CardTransaction(testID);
    result.subscribe((res) => {
      done();
    });
  });

  it('should mark an expense as personal', () => {
    apiService.post.and.returnValue(of(null));
    const testId = 'ccceJN3PWAR94U';
    const result = cccExpenseService.markPersonal(testId);
    result.subscribe((res) => {
      expect(res).toEqual(null);
    });
  });

  xit('should get all transactions from a search', (done) => {
    apiV2Service.get.and.returnValue(of(apiTransactionCountResponse.count));
    const testParams = {
      queryParams: {
        state: 'in.(IN_PROGRESS,SETTLED)',
      },
      order: 'txn_dt.desc',
    };

    const result = cccExpenseService.getAllv2CardTransactions(testParams);
    result.subscribe((res) => {
      expect(res).toEqual([undefined]);
      done();
    });
  });

  xit('should get Corporate Credit Card expenses by group ID', (done) => {
    apiService.get.and.returnValue(of(eCCCApiResponse));

    const testID = 'ccceJ6V4ifvNLM';

    const result = cccExpenseService.getEccceByGroupId(testID);

    result.subscribe((res) => {
      console.log(res);
      done();
    });
  });

  it('should get all assigned cards', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiAuthEouResponse));
    apiV2Service.get.and.returnValue(of(apiExpAndCCC));

    const result = cccExpenseService.getAssignedCards();
    result.subscribe((res) => {
      expect(res).toEqual(expectedCardResponse);
      done();
    });
  });

  it('should get non-unify cards', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiAuthEouResponse));
    apiV2Service.get.and.returnValue(of(apiAssignedAcc));

    const result = cccExpenseService.getNonUnifyCCCAssignedCards();
    result.subscribe((res) => {
      expect(res).toEqual(expectedUnifyExpenses);
      done();
    });
  });
});
