import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { ExtendedStatus } from '../models/extended_status.model';
import { StatusCategory } from '../models/status-category.model';
import { Observable } from 'rxjs';
import { TransactionStatus } from '../models/transaction-status.model';
import { ExpenseComment } from '../models/expense-comment.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  constructor(private apiService: ApiService) {}

  find(objectType: string, objectId: string): Observable<ExtendedStatus[]> {
    return this.apiService.get('/' + objectType + '/' + objectId + '/estatuses').pipe(
      map((estatuses: ExtendedStatus[]) =>
        estatuses?.map((estatus) => {
          estatus.st_created_at = new Date(estatus.st_created_at);
          return estatus;
        })
      )
    );
  }

  post(
    objectType: string,
    objectId: string,
    status: { comment: string | ExtendedStatus },
    notify: boolean = false
  ): Observable<TransactionStatus> {
    return this.apiService.post<TransactionStatus>('/' + objectType + '/' + objectId + '/statuses', {
      status,
      notify,
    });
  }

  // TODO: This needs dedicated effort to be fixed
  // eslint-disable-next-line complexity
  getStatusCategory(comment: string, type: string): StatusCategory {
    let statusCategory: StatusCategory;
    const lowerCaseComment = comment && comment.toLowerCase();

    switch (true) {
      case lowerCaseComment.indexOf('automatically merged') > -1:
        statusCategory = {
          category: 'Expense automatically merged',
          icon: 'merge',
        };
        break;
      case /(merged (\d+) expenses)/.test(lowerCaseComment):
        const regexMatch = lowerCaseComment.match(/merged (\d+) expenses/);
        statusCategory = {
          category: regexMatch[1] + ' expenses merged to this expense',
          icon: 'merge',
        };
        break;
      case lowerCaseComment.indexOf('merged') > -1:
        statusCategory = {
          category: 'Expense merged',
          icon: 'merge',
        };
        break;
      case lowerCaseComment.indexOf('created') > -1 && lowerCaseComment.indexOf('reversal') > -1:
        statusCategory = {
          category: type + ' Reversed',
          icon: 'radio-circle-outline',
        };
        break;
      case lowerCaseComment.indexOf('expense rule') > -1:
        statusCategory = {
          category: 'Expense Rule Applied',
          icon: 'file-lightning-indicator',
        };
        break;
      case lowerCaseComment.indexOf('created') > -1:
        statusCategory = {
          category: type + ' Created',
          icon: 'radio-circle-outline',
        };
        break;
      case lowerCaseComment.indexOf('updated') > -1:
        statusCategory = {
          category: type + ' Edited',
          icon: 'edit',
        };
        break;
      case lowerCaseComment.indexOf('policy violation will trigger the following action') > -1:
        statusCategory = {
          category: 'Policy Violation',
          icon: 'warning-fill',
        };
        break;
      case lowerCaseComment.indexOf('added to the report') > -1:
        statusCategory = {
          category: 'Expense added',
          icon: 'radio-circle-outline',
        };
        break;
      case lowerCaseComment.indexOf('added') > -1:
        statusCategory = {
          category: 'Receipt Attached',
          icon: 'attachment',
        };
        break;
      case lowerCaseComment.indexOf('submitted by') > -1:
        statusCategory = {
          category: 'Report Submitted',
          icon: 'list',
        };
        break;
      case lowerCaseComment.indexOf('deleted') > -1:
        statusCategory = {
          category: 'Receipt Removed',
          icon: 'attachment-none',
        };
        break;
      case lowerCaseComment.indexOf('removed from the report') > -1:
        statusCategory = {
          category: 'Expense removed',
          icon: 'bin',
        };
        break;
      case lowerCaseComment.indexOf('name was changed from') > -1:
        statusCategory = {
          category: 'Report Name Changed',
          icon: 'edit',
        };
        break;
      case lowerCaseComment.indexOf('report') > -1:
        statusCategory = {
          category: 'Report',
          icon: 'list',
        };
        break;
      case lowerCaseComment.indexOf('unflagged') > -1:
        statusCategory = {
          category: 'Unflagged',
          icon: 'flag-outline',
        };
        break;
      case lowerCaseComment.indexOf('flagged') > -1:
        statusCategory = {
          category: 'Flagged',
          icon: 'flag-fill',
        };
        break;
      case lowerCaseComment.indexOf('additional approvers are not present') > -1:
        statusCategory = {
          category: 'Failed to run policies',
          icon: 'warning-fill',
        };
        break;
      case lowerCaseComment.indexOf('verified') > -1:
        statusCategory = {
          category: 'Verified',
          icon: 'check-square-fill',
        };
        break;
      case lowerCaseComment.indexOf('approver_inquiry') > -1:
        statusCategory = {
          category: type + ' Sent Back',
          icon: 'send-back',
        };
        break;
      case lowerCaseComment.indexOf('approver_pending') > -1:
        statusCategory = {
          category: 'Approver Pending',
          icon: 'radio-circle-outline',
        };
        break;
      case lowerCaseComment.indexOf('approved') > -1:
        statusCategory = {
          category: type + ' Approved',
          icon: 'check-square-fill',
        };
        break;
      case lowerCaseComment.indexOf('payment_processing') > -1:
        statusCategory = {
          category: 'Processing Payment',
          icon: 'clock',
        };
        break;
      case lowerCaseComment.indexOf('to paid') > -1:
        statusCategory = {
          category: 'Paid',
          icon: 'check-square-fill',
        };
        break;
      case lowerCaseComment.indexOf('expense issues') > -1:
        statusCategory = {
          category: 'Expense Issues',
          icon: 'warning-fill',
        };
        break;
      case lowerCaseComment.indexOf('policies ran successfully') > -1:
        statusCategory = {
          category: 'Policies Ran Successfully',
          icon: 'check-square-fill',
        };
        break;
      case lowerCaseComment.indexOf('auto-matched by') > -1:
        statusCategory = {
          category: 'Card Transaction Matched',
          icon: 'card',
        };
        break;
      case lowerCaseComment.indexOf('unmatched by') > -1:
        statusCategory = {
          category: 'Expense Unmatched',
          icon: 'card',
        };
        break;
      case lowerCaseComment.indexOf('matched by') > -1:
        statusCategory = {
          category: 'Expense Matched',
          icon: 'card',
        };
        break;
      case lowerCaseComment.indexOf('expense is a possible duplicate') > -1:
        statusCategory = {
          category: 'Duplicate Detected',
          icon: 'duplicate',
        };
        break;
      case lowerCaseComment.indexOf('duplicate expense(s) with similar details') > -1:
        statusCategory = {
          category: 'Duplicate(s) issue resolved',
          icon: 'duplicate',
        };
        break;
      default:
        statusCategory = {
          category: 'Others',
          icon: 'radio-circle-outline',
        };
        break;
    }

    return statusCategory;
  }

  createStatusMap(statuses: ExtendedStatus[], type: string): ExtendedStatus[] {
    const modifiedStatuses = statuses.map((status) => {
      const statusCategoryAndIcon = this.getStatusCategory(status.st_comment, type);
      status.st = Object.assign({}, status.st, statusCategoryAndIcon);
      return status;
    });

    return modifiedStatuses;
  }

  findLatestComment(id: string, type: string, orgUserId: string): Observable<string> {
    return this.find(type, id).pipe(
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

  transformToExtendedStatus(expenseComment: ExpenseComment): ExtendedStatus {
    return {
      st_id: expenseComment.id,
      st_created_at: new Date(expenseComment.created_at),
      st_org_user_id: expenseComment.creator_user_id || expenseComment.creator_type,
      st_comment: expenseComment.comment,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      st_diff: expenseComment.action_data,
      st_state: null,
      st_transaction_id: expenseComment.expense_id,
      st_report_id: null,
      st_advance_request_id: null,
      us_full_name: expenseComment.creator_user?.full_name || null,
      us_email: expenseComment.creator_user?.email || null,
    };
  }
}
