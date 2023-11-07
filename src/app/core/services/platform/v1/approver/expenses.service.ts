import { Inject, Injectable } from '@angular/core';
import { Observable, concatMap, map, range, reduce, switchMap } from 'rxjs';
import { ApproverService } from './approver.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { ExpensesQueryParams } from 'src/app/core/models/platform/v1/expenses-query-params.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(@Inject(PAGINATION_SIZE) private paginationSize: number, private approverService: ApproverService) {}

  getExpenseById(id: string): Observable<Expense> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.approverService
      .get<PlatformApiResponse<Expense>>('/expenses', data)
      .pipe(map((response) => response.data[0]));
  }

  getExpensesCount(params: ExpensesQueryParams): Observable<number> {
    return this.approverService
      .get<PlatformApiResponse<Expense>>('/expenses', { params })
      .pipe(map((response) => response.count));
  }

  getExpenses(params: ExpensesQueryParams): Observable<Expense[]> {
    return this.approverService
      .get<PlatformApiResponse<Expense>>('/expenses', { params })
      .pipe(map((etxns) => etxns.data));
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
