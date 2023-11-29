import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExpensesService } from './expenses.service';
import { SpenderService } from './spender.service';
import { expenseData, readyToReportExpensesData2 } from 'src/app/core/mock-data/platform/v1/expense.data';
import { PAGINATION_SIZE } from 'src/app/constants';
import { expensesResponse } from 'src/app/core/mock-data/platform/v1/expenses-response.data';
import { getExpensesQueryParams } from 'src/app/core/mock-data/platform/v1/expenses-query-params.data';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let spenderService: jasmine.SpyObj<SpenderService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        { provide: SpenderService, useValue: spenderServiceSpy },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    service = TestBed.inject(ExpensesService);
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
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
});
