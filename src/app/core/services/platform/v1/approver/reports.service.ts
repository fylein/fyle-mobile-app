import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class ApproverReportsService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private approverPlatformApiService: ApproverPlatformApiService
  ) {}

  ejectExpenses(rptId: string, expenseId: string, comment?: string[]): Observable<void> {
    const payload = {
      data: {
        id: rptId,
        expense_ids: [expenseId],
      },
      reason: comment,
    };
    return this.approverPlatformApiService.post<void>('/reports/eject_expenses', payload);
  }
}
