import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApproverService } from './approver.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(private approverService: ApproverService) {}

  getById(id: string): Observable<Expense> {
    const params: Record<string, string> = {
      id: `eq.${id}`,
    };

    return this.approverService.get<PlatformApiResponse<Expense>>('/expenses', params).pipe(map((res) => res.data[0]));
  }
}
