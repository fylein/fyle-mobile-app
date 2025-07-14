import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';
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
import { AdvanceRequests } from '../models/advance-requests.model';
import { StatusPayload } from '../models/status-payload.model';
import { ApiV2Response } from '../models/api-v2.model';
import { AdvanceRequestActions } from '../models/advance-request-actions.model';
import { AdvanceRequestFile } from '../models/advance-request-file.model';
import { UnflattenedAdvanceRequest } from '../models/unflattened-advance-request.model';
import { ApproverService } from './platform/v1/approver/approver.service';
import { SpenderService } from './platform/v1/spender/spender.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { AdvanceRequestPlatform } from '../models/platform/advance-request-platform.model';
import { ExtendedAdvanceRequestPublic } from '../models/extended-advance-request-public.model';
import { AdvanceRequestState } from '../models/advance-request-state.model';
import { ApprovalPublic } from '../models/approval-public.model';
import { StatsResponse } from '../models/platform/v1/stats-response.model';
import { PlatformConfig } from '../models/platform/platform-config.model';
import { TranslocoService } from '@jsverse/transloco';
import { ExtendedStatus } from '../models/extended_status.model';
import { Comment } from '../models/platform/v1/comment.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

const advanceRequestsCacheBuster$ = new Subject<void>();

// eslint-disable-next-line
type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: SortingParam;
  sortDir: SortingDirection;
}>;

// eslint-disable-next-line
type Config = Partial<{
  offset: number;
  limit: number;
  queryParams: Record<string, string | string[]>;
  areq_org_user_id?: string;
  filter: Filters;
}>;

// eslint-disable-next-line
type advanceRequestStat = {
  state: string;
};

