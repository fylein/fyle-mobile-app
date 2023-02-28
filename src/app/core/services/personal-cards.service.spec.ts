import { TestBed } from '@angular/core/testing';
import { PersonalCardsService } from './personal-cards.service';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ExpenseAggregationService } from './expense-aggregation.service';
import { DateService } from './date.service';
import { creditTxnFilterPill, debitTxnFilterPill } from '../mock-data/filter-pills.data';
import { apiLinkedAccRes, deletePersonalCardRes } from '../mock-data/personal-cards.data';
import { of } from 'rxjs';
import { apiPersonalCardTxnsRes } from '../mock-data/personal-card-txns.data';
import { selectedFilters1 } from '../mock-data/selected-filters.data';

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
    expect(personalCardsService.convertFilters(selectedFilters1)).toEqual({
      createdOn: {
        name: 'custom',
        customDateStart: new Date('2023-02-20T18:30:00.000Z'),
        customDateEnd: new Date('2023-02-22T18:30:00.000Z'),
      },
      updatedOn: {
        name: 'custom',
        customDateStart: new Date('2023-02-22T18:30:00.000Z'),
        customDateEnd: new Date('2023-02-24T18:30:00.000Z'),
      },
      transactionType: 'Debit',
    });
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
});
