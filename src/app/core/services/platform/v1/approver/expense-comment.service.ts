import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApproverService } from './approver.service';
import { ExpenseComment } from 'src/app/core/models/expense-comment.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { map } from 'rxjs/operators';
import { StatusService } from '../../../status.service';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseCommentService {
  constructor(private approverService: ApproverService, private statusService: StatusService) {}

  getExpenseCommentsById(id: string): Observable<ExpenseComment[]> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.approverService
      .get<PlatformApiResponse<ExpenseComment[]>>('/expenses/comments', data)
      .pipe(map((response) => response.data));
  }

  getTransformedComments(expenseId: string): Observable<ExtendedStatus[]> {
    return this.getExpenseCommentsById(expenseId).pipe(
      map((comments) => comments.map((comment) => this.statusService.transformToExtendedStatus(comment)))
    );
  }

  findLatestExpenseComment(expenseId: string, orgUserId: string): Observable<string> {
    return this.getTransformedComments(expenseId).pipe(
      map((estatuses) => {
        const nonSystemEStatuses = estatuses.filter((eStatus) => eStatus.us_full_name);
        const userComments = nonSystemEStatuses.filter((estatus) => estatus.st_org_user_id === orgUserId);
        const sortedStatus = this.sortStatusByDate(userComments);
        if (sortedStatus.length) {
          return sortedStatus[0].st_comment;
        }
      })
    );
  }

  sortStatusByDate(estatus: ExtendedStatus[]): ExtendedStatus[] {
    estatus.sort((a, b) => {
      const dateA = a.st_created_at;
      const dateB = b.st_created_at;
      if (dateA.getTime() > dateB.getTime()) {
        return -1;
      } else {
        return 1;
      }
    });

    return estatus;
  }

  post(commentsWithExpenseId: { id: string; comment: string }[]): Observable<{ data: ExpenseComment[] }> {
    return this.approverService.post<{ data: ExpenseComment[] }>('/expenses/comments/bulk', {
      data: commentsWithExpenseId,
    });
  }
}
