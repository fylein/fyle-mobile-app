import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApproverService } from './approver.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { DateService } from '../shared/date.service';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(private approverService: ApproverService, private dateService: DateService) {}

  getById(id: string): Observable<Expense> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.approverService.get<PlatformApiResponse<Expense>>('/expenses', data).pipe(
      map((res) => res.data[0]),
      map((expense) => this.dateService.fixDates(expense))
    );
  }
}
