import { TestBed } from '@angular/core/testing';
import { AdvanceRequestService } from './advance-request.service';
import { ApiService } from './api.service';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from './timezone.service';
import { AdvanceRequestPolicyService } from './advance-request-policy.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { Observable, of } from 'rxjs';
import {
  singleExtendedAdvReqRes,
  extendedAdvReqDraft,
  extendedAdvReqInquiry,
  extendedAdvReqApproved,
  extendedAdvReqPaid,
  extendedAdvReqRejected,
  extendedAdvReqSubmitted,
  extendedAdvReqPulledBack,
  extendedAdvReqSentBack,
  extendedAdvReqWithoutDates,
  extendedAdvReqWithDates,
  withoutDatesAdv,
  singleErqRes,
  singleErqUnflattened,
  teamAdvanceCountRes,
  allAdvanceRequestsRes,
  allTeamAdvanceRequestsRes,
} from '../mock-data/extended-advance-request.data';
import { apiAdvanceRequestAction } from '../mock-data/advance-request-actions.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { apiAdvanceReqRes } from '../mock-data/stats-dimension-response.data';
import {
  advanceRequests,
  advancedRequests2,
  checkPolicyAdvReqParam,
  draftAdvancedRequestParam,
  draftAdvancedRequestRes,
  expectedSingleErq,
  pullBackAdvancedRequests,
  rejectedAdvReqRes,
} from '../mock-data/advance-requests.data';
import { advanceReqApprovals } from '../mock-data/approval.data';
import { fileObjectData3, fileObjectData4 } from '../mock-data/file-object.data';
import { fileData1, fileData2 } from '../mock-data/file.data';
import { advRequestFile, advRequestFile2 } from '../mock-data/advance-request-file.data';
import { customFieldData1, expectedCustomField } from '../mock-data/custom-field.data';
import { orgUserSettingsData } from '../mock-data/org-user-settings.data';
import { checkPolicyData } from '../mock-data/policy-violation-check.data';
import { SortingParam } from '../models/sorting-param.model';
import { SortingDirection } from '../models/sorting-direction.model';
import { AdvancesStates } from '../models/advances-states.model';
import { cloneDeep } from 'lodash';

