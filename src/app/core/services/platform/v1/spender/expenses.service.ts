import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { SpenderService } from '../spender/spender.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { ExpenseParams } from 'src/app/core/models/platform/v1/expense-params.model';
import { AuthService } from '../../../auth.service';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(private spenderService: SpenderService, private authServie: AuthService) {}

  getExpenseById(id: string): Observable<Expense> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.spenderService.get<PlatformApiResponse<Expense>>('/expenses', data).pipe(map((res) => res.data[0]));
  }

  getExpenses(
    config: Partial<{
      offset: number;
      limit: number;
      order: string;
      queryParams: ExpenseParams;
    }>
  ): Observable<PlatformApiResponse<Expense>> {
    return from(this.authServie.getEou()).pipe(
      switchMap((eou) =>
        this.spenderService.get<PlatformApiResponse<Expense>>('/expenses', {
          params: {
            offset: config.offset,
            limit: config.limit,
            employee_id: `eq.${eou.ou.id}`,
            order: `${config.order || 'spent_at.desc'},created_at.desc,id.desc`,
            ...config.queryParams,
          },
        })
      )
    );
  }

  getExpenseCount(queryParams: ExpenseParams): Observable<number> {
    return this.getExpenses({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((res) => res.count));
  }
}
