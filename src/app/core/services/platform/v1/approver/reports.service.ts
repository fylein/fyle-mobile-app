import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class ApproverReportsService {
  constructor(private approverPlatformApiService: ApproverPlatformApiService) {}

  ejectExpenses(rptId: string, txnId: string, comment?: string[]): Observable<void> {
    const payload = {
      data: {
        id: rptId,
        expense_ids: [txnId],
      },
      reason: comment,
    };
    return this.approverPlatformApiService.post<void>('/reports/eject_expenses', payload);
  }
}
