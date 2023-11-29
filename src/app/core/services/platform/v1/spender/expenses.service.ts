import { Inject, Injectable } from '@angular/core';
import { Observable, concatMap, map, range, reduce, switchMap } from 'rxjs';
import { SpenderService } from '../spender/spender.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(@Inject(PAGINATION_SIZE) private paginationSize: number, private spenderService: SpenderService) {}

  getExpenseById(id: string): Observable<Expense> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.spenderService.get<PlatformApiResponse<Expense>>('/expenses', data).pipe(map((res) => res.data[0]));
  }

  getExpensesCount(params: ExpensesQueryParams): Observable<number> {
    return this.spenderService
      .get<PlatformApiResponse<Expense>>('/expenses', { params })
      .pipe(map((response) => response.count));
  }

  getExpenses(params: ExpensesQueryParams): Observable<Expense[]> {
    return this.spenderService
      .get<PlatformApiResponse<Expense>>('/expenses', { params })
      .pipe(map((expenses) => expenses.data));
  }

  getAllExpenses(params: ExpensesQueryParams): Observable<Expense[]> {
    return this.getExpensesCount(params.queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) =>
        this.getExpenses({
          offset: this.paginationSize * page,
          limit: this.paginationSize,
          ...params.queryParams,
          order: params.order || 'spent_at.desc,created_at.desc,id.desc',
        })
      ),
      reduce((acc, curr) => acc.concat(curr), [] as Expense[])
    );
  }

  getReportExpenses(reportId: string): Observable<Expense[]> {
    const params = {
      report_id: `eq.${reportId}`,
    };
    return this.getExpensesCount(params).pipe(
      switchMap((expensesCount) => {
        const numBatches = expensesCount > this.paginationSize ? Math.ceil(expensesCount / this.paginationSize) : 1;
        return range(0, numBatches);
      }),
      concatMap((batchNum) =>
        this.getExpenses({ offset: this.paginationSize * batchNum, limit: this.paginationSize, ...params })
      ),
      reduce((acc, curr) => acc.concat(curr), [] as Expense[])
    );
  }
}
