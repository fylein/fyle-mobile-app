import { TestBed } from '@angular/core/testing';
import { PersonalCardsService } from './personal-cards.service';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ExpenseAggregationService } from './expense-aggregation.service';
import { DateService } from './date.service';
import { allFilterPills, creditTxnFilterPill, debitTxnFilterPill } from '../mock-data/filter-pills.data';
import { apiLinkedAccRes, deletePersonalCardRes } from '../mock-data/personal-cards.data';
import { of } from 'rxjs';
import { apiPersonalCardTxnsRes } from '../mock-data/personal-card-txns.data';
import { selectedFilters1, selectedFilters2 } from '../mock-data/selected-filters.data';
import { filterData1 } from '../mock-data/filter.data';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';
import { apiExpenseRes, etxncData } from '../mock-data/expense.data';
import * as dayjs from 'dayjs';

describe('PersonalCardsService', () => {
  let personalCardsService: PersonalCardsService;
  let apiV2Service: jasmine.SpyObj<ApiV2Service>;
  let apiService: jasmine.SpyObj<ApiService>;
  let expenseAggregationService: jasmine.SpyObj<ExpenseAggregationService>;
  let dateService: DateService;

  beforeEach(() => {
    const apiV2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post', 'get']);
    const expenseAggregationServiceSpy = jasmine.createSpyObj('ExpenseAggregationService', ['get', 'post', 'delete']);
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
      ],
    });
    personalCardsService = TestBed.inject(PersonalCardsService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    expenseAggregationService = TestBed.inject(ExpenseAggregationService) as jasmine.SpyObj<ExpenseAggregationService>;
  });

  it('should be created', () => {
    expect(personalCardsService).toBeTruthy();
  });

  it('getLinkedAccounts(): should get linked personal cards', (done) => {
    apiV2Service.get.and.returnValue(of(apiLinkedAccRes));

    personalCardsService.getLinkedAccounts().subscribe((res) => {
      expect(res).toEqual(apiLinkedAccRes.data);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/personal_bank_accounts', {
        params: {
          order: 'last_synced_at.desc',
        },
      });
      done();
    });
  });

  it('getLinkedAccountsCount(): should get linked cards count', (done) => {
    apiV2Service.get.and.returnValue(of(apiLinkedAccRes));

    personalCardsService.getLinkedAccountsCount().subscribe((res) => {
      expect(res).toEqual(apiLinkedAccRes.count);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/personal_bank_accounts', {
        params: {
          order: 'last_synced_at.desc',
        },
      });
      done();
    });
  });

  it('getBankTransactions(): should get bank transactions', (done) => {
    apiV2Service.get.and.returnValue(of(apiPersonalCardTxnsRes));

    const config = {
      offset: 0,
      limit: 10,
      queryParams: {
        btxn_status: 'in.(MATCHED)',
        ba_id: 'eq.baccLesaRlyvLY',
      },
    };

    personalCardsService.getBankTransactions(config).subscribe((res) => {
      expect(res).toEqual(apiPersonalCardTxnsRes);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/personal_bank_transactions', {
        params: {
          limit: config.limit,
          offset: config.offset,
          ...config.queryParams,
        },
      });
      done();
    });
  });

  it('getBankTransactionsCount(): should bank transaction count', (done) => {
    spyOn(personalCardsService, 'getBankTransactions').and.returnValue(of(apiPersonalCardTxnsRes));

    const queryParams = {
      btxn_status: 'in.(MATCHED)',
      ba_id: 'eq.baccLesaRlyvLY',
    };

    const config = {
      offset: 0,
      limit: 10,
      queryParams,
    };

    personalCardsService.getBankTransactionsCount(queryParams).subscribe((res) => {
      expect(res).toEqual(apiPersonalCardTxnsRes.count);
      expect(personalCardsService.getBankTransactions).toHaveBeenCalledOnceWith(config);
      done();
    });
  });

  it('deleteAccount(): should delete a personal card', (done) => {
    expenseAggregationService.delete.and.returnValue(of(deletePersonalCardRes));

    const accountId = 'bacc0By33NqhnS';

    personalCardsService.deleteAccount(accountId).subscribe((res) => {
      expect(res).toEqual(deletePersonalCardRes);
      expect(expenseAggregationService.delete).toHaveBeenCalledOnceWith(`/bank_accounts/${accountId}`);
      done();
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

  it('generateCreditParams(): should generate credit params', () => {
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
          customDateStart: '2023-02-21T00:00:00.000Z',
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

  describe('generateDateParams():', () => {
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

  describe('generateTxnDateParams():', () => {
    xit('should generate txn date param when range is this week', () => {
      spyOn(dateService, 'getThisWeekRange').and.returnValue({
        from: dayjs().startOf('week'),
        to: dayjs().startOf('week').add(7, 'days'),
      });
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
          '(and(btxn_created_at.gte.2023-02-25T00:00:00.000Z,btxn_created_at.lt.2023-03-04T00:00:00.000Z))',
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getThisWeekRange).toHaveBeenCalledTimes(1);
    });

    it('should generate txn date param when range is this month', () => {
      spyOn(dateService, 'getThisMonthRange').and.returnValue({
        from: new Date('2023-02-28T00:00:00.000Z'),
        to: new Date('2023-03-31T00:00:00.000Z'),
      });
      const type = 'updatedOn';

      const filters = {
        updatedOn: {
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
          '(and(btxn_updated_at.gte.2023-02-28T00:00:00.000Z,btxn_updated_at.lt.2023-03-31T00:00:00.000Z))',
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getThisMonthRange).toHaveBeenCalledTimes(1);
    });

    it('should generate txn date param when range is last month', () => {
      spyOn(dateService, 'getLastMonthRange').and.returnValue({
        from: new Date('2023-01-31T00:00:00.000Z'),
        to: new Date('2023-02-28T00:00:00.000Z'),
      });
      const type = 'updatedOn';

      const filters = {
        updatedOn: {
          name: DateFilters.lastMonth,
          customDateStart: '2023-02-21T00:00:00.000Z',
          customDateEnd: '2023-02-23T00:00:00.000Z',
        },
      };

      const queryParam = {
        or: [
          '(and(btxn_created_at.gte.2023-02-28T18:30:00.000Z,btxn_created_at.lt.2023-03-31T18:29:00.000Z))',
          '(and(btxn_updated_at.gte.2023-01-31T18:30:00.000Z,btxn_updated_at.lt.2023-02-28T18:29:00.000Z))',
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      };

      personalCardsService.generateTxnDateParams(queryParam, filters, type);
      expect(queryParam).toEqual({
        or: [
          '(and(btxn_created_at.gte.2023-02-28T18:30:00.000Z,btxn_created_at.lt.2023-03-31T18:29:00.000Z))',
          '(and(btxn_updated_at.gte.2023-01-31T18:30:00.000Z,btxn_updated_at.lt.2023-02-28T18:29:00.000Z))',
          '(and(btxn_updated_at.gte.2023-01-31T00:00:00.000Z,btxn_updated_at.lt.2023-02-28T00:00:00.000Z))',
        ],
        btxn_status: 'in.(INITIALIZED)',
        ba_id: 'eq.baccLesaRlyvLY',
      });
      expect(dateService.getLastMonthRange).toHaveBeenCalledTimes(1);
    });
  });

  it('getExpenseDetails(): should get expense details', (done) => {
    apiV2Service.get.and.returnValue(of(etxncData));

    const txnSplitGroupID = 'txOJVaaPxo9O';

    personalCardsService.getExpenseDetails(txnSplitGroupID).subscribe((res) => {
      expect(res).toEqual(etxncData.data[0]);
      expect(apiV2Service.get).toHaveBeenCalledOnceWith('/expenses', {
        params: {
          tx_split_group_id: `eq.${txnSplitGroupID}`,
        },
      });
      done();
    });
  });

  it('fetchTransactions(): should fetch transactions', (done) => {
    expenseAggregationService.post.and.returnValue(of(null));
    const accountId = 'baccLesaRlyvLY';

    personalCardsService.fetchTransactions(accountId).subscribe(() => {
      expect(expenseAggregationService.post).toHaveBeenCalledOnceWith(`/bank_accounts/${accountId}/sync`, {
        owner_type: 'org_user',
      });
      done();
    });
  });

  it('getMatchedExpenses(): should get matched expenses', (done) => {
    apiService.get.and.returnValue(of(apiExpenseRes));

    const amount = 3;
    const txnDate = '2021-07-29T06:30:00.000Z';

    personalCardsService.getMatchedExpenses(amount, txnDate).subscribe((res) => {
      expect(res).toEqual(apiExpenseRes);
      expect(apiService.get).toHaveBeenCalledOnceWith('/expense_suggestions/personal_cards', {
        params: {
          amount,
          txn_dt: txnDate,
        },
      });
      done();
    });
  });

  it('getMatchedExpensesCount(): should get matched expenses count', (done) => {
    spyOn(personalCardsService, 'getMatchedExpenses').and.returnValue(of(apiExpenseRes));

    const amount = 3;
    const txnDate = '2021-07-29T06:30:00.000Z';

    personalCardsService.getMatchedExpensesCount(amount, txnDate).subscribe((res) => {
      expect(res).toEqual(apiExpenseRes.length);
      expect(personalCardsService.getMatchedExpenses).toHaveBeenCalledOnceWith(amount, txnDate);
      done();
    });
  });

  it('matchExpense(): should match an expense', (done) => {
    const response = {
      id: 'tx3nHShG60zq',
      transaction_split_group_id: 'tx3nHShG60zq',
    };

    apiService.post.and.returnValue(of(response));
    const txnSplitGrp = 'tx3nHShG60zq';

    personalCardsService.matchExpense(txnSplitGrp, null).subscribe((res) => {
      expect(res).toEqual(response);
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/external_expense/match', {
        transaction_split_group_id: txnSplitGrp,
        external_expense_id: null,
      });
      done();
    });
  });

  it('unmatchExpense(): should unmatch an expense', (done) => {
    apiService.post.and.returnValue(of(null));

    const txnSplitGroupID = 'tx2ZttMRItRx';
    const externalId = 'btxntEdVJeYyyx';

    personalCardsService.unmatchExpense(txnSplitGroupID, externalId).subscribe((res) => {
      expect(res).toBeNull();
      expect(apiService.post).toHaveBeenCalledOnceWith('/transactions/external_expense/unmatch', {
        transaction_split_group_id: txnSplitGroupID,
        external_expense_id: externalId,
      });
      done();
    });
  });

  it('hideTransactions(): should hide transactions', (done) => {
    expenseAggregationService.post.and.returnValue(of(apiExpenseRes));

    const txn_ids = ['tx3nHShG60zq'];

    personalCardsService.hideTransactions(txn_ids).subscribe((res) => {
      expect(res).toEqual(apiExpenseRes);
      expect(expenseAggregationService.post).toHaveBeenCalledOnceWith('/bank_transactions/hide/bulk', {
        bank_transaction_ids: txn_ids,
      });
      done();
    });
  });

  it('htmlFormUrl(): get html from URL', () => {
    const URL = 'https://repo1.maven.org/maven2';

    expect(personalCardsService.htmlFormUrl(URL, '123')).toEqual(
      'data:text/html;base64,PGZvcm0gaWQ9ImZhc3RsaW5rLWZvcm0iIG5hbWU9ImZhc3RsaW5rLWZvcm0iIGFjdGlvbj0iaHR0cHM6Ly9yZXBvMS5tYXZlbi5vcmcvbWF2ZW4yIiBtZXRob2Q9IlBPU1QiPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuYW1lPSJhY2Nlc3NUb2tlbiIgdmFsdWU9IkJlYXJlciAxMjMiIGhpZGRlbj0idHJ1ZSIgLz4KICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgIG5hbWU9ImV4dHJhUGFyYW1zIiB2YWx1ZT0iY29uZmlnTmFtZT1BZ2dyZWdhdGlvbiZjYWxsYmFjaz1odHRwczovL3d3dy5meWxlaHEuY29tIiBoaWRkZW49InRydWUiIC8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPiAKICAgICAgICAgICAgICAgICAgICAgICAgICA8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoImZhc3RsaW5rLWZvcm0iKS5zdWJtaXQoKTsKICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NjcmlwdD4KICAgICAgICAgICAgICAgICAgICAgICAgICA='
    );
  });
});
