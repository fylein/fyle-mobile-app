import { TestBed } from '@angular/core/testing';
import { PersonalCardsService } from './personal-cards.service';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ExpenseAggregationService } from './expense-aggregation.service';
import { DateService } from './date.service';
import { allFilterPills, creditTxnFilterPill, debitTxnFilterPill } from '../mock-data/filter-pills.data';
import {
  apiLinkedAccRes,
  deletePersonalCardPlatformRes,
  deletePersonalCardRes,
  linkedAccountRes2,
  platformApiLinkedAccRes,
} from '../mock-data/personal-cards.data';
import { of } from 'rxjs';
import {
  apiPersonalCardTxnsRes,
  matchedExpensesPlatform,
  platformMatchExpenseResponse,
  platformPersonalCardTxns,
  platformQueryParams,
  platformTxnsConfig,
  publicQueryParams,
  publicTxnsConfig,
  transformedMatchedExpenses,
  transformedPlatformPersonalCardTxns,
} from '../mock-data/personal-card-txns.data';
import { selectedFilters1, selectedFilters2 } from '../mock-data/selected-filters.data';
import { filterData1 } from '../mock-data/filter.data';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { apiExpenseRes, etxncData } from '../mock-data/expense.data';
import { apiToken } from '../mock-data/yoodle-token.data';
import * as dayjs from 'dayjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformPersonalCardQueryParams } from '../models/platform/platform-personal-card-query-params.model';
import { personalCardAccessTokenResponse } from '../mock-data/personal-cards-access-token.data';
import {
  platformPersonalCardTxnExpenseSuggestions,
  platformPersonalCardTxnExpenseSuggestionsRes,
  publicPersonalCardTxnExpenseSuggestionsRes,
} from '../mock-data/personal-card-txn-expense-suggestions.data';

