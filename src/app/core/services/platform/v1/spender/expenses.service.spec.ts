import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExpensesService } from './expenses.service';
import { SpenderService } from './spender.service';
import {
  expenseData,
  readyToReportExpensesData2,
  splitExpensesData,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { PAGINATION_SIZE } from 'src/app/constants';
import { expensesResponse } from 'src/app/core/mock-data/platform/v1/expenses-response.data';
import { getExpensesQueryParams } from 'src/app/core/mock-data/platform/v1/expenses-query-params.data';
import { expenseDuplicateSets } from 'src/app/core/mock-data/platform/v1/expense-duplicate-sets.data';
import { completeStats } from 'src/app/core/mock-data/platform/v1/expenses-stats.data';
import { ExpensesService as SharedExpenseService } from '../shared/expenses.service';
import { expensesCacheBuster$ } from 'src/app/core/cache-buster/expense-cache-buster';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let spenderService: jasmine.SpyObj<SpenderService>;
  let sharedExpenseService: jasmine.SpyObj<SharedExpenseService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);
    const sharedExpenseServiceSpy = jasmine.createSpyObj('SharedExpenseService', ['generateStatsQueryParams']);

    TestBed.configureTestingModule({
      providers: [
        { provide: SpenderService, useValue: spenderServiceSpy },
        { provide: SharedExpenseService, useValue: sharedExpenseServiceSpy },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    service = TestBed.inject(ExpensesService);
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
    sharedExpenseService = TestBed.inject(SharedExpenseService) as jasmine.SpyObj<SharedExpenseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getExpenseById(): should return expense with the given id', (done) => {
    spenderService.get.and.returnValue(of({ data: [expenseData] }));
    const expenseId = 'txOJVaaPxo9O';

    service.getExpenseById(expenseId).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(expenseData);

      expect(spenderService.get).toHaveBeenCalledOnceWith(`/expenses`, {
        params: {
          id: `eq.${expenseId}`,
        },
      });
      done();
    });
  });

  it('getExpensesCount(): should return the count of expenses', (done) => {
    spenderService.get.and.returnValue(of(expensesResponse));

    service.getExpensesCount(getExpensesQueryParams).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(expensesResponse.count);

      expect(spenderService.get).toHaveBeenCalledOnceWith('/expenses', {
        params: getExpensesQueryParams,
      });
      done();
    });
  });

  it('getExpenses(): should return the expenses', (done) => {
    spenderService.get.and.returnValue(of(expensesResponse));

    service.getExpenses(getExpensesQueryParams).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(expensesResponse.data);

      expect(spenderService.get).toHaveBeenCalledOnceWith('/expenses', {
        params: getExpensesQueryParams,
      });
      done();
    });
  });

  describe('getAllExpenses(): ', () => {
    it('should get all expenses for multiple pages', (done) => {
      expensesCacheBuster$.next(null);
      spyOn(service, 'getExpensesCount').and.returnValue(of(4));
      spyOn(service, 'getExpenses').and.returnValue(of(readyToReportExpensesData2));

      const queryParams = {
        report_id: 'is.null',
        state: 'in.(COMPLETE)',
        order: 'spent_at.desc',
        or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
      };

      service.getAllExpenses({ queryParams }).subscribe((res) => {
        expect(res.length).toEqual(4);
        expect(service.getExpensesCount).toHaveBeenCalledOnceWith(queryParams);
        expect(service.getExpenses).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should get all expenses in a single page', (done) => {
      expensesCacheBuster$.next(null);
      spyOn(service, 'getExpensesCount').and.returnValue(of(2));
      spyOn(service, 'getExpenses').and.returnValue(of(readyToReportExpensesData2));

      const queryParams = {
        report_id: 'is.null',
        state: 'in.(COMPLETE)',
        order: 'spent_at.desc',
        or: ['(policy_amount.is.null,policy_amount.gt.0.0001)'],
      };

      service.getAllExpenses({ queryParams }).subscribe((res) => {
        expect(res.length).toEqual(2);
        expect(service.getExpensesCount).toHaveBeenCalledOnceWith(queryParams);
        expect(service.getExpenses).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('getReportExpenses(): should return all expenses', (done) => {
    spyOn(service, 'getExpensesCount').and.returnValue(of(2));
    spyOn(service, 'getExpenses').and.returnValue(of(expensesResponse.data));
    const reportId = 'rpSGcIEwzxDd';
    const params = {
      report_id: `eq.${reportId}`,
      order: 'spent_at.desc,id.desc',
    };

    service.getReportExpenses(reportId).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(expensesResponse.data);
      expect(service.getExpensesCount).toHaveBeenCalledOnceWith(params);
      expect(service.getExpenses).toHaveBeenCalledWith({
        ...params,
        offset: 0,
        limit: 2,
      });
      done();
    });
  });

  it('getDuplicateSets(): should return expense duplicate sets', (done) => {
    spenderService.get.and.returnValue(of({ data: expenseDuplicateSets }));

    service.getDuplicateSets().subscribe((response) => {
      expect(response).toEqual(expenseDuplicateSets);

      expect(spenderService.get).toHaveBeenCalledOnceWith('/expenses/duplicate_sets');
      done();
    });
  });

  it('getDuplicatesByExpense() : should get the duplicates by expense', (done) => {
    const expenseId = 'txaiCW1efU0n';
    spenderService.get.and.returnValue(of({ data: expenseDuplicateSets }));

    service.getDuplicatesByExpense(expenseId).subscribe((response) => {
      expect(response).toEqual(expenseDuplicateSets);

      expect(spenderService.get).toHaveBeenCalledOnceWith('/expenses/duplicate_sets', {
        params: {
          expense_id: 'txaiCW1efU0n',
        },
      });
      done();
    });
  });

  it('getExpenseStats(): should get expense stats for unreported stats', (done) => {
    spenderService.post.and.returnValue(of(completeStats));
    sharedExpenseService.generateStatsQueryParams.and.returnValue(
      'state=in.(COMPLETE)&report_id=is.null&or=(policy_amount.is.null,policy_amount.gt.0.0001)'
    );

    const queryParams = {
      state: 'in.(COMPLETE)',
      report_id: 'is.null',
      or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
    };
    service.getExpenseStats(queryParams).subscribe((res) => {
      expect(res).toEqual(completeStats);
      expect(sharedExpenseService.generateStatsQueryParams).toHaveBeenCalledOnceWith(queryParams);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/stats', {
        data: {
          query_params: 'state=in.(COMPLETE)&report_id=is.null&or=(policy_amount.is.null,policy_amount.gt.0.0001)',
        },
      });
      done();
    });
  });

  it('dismissDuplicates(): should dismiss duplicate expenses', (done) => {
    spenderService.post.and.returnValue(of({}));

    const duplicateExpenseIds = ['tx1234', 'tx2345'];
    const targetExpenseIds = ['tx1234', 'tx2345'];

    service.dismissDuplicates(duplicateExpenseIds, targetExpenseIds).subscribe(() => {
      expect(spenderService.post).toHaveBeenCalledOnceWith('/expenses/dismiss_duplicates/bulk', {
        data: [
          {
            id: 'tx1234',
            duplicate_expense_ids: ['tx1234', 'tx2345'],
          },
          {
            id: 'tx2345',
            duplicate_expense_ids: ['tx1234', 'tx2345'],
          },
        ],
      });
      done();
    });
  });

  it('getSplitExpenses(): should return the list of expenses based on splitGroupId', (done) => {
    const splitGroupId = 'tx6I9xcOZFU6';
    const queryParams = {
      split_group_id: 'eq.tx6I9xcOZFU6',
    };
    spyOn(service, 'getAllExpenses').and.returnValue(of(splitExpensesData));

    service.getSplitExpenses(splitGroupId).subscribe((res) => {
      expect(res).toEqual(splitExpensesData);
      expect(service.getAllExpenses).toHaveBeenCalledOnceWith({ queryParams });
      done();
    });
  });
});