// eslint-disable-next-line
interface approverParams {
  offset: number;
  limit: number;
  state?: string;
  or?: string;
  approvals?: string;
  order?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdvanceRequestService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private dataTransformService: DataTransformService,
    private dateService: DateService,
    private fileService: FileService,
    private approverService: ApproverService,
    private spenderService: SpenderService,
    private translocoService: TranslocoService
  ) {}

  @Cacheable({
    cacheBusterObserver: advanceRequestsCacheBuster$,
  })
  getSpenderAdvanceRequests(
    config: PlatformConfig = {
      offset: 0,
      limit: 200,
      queryParams: {},
    }
  ): Observable<ApiV2Response<ExtendedAdvanceRequestPublic>> {
    const params = {
      offset: config.offset,
      limit: config.limit,
      advance_id: 'eq.null',
      ...config.queryParams,
    };
    return this.spenderService
      .get<PlatformApiResponse<AdvanceRequestPlatform[]>>('/advance_requests', {
        params,
      })
      .pipe(
        map((res) => ({
          count: res.count,
          offset: res.offset,
          data: this.transformToPublicAdvanceRequest(res),
        }))
      );
  }

  @Cacheable({
    cacheBusterObserver: advanceRequestsCacheBuster$,
  })
  getAdvanceRequestPlatform(id: string): Observable<ExtendedAdvanceRequestPublic> {
    return this.spenderService
      .get<PlatformApiResponse<AdvanceRequestPlatform[]>>('/advance_requests', {
        params: { id: `eq.${id}` },
      })
      .pipe(map((res) => this.transformSpenderAdvReq(this.fixDatesForPlatformFields(res.data[0]))));
  }

  @Cacheable({
    cacheBusterObserver: advanceRequestsCacheBuster$,
  })
  getApproverAdvanceRequest(id: string): Observable<ExtendedAdvanceRequest> {
    return this.approverService
      .get<PlatformApiResponse<AdvanceRequestPlatform[]>>('/advance_requests', {
        params: { id: `eq.${id}` },
      })
      .pipe(map((res) => this.transformApproverAdvReq(this.fixDatesForPlatformFields(res.data[0]))));
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
  pullBackAdvanceRequest(
    advanceRequestId: string,
    addStatusPayload: StatusPayload
  ): Observable<AdvanceRequestPlatform> {
    const comment = addStatusPayload.status?.comment || '';
    const notify = addStatusPayload.notify || false;
    const payload = {
      data: {
        id: advanceRequestId,
        comment,
        notify,
      },
    };
    return this.spenderService
      .post<PlatformApiResponse<AdvanceRequestPlatform>>('/advance_requests/pull_back', payload)
      .pipe(map((response) => response.data));
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
  submit(advanceRequest: Partial<AdvanceRequests>, isApprover: Boolean): Observable<AdvanceRequestPlatform> {
    const payload = this.buildPlatformPayload(advanceRequest);
    const service = isApprover ? this.approverService : this.spenderService;

    return service
      .post<PlatformApiResponse<AdvanceRequestPlatform>>('/advance_requests/submit', payload)
      .pipe(map((response) => response.data));
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  post(advanceRequest: Partial<AdvanceRequests>): Observable<AdvanceRequestPlatform> {
    const payload = this.buildPlatformPayload(advanceRequest);
    return this.spenderService
      .post<PlatformApiResponse<AdvanceRequestPlatform>>('/advance_requests', payload)
      .pipe(map((response) => response.data));
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
  getTeamAdvanceRequestsPlatform(
    config: Config = {
      offset: 0,
      limit: 10,
      queryParams: {},
    }
  ): Observable<ApiV2Response<ExtendedAdvanceRequest>> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) => {
        const userId = eou.ou.user_id;
        const isPending = config.filter.state.includes(AdvancesStates.pending);
        const isApproved = config.filter.state.includes(AdvancesStates.approved);
        const params: approverParams = {
          offset: config.offset,
          limit: config.limit,
        };

        if (isPending && isApproved) {
          params.state = 'in.(APPROVED, APPROVAL_PENDING)';
          params.or = `(approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_PENDING"}], approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_DONE"}])`;
        } else if (isPending) {
          params.state = 'eq.APPROVAL_PENDING';
          params.approvals = `cs.[{"approver_user_id":"${userId}", "state":"APPROVAL_PENDING"}]`;
        } else if (isApproved) {
          params.state = 'in.(APPROVED, APPROVAL_PENDING)';
          params.approvals = `cs.[{"approver_user_id":"${userId}", "state":"APPROVAL_DONE"}]`;
        } else {
          params.or = `(approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_PENDING"}], approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_DONE"}], approvals.cs.[{"approver_user_id":"${userId}", "state":"APPROVAL_REJECTED"}])`;
        }
        params.order = this.getSortOrder(config.filter.sortParam, config.filter.sortDir);
        return this.approverService.get<PlatformApiResponse<AdvanceRequestPlatform[]>>('/advance_requests', {
          params,
        });
      }),
      map((res) => ({
        count: res.count,
        offset: res.offset,
        data: this.transformToAdvanceRequest(res),
      }))
    );
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  postCommentPlatform(advanceRequestId: string, comment: string): Observable<Comment> {
    const payload = {
      data: {
        advance_request_id: advanceRequestId,
        comment,
      },
    };
    return this.spenderService
      .post<PlatformApiResponse<Comment>>('/advance_requests/comments', payload)
      .pipe(map((response) => response.data));
  }

  @CacheBuster({
    cacheBusterNotifier: advanceRequestsCacheBuster$,
  })
  postCommentPlatformForApprover(advanceRequestId: string, comment: string): Observable<Comment> {
    const payload = {
      data: {
        advance_request_id: advanceRequestId,
        comment,
      },
    };
    return this.approverService
      .post<PlatformApiResponse<Comment>>('/advance_requests/comments', payload)
      .pipe(map((response) => response.data));
  }

  getEReqFromPlatform(advanceRequestId: string): Observable<UnflattenedAdvanceRequest> {
    return this.getAdvanceRequestPlatform(advanceRequestId).pipe(
      map((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const eAdvanceRequest: UnflattenedAdvanceRequest = this.dataTransformService.unflatten(res);
        this.dateService.fixDates(eAdvanceRequest.areq);
        return eAdvanceRequest;
      })
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

  getSpenderPermissions(advanceRequestId: string): Observable<AdvanceRequestActions> {
    const payload = {
      data: { id: advanceRequestId },
    };
    return this.spenderService
      .post<PlatformApiResponse<AdvanceRequestActions>>('/advance_requests/permissions', payload)
      .pipe(map((response) => response.data));
  }

  getApproverPermissions(advanceRequestId: string): Observable<AdvanceRequestActions> {
    const payload = {
      data: { id: advanceRequestId },
    };
    return this.approverService
      .post<PlatformApiResponse<AdvanceRequestActions>>('/advance_requests/permissions', payload)
      .pipe(map((response) => response.data));
  }

  getActiveApproversByAdvanceRequestIdPlatformForApprover(advanceRequestId: string): Observable<ApprovalPublic[]> {
    return this.approverService
      .get<PlatformApiResponse<AdvanceRequestPlatform[]>>('/advance_requests', {
        params: { id: `eq.${advanceRequestId}` },
      })
      .pipe(
        map((res) => {
          const approvals = res.data[0].approvals;
          const filteredApprovers: ApprovalPublic[] = [];
          approvals.filter((approver) => {
            if (approver.state !== 'APPROVAL_DISABLED') {
              filteredApprovers.push({
                approver_name: approver.approver_user.full_name,
                approver_email: approver.approver_user.email,
                state: approver.state,
              });
            }
          });
          return filteredApprovers;
        })
      );
  }

  getActiveApproversByAdvanceRequestIdPlatform(advanceRequestId: string): Observable<ApprovalPublic[]> {
    return this.spenderService
      .get<PlatformApiResponse<AdvanceRequestPlatform[]>>('/advance_requests', {
        params: { id: `eq.${advanceRequestId}` },
      })
      .pipe(
        map((res) => {
          const approvals = res.data[0].approvals;
          const filteredApprovers: ApprovalPublic[] = [];
          approvals.filter((approver) => {
            if (approver.state !== 'APPROVAL_DISABLED') {
              filteredApprovers.push({
                approver_name: approver.approver_user.full_name,
                approver_email: approver.approver_user.email,
                state: approver.state,
              });
            }
          });
          return filteredApprovers;
        })
      );
  }

  getCommentsByAdvanceRequestIdPlatformForApprover(advanceRequestId: string): Observable<ExtendedStatus[]> {
    return this.approverService
      .get<PlatformApiResponse<AdvanceRequestPlatform[]>>('/advance_requests', {
        params: { id: `eq.${advanceRequestId}` },
      })
      .pipe(
        switchMap((res: PlatformApiResponse<AdvanceRequestPlatform[]>) =>
          this.mapCommentsToExtendedStatus(res, advanceRequestId)
        )
      );
  }

  getCommentsByAdvanceRequestIdPlatform(advanceRequestId: string): Observable<ExtendedStatus[]> {
    return this.spenderService
      .get<PlatformApiResponse<AdvanceRequestPlatform[]>>('/advance_requests', {
        params: { id: `eq.${advanceRequestId}` },
      })
      .pipe(
        switchMap((res: PlatformApiResponse<AdvanceRequestPlatform[]>) =>
          this.mapCommentsToExtendedStatus(res, advanceRequestId)
        )
      );
  }

  getSpenderAdvanceRequestsCount(queryParams = {}): Observable<number> {
    return this.getSpenderAdvanceRequests({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((advanceRequest) => advanceRequest.count));
  }

  getTeamAdvanceRequestsCount(filter: Filters): Observable<number> {
    return this.getTeamAdvanceRequestsPlatform({
      offset: 0,
      limit: 1,
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

  getInternalStateAndDisplayName(advanceRequest: ExtendedAdvanceRequest | ExtendedAdvanceRequestPublic): {
    state: string;
    name: string;
  } {
    let internalRepresentation: { state: string; name: string } = {
      state: null,
      name: null,
    };
    if (advanceRequest.areq_state === 'DRAFT') {
      internalRepresentation = this.getStateIfDraft(advanceRequest);
    } else if (advanceRequest.areq_state === 'INQUIRY') {
      internalRepresentation = {
        state: 'inquiry',
        name: this.translocoService.translate('services.advanceRequest.sentBack'),
      };
    } else if (advanceRequest.areq_state === 'SUBMITTED' || advanceRequest.areq_state === 'APPROVAL_PENDING') {
      internalRepresentation = {
        state: 'pendingApproval',
        name: this.translocoService.translate('services.advanceRequest.pending'),
      };
    } else if (advanceRequest.areq_state === 'APPROVED') {
      internalRepresentation = {
        state: 'approved',
        name: this.translocoService.translate('services.advanceRequest.approved'),
      };
    } else if (advanceRequest.areq_state === 'PAID') {
      internalRepresentation = {
        state: 'paid',
        name: this.translocoService.translate('services.advanceRequest.paid'),
      };
    } else if (advanceRequest.areq_state === 'REJECTED') {
      internalRepresentation = {
        state: 'rejected',
        name: this.translocoService.translate('services.advanceRequest.rejected'),
      };
    }

    return internalRepresentation;
  }

  createAdvReqWithFilesAndSubmit(
    advanceRequest: Partial<AdvanceRequests>,
    fileObservables?: Observable<File[]>,
    isApprover?: boolean
  ): Observable<AdvanceRequestFile> {
    return forkJoin({
      files: fileObservables,
      advanceReq: this.submit(advanceRequest, isApprover || false),
    }).pipe(
      switchMap((res) => {
        if (res.files && res.files.length > 0) {
          const fileObjs: File[] = res.files;
          const advanceReqPlatform = res.advanceReq;
          const newFileObjs = fileObjs.map((obj: File) => {
            obj.advance_request_id = advanceReqPlatform.id;
            return this.fileService.post(obj);
          });
          return forkJoin(newFileObjs).pipe(
            map(() => ({
              files: res.files,
              advanceReq: advanceReqPlatform,
            }))
          );
        } else {
          return of(null).pipe(
            map(() => ({
              files: res.files,
              advanceReq: res.advanceReq,
            }))
          );
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
      advanceReq: this.post(advanceRequest),
    }).pipe(
      switchMap((res) => {
        if (res.files && res.files.length > 0) {
          const fileObjs: File[] = res.files;
          const advanceReqPlatform = res.advanceReq;
          const newFileObjs = fileObjs.map((obj: File) => {
            obj.advance_request_id = advanceReqPlatform.id;
            return this.fileService.post(obj);
          });
          return forkJoin(newFileObjs).pipe(
            map(() => ({
              files: res.files,
              advanceReq: advanceReqPlatform,
            }))
          );
        } else {
          return of(null).pipe(
            map(() => ({
              files: res.files,
              advanceReq: res.advanceReq,
            }))
          );
        }
      })
    );
  }

  getAdvanceRequestStats(params: advanceRequestStat): Observable<StatsResponse> {
    return this.spenderService
      .post<{ data: StatsResponse }>('/advance_requests/stats', {
        data: {
          query_params: `state=${params.state}`,
        },
      })
      .pipe(map((res) => res.data));
  }

  transformApproverAdvReq(advanceRequestPlatform: AdvanceRequestPlatform): ExtendedAdvanceRequest {
    return {
      areq_advance_request_number: advanceRequestPlatform.seq_num,
      areq_advance_id: advanceRequestPlatform.advance_id,
      areq_amount: advanceRequestPlatform.amount,
      areq_approved_at: advanceRequestPlatform.last_approved_at,
      areq_created_at: advanceRequestPlatform.created_at,
      areq_currency: advanceRequestPlatform.currency,
      areq_id: advanceRequestPlatform.id,
      areq_notes: advanceRequestPlatform.notes,
      areq_org_user_id: advanceRequestPlatform.employee_id,
      areq_project_id: advanceRequestPlatform.project_id,
      areq_purpose: advanceRequestPlatform.purpose,
      areq_source: advanceRequestPlatform.source,
      areq_state: this.getAdvanceRequestState(advanceRequestPlatform.state),
      areq_updated_at: advanceRequestPlatform.updated_at,
      ou_department: advanceRequestPlatform.employee?.department?.name,
      ou_department_id: advanceRequestPlatform.employee?.department?.id,
      ou_id: advanceRequestPlatform.employee_id,
      ou_org_id: advanceRequestPlatform.org_id,
      ou_sub_department: advanceRequestPlatform.employee?.department?.sub_department,
      us_email: advanceRequestPlatform.user?.email,
      us_full_name: advanceRequestPlatform.user?.full_name,
      areq_is_pulled_back: advanceRequestPlatform.state === AdvanceRequestState.PULLED_BACK,
      ou_employee_id: advanceRequestPlatform.employee_id,
      areq_custom_field_values: advanceRequestPlatform.custom_fields,
      areq_policy_amount: advanceRequestPlatform.policy_amount,
      areq_is_sent_back: advanceRequestPlatform.state === AdvanceRequestState.SENT_BACK,
      project_name: advanceRequestPlatform.project?.name,
      project_code: advanceRequestPlatform.project?.code,
    };
  }

  transformToAdvanceRequest(
    advanceReqPlatformResponse: PlatformApiResponse<AdvanceRequestPlatform[]>
  ): ExtendedAdvanceRequest[] {
    return advanceReqPlatformResponse.data.map((advanceRequestPlatform) =>
      this.transformApproverAdvReq(advanceRequestPlatform)
    );
  }

  transformSpenderAdvReq(advanceRequestPlatform: AdvanceRequestPlatform): ExtendedAdvanceRequestPublic {
    return {
      areq_advance_request_number: advanceRequestPlatform.seq_num,
      areq_advance_id: advanceRequestPlatform.advance_id,
      areq_amount: advanceRequestPlatform.amount,
      areq_approved_at: advanceRequestPlatform.last_approved_at,
      areq_created_at: advanceRequestPlatform.created_at,
      areq_currency: advanceRequestPlatform.currency,
      areq_id: advanceRequestPlatform.id,
      areq_notes: advanceRequestPlatform.notes,
      areq_org_user_id: advanceRequestPlatform.employee_id,
      areq_project_id: advanceRequestPlatform.project_id,
      areq_purpose: advanceRequestPlatform.purpose,
      areq_source: advanceRequestPlatform.source,
      areq_state: this.getAdvanceRequestState(advanceRequestPlatform.state),
      areq_updated_at: advanceRequestPlatform.updated_at,
      ou_department: advanceRequestPlatform.employee.department && advanceRequestPlatform.employee.department.name,
      ou_department_id: advanceRequestPlatform.employee.department && advanceRequestPlatform.employee.department.id,
      ou_id: advanceRequestPlatform.employee_id,
      ou_org_id: advanceRequestPlatform.org_id,
      ou_sub_department:
        advanceRequestPlatform.employee.department && advanceRequestPlatform.employee.department.sub_department,
      us_email: advanceRequestPlatform.user.email,
      us_full_name: advanceRequestPlatform.user.full_name,
      areq_is_pulled_back: advanceRequestPlatform.state === AdvanceRequestState.PULLED_BACK,
      ou_employee_id: advanceRequestPlatform.employee_id,
      areq_custom_field_values: advanceRequestPlatform.custom_fields,
      areq_is_sent_back: advanceRequestPlatform.state === AdvanceRequestState.SENT_BACK,
      project_name: advanceRequestPlatform.project && advanceRequestPlatform.project.name,
      project_code: advanceRequestPlatform.project && advanceRequestPlatform.project.code,
    };
  }

  transformToPublicAdvanceRequest(
    advanceReqPlatformResponse: PlatformApiResponse<AdvanceRequestPlatform[]>
  ): ExtendedAdvanceRequestPublic[] {
    return advanceReqPlatformResponse.data.map((advanceRequestPlatform) =>
      this.transformSpenderAdvReq(advanceRequestPlatform)
    );
  }

  private getAdvanceRequestState(advanceRequestState: string): string {
    if (advanceRequestState === 'SENT_BACK') {
      return 'INQUIRY';
    } else if (advanceRequestState === 'PULLED_BACK') {
      return 'DRAFT';
    }

    return advanceRequestState;
  }

  private getSortOrder(sortParam: SortingParam, sortDir: SortingDirection): string {
    let order: string;
    if (sortParam === SortingParam.creationDate) {
      order = 'created_at';
    } else if (sortParam === SortingParam.approvalDate) {
      order = 'last_approved_at';
    } else if (sortParam === SortingParam.project) {
      order = 'project->name';
    } else {
      order = 'created_at'; //default
    }

    if (sortDir === SortingDirection.ascending) {
      order += '.asc,id.desc';
    } else {
      order += '.desc,id.desc'; //default
    }

    return order;
  }

  private getApproversByAdvanceRequestId(advanceRequestId: string): Observable<Approval[]> {
    return this.apiService
      .get('/eadvance_requests/' + advanceRequestId + '/approvals')
      .pipe(map((res) => res as Approval[]));
  }

  private fixDates(data: ExtendedAdvanceRequest): ExtendedAdvanceRequest {
    if (data && data.areq_created_at) {
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

  private fixDatesForPlatformFields(data: AdvanceRequestPlatform): AdvanceRequestPlatform {
    if (data.created_at) {
      data.created_at = new Date(data.created_at);
    }

    if (data.updated_at) {
      data.updated_at = new Date(data.updated_at);
    }

    if (data.last_approved_at) {
      data.last_approved_at = new Date(data.last_approved_at);
    }

    return data;
  }

  private mapCommentsToExtendedStatus(
    res: PlatformApiResponse<AdvanceRequestPlatform[]>,
    advanceRequestId: string
  ): Observable<ExtendedStatus[]> {
    if (!res.data || res.data.length === 0) {
      return of([] as ExtendedStatus[]);
    }

    const advanceRequest = res.data[0];
    if (!advanceRequest.comments) {
      return of([] as ExtendedStatus[]);
    }

    return from(this.authService.getEou()).pipe(
      map((eou: ExtendedOrgUser): ExtendedStatus[] => {
        const currentUserId = eou?.us?.id;

        return advanceRequest.comments.map(
          (comment: Comment): ExtendedStatus => ({
            st_id: comment.id,
            st_created_at: new Date(comment.created_at),
            st_org_user_id: comment.creator_user_id,
            st_comment: comment.comment,
            st_advance_request_id: advanceRequestId,
            us_full_name: comment.creator_user?.full_name || null,
            us_email: comment.creator_user?.email || null,
            isBotComment: comment.creator_type === 'SYSTEM',
            isSelfComment: currentUserId ? comment.creator_user_id === currentUserId : false,
            isOthersComment:
              comment.creator_type !== 'SYSTEM' && currentUserId && comment.creator_user_id !== currentUserId,
          })
        );
      })
    );
  }

  private getStateIfDraft(advanceRequest: ExtendedAdvanceRequest | ExtendedAdvanceRequestPublic): {
    state: string;
    name: string;
  } {
    const internalRepresentation: { state: string; name: string } = {
      state: null,
      name: null,
    };
    if (!advanceRequest.areq_is_pulled_back && !advanceRequest.areq_is_sent_back) {
      internalRepresentation.state = 'draft';
      internalRepresentation.name = this.translocoService.translate('services.advanceRequest.draft');
    } else if (advanceRequest.areq_is_pulled_back) {
      internalRepresentation.state = 'pulledBack';
      internalRepresentation.name = this.translocoService.translate('services.advanceRequest.pulledBack');
    } else if (advanceRequest.areq_is_sent_back) {
      internalRepresentation.state = 'inquiry';
      internalRepresentation.name = this.translocoService.translate('services.advanceRequest.sentBack');
    }
    return internalRepresentation;
  }

  private convertCustomFieldValue(
    value: string | boolean | number | Date | string[] | { display?: string }
  ): string | boolean | number {
    if (value instanceof Date) {
      return value.toISOString();
    } else if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'object' && value !== null) {
      return value.display || JSON.stringify(value);
    }
    return value as string | boolean | number;
  }

  private buildPlatformPayload(advanceRequest: Partial<AdvanceRequests>): { data: Record<string, unknown> } {
    return {
      data: {
        ...advanceRequest,
        custom_fields: advanceRequest.custom_field_values?.map((field) => ({
          id: field.id,
          name: field.name,
          value: this.convertCustomFieldValue(field.value),
          type: field.type || 'TEXT',
        })),
      },
    };
  }
}
