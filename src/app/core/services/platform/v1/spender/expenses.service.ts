import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SpenderService } from '../spender/spender.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { DateService } from '../shared/date.service';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(private spenderService: SpenderService, private dateService: DateService) {}

  getById(id: string): Observable<Expense> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.spenderService.get<PlatformApiResponse<Expense>>('/expenses', data).pipe(
      map((res) => res.data[0]),
      map((expense) => this.dateService.fixDates(expense))
    );
  }
}
