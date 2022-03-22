import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { ExtendedStatus } from '../models/extended_status.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  constructor(private apiService: ApiService) {}

  find(objectType, objectId) {
    return this.apiService.get('/' + objectType + '/' + objectId + '/estatuses').pipe(
      map((estatuses: ExtendedStatus[]) =>
        estatuses.map((estatus) => {
          estatus.st_created_at = new Date(estatus.st_created_at);
          return estatus as ExtendedStatus;
        })
      )
    );
  }

  post(objectType, objectId, status, notify = false) {
    return this.apiService.post('/' + objectType + '/' + objectId + '/statuses', {
      status,
      notify,
    });
  }

  // TODO: This needs dedicated effort to be fixed
  // eslint-disable-next-line complexity
  getStatusCategory(comment, type) {
    let statusCategory = {};
    const lowerCaseComment = comment && comment.toLowerCase();

    switch (true) {
      case lowerCaseComment.indexOf('hotel request') > -1 || lowerCaseComment.indexOf('transportation request') > -1:
        statusCategory = {
          category: 'Others',
          icon: 'circle',
        };
        break;
      case lowerCaseComment.indexOf('automatically merged') > -1:
        statusCategory = {
          category: 'Expense automatically merged',
          icon: 'fy-merge',
        };
        break;
      case lowerCaseComment.indexOf('you merged') > -1:
        statusCategory = {
          category: 'Expense merged by user',
          icon: 'fy-merge',
        };
        break;
      case lowerCaseComment.indexOf('created') > -1 && lowerCaseComment.indexOf('reversal') > -1:
        statusCategory = {
          category: type + ' Reversed',
          icon: 'circle',
        };
        break;
      case lowerCaseComment.indexOf('created') > -1:
        statusCategory = {
          category: type + ' Created',
          icon: 'circle',
        };
        break;
      case lowerCaseComment.indexOf('updated') > -1:
        statusCategory = {
          category: type + ' Edited',
          icon: 'edit',
        };
        break;
      case lowerCaseComment.indexOf('added') > -1:
        statusCategory = {
          category: 'Receipt Attached',
          icon: 'attachment',
        };
        break;
      case lowerCaseComment.indexOf('deleted') > -1:
        statusCategory = {
          category: 'Receipt Removed',
          icon: 'no-attachment',
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
          icon: 'flag',
        };
        break;
      case lowerCaseComment.indexOf('flagged') > -1:
        statusCategory = {
          category: 'Flagged',
          icon: 'flag',
        };
        break;
      case lowerCaseComment.indexOf('the following action(s) will be taken') > -1:
        statusCategory = {
          category: 'Policy Violation',
          icon: 'danger',
        };
        break;
      case lowerCaseComment.indexOf('additional approvers are not present') > -1:
        statusCategory = {
          category: 'Failed to run policies',
          icon: 'error-filled',
        };
        break;
      case lowerCaseComment.indexOf('verified') > -1:
        statusCategory = {
          category: 'Verified',
          icon: 'success-tick',
        };
        break;
      case lowerCaseComment.indexOf('un-approved') > -1:
        statusCategory = {
          category: type + ' Sent Back',
          icon: 'send-back',
        };
        break;
      case lowerCaseComment.indexOf('approved') > -1:
        statusCategory = {
          category: type + ' Approved',
          icon: 'success-tick',
        };
        break;
      case lowerCaseComment.indexOf('payment_processing') > -1:
        statusCategory = {
          category: 'Processing Payment',
          icon: 'fy-recently-used',
        };
        break;
      case lowerCaseComment.indexOf('to paid') > -1:
        statusCategory = {
          category: 'Paid',
          icon: 'success-tick',
        };
        break;
      case lowerCaseComment.indexOf('expense issues') > -1:
        statusCategory = {
          category: 'Expense Issues',
          icon: 'error-filled',
        };
        break;
      case lowerCaseComment.indexOf('policies ran successfully') > -1:
        statusCategory = {
          category: 'Policies Ran Successfully',
          icon: 'success-tick',
        };
        break;
      case lowerCaseComment.indexOf('auto-matched by') > -1:
        statusCategory = {
          category: 'Card Transaction Matched',
          icon: 'card-filled',
        };
        break;
      case lowerCaseComment.indexOf('unmatched by') > -1:
        statusCategory = {
          category: 'Expense Unmatched',
          icon: 'fy-corporate-card',
        };
        break;
      case lowerCaseComment.indexOf('matched by') > -1:
        statusCategory = {
          category: 'Expense Matched',
          icon: 'card-filled',
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
          icon: 'circle',
        };
        break;
    }

    return statusCategory;
  }

  createStatusMap(statuses, type) {
    const modifiedStatuses = statuses.map((status) => {
      const statusCategoryAndIcon = this.getStatusCategory(status.st_comment, type);
      status.st = Object.assign({}, status.st, statusCategoryAndIcon);
      return status;
    });

    return modifiedStatuses;
  }

  findLatestComment(id, type, orgUserId) {
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

  sortStatusByDate(estatus) {
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

  filterNonSystemEStatuses(eStatus) {
    return eStatus.us.full_name;
  }

  filterSystemStatuses(status) {
    return ['SYSTEM', 'POLICY'].indexOf(status.st.org_user_id) > -1;
  }

  filterSystemEStatuses(eStatus) {
    return eStatus.st.org_user_id !== 'SYSTEM';
  }
}
