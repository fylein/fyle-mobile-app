import { TestBed } from '@angular/core/testing';
import { PersonalCardsService } from './personal-cards.service';
import { ApiService } from './api.service';
import { ExpenseAggregationService } from './expense-aggregation.service';
import { DateService } from './date.service';
import { allFilterPills, creditTxnFilterPill, debitTxnFilterPill } from '../mock-data/filter-pills.data';
import { deletePersonalCardPlatformRes, platformApiLinkedAccRes } from '../mock-data/personal-cards.data';
import { of } from 'rxjs';
import {
  platformMatchExpenseResponse,
  platformPersonalCardTxns,
  platformQueryParams,
  platformTxnsConfig,
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
import { platformPersonalCardTxnExpenseSuggestionsRes } from '../mock-data/personal-card-txn-expense-suggestions.data';
import { PlatformPersonalCardFilterParams } from '../models/platform/platform-personal-card-filter-params.model';

describe('PersonalCardsService', () => {
  let personalCardsService: PersonalCardsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let expenseAggregationService: jasmine.SpyObj<ExpenseAggregationService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let dateService: DateService;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post', 'get']);
    const expenseAggregationServiceSpy = jasmine.createSpyObj('ExpenseAggregationService', ['get', 'post', 'delete']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        PersonalCardsService,
        DateService,
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
    expenseAggregationService = TestBed.inject(ExpenseAggregationService) as jasmine.SpyObj<ExpenseAggregationService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(personalCardsService).toBeTruthy();
  });

  describe('helper functions', () => {
    it('addTransactionTypeToTxns: should add transactionType property to personal card txn.', () => {
      expect(personalCardsService.addTransactionTypeToTxns(platformPersonalCardTxns.data)).toEqual(
        platformPersonalCardTxns.data
      );
    });
  });

  describe('getPersonalCards()', () => {
    it('should get linked personal cards when using platform api', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformApiLinkedAccRes));

      personalCardsService.getPersonalCards().subscribe((res) => {
        expect(res).toEqual(platformApiLinkedAccRes.data);
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/personal_cards');
        done();
      });
    });
  });

  describe('getPersonalCardsCount()', () => {
    it('should get linked personal cards count when using platform api', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformApiLinkedAccRes));

      personalCardsService.getPersonalCardsCount().subscribe((res) => {
        expect(res).toEqual(platformApiLinkedAccRes.count);
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/personal_cards');
        done();
      });
    });
  });

  describe('deleteAccount()', () => {
    it('should delete personal card when using platform api', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of(deletePersonalCardPlatformRes));

      const accountId = 'bacc0By33NqhnS';
      const payload = {
        data: {
          id: accountId,
        },
      };

      personalCardsService.deleteAccount(accountId).subscribe((res) => {
        expect(res).toEqual(deletePersonalCardPlatformRes.data);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_cards/delete', payload);
        done();
      });
    });
  });

  describe('getBankTransactions()', () => {
    it('should get bank transactions when using platform api', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformPersonalCardTxns));

      personalCardsService.getBankTransactions(platformTxnsConfig).subscribe((res) => {
        expect(res).toEqual(platformPersonalCardTxns);
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/personal_card_transactions', {
          params: {
            limit: platformTxnsConfig.limit,
            offset: platformTxnsConfig.offset,
            ...platformTxnsConfig.queryParams,
            order: 'spent_at.desc,id.desc',
          },
        });
        done();
      });
    });
  });

  describe('getBankTransactionsCount', () => {
    it('should get bank transaction count using platform api', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformPersonalCardTxns));
      personalCardsService.getBankTransactionsCount(platformQueryParams).subscribe((res) => {
        expect(res).toEqual(platformPersonalCardTxns.count);
        done();
      });
    });
  });

  describe('postBankAccounts()', () => {
    it('should link personal cards using platform api', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of(platformApiLinkedAccRes));

      personalCardsService.postBankAccounts().subscribe((res) => {
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
    it('should generate credit params for platform API with transactionType credit', () => {
      const queryParam = {
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
        amount: undefined,
      };

      const filter = {
        transactionType: 'Credit',
      };
      personalCardsService.generateCreditParams(queryParam, filter);
      expect(queryParam).toEqual({
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
        amount: 'lte.0',
      });
    });

    it('should generate debit params for platform API with transactionType debit', () => {
      const queryParam = {
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
        amount: undefined,
      };

      const filter = {
        transactionType: 'Debit',
      };

      personalCardsService.generateCreditParams(queryParam, filter);
      expect(queryParam).toEqual({
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
        amount: 'gte.0',
      });
    });

    it('should not modify queryParam if transactionType is not provided', () => {
      const queryParam = {
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {};

      personalCardsService.generateCreditParams(queryParam, filter);
      expect(queryParam).toEqual({
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      });
    });

    it('should not modify queryParam if filters are empty', () => {
      const queryParam = {
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateCreditParams(queryParam, {});
      expect(queryParam).toEqual({
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      });
    });
  });

  describe('generateCustomDateParams():', () => {
    it(' should generate custom date params with both start and end dates', () => {
      const queryParam: Partial<PlatformPersonalCardQueryParams> = {
        or: ['(and(created_at.gte.2023-02-22T18:30:00.000Z,created_at.lt.2023-02-27T18:30:00.000Z))'],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {
        createdOn: {
          name: 'custom',
          customDateStart: new Date('2023-02-22T18:30:00.000Z'),
          customDateEnd: new Date('2023-02-27T18:30:00.000Z'),
        },
      };

      const type = 'createdOn';
      const queryType = 'created_at';

      personalCardsService.generateCustomDateParams(queryParam, filter, type, queryType);
      expect(queryParam).toEqual({
        or: [
          '(and(created_at.gte.2023-02-22T18:30:00.000Z,created_at.lt.2023-02-27T18:30:00.000Z))',
          '(and(created_at.gte.2023-02-22T18:30:00.000Z,created_at.lt.2023-02-27T18:30:00.000Z))',
        ],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      });
    });

    it(' should generate custom date params with start date', () => {
      const queryParam: Partial<PlatformPersonalCardQueryParams> = {
        or: ['(and(created_at.gte.2023-02-22T18:30:00.000Z,created_at.lt.2023-02-27T18:30:00.000Z))'],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {
        createdOn: {
          name: 'custom',
          customDateStart: new Date('2023-02-22T18:30:00.000Z'),
        },
      };

      const type = 'createdOn';
      const queryType = 'created_at';

      personalCardsService.generateCustomDateParams(queryParam, filter, type, queryType);
      expect(queryParam).toEqual({
        or: [
          '(and(created_at.gte.2023-02-22T18:30:00.000Z,created_at.lt.2023-02-27T18:30:00.000Z))',
          '(and(created_at.gte.2023-02-22T18:30:00.000Z))',
        ],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      });
    });

    it(' should generate custom date params with end date', () => {
      const queryParam: Partial<PlatformPersonalCardQueryParams> = {
        or: ['(and(created_at.gte.2023-02-22T18:30:00.000Z,created_at.lt.2023-02-27T18:30:00.000Z))'],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      };

      const filter = {
        createdOn: {
          name: 'custom',
          customDateEnd: new Date('2023-02-27T18:30:00.000Z'),
        },
      };

      const type = 'createdOn';
      const queryType = 'created_at';

      personalCardsService.generateCustomDateParams(queryParam, filter, type, queryType);
      expect(queryParam).toEqual({
        or: [
          '(and(created_at.gte.2023-02-22T18:30:00.000Z,created_at.lt.2023-02-27T18:30:00.000Z))',
          '(and(created_at.lt.2023-02-27T18:30:00.000Z))',
        ],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
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
          label: 'Created date',
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
          label: 'Created date',
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
          label: 'Created date',
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
          label: 'Updated date',
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
          label: 'Updated date',
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
          label: 'Updated date',
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
          label: 'Created date',
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
          label: 'Created date',
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
          label: 'Created date',
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
          label: 'Created date',
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
          label: 'Created date',
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
          label: 'Updated date',
          type: 'date',
          value: '>= 2023-02-21',
        },
      ]);
    });
  });

  it('should generate filter pills with all properties', () => {
    expect(personalCardsService.generateFilterPills(filterData1)).toEqual(allFilterPills);
  });

  describe('generateDateParams(): when using platform api', () => {
    it('should generate date params when range is this month', () => {
      spyOn(dateService, 'getThisMonthRange').and.returnValue({
        from: new Date('2023-02-28T18:30:00.000Z'),
        to: new Date('2023-03-31T18:29:00.000Z'),
      });
      const data = {
        range: 'This Month',
      };

      const queryParams: Partial<PlatformPersonalCardFilterParams> = {
        queryParams: {
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: ['(and(spent_at.gte.2023-02-28T18:30:00.000Z,spent_at.lt.2023-03-31T18:29:00.000Z))'],
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
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
      const queryParams: Partial<PlatformPersonalCardFilterParams> = {
        queryParams: {
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: ['(and(spent_at.gte.2023-01-31T18:30:00.000Z,spent_at.lt.2023-02-28T18:29:00.000Z))'],
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
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

      const queryParams: Partial<PlatformPersonalCardFilterParams> = {
        queryParams: {
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: ['(and(spent_at.gte.2023-01-30T09:41:35.002Z,spent_at.lt.2023-03-01T09:41:35.002Z))'],
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
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
      const queryParams: Partial<PlatformPersonalCardFilterParams> = {
        queryParams: {
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: ['(and(spent_at.gte.2022-12-31T11:27:02.760Z,spent_at.lt.2023-03-01T11:27:02.760Z))'],
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
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
      const queryParams: Partial<PlatformPersonalCardFilterParams> = {
        queryParams: {
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: ['(and(spent_at.gte.2022-12-01T11:32:26.779Z,spent_at.lt.2023-03-01T11:32:26.779Z))'],
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
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
      const queryParams: Partial<PlatformPersonalCardFilterParams> = {
        queryParams: {
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      };

      expect(personalCardsService.generateDateParams(data, queryParams)).toEqual({
        queryParams: {
          or: ['(and(spent_at.gte.2023-01-31T18:30:00.000Z,spent_at.lt.2023-02-28T18:29:00.000Z))'],
          state: 'in.(INITIALIZED)',
          personal_card_id: 'eq.baccLesaRlyvLY',
        },
        pageNumber: 1,
      });
    });
  });

  describe('generateTxnDateParams(): when using platform api', () => {
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

      const queryParam: Partial<PlatformPersonalCardQueryParams> = {
        or: ['(and(created_at.gte.2023-02-28T18:30:00.000Z,created_at.lt.2023-03-31T18:29:00.000Z))'],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type);
      expect(queryParam).toEqual({
        or: [
          '(and(created_at.gte.2023-02-28T18:30:00.000Z,created_at.lt.2023-03-31T18:29:00.000Z))',
          `(and(created_at.gte.${thisWeek.from.toISOString()},created_at.lt.${thisWeek.to.toISOString()}))`,
        ],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
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

      const queryParam: Partial<PlatformPersonalCardQueryParams> = {
        or: ['(and(updated_at.gte.2023-01-31T18:30:00.000Z,updated_at.lt.2023-02-28T18:29:00.000Z))'],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type);
      expect(queryParam).toEqual({
        or: [
          '(and(updated_at.gte.2023-01-31T18:30:00.000Z,updated_at.lt.2023-02-28T18:29:00.000Z))',
          `(and(created_at.gte.${thisMonth.from.toISOString()},created_at.lt.${thisMonth.to.toISOString()}))`,
        ],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
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

      const queryParam: Partial<PlatformPersonalCardQueryParams> = {
        or: [
          '(and(created_at.gte.2023-02-28T18:30:00.000Z,created_at.lt.2023-03-31T18:29:00.000Z))',
          `(and(updated_at.gte.2023-01-31T18:30:00.000Z,updated_at.lt.2023-02-28T18:29:00.000Z))`,
        ],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type);
      expect(queryParam).toEqual({
        or: [
          '(and(created_at.gte.2023-02-28T18:30:00.000Z,created_at.lt.2023-03-31T18:29:00.000Z))',
          '(and(updated_at.gte.2023-01-31T18:30:00.000Z,updated_at.lt.2023-02-28T18:29:00.000Z))',
          `(and(updated_at.gte.${thisMonth.from.toISOString()},updated_at.lt.${thisMonth.to.toISOString()}))`,
        ],
        state: 'in.(INITIALIZED)',
        personal_card_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getLastMonthRange).toHaveBeenCalledTimes(1);
    });
  });

  describe('syncTransactions()', () => {
    it('should fetch transactions using platform api', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: {} }));
      const accountId = 'baccLesaRlyvLY';
      const payload = {
        data: {
          personal_card_id: accountId,
        },
      };

      personalCardsService.syncTransactions(accountId).subscribe((res) => {
        expect(res).toEqual({ data: {} });
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_card_transactions', payload);
        done();
      });
    });
  });

  describe('getMatchedExpensesSuggestions()', () => {
    it('should get expense suggestions using platform api', (done) => {
      spenderPlatformV1ApiService.get.and.returnValue(of(platformPersonalCardTxnExpenseSuggestionsRes));

      const amount = 3;
      const txnDate = '2021-07-29T06:30:00.000Z';

      personalCardsService.getMatchedExpensesSuggestions(amount, txnDate).subscribe((res) => {
        expect(res).toEqual(platformPersonalCardTxnExpenseSuggestionsRes.data);
        done();
      });
    });
  });

  describe('matchExpense()', () => {
    it('should match an expense using platform api', (done) => {
      const response = {
        external_expense_id: 'btxndbZdAth0x4',
        transaction_split_group_id: 'tx3nHShG60zq',
      };
      spenderPlatformV1ApiService.post.and.returnValue(of(platformMatchExpenseResponse));
      const externalExpenseId = 'btxndbZdAth0x4';
      const txnSplitGroupId = 'tx3nHShG60zq';

      personalCardsService.matchExpense(txnSplitGroupId, externalExpenseId).subscribe((res) => {
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
    it('should hide transactions using platform api', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of({}));
      const txnIds = ['tx3nHShG60zq', 'tx3nHShG60zw'];

      personalCardsService.hideTransactions(txnIds).subscribe((res) => {
        expect(res).toEqual(txnIds.length);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_card_transactions/hide/bulk', {
          data: txnIds.map((txnId) => ({ id: txnId })),
        });
        done();
      });
    });
  });

  describe('htmlFormUrl()', () => {
    const baseUrl = 'https://repo1.maven.org/maven2';

    it('should generate the correct HTML for a normal flow', () => {
      const accessToken = '123';
      const isMfaFlow = false;

      const result = personalCardsService.htmlFormUrl(baseUrl, accessToken, isMfaFlow);
      const expectedExtraParams = 'configName=Aggregation&callback=https://www.fylehq.com';
      const expectedHtml = `<form id="fastlink-form" name="fastlink-form" action="${baseUrl}" method="POST">
                          <input name="accessToken" value="Bearer ${accessToken}" hidden="true" />
                          <input  name="extraParams" value="${expectedExtraParams}" hidden="true" />
                          </form> 
                          <script type="text/javascript">
                          document.getElementById("fastlink-form").submit();
                          </script>
                          `;
      const expectedEncodedHtml = 'data:text/html;base64,' + btoa(expectedHtml);

      expect(result).toEqual(expectedEncodedHtml);
    });

    it('should generate the correct HTML for an MFA flow with providerAccountId', () => {
      const accessToken = '789';
      const isMfaFlow = true;
      const providerAccountId = 'test-provider-id';

      const result = personalCardsService.htmlFormUrl(baseUrl, accessToken, isMfaFlow, providerAccountId);
      const expectedExtraParams = `configName=Aggregation&flow=refresh&providerAccountId=${providerAccountId}&callback=https://www.fylehq.com`;
      const expectedHtml = `<form id="fastlink-form" name="fastlink-form" action="${baseUrl}" method="POST">
                          <input name="accessToken" value="Bearer ${accessToken}" hidden="true" />
                          <input  name="extraParams" value="${expectedExtraParams}" hidden="true" />
                          </form> 
                          <script type="text/javascript">
                          document.getElementById("fastlink-form").submit();
                          </script>
                          `;
      const expectedEncodedHtml = 'data:text/html;base64,' + btoa(expectedHtml);

      expect(result).toEqual(expectedEncodedHtml);
    });
  });

  describe('getToken()', () => {
    it('should get access token using platform api', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of(personalCardAccessTokenResponse));

      personalCardsService.getToken().subscribe((res) => {
        expect(res.access_token).toEqual(personalCardAccessTokenResponse.data.access_token);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_cards/access_token');
        done();
      });
    });
  });

  describe('isMfaEnabled()', () => {
    it('should get is_mfa_enabled using platform api', (done) => {
      const personalCardId = '12345';
      const mockApiResponse = {
        data: {
          is_mfa_enabled: true,
        },
      };
      spenderPlatformV1ApiService.post.and.returnValue(of(mockApiResponse));

      personalCardsService.isMfaEnabled(personalCardId).subscribe((res) => {
        expect(res).toBeTrue();
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/personal_cards/mfa', {
          data: {
            id: personalCardId,
          },
        });
        done();
      });
    });
  });
});
