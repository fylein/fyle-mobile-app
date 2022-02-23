import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
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
import { FileService } from './file.service';
import { File } from '../models/file.model';
import { TransactionsOutboxService } from './transactions-outbox.service';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

const advanceRequestsCacheBuster$ = new Subject<void>();

type advanceRequestStat = {
  aggregates: string;
  areq_trip_request_id: string;
  areq_state: string;
  areq_is_sent_back: string;
  scalar: boolean;
};

@Injectable({
  providedIn: 'root',
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
    private dateService: DateService,
    private fileService: FileService
  ) {}

  @Cacheable({
    cacheBusterObserver: advanceRequestsCacheBuster$,
  })
  getMyadvanceRequests(
    config: Partial<{ offset: number; limit: number; queryParams: any }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ) {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiv2Service.get('/advance_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            areq_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams,
          },
        })
      ),
      map(
        (res) =>
          res as {
            count: number;
            data: ExtendedAdvanceRequest[];
            limit: number;
            offset: number;
            url: string;
          }
      ),
      map((res) => ({
        ...res,
        data: res.data.map(this.fixDates),
      }))
    );
  }

  @Cacheable({
    cacheBusterObserver: advanceRequestsCacheBuster$,
  })
  getAdvanceRequest(id: string): Observable<ExtendedAdvanceRequest> {
    return this.apiv2Service
      .get('/advance_requests', {
        params: {
          areq_id: `eq.${id}`,
        },
      })
      .pipe(map((res) => this.fixDates(res.data[0]) as ExtendedAdvanceRequest));
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  delete(advanceRequestId: string) {
    return this.apiService.delete('/advance_requests/' + advanceRequestId);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  pullBackadvanceRequest(advanceRequestId: string, addStatusPayload) {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/pull_back', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  addApprover(advanceRequestId, approverEmail, comment) {
    const data = {
      advance_request_id: advanceRequestId,
      approver_email: approverEmail,
      comment,
    };

    return this.apiService.post('/advance_requests/add_approver', data);
    // self.deleteCache();
    // return fixDates(advance_request);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  submit(advanceRequest) {
    return this.apiService.post('/advance_requests/submit', advanceRequest);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  saveDraft(advanceRequest) {
    return this.apiService.post('/advance_requests/save', advanceRequest);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  approve(advanceRequestId) {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/approve');
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  sendBack(advanceRequestId, addStatusPayload) {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/inquire', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  reject(advanceRequestId, addStatusPayload) {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/reject', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  destroyAdvanceRequestsCacheBuster() {
    return of(null);
  }

  @Cacheable({
    cacheBusterObserver: advanceRequestsCacheBuster$,
  })
  getTeamadvanceRequests(
    config: Partial<{ offset: number; limit: number; queryParams: any; filter: any }> = {
      offset: 0,
      limit: 10,
      queryParams: {},
      filter: 'PENDING',
    }
  ) {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => {
        const defaultParams = {};
        if (config.filter === 'APPROVED') {
          defaultParams[`advance_request_approvals->${eou.ou.id}->>state`] = ['eq.APPROVAL_DONE'];
        } else {
          defaultParams[`advance_request_approvals->${eou.ou.id}->>state`] = ['eq.APPROVAL_PENDING'];
        }

        return this.apiv2Service.get('/advance_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order: 'areq_created_at.desc',
            areq_approvers_ids: 'cs.{' + eou.ou.id + '}',
            ...defaultParams,
            ...config.queryParams,
          },
        });
      }),
      map(
        (res) =>
          res as {
            count: number;
            data: ExtendedAdvanceRequest[];
            limit: number;
            offset: number;
            url: string;
          }
      ),
      map((res) => ({
        ...res,
        data: res.data.map(this.fixDates),
      }))
    );
  }

  getEReq(advanceRequestId) {
    return this.apiService.get('/eadvance_requests/' + advanceRequestId).pipe(
      map((res) => {
        const eAdvanceRequest = this.dataTransformService.unflatten(res);
        this.dateService.fixDates(eAdvanceRequest.areq);
        // self.setInternalStateAndDisplayName(eAdvanceRequest.areq);
        return eAdvanceRequest;
      })
    );
  }

  testPolicy(advanceRequest): Observable<any> {
    return this.orgUserSettingsService.get().pipe(
      switchMap((orgUserSettings) => {
        if (advanceRequest.created_at) {
          advanceRequest.created_at = this.timezoneService.convertToUtc(
            advanceRequest.created_at,
            orgUserSettings.locale.offset
          );
        }
        return this.advanceRequestPolicyService.servicePost('/policy_check/test', advanceRequest, { timeout: 5000 });
      })
    );
  }

  getPaginatedEAdvanceRequestsStats(params) {
    return this.apiService.get('/eadvance_requests/stats', { params });
  }

  getPaginatedMyEAdvanceRequestsCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap((isOnline) => {
        if (isOnline) {
          return this.apiService.get('/eadvance_requests/count', { params }).pipe(
            tap((res) => {
              this.storageService.set('eadvanceRequestsCount' + JSON.stringify(params), res);
            })
          );
        } else {
          return from(this.storageService.get('eadvanceRequestsCount' + JSON.stringify(params)));
        }
      })
    );
  }

  getActions(advanceRequestId: string) {
    return this.apiService.get('/advance_requests/' + advanceRequestId + '/actions');
  }

  getApproversByAdvanceRequestId(advanceRequestId: string) {
    return this.apiService
      .get('/eadvance_requests/' + advanceRequestId + '/approvals')
      .pipe(map((res) => res as Approval[]));
  }

  getActiveApproversByAdvanceRequestId(advanceRequestId: string) {
    return from(this.getApproversByAdvanceRequestId(advanceRequestId)).pipe(
      map((approvers) => {
        const filteredApprovers = approvers.filter((approver) => {
          if (approver.state !== 'APPROVAL_DISABLED') {
            return approver;
          }
        });
        return filteredApprovers;
      })
    );
  }

  getMyAdvanceRequestsCount(queryParams = {}) {
    return this.getMyadvanceRequests({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((advanceRequest) => advanceRequest.count));
  }

  getTeamAdvanceRequestsCount(queryParams: {}, filter: any) {
    return this.getTeamadvanceRequests({
      offset: 0,
      limit: 1,
      queryParams,
      filter,
    }).pipe(map((advanceRequest) => advanceRequest.count));
  }

  modifyAdvanceRequestCustomFields(customFields): CustomField[] {
    customFields = customFields.map((customField) => {
      if (customField.type === 'DATE' && customField.value) {
        customField.value = new Date(customField.value);
      }
      return customField;
    });
    return customFields;
  }

  fixDates(data: ExtendedAdvanceRequest) {
    if (data.areq_created_at) {
      data.areq_created_at = new Date(data.areq_created_at);
    }

    if (data.areq_updated_at) {
      data.areq_updated_at = new Date(data.areq_updated_at);
    }

    if (data.areq_approved_at) {
      data.areq_approved_at = new Date(data.areq_approved_at);
    }

    return data;
  }

  getInternalStateAndDisplayName(advanceRequest: ExtendedAdvanceRequest): { state: string; name: string } {
    let state: { state: string; name: string };
    state = this.getStateIfDraft(advanceRequest, state);

    if (advanceRequest.areq_state === 'INQUIRY') {
      state = {
        state: 'inquiry',
        name: 'Sent Back',
      };
    }

    if (advanceRequest.areq_state === 'SUBMITTED' || advanceRequest.areq_state === 'APPROVAL_PENDING') {
      state = {
        state: 'pendingApproval',
        name: 'Pending Approval',
      };
    }

    if (advanceRequest.areq_state === 'APPROVED') {
      state = {
        state: 'approved',
        name: 'Approved',
      };
    }

    if (advanceRequest.areq_state === 'PAID') {
      state = {
        state: 'paid',
        name: 'Paid',
      };
    }

    if (advanceRequest.areq_state === 'REJECTED') {
      state = {
        state: 'rejected',
        name: 'Rejected',
      };
    }

    return state;
  }

  getStateIfDraft(advanceRequest: ExtendedAdvanceRequest, state: { state: string; name: string }) {
    if (advanceRequest.areq_state === 'DRAFT') {
      if (!advanceRequest.areq_is_pulled_back && !advanceRequest.areq_is_sent_back) {
        state = {
          state: 'draft',
          name: 'Draft',
        };
      } else if (advanceRequest.areq_is_pulled_back) {
        state = {
          state: 'pulledBack',
          name: 'Pulled Back',
        };
      } else if (advanceRequest.areq_is_sent_back) {
        state = {
          state: 'inquiry',
          name: 'Sent Back',
        };
      }
    }
    return state;
  }

  createAdvReqWithFilesAndSubmit(advanceRequest, fileObservables?: Observable<any[]>) {
    return forkJoin({
      files: fileObservables,
      advanceReq: this.submit(advanceRequest),
    }).pipe(
      switchMap((res) => {
        if (res.files && res.files.length > 0) {
          const fileObjs: File[] = res.files;
          const advanceReq = res.advanceReq;
          const newFileObjs = fileObjs.map((obj: File) => {
            obj.advance_request_id = advanceReq.id;
            return this.fileService.post(obj);
          });
          return forkJoin(newFileObjs).pipe(map(() => res));
        } else {
          return of(null).pipe(map(() => res));
        }
      })
    );
  }

  saveDraftAdvReqWithFiles(advanceRequest, fileObservables?: Observable<any[]>) {
    return forkJoin({
      files: fileObservables,
      advanceReq: this.saveDraft(advanceRequest),
    }).pipe(
      switchMap((res) => {
        if (res.files && res.files.length > 0) {
          const fileObjs: File[] = res.files;
          const advanceReq = res.advanceReq;
          const newFileObjs = fileObjs.map((obj: File) => {
            obj.advance_request_id = advanceReq.id;
            return this.fileService.post(obj);
          });
          return forkJoin(newFileObjs).pipe(map(() => res));
        } else {
          return of(null).pipe(map(() => res));
        }
      })
    );
  }

  getMyAdvanceRequestStats(params: advanceRequestStat): Observable<any> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => this.getAdvanceRequestStats(eou, params)),
      map((res) => res.data)
    );
  }

  getAdvanceRequestStats(eou: ExtendedOrgUser, params: advanceRequestStat): Observable<any> {
    return this.apiv2Service.get('/advance_requests/stats', {
      params: {
        areq_org_user_id: 'eq.' + eou.ou.id,
        ...params,
      },
    });
  }
}
