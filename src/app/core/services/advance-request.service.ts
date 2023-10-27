import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';

import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from 'src/app/core/services/timezone.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { FileService } from './file.service';

import { ExtendedAdvanceRequest } from '../models/extended_advance_request.model';
import { Approval } from '../models/approval.model';
import { CustomField } from '../models/custom_field.model';
import { File } from '../models/file.model';
import { AdvancesStates } from '../models/advances-states.model';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingParam } from '../models/sorting-param.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { AdvanceRequests } from '../models/advance-requests.model';
import { StatusPayload } from '../models/status-payload.model';
import { ApiV2Response } from '../models/api-v2.model';
import { StatsDimensionResponse } from '../models/stats-dimension-response.model';
import { AdvanceRequestActions } from '../models/advance-request-actions.model';
import { AdvanceRequestFile } from '../models/advance-request-file.model';
import { UnflattenedAdvanceRequest } from '../models/unflattened-advance-request.model';

const advanceRequestsCacheBuster$ = new Subject<void>();

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: SortingParam;
  sortDir: SortingDirection;
}>;

type Config = Partial<{
  offset: number;
  limit: number;
  queryParams: Record<string, string | string[]>;
  areq_org_user_id?: string;
  filter: Filters;
}>;

type advanceRequestStat = {
  aggregates: string;
  areq_state: string;
  areq_is_sent_back: string;
  scalar: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class AdvanceRequestService {
  constructor(
    private apiService: ApiService,
    private apiv2Service: ApiV2Service,
    private authService: AuthService,
    private orgUserSettingsService: OrgUserSettingsService,
    private timezoneService: TimezoneService,
    private dataTransformService: DataTransformService,
    private dateService: DateService,
    private fileService: FileService
  ) {}

  @Cacheable({
    cacheBusterObserver: advanceRequestsCacheBuster$,
  })
  getMyadvanceRequests(
    config: Config = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ): Observable<ApiV2Response<ExtendedAdvanceRequest>> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiv2Service.get<ExtendedAdvanceRequest, { params: Config }>('/advance_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            areq_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams,
          },
        })
      ),
      map((res) => res as ApiV2Response<ExtendedAdvanceRequest>),
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
      .get<ExtendedAdvanceRequest, { params: { areq_id: string } }>('/advance_requests', {
        params: {
          areq_id: `eq.${id}`,
        },
      })
      .pipe(map((res) => this.fixDates(res.data[0])));
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  delete(advanceRequestId: string): Observable<AdvanceRequests> {
    return this.apiService.delete('/advance_requests/' + advanceRequestId);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  pullBackAdvanceRequest(advanceRequestId: string, addStatusPayload: StatusPayload): Observable<AdvanceRequests> {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/pull_back', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  addApprover(advanceRequestId: string, approverEmail: string, comment: string): Observable<AdvanceRequests> {
    const data = {
      advance_request_id: advanceRequestId,
      approver_email: approverEmail,
      comment,
    };

    return this.apiService.post('/advance_requests/add_approver', data);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  submit(advanceRequest: Partial<AdvanceRequests>): Observable<AdvanceRequests> {
    return this.apiService.post('/advance_requests/submit', advanceRequest);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  saveDraft(advanceRequest: Partial<AdvanceRequests>): Observable<AdvanceRequests> {
    return this.apiService.post('/advance_requests/save', advanceRequest);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  approve(advanceRequestId: string): Observable<AdvanceRequests> {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/approve');
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  sendBack(advanceRequestId: string, addStatusPayload: StatusPayload): Observable<AdvanceRequests> {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/inquire', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  reject(advanceRequestId: string, addStatusPayload: StatusPayload): Observable<AdvanceRequests> {
    return this.apiService.post('/advance_requests/' + advanceRequestId + '/reject', addStatusPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  destroyAdvanceRequestsCacheBuster(): Observable<null> {
    return of(null);
  }

  @Cacheable({
    cacheBusterObserver: advanceRequestsCacheBuster$,
  })
  getTeamAdvanceRequests(
    config: Config = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ): Observable<ApiV2Response<ExtendedAdvanceRequest>> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => {
        const defaultParams = {};
        const isPending = config.filter.state.includes(AdvancesStates.pending);
        const isApproved = config.filter.state.includes(AdvancesStates.approved);
        let approvalState;

        if (isPending && isApproved) {
          approvalState = 'in.(APPROVAL_PENDING,APPROVAL_DONE)';
        } else if (isApproved) {
          approvalState = 'eq.APPROVAL_DONE';
        } else if (isPending) {
          approvalState = 'eq.APPROVAL_PENDING';
        }

        if (approvalState) {
          defaultParams[`advance_request_approvals->${eou.ou.id}->>state`] = [approvalState];
        }

        const order = this.getSortOrder(config.filter.sortParam, config.filter.sortDir);
        return this.apiv2Service.get<ExtendedAdvanceRequest, {}>('/advance_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order,
            areq_approvers_ids: 'cs.{' + eou.ou.id + '}',
            ...defaultParams,
            ...config.queryParams,
          },
        });
      }),
      map((res) => res as ApiV2Response<ExtendedAdvanceRequest>),
      map((res) => ({
        ...res,
        data: res.data.map(this.fixDates),
      }))
    );
  }

  getEReq(advanceRequestId: string): Observable<UnflattenedAdvanceRequest> {
    return this.apiService.get('/eadvance_requests/' + advanceRequestId).pipe(
      map((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const eAdvanceRequest: UnflattenedAdvanceRequest = this.dataTransformService.unflatten(res);
        this.dateService.fixDates(eAdvanceRequest.areq);
        return eAdvanceRequest;
      })
    );
  }

  getActions(advanceRequestId: string): Observable<AdvanceRequestActions> {
    return this.apiService.get('/advance_requests/' + advanceRequestId + '/actions');
  }

  getActiveApproversByAdvanceRequestId(advanceRequestId: string): Observable<Approval[]> {
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

  getMyAdvanceRequestsCount(queryParams = {}): Observable<number> {
    return this.getMyadvanceRequests({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((advanceRequest) => advanceRequest.count));
  }

  getTeamAdvanceRequestsCount(queryParams: {}, filter: Filters): Observable<number> {
    return this.getTeamAdvanceRequests({
      offset: 0,
      limit: 1,
      queryParams,
      filter,
    }).pipe(map((advanceRequest) => advanceRequest.count));
  }

  modifyAdvanceRequestCustomFields(customFields: CustomField[]): CustomField[] {
    customFields = customFields.map((customField) => {
      if (customField.type === 'DATE' && customField.value) {
        customField.value = new Date(customField.value as string);
      }
      return customField;
    });
    return customFields;
  }

  getInternalStateAndDisplayName(advanceRequest: ExtendedAdvanceRequest): { state: string; name: string } {
    let internalRepresentation: { state: string; name: string } = {
      state: null,
      name: null,
    };
    if (advanceRequest.areq_state === 'DRAFT') {
      internalRepresentation = this.getStateIfDraft(advanceRequest);
    } else if (advanceRequest.areq_state === 'INQUIRY') {
      internalRepresentation = {
        state: 'inquiry',
        name: 'Sent Back',
      };
    } else if (advanceRequest.areq_state === 'SUBMITTED' || advanceRequest.areq_state === 'APPROVAL_PENDING') {
      internalRepresentation = {
        state: 'pendingApproval',
        name: 'Pending',
      };
    } else if (advanceRequest.areq_state === 'APPROVED') {
      internalRepresentation = {
        state: 'approved',
        name: 'Approved',
      };
    } else if (advanceRequest.areq_state === 'PAID') {
      internalRepresentation = {
        state: 'paid',
        name: 'Paid',
      };
    } else if (advanceRequest.areq_state === 'REJECTED') {
      internalRepresentation = {
        state: 'rejected',
        name: 'Rejected',
      };
    }

    return internalRepresentation;
  }

  createAdvReqWithFilesAndSubmit(
    advanceRequest: Partial<AdvanceRequests>,
    fileObservables?: Observable<File[]>
  ): Observable<AdvanceRequestFile> {
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

  saveDraftAdvReqWithFiles(
    advanceRequest: Partial<AdvanceRequests>,
    fileObservables?: Observable<File[]>
  ): Observable<AdvanceRequestFile> {
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

  getMyAdvanceRequestStats(params: advanceRequestStat): Observable<Partial<StatsDimensionResponse[]>> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => this.getAdvanceRequestStats(eou, params)),
      map((res) => res.data)
    );
  }

  private getSortOrder(sortParam: SortingParam, sortDir: SortingDirection): string {
    let order: string;
    if (sortParam === SortingParam.creationDate) {
      order = 'areq_created_at';
    } else if (sortParam === SortingParam.approvalDate) {
      order = 'areq_approved_at';
    } else if (sortParam === SortingParam.project) {
      order = 'project_name';
    } else {
      order = 'areq_created_at'; //default
    }

    if (sortDir === SortingDirection.ascending) {
      order += '.asc,areq_id.desc';
    } else {
      order += '.desc,areq_id.desc'; //default
    }

    return order;
  }

  private getAdvanceRequestStats(
    eou: ExtendedOrgUser,
    params: advanceRequestStat
  ): Observable<Partial<ApiV2Response<StatsDimensionResponse>>> {
    return this.apiv2Service.get<StatsDimensionResponse, {}>('/advance_requests/stats', {
      params: {
        areq_org_user_id: 'eq.' + eou.ou.id,
        ...params,
      },
    });
  }

  private getApproversByAdvanceRequestId(advanceRequestId: string): Observable<Approval[]> {
    return this.apiService
      .get('/eadvance_requests/' + advanceRequestId + '/approvals')
      .pipe(map((res) => res as Approval[]));
  }

  private fixDates(data: ExtendedAdvanceRequest): ExtendedAdvanceRequest {
    if (data?.areq_created_at) {
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

  private getStateIfDraft(advanceRequest: ExtendedAdvanceRequest): {
    state: string;
    name: string;
  } {
    const internalRepresentation: { state: string; name: string } = {
      state: null,
      name: null,
    };
    if (!advanceRequest.areq_is_pulled_back && !advanceRequest.areq_is_sent_back) {
      internalRepresentation.state = 'draft';
      internalRepresentation.name = 'Draft';
    } else if (advanceRequest.areq_is_pulled_back) {
      internalRepresentation.state = 'pulledBack';
      internalRepresentation.name = 'Pulled Back';
    } else if (advanceRequest.areq_is_sent_back) {
      internalRepresentation.state = 'inquiry';
      internalRepresentation.name = 'Sent Back';
    }
    return internalRepresentation;
  }
}