describe('PersonalCardsService', () => {
  let personalCardsService: PersonalCardsService;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let apiService: jasmine.SpyObj<ApiService>;
  let expenseAggregationService: jasmine.SpyObj<ExpenseAggregationService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let dateService: DateService;

  beforeEach(() => {
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post', 'get']);
    const expenseAggregationServiceSpy = jasmine.createSpyObj('ExpenseAggregationService', ['get', 'post', 'delete']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        PersonalCardsService,
        DateService,
        {
          provide: ApiV2Service,
          useValue: apiV2ServiceSpy,
        },
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: ExpenseAggregationService,
          useValue: expenseAggregationServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });
    personalCardsService = TestBed.inject(PersonalCardsService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    expenseAggregationService = TestBed.inject(ExpenseAggregationService) as jasmine.SpyObj<ExpenseAggregationService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(personalCardsService).toBeTruthy();
  });

  describe('helper functions', () => {
    it('transformPersonalCardPlatformArray: should transform PlatformPersonalCard array to PersonalCard array', () => {
      const platformPersonalCardArray = platformApiLinkedAccRes.data;
      const personalCardArray = linkedAccountRes2;

      expect(personalCardsService.transformPersonalCardPlatformArray(platformPersonalCardArray)).toEqual(
        personalCardArray
      );
    });

    describe('transformMatchedExpensesToTxnDetails', () => {
      it('it should transform matched expenses to transaction details', () => {
        expect(personalCardsService.transformMatchedExpensesToTxnDetails(matchedExpensesPlatform)).toEqual(
          transformedMatchedExpenses
        );
      });

      it('it should return an empty array if matchedExpenses is undefined', () => {
        expect(personalCardsService.transformMatchedExpensesToTxnDetails(undefined)).toEqual([]);
      });
    });

    it('transformPlatformPersonalCardTxn: should transform PlatformPersonalCardTxn array to PersonalCardTxn array', () => {
      expect(personalCardsService.transformPlatformPersonalCardTxn(platformPersonalCardTxns.data)).toEqual(
        transformedPlatformPersonalCardTxns.data
      );
    });

    describe('mapPublicQueryParamsToPlatform', () => {
      it('should map public query params to platform query params', () => {
        const result = personalCardsService.mapPublicQueryParamsToPlatform(publicQueryParams);
        expect(result).toEqual(platformQueryParams);
      });

      it('should filter out undefined values in the query params', () => {
        const queryParams = {
          ba_id: undefined,
          _search_document: 'fts.query',
        };

        const expected: PlatformPersonalCardQueryParams = {
          q: 'query',
        };

        const result = personalCardsService.mapPublicQueryParamsToPlatform(queryParams);
        expect(result).toEqual(expected);
      });

      it('should handle cases where _search_document is not provided', () => {
        const result = personalCardsService.mapPublicQueryParamsToPlatform({ btxn_status: 'MATCHED' });
        expect(result).toEqual({ state: 'MATCHED' });
      });
    });
  });

  describe('getPersonalCards()', () => {
    it('should get linked personal cards when using public api', (done) => {
      const usePlatformApi = false;
      apiV2Service.get.and.returnValue(of(apiLinkedAccRes));

      personalCardsService.getPersonalCards(usePlatformApi).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).not.toHaveBeenCalled();
        expect(res).toEqual(apiLinkedAccRes.data);
        expect(apiV2Service.get).toHaveBeenCalledOnceWith('/personal_bank_accounts', {
          params: {
            order: 'last_synced_at.desc',
          },
        });
        done();
      });
    });

    it('should get linked personal cards when using platform api', (done) => {
      const usePlatformApi = true;
      spenderPlatformV1ApiService.get.and.returnValue(of(platformApiLinkedAccRes));
      spyOn(personalCardsService, 'transformPersonalCardPlatformArray').and.callThrough();

      personalCardsService.getPersonalCards(usePlatformApi).subscribe((res) => {
        expect(res).toEqual(linkedAccountRes2);
        expect(personalCardsService.transformPersonalCardPlatformArray).toHaveBeenCalledWith(
          platformApiLinkedAccRes.data
        );
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/personal_cards');
        expect(apiV2Service.get).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('getPersonalCardsCount()', () => {
    it('should get linked personal cards count when using public api', (done) => {
      const usePlatformApi = false;
      apiV2Service.get.and.returnValue(of(apiLinkedAccRes));

      personalCardsService.getPersonalCardsCount(usePlatformApi).subscribe((res) => {
        expect(spenderPlatformV1ApiService.get).not.toHaveBeenCalled();
        expect(res).toEqual(apiLinkedAccRes.count);
        expect(apiV2Service.get).toHaveBeenCalledOnceWith('/personal_bank_accounts', {
          params: {
            order: 'last_synced_at.desc',
          },
        });
        done();
      });
    });

    it('should get linked personal cards count when using platform api', (done) => {
      const usePlatformApi = true;
      spenderPlatformV1ApiService.get.and.returnValue(of(platformApiLinkedAccRes));

      personalCardsService.getPersonalCardsCount(usePlatformApi).subscribe((res) => {
        expect(res).toEqual(platformApiLinkedAccRes.count);
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/personal_cards');
        expect(apiV2Service.get).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('deleteAccount()', () => {
    it('should delete personal card when using public api', (done) => {
      const usePlatformApi = false;
      expenseAggregationService.delete.and.returnValue(of(deletePersonalCardRes));

      const accountId = 'bacc0By33NqhnS';

      personalCardsService.deleteAccount(accountId, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(deletePersonalCardRes);
        expect(expenseAggregationService.delete).toHaveBeenCalledOnceWith(`/bank_accounts/${accountId}`);
        done();
      });
    });

    it('should delete personal card when using platform api', (done) => {
      const usePlatformApi = true;
      spenderPlatformV1ApiService.post.and.returnValue(of(deletePersonalCardPlatformRes));

      const accountId = 'bacc0By33NqhnS';
      const payload = {
        data: {
          id: accountId,
        },
      };

      personalCardsService.deleteAccount(accountId, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(deletePersonalCardPlatformRes.data);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_cards/delete', payload);
        expect(apiV2Service.get).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('getBankTransactions()', () => {
    it('should get bank transactions when using public api', (done) => {
      apiV2Service.get.and.returnValue(of(apiPersonalCardTxnsRes));

      const usePlatformApi = false;

      personalCardsService.getBankTransactions(publicTxnsConfig, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(apiPersonalCardTxnsRes);
        expect(apiV2Service.get).toHaveBeenCalledOnceWith('/personal_bank_transactions', {
          params: {
            limit: publicTxnsConfig.limit,
            offset: publicTxnsConfig.offset,
            ...publicTxnsConfig.queryParams,
          },
        });
        done();
      });
    });

    it('should get bank transactions when using platform api', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformPersonalCardTxns));

      const usePlatformApi = true;
      personalCardsService.getBankTransactions(publicTxnsConfig, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(transformedPlatformPersonalCardTxns);
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/personal_card_transactions', {
          params: {
            limit: platformTxnsConfig.limit,
            offset: platformTxnsConfig.offset,
            ...platformTxnsConfig.queryParams,
          },
        });
        done();
      });
    });
  });

  describe('getBankTransactionsCount', () => {
    it('should get bank transaction count using public api', (done) => {
      spyOn(personalCardsService, 'getBankTransactions').and.returnValue(of(apiPersonalCardTxnsRes));

      const queryParams = {
        btxn_status: 'in.(MATCHED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };
      const usePlatformApi = false;
      const config = {
        offset: 0,
        limit: 10,
        queryParams,
      };

      personalCardsService.getBankTransactionsCount(queryParams, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(apiPersonalCardTxnsRes.count);
        expect(personalCardsService.getBankTransactions).toHaveBeenCalledOnceWith(config, usePlatformApi);
        done();
      });
    });

    it('should get bank transaction count using platform api', (done) => {
      spyOn(personalCardsService, 'getBankTransactionsPlatform').and.returnValue(
        of(transformedPlatformPersonalCardTxns)
      );

      const usePlatformApi = true;
      personalCardsService.getBankTransactionsCount(publicQueryParams, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(transformedPlatformPersonalCardTxns.count);
        expect(personalCardsService.getBankTransactionsPlatform).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('postBankAccounts()', () => {
    it('should link personal cards using public api', (done) => {
      const requestIds = ['bacc0dtQ3ESjjQ'];
      const usePlatformApi = false;
      expenseAggregationService.post.and.returnValue(of(requestIds));

      personalCardsService.postBankAccounts(requestIds, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(requestIds);
        expect(expenseAggregationService.post).toHaveBeenCalledOnceWith('/yodlee/personal/bank_accounts', {
          aggregator: 'yodlee',
          request_ids: requestIds,
        });
        done();
      });
    });

    it('should link personal cards using platform api', (done) => {
      const requestIds = ['bacc0dtQ3ESjjQ'];
      const usePlatformApi = true;
      spenderPlatformV1ApiService.post.and.returnValue(of(platformApiLinkedAccRes));

      personalCardsService.postBankAccounts(requestIds, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(platformApiLinkedAccRes.data);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_cards', { data: {} });
        done();
      });
    });
  });

  it('convertFilters(): should convert selected filters', () => {
    expect(personalCardsService.convertFilters(selectedFilters1)).toEqual(filterData1);
  });

  describe('generateCreditTrasactionsFilterPills():', () => {
    it(' should generate credit txns filter pills', () => {
      const filterPills = [];
      const filters = {
        transactionType: 'Credit',
      };
      //@ts-ignore
      personalCardsService.generateCreditTrasactionsFilterPills(filters, filterPills);
      expect(filterPills).toEqual(creditTxnFilterPill);
    });

    it(' should generate debit txns filter pills', () => {
      const filterPills = [];
      const filters = {
        transactionType: 'Debit',
      };
      //@ts-ignore
      personalCardsService.generateCreditTrasactionsFilterPills(filters, filterPills);
      expect(filterPills).toEqual(debitTxnFilterPill);
    });
  });

  it('generateSelectedFilters(): should generate selected filters from available filters', () => {
    expect(personalCardsService.generateSelectedFilters(filterData1)).toEqual(selectedFilters2);
  });

  describe('generateCreditParams()', () => {
    it('should generate credit params for public API with transactionType credit', () => {
      const queryParam = {
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {
        transactionType: 'Credit',
      };

      personalCardsService.generateCreditParams(queryParam, filter);
      expect(queryParam).toEqual({
        or: ['(btxn_transaction_type.in.(credit))', '(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
    });

    it('should generate debit params for public API with transactionType debit', () => {
      const queryParam = {
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {
        transactionType: 'Debit',
      };

      personalCardsService.generateCreditParams(queryParam, filter);
      expect(queryParam).toEqual({
        or: ['(btxn_transaction_type.in.(credit))', '(btxn_transaction_type.in.(debit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
    });

    it('should generate credit params for platform API with transactionType credit', () => {
      const queryParam = {
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
        amount: undefined,
      };

      const filter = {
        transactionType: 'Credit',
      };
      const usePlatformApi = true;

      personalCardsService.generateCreditParams(queryParam, filter, usePlatformApi);
      expect(queryParam).toEqual({
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
        amount: 'lte.0',
      });
    });

    it('should generate debit params for platform API with transactionType debit', () => {
      const queryParam = {
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
        amount: undefined,
      };

      const filter = {
        transactionType: 'Debit',
      };
      const usePlatformApi = true;

      personalCardsService.generateCreditParams(queryParam, filter, usePlatformApi);
      expect(queryParam).toEqual({
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
        amount: 'gte.0',
      });
    });

    it('should not modify queryParam if transactionType is not provided', () => {
      const queryParam = {
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {};

      personalCardsService.generateCreditParams(queryParam, filter);
      expect(queryParam).toEqual({
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
    });

    it('should not modify queryParam if filters are empty', () => {
      const queryParam = {
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateCreditParams(queryParam, {});
      expect(queryParam).toEqual({
        or: ['(btxn_transaction_type.in.(credit))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
    });
  });

  describe('generateCustomDateParams():', () => {
    it(' should generate custom date params with both start and end dates', () => {
      const queryParam = {
        or: ['(and(btxn_created_at.gte.2023-02-22T18:30:00.000Z,btxn_created_at.lt.2023-02-27T18:30:00.000Z))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {
        createdOn: {
          name: 'custom',
          customDateStart: new Date('2023-02-22T18:30:00.000Z'),
          customDateEnd: new Date('2023-02-27T18:30:00.000Z'),
        },
      };

      const type = 'createdOn';
      const queryType = 'btxn_created_at';

      personalCardsService.generateCustomDateParams(queryParam, filter, type, queryType);
      expect(queryParam).toEqual({
        or: [
          '(and(btxn_created_at.gte.2023-02-22T18:30:00.000Z,btxn_created_at.lt.2023-02-27T18:30:00.000Z))',
          '(and(btxn_created_at.gte.2023-02-22T18:30:00.000Z,btxn_created_at.lt.2023-02-27T18:30:00.000Z))',
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
    });

    it(' should generate custom date params with start date', () => {
      const queryParam = {
        or: ['(and(btxn_created_at.gte.2023-02-22T18:30:00.000Z,btxn_created_at.lt.2023-02-27T18:30:00.000Z))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {
        createdOn: {
          name: 'custom',
          customDateStart: new Date('2023-02-22T18:30:00.000Z'),
        },
      };

      const type = 'createdOn';
      const queryType = 'btxn_created_at';

      personalCardsService.generateCustomDateParams(queryParam, filter, type, queryType);
      expect(queryParam).toEqual({
        or: [
          '(and(btxn_created_at.gte.2023-02-22T18:30:00.000Z,btxn_created_at.lt.2023-02-27T18:30:00.000Z))',
          '(and(btxn_created_at.gte.2023-02-22T18:30:00.000Z))',
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
    });

    it(' should generate custom date params with end date', () => {
      const queryParam = {
        or: ['(and(btxn_created_at.gte.2023-02-22T18:30:00.000Z,btxn_created_at.lt.2023-02-27T18:30:00.000Z))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {
        createdOn: {
          name: 'custom',
          customDateEnd: new Date('2023-02-27T18:30:00.000Z'),
        },
      };

      const type = 'createdOn';
      const queryType = 'btxn_created_at';

      personalCardsService.generateCustomDateParams(queryParam, filter, type, queryType);
      expect(queryParam).toEqual({
        or: [
          '(and(btxn_created_at.gte.2023-02-22T18:30:00.000Z,btxn_created_at.lt.2023-02-27T18:30:00.000Z))',
          '(and(btxn_created_at.lt.2023-02-27T18:30:00.000Z))',
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
    });
  });

  describe('generateCreatedOnCustomDatePill():', () => {
    it('should generate custom date pills with both start and end dates', () => {
      const filters = {
        createdOn: {
          name: 'custom',
          customDateStart: new Date('2023-02-21T00:00:00.000Z'),
          customDateEnd: new Date('2023-02-23T00:00:00.000Z'),
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateCreatedOnCustomDatePill(filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Created On',
          type: 'date',
          value: '2023-02-21 to 2023-02-23',
        },
      ]);
    });

    it('should generate custom date pills with start dates', () => {
      const filters = {
        createdOn: {
          name: 'custom',
          customDateStart: '2023-02-21T00:00:00.000Z',
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateCreatedOnCustomDatePill(filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Created On',
          type: 'date',
          value: '>= 2023-02-21',
        },
      ]);
    });

    it('should generate custom date pills with end dates', () => {
      const filters = {
        createdOn: {
          name: 'custom',
          customDateEnd: '2023-02-23T00:00:00.000Z',
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateCreatedOnCustomDatePill(filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Created On',
          type: 'date',
          value: '<= 2023-02-23',
        },
      ]);
    });
  });

  describe('generateUpdatedOnCustomDatePill():', () => {
    it('should generate custom date pills with both start and end dates', () => {
      const filters = {
        updatedOn: {
          name: 'custom',
          customDateStart: '2023-02-21T00:00:00.000Z',
          customDateEnd: '2023-02-23T00:00:00.000Z',
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateUpdatedOnCustomDatePill(filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Updated On',
          type: 'date',
          value: '2023-02-21 to 2023-02-23',
        },
      ]);
    });

    it('should generate custom date pills with start dates', () => {
      const filters = {
        updatedOn: {
          name: 'custom',
          customDateStart: '2023-02-21T00:00:00.000Z',
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateUpdatedOnCustomDatePill(filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Updated On',
          type: 'date',
          value: '>= 2023-02-21',
        },
      ]);
    });

    it('should generate custom date pills with end dates', () => {
      const filters = {
        updatedOn: {
          name: 'custom',
          customDateEnd: '2023-02-23T00:00:00.000Z',
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateUpdatedOnCustomDatePill(filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Updated On',
          type: 'date',
          value: '<= 2023-02-23',
        },
      ]);
    });
  });

  describe('generateDateFilterPills():', () => {
    it('should generate date filter pills when date is set to this week', () => {
      const filters = {
        createdOn: {
          name: DateFilters.thisWeek,
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateDateFilterPills('createdOn', filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Created On',
          type: 'date',
          value: 'this Week',
        },
      ]);
    });

    it('should generate date filter pills when date is set to this month', () => {
      const filters = {
        createdOn: {
          name: DateFilters.thisMonth,
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateDateFilterPills('createdOn', filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Created On',
          type: 'date',
          value: 'this Month',
        },
      ]);
    });

    it('should generate date filter pills when date is set to all', () => {
      const filters = {
        createdOn: {
          name: DateFilters.all,
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateDateFilterPills('createdOn', filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Created On',
          type: 'date',
          value: 'All',
        },
      ]);
    });

    it('should generate date filter pills when date is set to last month', () => {
      const filters = {
        createdOn: {
          name: DateFilters.lastMonth,
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateDateFilterPills('createdOn', filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Created On',
          type: 'date',
          value: 'Last Month',
        },
      ]);
    });

    it('should generate date filter pills when date is set to custom and createdOn', () => {
      const filters = {
        createdOn: {
          name: DateFilters.custom,
          customDateStart: '2023-02-21T00:00:00.000Z',
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateDateFilterPills('createdOn', filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Created On',
          type: 'date',
          value: '>= 2023-02-21',
        },
      ]);
    });

    it('should generate date filter pills when date is set to custom and updatedOn', () => {
      const filters = {
        updatedOn: {
          name: DateFilters.custom,
          customDateStart: '2023-02-21T00:00:00.000Z',
        },
      };

      const filterPills = [];

      //@ts-ignore
      personalCardsService.generateDateFilterPills('updatedOn', filters, filterPills);
      expect(filterPills).toEqual([
        {
          label: 'Updated On',
          type: 'date',
          value: '>= 2023-02-21',
        },
      ]);
    });
  });

  it('should generate filter pills with all properties', () => {
    expect(personalCardsService.generateFilterPills(filterData1)).toEqual(allFilterPills);
  });

  describe('generateDateParams(): when using public api', () => {
    it('should generate date params when range is this month', () => {
      spyOn(dateService, 'getThisMonthRange').and.returnValue({
        from: new Date('2023-02-28T18:30:00.000Z'),
        to: new Date('2023-03-31T18:29:00.000Z'),
      });
      const data = {
        range: 'This Month',
      };

      const queryParams = {
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-02-28T18:30:00.000Z,btxn_transaction_dt.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-02-28T18:30:00.000Z,btxn_transaction_dt.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getThisMonthRange).toHaveBeenCalledTimes(1);
    });

    it('should generate date params when range is last month', () => {
      spyOn(dateService, 'getLastMonthRange').and.returnValue({
        from: new Date('2023-01-31T18:30:00.000Z'),
        to: new Date('2023-02-28T18:29:00.000Z'),
      });
      const data = {
        range: 'Last Month',
      };

      const queryParams = {
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-02-28T18:30:00.000Z,btxn_transaction_dt.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-01-31T18:30:00.000Z,btxn_transaction_dt.lt.2023-02-28T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getLastMonthRange).toHaveBeenCalledTimes(1);
    });

    it('should generate date params when range is last 30 days', () => {
      spyOn(dateService, 'getLastDaysRange').and.returnValue({
        from: new Date('2023-01-30T09:41:35.002Z'),
        to: new Date('2023-03-01T09:41:35.002Z'),
      });
      const data = {
        range: 'Last 30 Days',
      };

      const queryParams = {
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-02-28T18:30:00.000Z,btxn_transaction_dt.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-01-30T09:41:35.002Z,btxn_transaction_dt.lt.2023-03-01T09:41:35.002Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getLastDaysRange).toHaveBeenCalledOnceWith(30);
    });

    it('should generate date params when range is last 60 days', () => {
      spyOn(dateService, 'getLastDaysRange').and.returnValue({
        from: new Date('2022-12-31T11:27:02.760Z'),
        to: new Date('2023-03-01T11:27:02.760Z'),
      });
      const data = {
        range: 'Last 60 Days',
      };

      const queryParams = {
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-02-28T18:30:00.000Z,btxn_transaction_dt.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2022-12-31T11:27:02.760Z,btxn_transaction_dt.lt.2023-03-01T11:27:02.760Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getLastDaysRange).toHaveBeenCalledOnceWith(60);
    });

    it('should generate date params when range is all time', () => {
      spyOn(dateService, 'getLastDaysRange').and.returnValue({
        from: new Date('2022-12-01T11:32:26.779Z'),
        to: new Date('2023-03-01T11:32:26.779Z'),
      });
      const data = {
        range: 'All Time',
      };

      const queryParams = {
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-02-28T18:30:00.000Z,btxn_transaction_dt.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2022-12-01T11:32:26.779Z,btxn_transaction_dt.lt.2023-03-01T11:32:26.779Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getLastDaysRange).toHaveBeenCalledOnceWith(90);
    });

    it('should generate date params when range is custom date', () => {
      const data = {
        range: 'Custom Range',
        startDate: '2023-01-31T18:30:00.000Z',
        endDate: '2023-02-28T18:29:00.000Z',
      };

      const queryParams = {
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-02-28T18:30:00.000Z,btxn_transaction_dt.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: '(and(btxn_transaction_dt.gte.2023-01-31T18:30:00.000Z,btxn_transaction_dt.lt.2023-02-28T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
    });
  });

  describe('generateDateParams(): when using platform api', () => {
    it('should generate date params when range is this month', () => {
      spyOn(dateService, 'getThisMonthRange').and.returnValue({
        from: new Date('2023-02-28T18:30:00.000Z'),
        to: new Date('2023-03-31T18:29:00.000Z'),
      });
      const usePlatformApi = true;
      const data = {
        range: 'This Month',
      };

      const queryParams = {
        queryParams: {
          or: '(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams, usePlatformApi)).toEqual({
        queryParams: {
          or: '(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getThisMonthRange).toHaveBeenCalledTimes(1);
    });

    it('should generate date params when range is last month', () => {
      spyOn(dateService, 'getLastMonthRange').and.returnValue({
        from: new Date('2023-01-31T18:30:00.000Z'),
        to: new Date('2023-02-28T18:29:00.000Z'),
      });
      const data = {
        range: 'Last Month',
      };
      const usePlatformApi = true;
      const queryParams = {
        queryParams: {
          or: '(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams, usePlatformApi)).toEqual({
        queryParams: {
          or: '(and(spent_at.gte.2023-01-31T18:30:00.000Z,spent_at.lt.2023-02-28T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getLastMonthRange).toHaveBeenCalledTimes(1);
    });

    it('should generate date params when range is last 30 days', () => {
      spyOn(dateService, 'getLastDaysRange').and.returnValue({
        from: new Date('2023-01-30T09:41:35.002Z'),
        to: new Date('2023-03-01T09:41:35.002Z'),
      });
      const data = {
        range: 'Last 30 Days',
      };
      const usePlatformApi = true;
      const queryParams = {
        queryParams: {
          or: '(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams, usePlatformApi)).toEqual({
        queryParams: {
          or: '(and(spent_at.gte.2023-01-30T09:41:35.002Z,spent_at.lt.2023-03-01T09:41:35.002Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getLastDaysRange).toHaveBeenCalledOnceWith(30);
    });

    it('should generate date params when range is last 60 days', () => {
      spyOn(dateService, 'getLastDaysRange').and.returnValue({
        from: new Date('2022-12-31T11:27:02.760Z'),
        to: new Date('2023-03-01T11:27:02.760Z'),
      });
      const data = {
        range: 'Last 60 Days',
      };
      const usePlatformApi = true;
      const queryParams = {
        queryParams: {
          or: '(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams, usePlatformApi)).toEqual({
        queryParams: {
          or: '(and(spent_at.gte.2022-12-31T11:27:02.760Z,spent_at.lt.2023-03-01T11:27:02.760Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getLastDaysRange).toHaveBeenCalledOnceWith(60);
    });

    it('should generate date params when range is all time', () => {
      spyOn(dateService, 'getLastDaysRange').and.returnValue({
        from: new Date('2022-12-01T11:32:26.779Z'),
        to: new Date('2023-03-01T11:32:26.779Z'),
      });
      const data = {
        range: 'All Time',
      };
      const usePlatformApi = true;
      const queryParams = {
        queryParams: {
          or: '(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams, usePlatformApi)).toEqual({
        queryParams: {
          or: '(and(spent_at.gte.2022-12-01T11:32:26.779Z,spent_at.lt.2023-03-01T11:32:26.779Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
      expect(dateService.getLastDaysRange).toHaveBeenCalledOnceWith(90);
    });

    it('should generate date params when range is custom date', () => {
      const data = {
        range: 'Custom Range',
        startDate: '2023-01-31T18:30:00.000Z',
        endDate: '2023-02-28T18:29:00.000Z',
      };
      const usePlatformApi = true;
      const queryParams = {
        queryParams: {
          or: '(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams, usePlatformApi)).toEqual({
        queryParams: {
          or: '(and(spent_at.gte.2023-01-31T18:30:00.000Z,spent_at.lt.2023-02-28T18:29:00.000Z))',
          btxn_status: 'in.(INITIALIZED)',
          ba_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
    });
  });

  describe('generateTxnDateParams(): when using public api', () => {
    it('should generate txn date param when range is this week', () => {
      const thisWeek = {
        from: dayjs().startOf('week'),
        to: dayjs().startOf('week').add(7, 'days'),
      };
      spyOn(dateService, 'getThisWeekRange').and.returnValue(thisWeek);
      const type = 'createdOn';

      const filters = {
        createdOn: {
          name: DateFilters.thisWeek,
        },
      };

      const queryParam = {
        or: ['(and(btxn_created_at.gte.2023-02-28T18:30:00.000Z,btxn_created_at.lt.2023-03-31T18:29:00.000Z))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type);
      expect(queryParam).toEqual({
        or: [
          '(and(btxn_created_at.gte.2023-02-28T18:30:00.000Z,btxn_created_at.lt.2023-03-31T18:29:00.000Z))',
          `(and(btxn_created_at.gte.${thisWeek.from.toISOString()},btxn_created_at.lt.${thisWeek.to.toISOString()}))`,
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getThisWeekRange).toHaveBeenCalledTimes(1);
    });

    it('should generate txn date param when range is this month', () => {
      const thisMonth = {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59),
      };
      spyOn(dateService, 'getThisMonthRange').and.returnValue(thisMonth);
      const type = 'createdOn';

      const filters = {
        createdOn: {
          name: DateFilters.thisMonth,
        },
      };

      const queryParam = {
        or: ['(and(btxn_updated_at.gte.2023-01-31T18:30:00.000Z,btxn_updated_at.lt.2023-02-28T18:29:00.000Z))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type);
      expect(queryParam).toEqual({
        or: [
          '(and(btxn_updated_at.gte.2023-01-31T18:30:00.000Z,btxn_updated_at.lt.2023-02-28T18:29:00.000Z))',
          `(and(btxn_created_at.gte.${thisMonth.from.toISOString()},btxn_created_at.lt.${thisMonth.to.toISOString()}))`,
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getThisMonthRange).toHaveBeenCalledTimes(1);
    });

    it('should generate txn date param when range is last month', () => {
      const thisMonth = {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59),
      };
      spyOn(dateService, 'getLastMonthRange').and.returnValue(thisMonth);
      const type = 'updatedOn';

      const filters = {
        updatedOn: {
          name: DateFilters.lastMonth as string,
          customDateStart: new Date('2023-02-21T00:00:00.000Z'),
          customDateEnd: new Date('2023-02-23T00:00:00.000Z'),
        },
      };

      const queryParam = {
        or: [
          '(and(btxn_created_at.gte.2023-02-28T18:30:00.000Z,btxn_created_at.lt.2023-03-31T18:29:00.000Z))',
          `(and(btxn_updated_at.gte.2023-01-31T18:30:00.000Z,btxn_updated_at.lt.2023-02-28T18:29:00.000Z))`,
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type);
      expect(queryParam).toEqual({
        or: [
          '(and(btxn_created_at.gte.2023-02-28T18:30:00.000Z,btxn_created_at.lt.2023-03-31T18:29:00.000Z))',
          '(and(btxn_updated_at.gte.2023-01-31T18:30:00.000Z,btxn_updated_at.lt.2023-02-28T18:29:00.000Z))',
          `(and(btxn_updated_at.gte.${thisMonth.from.toISOString()},btxn_updated_at.lt.${thisMonth.to.toISOString()}))`,
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getLastMonthRange).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateTxnDateParams(): when using platform api', () => {
    it('should generate txn date param when range is this week', () => {
      const usePlatformApi = true;
      const thisWeek = {
        from: dayjs().startOf('week'),
        to: dayjs().startOf('week').add(7, 'days'),
      };
      spyOn(dateService, 'getThisWeekRange').and.returnValue(thisWeek);
      const type = 'createdOn';

      const filters = {
        createdOn: {
          name: DateFilters.thisWeek,
        },
      };

      const queryParam = {
        or: ['(and(created_at.gte.2023-02-28T18:30:00.000Z,created_at.lt.2023-03-31T18:29:00.000Z))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type, usePlatformApi);
      expect(queryParam).toEqual({
        or: [
          '(and(created_at.gte.2023-02-28T18:30:00.000Z,created_at.lt.2023-03-31T18:29:00.000Z))',
          `(and(created_at.gte.${thisWeek.from.toISOString()},created_at.lt.${thisWeek.to.toISOString()}))`,
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getThisWeekRange).toHaveBeenCalledTimes(1);
    });

    it('should generate txn date param when range is this month', () => {
      const usePlatformApi = true;
      const thisMonth = {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59),
      };
      spyOn(dateService, 'getThisMonthRange').and.returnValue(thisMonth);
      const type = 'createdOn';

      const filters = {
        createdOn: {
          name: DateFilters.thisMonth,
        },
      };

      const queryParam = {
        or: ['(and(updated_at.gte.2023-01-31T18:30:00.000Z,updated_at.lt.2023-02-28T18:29:00.000Z))'],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type, usePlatformApi);
      expect(queryParam).toEqual({
        or: [
          '(and(updated_at.gte.2023-01-31T18:30:00.000Z,updated_at.lt.2023-02-28T18:29:00.000Z))',
          `(and(created_at.gte.${thisMonth.from.toISOString()},created_at.lt.${thisMonth.to.toISOString()}))`,
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getThisMonthRange).toHaveBeenCalledTimes(1);
    });

    it('should generate txn date param when range is last month', () => {
      const usePlatformApi = true;
      const thisMonth = {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59),
      };
      spyOn(dateService, 'getLastMonthRange').and.returnValue(thisMonth);
      const type = 'updatedOn';

      const filters = {
        updatedOn: {
          name: DateFilters.lastMonth as string,
          customDateStart: new Date('2023-02-21T00:00:00.000Z'),
          customDateEnd: new Date('2023-02-23T00:00:00.000Z'),
        },
      };

      const queryParam = {
        or: [
          '(and(created_at.gte.2023-02-28T18:30:00.000Z,created_at.lt.2023-03-31T18:29:00.000Z))',
          `(and(updated_at.gte.2023-01-31T18:30:00.000Z,updated_at.lt.2023-02-28T18:29:00.000Z))`,
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type, usePlatformApi);
      expect(queryParam).toEqual({
        or: [
          '(and(created_at.gte.2023-02-28T18:30:00.000Z,created_at.lt.2023-03-31T18:29:00.000Z))',
          '(and(updated_at.gte.2023-01-31T18:30:00.000Z,updated_at.lt.2023-02-28T18:29:00.000Z))',
          `(and(updated_at.gte.${thisMonth.from.toISOString()},updated_at.lt.${thisMonth.to.toISOString()}))`,
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getLastMonthRange).toHaveBeenCalledTimes(1);
    });
  });

  it('fetchTransactions(): should fetch transactions', (done) => {
    expenseAggregationService.post.and.returnValue(of(apiPersonalCardTxnsRes));
    const accountId = 'baccLesaRlyvLY';

    personalCardsService.fetchTransactions(accountId).subscribe((res) => {
      expect(res).toEqual(apiPersonalCardTxnsRes);
      expect(expenseAggregationService.post).toHaveBeenCalledOnceWith(`/bank_accounts/${accountId}/sync`, {
        owner_type: 'org_user',
      });
      done();
    });
  });

  describe('getMatchedExpensesSuggestions()', () => {
    it('should get expense suggestions using public api', (done) => {
      apiService.get.and.returnValue(of(publicPersonalCardTxnExpenseSuggestionsRes));

      const amount = 3;
      const txnDate = '2021-07-29T06:30:00.000Z';
      const usePlatformApi = false;

      personalCardsService.getMatchedExpensesSuggestions(amount, txnDate, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(publicPersonalCardTxnExpenseSuggestionsRes);
        expect(apiService.get).toHaveBeenCalledOnceWith('/expense_suggestions/personal_cards', {
          params: {
            amount,
            txn_dt: txnDate,
          },
        });
        done();
      });
    });

    it('should get expense suggestions using platform api', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformPersonalCardTxnExpenseSuggestionsRes));

      const amount = 3;
      const txnDate = '2021-07-29T06:30:00.000Z';
      const usePlatformApi = true;

      personalCardsService.getMatchedExpensesSuggestions(amount, txnDate, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(platformPersonalCardTxnExpenseSuggestions);
        done();
      });
    });
  });

  describe('matchExpense()', () => {
    it('should match an expense using public api', (done) => {
      const usePlatformApi = false;
      const response = {
        external_expense_id: 'tx3nHShG60zz',
        transaction_split_group_id: 'tx3nHShG60zq',
      };

      apiService.post.and.returnValue(of(response));
      const externalExpenseId = 'tx3nHShG60zz';
      const txnSplitGroupId = 'tx3nHShG60zq';

      personalCardsService.matchExpense(txnSplitGroupId, externalExpenseId, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(response);
        expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/external_expense/match', {
          transaction_split_group_id: txnSplitGroupId,
          external_expense_id: externalExpenseId,
        });
        done();
      });
    });

    it('should match an expense using platform api', (done) => {
      const response = {
        external_expense_id: 'btxndbZdAth0x4',
        transaction_split_group_id: 'tx3nHShG60zq',
      };
      spenderPlatformV1ApiService.post.and.returnValue(of(platformMatchExpenseResponse));
      const usePlatformApi = true;
      const externalExpenseId = 'btxndbZdAth0x4';
      const txnSplitGroupId = 'tx3nHShG60zq';

      personalCardsService.matchExpense(txnSplitGroupId, externalExpenseId, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(response);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_card_transactions/match', {
          data: {
            id: externalExpenseId,
            expense_split_group_id: txnSplitGroupId,
          },
        });
        done();
      });
    });
  });

  describe('hideTransactions()', () => {
    it('should hide transactions using public api', (done) => {
      expenseAggregationService.post.and.returnValue(of(apiExpenseRes));
      const usePlatformApi = false;
      const txnIds = ['tx3nHShG60zq'];

      personalCardsService.hideTransactions(txnIds, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(txnIds.length);
        expect(expenseAggregationService.post).toHaveBeenCalledOnceWith('/bank_transactions/hide/bulk', {
          bank_transaction_ids: txnIds,
        });
        done();
      });
    });

    it('should hide transactions using platform api', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of({}));
      const usePlatformApi = true;
      const txnIds = ['tx3nHShG60zq', 'tx3nHShG60zw'];

      personalCardsService.hideTransactions(txnIds, usePlatformApi).subscribe((res) => {
        expect(res).toEqual(txnIds.length);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_card_transactions/hide/bulk', {
          data: txnIds.map((txnId) => ({ id: txnId })),
        });
        done();
      });
    });
  });

  it('htmlFormUrl(): get html from URL', () => {
    const URL = 'https://repo1.maven.org/maven2';

    expect(personalCardsService.htmlFormUrl(URL, '123')).toEqual(
      'data:text/html;base64,PGZvcm0gaWQ9ImZhc3RsaW5rLWZvcm0iIG5hbWU9ImZhc3RsaW5rLWZvcm0iIGFjdGlvbj0iaHR0cHM6Ly9yZXBvMS5tYXZlbi5vcmcvbWF2ZW4yIiBtZXRob2Q9IlBPU1QiPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuYW1lPSJhY2Nlc3NUb2tlbiIgdmFsdWU9IkJlYXJlciAxMjMiIGhpZGRlbj0idHJ1ZSIgLz4KICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgIG5hbWU9ImV4dHJhUGFyYW1zIiB2YWx1ZT0iY29uZmlnTmFtZT1BZ2dyZWdhdGlvbiZjYWxsYmFjaz1odHRwczovL3d3dy5meWxlaHEuY29tIiBoaWRkZW49InRydWUiIC8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPiAKICAgICAgICAgICAgICAgICAgICAgICAgICA8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoImZhc3RsaW5rLWZvcm0iKS5zdWJtaXQoKTsKICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NjcmlwdD4KICAgICAgICAgICAgICAgICAgICAgICAgICA='
    );
  });

  describe('getToken()', () => {
    it('should get access token using public api', (done) => {
      expenseAggregationService.get.and.returnValue(of(apiToken));
      const usePlatformApi = false;

      personalCardsService.getToken(usePlatformApi).subscribe((res) => {
        expect(res).toEqual(apiToken);
        expect(expenseAggregationService.get).toHaveBeenCalledOnceWith('/yodlee/personal/access_token');
        done();
      });
    });

    it('should get access token using platform api', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of(personalCardAccessTokenResponse));
      const usePlatformApi = true;

      personalCardsService.getToken(usePlatformApi).subscribe((res) => {
        expect(res.access_token).toEqual(personalCardAccessTokenResponse.data.access_token);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_cards/access_token');
        done();
      });
    });
  });
});
