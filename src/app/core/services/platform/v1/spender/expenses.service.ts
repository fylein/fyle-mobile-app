import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SpenderService } from '../spender/spender.service';
import { Expense } from 'src/app/core/models/expense.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(private spenderService: SpenderService) {}

  getById(id: string): Observable<Expense> {
    const params: Record<string, string> = {
      id: `eq.${id}`,
    };

    return this.spenderService.get<PlatformApiResponse<Expense>>('/expenses', params).pipe(map((res) => res.data[0]));
  }
}
