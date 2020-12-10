import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { ExtendedAdvanceRequest } from '../models/extended_advance_request.model';
import { Approval } from '../models/approval.model';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { AdvanceRequestPolicyService } from './advance-request-policy.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { CustomField } from '../models/custom_field.model';

@Injectable({
  providedIn: 'root'
})
export class AdvanceRequestService {
  
  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private apiv2Service: ApiV2Service,
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService,
    private timezoneService: TimezoneService,
    private advanceRequestPolicyService: AdvanceRequestPolicyService,
    private dataTransformService: DataTransformService,
    private dateService: DateService
  ) { }

  getEReq(advanceRequestId) {
    return this.apiService.get('/eadvance_requests/' + advanceRequestId).pipe(
      map(res => {
        const eAdvanceRequest = this.dataTransformService.unflatten(res);
        this.dateService.fixDates(eAdvanceRequest.areq);
        // self.setInternalStateAndDisplayName(eAdvanceRequest.areq);
        return eAdvanceRequest;
      })
    );
  }

  testPolicy(advanceRequest): Observable<any> {
    return this.orgUserSettingsService.get().pipe(
      switchMap(orgUserSettings => {
        if (advanceRequest.created_at) {
          advanceRequest.created_at = this.timezoneService.convertToUtc(advanceRequest.created_at, orgUserSettings.locale.offset);
        }
        return this.advanceRequestPolicyService.servicePost('/policy_check/test', advanceRequest, {timeout: 5000});
      })
    )
  }

  getUserAdvanceRequestParams(state: string) {
    var stateMap = {
      draft: {
        state: ['DRAFT'],
        is_sent_back: false
      },
      pending: {
        state: ['APPROVAL_PENDING']
      },
      approved: {
        state: ['APPROVED']
      },
      inquiry: {
        state: ['DRAFT'],
        is_sent_back: true
      },
      all: {
        state: ['APPROVAL_PENDING', 'DRAFT', 'APPROVED', 'REJECTED']
      }
    };

    return stateMap[state];
  }

  getPaginatedEAdvanceRequestsStats(params) {
    return this.apiService.get('/eadvance_requests/stats', {params});
  }

  getPaginatedMyEAdvanceRequestsCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/eadvance_requests/count', {params}).pipe(
              tap((res) => {
                this.storageService.set('eadvanceRequestsCount' + JSON.stringify(params), res);
              })
            );
          } else {
            return from(this.storageService.get('eadvanceRequestsCount' + JSON.stringify(params)));
          }
        }
      )
    );
  }

  getMyadvanceRequests(config: Partial<{ offset: number, limit: number, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiv2Service.get('/advance_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            areq_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams
          }
        });
      }),
      map(res => res as {
        count: number,
        data: ExtendedAdvanceRequest[],
        limit: number,
        offset: number,
        url: string
      }),
      map(res => ({
        ...res,
        data: res.data.map(this.fixDates)
      }))
    );
  }

  getAdvanceRequest(id: string): Observable<ExtendedAdvanceRequest> {
    return this.apiv2Service.get('/advance_requests', {
      params: {
        areq_id: `eq.${id}`
      }
    }).pipe(
      map(
        res => this.fixDates(res.data[0]) as ExtendedAdvanceRequest
      )
    );
  }

  getActions(advanceRequestId: string) {
    return this.apiService.get('/advance_requests/' + advanceRequestId + '/actions');
  }

  getApproversByAdvanceRequestId(advanceRequestId: string) {
    return this.apiService.get('/eadvance_requests/' + advanceRequestId + '/approvals').pipe(
      map(res => res as Approval[])
    );
  }

  getTeamadvanceRequests(config: Partial<{ offset: number, limit: number, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {

        const defaultParams = {};
        defaultParams[`advance_request_approvals->${eou.ou.id}->>state`] = ['eq.APPROVAL_PENDING'];

        return this.apiv2Service.get('/advance_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order: 'areq_created_at.desc',
            areq_approvers_ids: 'cs.{' + eou.ou.id + '}',
            ...defaultParams,
            ...config.queryParams
          }
        });
      }),
      map(res => res as {
        count: number,
        data: ExtendedAdvanceRequest[],
        limit: number,
        offset: number,
        url: string
      }),
      map(res => ({
        ...res,
        data: res.data.map(this.fixDates)
      }))
    );
  }

  getActiveApproversByAdvanceRequestId(advanceRequestId: string) {
    return from(this.getApproversByAdvanceRequestId(advanceRequestId)).pipe(
      map(approvers => {
        const filteredApprovers = approvers.filter((approver) => {
          if (approver.state !== 'APPROVAL_DISABLED') {
            return approver;
          }
        })
        return filteredApprovers;
      })
    )
  }

  getMyAdvanceRequestsCount(queryParams = {}) {
    return this.getMyadvanceRequests({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(advanceRequest => advanceRequest.count)
    );
  }

  getTeamAdvanceRequestsCount(queryParams: {}) {
    return this.getTeamadvanceRequests({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(advanceRequest => advanceRequest.count)
    );
  }

  modifyAdvanceRequestCustomFields(customFields): CustomField[] {
    customFields = customFields.map(customField => {
      if (customField.type === 'DATE' && customField.value) {
        customField.value = new Date(customField.value);
      }
      return customField;
    });
    return customFields;
  }

  fixDates(data: ExtendedAdvanceRequest) {
    data.areq_created_at = new Date(data.areq_created_at);
    data.areq_updated_at = new Date(data.areq_updated_at);
    if (data.areq_approved_at) {
      data.areq_approved_at = new Date(data.areq_approved_at);
    }

    return data;
  }

  getInternalStateAndDisplayName (advanceRequest: ExtendedAdvanceRequest): { state: string, name: string } {
    if (advanceRequest.areq_state === 'DRAFT') {
      if (!advanceRequest.areq_is_pulled_back && !advanceRequest.areq_is_sent_back) {
        return {
          state: 'draft',
          name: 'Draft'
        };
      } else if (advanceRequest.areq_is_pulled_back) {
        return {
          state: 'pulledBack',
          name: 'Pulled Back'
        };
      } else if (advanceRequest.areq_is_sent_back) {
        return {
          state: 'inquiry',
          name: 'Inquiry'
        };
      }
    } else if (advanceRequest.areq_state === 'INQUIRY') {
      return {
        state: 'inquiry',
        name: 'Inquiry'
      };
    } else if (advanceRequest.areq_state === 'SUBMITTED' || advanceRequest.areq_state === 'APPROVAL_PENDING') {
      return {
        state: 'pendingApproval',
        name: 'Pending Approval'
      };
    } else if (advanceRequest.areq_state === 'APPROVED') {
      return {
        state: 'approved',
        name: 'Approved'
      };
    } else if (advanceRequest.areq_state === 'PAID') {
      return {
        state: 'paid',
        name: 'Paid'
      };
    } else if (advanceRequest.areq_state === 'REJECTED') {
      return {
        state: 'rejected',
        name: 'Rejected'
      };
    }
  }

  delete(advanceRequestId: string) {
    return this.apiService.delete('/advance_requests/' + advanceRequestId);
  }

  pullBackadvanceRequest(advanceRequestId: string, addStatusPayload) {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/pull_back', addStatusPayload);
  }

  addApprover(advanceRequestId, approverEmail, comment) {
    const data = {
      advance_request_id: advanceRequestId,
      approver_email: approverEmail,
      comment: comment
    };

    return this.apiService.post('/advance_requests/add_approver', data);
      // self.deleteCache();
      // return fixDates(advance_request);
  }
  
  submit(advanceRequest) {
    return this.apiService.post('/advance_requests/submit', advanceRequest);
    // Todo: Fix dates and delete cache
  }

  saveDraft(advanceRequest) {
    return this.apiService.post('/advance_requests/save', advanceRequest);
    // Todo: Fix dates and delete cache
  }

  createAdvReqWithFilesAndSubmit(advanceRequest, fileObjs?) {
    // Todo: create adv req with files
    return this.submit(advanceRequest);
  }

  saveDraftAdvReqWithFiles(advanceRequest, fileObjs?) {
    // Todo: create adv req with files
    return this.saveDraft(advanceRequest);
  }


}