describe('AdvanceRequestService', () => {
  let advanceRequestService: AdvanceRequestService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let advanceRequestPolicyService: jasmine.SpyObj<AdvanceRequestPolicyService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: DateService;
  let fileService: jasmine.SpyObj<FileService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const advanceRequestPolicyServiceSpy = jasmine.createSpyObj('AdvanceRequestPolicyService', ['servicePost']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const timezoneServiceSpy = jasmine.createSpyObj('TimezoneService', ['convertToUtc']);

    TestBed.configureTestingModule({
      providers: [
        AdvanceRequestService,
        DateService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: ApiV2Service,
          useValue: apiv2ServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: AdvanceRequestPolicyService,
          useValue: advanceRequestPolicyServiceSpy,
        },
        {
          provide: DataTransformService,
          useValue: dataTransformServiceSpy,
        },
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: TimezoneService,
          useValue: timezoneServiceSpy,
        },
      ],
    });
    advanceRequestService = TestBed.inject(AdvanceRequestService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiv2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    advanceRequestPolicyService = TestBed.inject(
      AdvanceRequestPolicyService
    ) as jasmine.SpyObj<AdvanceRequestPolicyService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    timezoneService = TestBed.inject(TimezoneService) as jasmine.SpyObj<TimezoneService>;
  });

  it('should be created', () => {
    expect(advanceRequestService).toBeTruthy();
  });

  it('destroyAdvanceRequestsCacheBuster(): should reset advance request cache', (done) => {
    advanceRequestService.destroyAdvanceRequestsCacheBuster().subscribe((res) => {
      expect(res).toBeNull();
      done();
    });
  });

  it('getAdvanceRequest(): should get an advance request from ID', (done) => {
    const advReqID = 'areqdQ9jnokUva';
    apiv2Service.get.and.returnValue(of(singleExtendedAdvReqRes));
    // @ts-ignore
    spyOn(advanceRequestService, 'fixDates').and.returnValue(singleExtendedAdvReqRes.data[0]);

    advanceRequestService.getAdvanceRequest(advReqID).subscribe((res) => {
      expect(res).toEqual(singleExtendedAdvReqRes.data[0]);
      expect(apiv2Service.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: {
          areq_id: `eq.${advReqID}`,
        },
      });
      // @ts-ignore
      expect(advanceRequestService.fixDates).toHaveBeenCalledOnceWith(singleExtendedAdvReqRes.data[0]);
      done();
    });
  });

  it('getActions(): should get advance request actions from ID', (done) => {
    const advReqID = 'areqoVuT5I8OOy';
    apiService.get.and.returnValue(of(apiAdvanceRequestAction));

    advanceRequestService.getActions(advReqID).subscribe((res) => {
      expect(res).toEqual(apiAdvanceRequestAction);
      expect(apiService.get).toHaveBeenCalledOnceWith(`/advance_requests/${advReqID}/actions`);
      done();
    });
  });

  describe('getInternalStateAndDisplayName():', () => {
    it('should get state and display name of an advance request | DRAFT state', () => {
      //@ts-ignore
      spyOn(advanceRequestService, 'getStateIfDraft').and.returnValue({
        state: 'draft',
        name: 'Draft',
      });
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqDraft)).toEqual({
        state: 'draft',
        name: 'Draft',
      });
      //@ts-ignore
      expect(advanceRequestService.getStateIfDraft).toHaveBeenCalledOnceWith(extendedAdvReqDraft);
    });

    it('should get state and display name of an advance request | INQUIRY state', () => {
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqInquiry)).toEqual({
        state: 'inquiry',
        name: 'Sent Back',
      });
    });

    it('should get state and display name of an advance request | APPROVED state', () => {
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqApproved)).toEqual({
        state: 'approved',
        name: 'Approved',
      });
    });

    it('should get state and display name of an advance request | SUBMITTED state', () => {
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqSubmitted)).toEqual({
        state: 'pendingApproval',
        name: 'Pending',
      });
    });

    it('should get state and display name of an advance request | PAID state', () => {
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqPaid)).toEqual({
        state: 'paid',
        name: 'Paid',
      });
    });

    it('should get state and display name of an advance request | REJECTED state', () => {
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqRejected)).toEqual({
        state: 'rejected',
        name: 'Rejected',
      });
    });
  });

  describe('getStateIfDraft():', () => {
    it('get state if request is draft', () => {
      //@ts-ignore
      expect(advanceRequestService.getStateIfDraft(extendedAdvReqDraft)).toEqual({
        state: 'draft',
        name: 'Draft',
      });
    });

    it('get state if request is draft', () => {
      //@ts-ignore
      expect(advanceRequestService.getStateIfDraft(extendedAdvReqPulledBack)).toEqual({
        state: 'pulledBack',
        name: 'Pulled Back',
      });
    });

    it('get state if request is draft', () => {
      //@ts-ignore
      expect(advanceRequestService.getStateIfDraft(extendedAdvReqSentBack)).toEqual({
        state: 'inquiry',
        name: 'Sent Back',
      });
    });
  });

  it('getMyAdvanceRequestStats(): should get advance request stats by params provided', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    //@ts-ignore
    spyOn(advanceRequestService, 'getAdvanceRequestStats').and.returnValue(of(apiAdvanceReqRes));
    const params = {
      aggregates: 'count(areq_id),sum(areq_amount)',
      areq_state: 'in.(DRAFT)',
      areq_is_sent_back: 'is.true',
      scalar: true,
    };

    advanceRequestService.getMyAdvanceRequestStats(params).subscribe((res) => {
      expect(res).toEqual(apiAdvanceReqRes.data);
      //@ts-ignore
      expect(advanceRequestService.getAdvanceRequestStats).toHaveBeenCalledOnceWith(apiEouRes, params);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getAdvanceRequestStats(): should get advance request stats', (done) => {
    apiv2Service.get.and.returnValue(of(apiAdvanceReqRes));

    const params = {
      aggregates: 'count(areq_id),sum(areq_amount)',
      areq_state: 'in.(DRAFT)',
      areq_is_sent_back: 'is.true',
      scalar: true,
    };

    //@ts-ignore
    advanceRequestService.getAdvanceRequestStats(apiEouRes, params).subscribe((res) => {
      expect(res).toEqual(apiAdvanceReqRes);
      expect(apiv2Service.get).toHaveBeenCalledOnceWith('/advance_requests/stats', {
        params: {
          areq_org_user_id: 'eq.' + apiEouRes.ou.id,
          ...params,
        },
      });
      done();
    });
  });

  it('submit(): should submit an advance request', (done) => {
    apiService.post.and.returnValue(of(advanceRequests));

    advanceRequestService.submit(advanceRequests).subscribe((res) => {
      expect(res).toEqual(advanceRequests);
      expect(apiService.post).toHaveBeenCalledOnceWith('/advance_requests/submit', advanceRequests);
      done();
    });
  });

  it('saveDraft(): should save a draft advance request', (done) => {
    apiService.post.and.returnValue(of(draftAdvancedRequestRes));

    advanceRequestService.saveDraft(draftAdvancedRequestParam).subscribe((res) => {
      expect(res).toEqual(draftAdvancedRequestRes);
      expect(apiService.post).toHaveBeenCalledOnceWith('/advance_requests/save', draftAdvancedRequestParam);
      done();
    });
  });

  it('reject(): should reject an advance request', (done) => {
    apiService.post.and.returnValue(of(rejectedAdvReqRes));

    const advReq = 'areqVU0Xr5suPC';
    const payload = {
      status: {
        comment: 'a comment',
      },
      notify: false,
    };

    advanceRequestService.reject(advReq, payload).subscribe((res) => {
      expect(res).toEqual(rejectedAdvReqRes);
      expect(apiService.post).toHaveBeenCalledOnceWith(`/advance_requests/${advReq}/reject`, payload);
      done();
    });
  });

  it('approve(): should approve an advanced request', (done) => {
    apiService.post.and.returnValue(of(rejectedAdvReqRes));

    const advReq = 'areqVU0Xr5suPC';

    advanceRequestService.approve(advReq).subscribe((res) => {
      expect(res).toEqual(rejectedAdvReqRes);
      expect(apiService.post).toHaveBeenCalledOnceWith(`/advance_requests/${advReq}/approve`);
      done();
    });
  });

  it('sendBack(): should send back an advance request', (done) => {
    apiService.post.and.returnValue(of(rejectedAdvReqRes));

    const advReq = 'areqVU0Xr5suPC';
    const payload = {
      status: {
        comment: 'a comment',
      },
      notify: false,
    };

    advanceRequestService.sendBack(advReq, payload).subscribe((res) => {
      expect(res).toEqual(rejectedAdvReqRes);
      expect(apiService.post).toHaveBeenCalledOnceWith(`/advance_requests/${advReq}/inquire`, payload);
      done();
    });
  });

  it('pullBackadvanceRequest(): should pull back an advance requests', (done) => {
    apiService.post.and.returnValue(of(pullBackAdvancedRequests));

    const payloadParam = {
      status: {
        comment: 'sdf',
      },
      notify: false,
    };

    const advanceID = 'areqMP09oaYXBf';

    advanceRequestService.pullBackadvanceRequest(advanceID, payloadParam).subscribe((res) => {
      expect(res).toEqual(pullBackAdvancedRequests);
      expect(apiService.post).toHaveBeenCalledOnceWith(`/advance_requests/${advanceID}/pull_back`, payloadParam);
      done();
    });
  });

  it('addApprover(): should add approver to an advance request', (done) => {
    apiService.post.and.returnValue(of(pullBackAdvancedRequests));
    const advanceID = 'areqMP09oaYXBf';

    const data = {
      advance_request_id: advanceID,
      approver_email: 'ajain@fyle.in',
      comment: 'a comment',
    };

    advanceRequestService.addApprover(advanceID, data.approver_email, data.comment).subscribe((res) => {
      expect(res).toEqual(pullBackAdvancedRequests);
      expect(apiService.post).toHaveBeenCalledOnceWith('/advance_requests/add_approver', data);
      done();
    });
  });

  it('delete(): should delete an advance request', (done) => {
    apiService.delete.and.returnValue(of(advanceRequests));

    advanceRequestService.delete(advanceRequests.id).subscribe((res) => {
      expect(res).toEqual(advanceRequests);
      expect(apiService.delete).toHaveBeenCalledOnceWith(`/advance_requests/${advanceRequests.id}`);
      done();
    });
  });

  describe('fixDates():', () => {
    it('should convert string values to dates', () => {
      //@ts-ignore
      expect(advanceRequestService.fixDates(extendedAdvReqWithoutDates)).toEqual(extendedAdvReqWithDates);
    });
  });

  it('getActiveApproversByAdvanceRequestId(): should get active approvers for an advance request', (done) => {
    const advID = 'areqa4CojbCAqd';
    //@ts-ignore
    spyOn(advanceRequestService, 'getApproversByAdvanceRequestId').and.returnValue(of(advanceReqApprovals));

    advanceRequestService.getActiveApproversByAdvanceRequestId(advID).subscribe((res) => {
      expect(res).toEqual(advanceReqApprovals);
      //@ts-ignore
      expect(advanceRequestService.getApproversByAdvanceRequestId).toHaveBeenCalledOnceWith(advID);
      done();
    });
  });

  it('getApproversByAdvanceRequestId(): should get approvers for an advance request', (done) => {
    apiService.get.and.returnValue(of(advanceReqApprovals));
    const advID = 'areqa4CojbCAqd';

    //@ts-ignore
    advanceRequestService.getActiveApproversByAdvanceRequestId(advID).subscribe((res) => {
      expect(res).toEqual(advanceReqApprovals);
      expect(apiService.get).toHaveBeenCalledOnceWith(`/eadvance_requests/${advID}/approvals`);
      done();
    });
  });

  describe('createAdvReqWithFilesAndSubmit():', () => {
    it('should create advanced request and submit it with the file', (done) => {
      fileService.post.and.returnValue(of(fileObjectData3));
      spyOn(advanceRequestService, 'submit').and.returnValue(of(advanceRequests));

      advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequests, of(fileData1)).subscribe((res) => {
        expect(res).toEqual(advRequestFile);
        expect(advanceRequestService.submit).toHaveBeenCalledOnceWith(advanceRequests);
        expect(fileService.post).toHaveBeenCalledOnceWith(fileData1[0]);
        done();
      });
    });

    it('should create advanced request and submit it without the file', (done) => {
      spyOn(advanceRequestService, 'submit').and.returnValue(of(advanceRequests));

      advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequests, of(null)).subscribe((res) => {
        expect(res).toEqual({ ...advRequestFile, files: null });
        expect(advanceRequestService.submit).toHaveBeenCalledOnceWith(advanceRequests);
        done();
      });
    });
  });

  describe('saveDraftAdvReqWithFiles():', () => {
    it('should save draft advance request along with the file', (done) => {
      fileService.post.and.returnValue(of(fileObjectData4));
      spyOn(advanceRequestService, 'saveDraft').and.returnValue(of(advancedRequests2));

      advanceRequestService.saveDraftAdvReqWithFiles(advancedRequests2, of(fileData2)).subscribe((res) => {
        expect(res).toEqual(advRequestFile2);
        expect(advanceRequestService.saveDraft).toHaveBeenCalledOnceWith(advancedRequests2);
        expect(fileService.post).toHaveBeenCalledOnceWith(fileData2[0]);
        done();
      });
    });

    it('should save draft advance request without the file', (done) => {
      spyOn(advanceRequestService, 'saveDraft').and.returnValue(of(advancedRequests2));

      advanceRequestService.saveDraftAdvReqWithFiles(advancedRequests2, of(null)).subscribe((res) => {
        expect(res).toEqual({ ...advRequestFile2, files: null });
        expect(advanceRequestService.saveDraft).toHaveBeenCalledOnceWith(advancedRequests2);
        done();
      });
    });
  });

  it('getEReq(): should get advance request', (done) => {
    apiService.get.and.returnValue(of(singleErqRes));
    dataTransformService.unflatten.and.returnValue(singleErqUnflattened);
    spyOn(dateService, 'fixDates').and.returnValue(of(expectedSingleErq));

    const advID = 'areqGzKF1Tne23';

    advanceRequestService.getEReq(advID).subscribe((res) => {
      expect(res).toEqual(singleErqUnflattened);
      expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(singleErqRes);
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(singleErqUnflattened.areq);
      done();
    });
  });

  it('modifyAdvanceRequestCustomFields(): should modify advance request custom fields', () => {
    expect(advanceRequestService.modifyAdvanceRequestCustomFields(cloneDeep(customFieldData1))).toEqual(
      expectedCustomField
    );
  });

  describe('getSortOrder(): should get the sorting order', () => {
    it('param - creation date | direction - ascending', () => {
      const sortingParam = SortingParam.creationDate;

      const sortingDirection = SortingDirection.ascending;

      //@ts-ignore
      expect(advanceRequestService.getSortOrder(sortingParam, sortingDirection)).toEqual(
        'areq_created_at.asc,areq_id.desc'
      );
    });

    it('param - approval date | direction - descending', () => {
      const sortingParam = SortingParam.approvalDate;

      const sortingDirection = SortingDirection.descending;

      //@ts-ignore
      expect(advanceRequestService.getSortOrder(sortingParam, sortingDirection)).toEqual(
        'areq_approved_at.desc,areq_id.desc'
      );
    });

    it('param - project | direction - ascending', () => {
      const sortingParam = SortingParam.project;

      const sortingDirection = SortingDirection.ascending;

      //@ts-ignore
      expect(advanceRequestService.getSortOrder(sortingParam, sortingDirection)).toEqual(
        'project_name.asc,areq_id.desc'
      );
    });

    it('param - nothing specified | direction - ascending', () => {
      const sortingDirection = SortingDirection.ascending;

      //@ts-ignore
      expect(advanceRequestService.getSortOrder({}, sortingDirection)).toEqual('areq_created_at.asc,areq_id.desc');
    });
  });

  it('testPolicy(): should test policy violations', (done) => {
    const date = '2023-02-23T19:37:01.207Z';
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    advanceRequestPolicyService.servicePost.and.returnValue(of(checkPolicyData));
    timezoneService.convertToUtc.and.returnValue(new Date(date));

    advanceRequestService.testPolicy(checkPolicyAdvReqParam).subscribe((res) => {
      expect(res).toEqual(checkPolicyData);
      expect(timezoneService.convertToUtc).toHaveBeenCalledOnceWith(
        checkPolicyAdvReqParam.created_at,
        orgUserSettingsData.locale.offset
      );
      expect(advanceRequestPolicyService.servicePost).toHaveBeenCalledOnceWith(
        '/policy_check/test',
        checkPolicyAdvReqParam
      );
      done();
    });
  });

  it('getTeamAdvanceRequestsCount(): should get team advance count', (done) => {
    spyOn(advanceRequestService, 'getTeamAdvanceRequests').and.returnValue(of(teamAdvanceCountRes));

    const filters = {
      state: [AdvancesStates.pending],
      sortParam: undefined,
      sortDir: undefined,
    };

    const queryParams = {
      areq_state: ['eq.APPROVAL_PENDING'],
      or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)'],
    };

    advanceRequestService.getTeamAdvanceRequestsCount(queryParams, filters).subscribe((res) => {
      expect(res).toEqual(teamAdvanceCountRes.count);
      expect(advanceRequestService.getTeamAdvanceRequests).toHaveBeenCalledOnceWith({
        offset: 0,
        limit: 1,
        queryParams,
        filter: { state: [AdvancesStates.pending], sortParam: undefined, sortDir: undefined },
      });
      done();
    });
  });

  describe('getMyAdvanceRequestsCount():', () => {
    it('should get advance request count', (done) => {
      spyOn(advanceRequestService, 'getMyadvanceRequests').and.returnValue(of(teamAdvanceCountRes));
      const queryParams = {
        areq_advance_id: 'is.null',
      };

      advanceRequestService.getMyAdvanceRequestsCount(queryParams).subscribe((res) => {
        expect(res).toEqual(teamAdvanceCountRes.count);
        expect(advanceRequestService.getMyadvanceRequests).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 1,
          queryParams: { ...queryParams },
        });
        done();
      });
    });

    it('should get advance request count without query parmas', (done) => {
      spyOn(advanceRequestService, 'getMyadvanceRequests').and.returnValue(of(teamAdvanceCountRes));

      advanceRequestService.getMyAdvanceRequestsCount().subscribe((res) => {
        expect(res).toEqual(teamAdvanceCountRes.count);
        expect(advanceRequestService.getMyadvanceRequests).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 1,
          queryParams: {},
        });
        done();
      });
    });
  });

  it('getMyadvanceRequests(): should get all advance request', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    apiv2Service.get.and.returnValue(of(allAdvanceRequestsRes));

    const param = {
      offset: 0,
      limit: 10,
      queryParams: {
        areq_advance_id: 'is.null',
        order: 'areq_created_at.desc,areq_id.desc',
      },
    };

    advanceRequestService.getMyadvanceRequests(param).subscribe((res) => {
      expect(res).toEqual(allAdvanceRequestsRes);
      expect(apiv2Service.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: {
          offset: param.offset,
          limit: param.limit,
          areq_org_user_id: 'eq.' + apiEouRes.ou.id,
          ...param.queryParams,
        },
      });
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getTeamAdvanceRequests():', () => {
    it('should get all team advance requests | APPROVAL PENDING AND APPROVED', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(allTeamAdvanceRequestsRes));

      const params = {
        offset: 0,
        limit: 1,
        queryParams: {
          areq_state: ['eq.APPROVAL_PENDING'],
          or: 'areq_created_at.desc,areq_id.desc',
        },
        filter: {
          sortParam: undefined,
          sortDir: undefined,
          state: [AdvancesStates.pending, AdvancesStates.approved],
        },
      };

      const defaultParams = {
        'advance_request_approvals->ouX8dwsbLCLv->>state': ['in.(APPROVAL_PENDING,APPROVAL_DONE)'],
      };

      advanceRequestService.getTeamAdvanceRequests(params).subscribe((res) => {
        expect(res).toEqual(allTeamAdvanceRequestsRes);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: params.offset,
            limit: params.limit,
            order: params.queryParams.or,
            areq_approvers_ids: `cs.{${apiEouRes.ou.id}}`,
            ...defaultParams,
            ...params.queryParams,
          },
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should get all team advance requests | APPROVAL PENDING', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(allTeamAdvanceRequestsRes));

      const params = {
        offset: 0,
        limit: 1,
        queryParams: {
          areq_state: ['eq.APPROVAL_PENDING'],
          or: 'areq_created_at.desc,areq_id.desc',
        },
        filter: {
          sortParam: undefined,
          sortDir: undefined,
          state: [AdvancesStates.pending],
        },
      };

      const defaultParams = {
        'advance_request_approvals->ouX8dwsbLCLv->>state': ['eq.APPROVAL_PENDING'],
      };

      advanceRequestService.getTeamAdvanceRequests(params).subscribe((res) => {
        expect(res).toEqual(allTeamAdvanceRequestsRes);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: params.offset,
            limit: params.limit,
            order: params.queryParams.or,
            areq_approvers_ids: `cs.{${apiEouRes.ou.id}}`,
            ...defaultParams,
            ...params.queryParams,
          },
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should get all team advance requests | APPROVED', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(allTeamAdvanceRequestsRes));

      const params = {
        offset: 0,
        limit: 1,
        queryParams: {
          areq_state: ['eq.APPROVAL_PENDING'],
          or: 'areq_created_at.desc,areq_id.desc',
        },
        filter: {
          sortParam: undefined,
          sortDir: undefined,
          state: [AdvancesStates.approved],
        },
      };

      const defaultParams = {
        'advance_request_approvals->ouX8dwsbLCLv->>state': ['eq.APPROVAL_DONE'],
      };

      advanceRequestService.getTeamAdvanceRequests(params).subscribe((res) => {
        expect(res).toEqual(allTeamAdvanceRequestsRes);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: params.offset,
            limit: params.limit,
            order: params.queryParams.or,
            areq_approvers_ids: `cs.{${apiEouRes.ou.id}}`,
            ...defaultParams,
            ...params.queryParams,
          },
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
