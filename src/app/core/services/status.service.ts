import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { ExtendedStatus } from '../models/extended_status.model';
import { StatusCategory } from '../models/status-category.model';
import { Observable } from 'rxjs';
import { TransactionStatus } from '../models/transaction-status.model';
import { ExpenseComment } from '../models/expense-comment.model';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private apiService = inject(ApiService);

  private translocoService = inject(TranslocoService);

  find(objectType: string, objectId: string): Observable<ExtendedStatus[]> {
    return this.apiService.get('/' + objectType + '/' + objectId + '/estatuses').pipe(
      map((estatuses: ExtendedStatus[]) =>
        estatuses?.map((estatus) => {
          estatus.st_created_at = new Date(estatus.st_created_at);
          return estatus;
        }),
      ),
    );
  }

  post(
    objectType: string,
    objectId: string,
    status: { comment: string | ExtendedStatus },
    notify = false,
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
    type = type ? `${type.charAt(0).toUpperCase()}${type.slice(1)}` : '';

    switch (true) {
      case lowerCaseComment.includes('automatically merged'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseAutomaticallyMerged'),
          icon: 'check',
        };
        break;
      case /(merged (\d+) expenses)/.test(lowerCaseComment):
        const regexMatch = lowerCaseComment.match(/merged (\d+) expenses/);
        statusCategory = {
          category: this.translocoService.translate('services.status.expensesMergedToThisExpense', {
            count: regexMatch[1],
          }),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense merged automatically') ||
        lowerCaseComment.includes('automatically merged'):
        statusCategory = {
          category: this.translocoService.translate('services.status.cardExpenseMerged'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('merged'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseMerged'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('created') && lowerCaseComment.includes('reversal'):
        statusCategory = {
          category: this.translocoService.translate('services.status.typeReversed', { type }),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense rule'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseRuleApplied'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('created'):
        statusCategory = {
          category: this.translocoService.translate('services.status.typeCreated', { type }),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('updated'):
        statusCategory = {
          category: this.translocoService.translate('services.status.typeEdited', { type }),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('policy violation triggered'):
        statusCategory = {
          category: this.translocoService.translate('services.status.policyViolationTriggered'),
          icon: 'danger-outline',
        };
        break;
      case lowerCaseComment.includes('policy violation will trigger the following action'):
        // Check if the report is blocked (contains "could not be added to a report")
        if (lowerCaseComment.includes('could not be added to a report')) {
          statusCategory = {
            category: this.translocoService.translate('services.status.criticalPolicyViolation'),
            icon: 'danger-outline',
          };
        } else {
          statusCategory = {
            category: this.translocoService.translate('services.status.policyViolation'),
            icon: 'danger-outline',
          };
        }
        break;
      case lowerCaseComment.includes('expense(s) added to report'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expensesAdded'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('added to the report'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseAdded'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('added as approver'):
        statusCategory = {
          category: this.translocoService.translate('services.status.approverAdded'),
          icon: 'check',
        };
        break;
      case (lowerCaseComment.includes('attachment') && lowerCaseComment.includes('added')) ||
        (lowerCaseComment.includes('receipt') && lowerCaseComment.includes('attached to expense')):
        statusCategory = {
          category: this.translocoService.translate('services.status.receiptAttached'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('submitted by'):
        statusCategory = {
          category: this.translocoService.translate('services.status.reportSubmitted'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('invalid value removed'):
        statusCategory = {
          category: this.translocoService.translate('services.status.invalidValueRemoved'),
          icon: 'check',
        };
        break;
      case (lowerCaseComment.includes('attachment') && lowerCaseComment.includes('deleted')) ||
        (lowerCaseComment.includes('receipt') && lowerCaseComment.includes('removed from expense')):
        statusCategory = {
          category: this.translocoService.translate('services.status.receiptRemoved'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('removed from the report') ||
        lowerCaseComment.includes('expense removed from report by'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseRemoved'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('name was changed from') || lowerCaseComment.includes('report name changed'):
        statusCategory = {
          category: this.translocoService.translate('services.status.reportNameChanged'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('card expense removed'):
        statusCategory = {
          category: this.translocoService.translate('services.status.cardExpenseRemoved'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('removed') && lowerCaseComment.includes('approver'):
        statusCategory = {
          category: this.translocoService.translate('services.status.approverRemoved'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('report closed'):
        statusCategory = {
          category: this.translocoService.translate('services.status.reportClosed'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('unflagged'):
        statusCategory = {
          category: this.translocoService.translate('services.status.unflagged'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('flagged'):
        statusCategory = {
          category: this.translocoService.translate('services.status.flagged'),
          icon: 'danger-outline',
        };
        break;
      case lowerCaseComment.includes('additional approvers are not present'):
        statusCategory = {
          category: this.translocoService.translate('services.status.failedToRunPolicies'),
          icon: 'danger-outline',
        };
        break;
      case lowerCaseComment.includes('expense verified'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseVerified'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense split'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseSplit'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('verified'):
        statusCategory = {
          category: this.translocoService.translate('services.status.verified'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('approvals reset'):
        statusCategory = {
          category: this.translocoService.translate('services.status.approvalsReset'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('approver_inquiry') || lowerCaseComment.includes('report was sent back'):
        statusCategory = {
          category: this.translocoService.translate('services.status.typeSentBack', { type }),
          icon: 'danger-outline',
        };
        break;
      case lowerCaseComment.includes('approver_pending'):
        statusCategory = {
          category: this.translocoService.translate('services.status.approverPending'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('automatically approved'):
        statusCategory = {
          category: this.translocoService.translate('services.status.typeAutomaticallyApproved', { type }),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('approved'):
        statusCategory = {
          category: this.translocoService.translate('services.status.typeApproved', { type }),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('payment_processing'):
        statusCategory = {
          category: this.translocoService.translate('services.status.processingPayment'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense paid'):
        statusCategory = {
          category: this.translocoService.translate('services.status.reimbursements'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('to paid'):
        statusCategory = {
          category: this.translocoService.translate('services.status.paid'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense issues'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseIssues'),
          icon: 'danger-outline',
        };
        break;
      case lowerCaseComment.includes('policies ran successfully'):
        statusCategory = {
          category: this.translocoService.translate('services.status.policiesRanSuccessfully'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense approved') || lowerCaseComment.includes('expense was approved'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseApproved'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('auto-matched by'):
        statusCategory = {
          category: this.translocoService.translate('services.status.cardTransactionMatched'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('unmatched by'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseUnmatched'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('matched by'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseMatched'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense is a possible duplicate'):
        statusCategory = {
          category: this.translocoService.translate('services.status.duplicateDetected'),
          icon: 'danger-outline',
        };
        break;
      case lowerCaseComment.includes('duplicate expense(s) with similar details'):
        statusCategory = {
          category: this.translocoService.translate('services.status.duplicateIssueResolved'),
          icon: 'check',
        };
        break;

      case lowerCaseComment.includes('expense was reconciled'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseReconciled'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense unlinked'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseUnlinked'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense verification undone'):
        statusCategory = {
          category: this.translocoService.translate('services.status.expenseVerificationUndone'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('data extracted from the receipt'):
        statusCategory = {
          category: this.translocoService.translate('services.status.dataExtracted'),
          icon: 'check',
        };
        break;
      case lowerCaseComment.includes('expense amount capped by system') ||
        lowerCaseComment.includes('policy caps amount'):
        statusCategory = {
          category: this.translocoService.translate('services.status.policyCappedAmount'),
          icon: 'danger-outline',
        };
        break;
      case lowerCaseComment.includes('report'):
        statusCategory = {
          category: this.translocoService.translate('services.status.report'),
          icon: 'check',
        };
        break;
      default:
        statusCategory = {
          category: this.translocoService.translate('services.status.others'),
          icon: 'check',
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
      }),
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
      st_diff: expenseComment.action_data || null,
      st_state: null,
      st_transaction_id: expenseComment.expense_id,
      st_report_id: null,
      st_advance_request_id: null,
      us_full_name: expenseComment.creator_user?.full_name || null,
      us_email: expenseComment.creator_user?.email || null,
    };
  }
}
