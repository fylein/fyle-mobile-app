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
import { of } from 'rxjs';
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
} from '../mock-data/extended-advance-request.data';
import { apiAdvanceRequestAction } from '../mock-data/advance-request-actions.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { apiAdvanceReqRes } from '../mock-data/stats-dimension-response.data';
import { advancedRequests, pullBackAdvancedRequests } from '../mock-data/advance-requests.data';
import { advanceReqApprovals } from '../mock-data/approval.data';
import { fileObjectData3 } from '../mock-data/file-object.data';
import { fileData1 } from '../mock-data/file.data';
import { advRequestFile } from '../mock-data/advance-request-file.data';

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
    apiService.post.and.returnValue(of(advancedRequests));

    advanceRequestService.submit(advancedRequests).subscribe((res) => {
      expect(res).toEqual(advancedRequests);
      expect(apiService.post).toHaveBeenCalledOnceWith('/advance_requests/submit', advancedRequests);
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

  it('delete(): should delete an advance request', (done) => {
    apiService.delete.and.returnValue(of(advancedRequests));

    advanceRequestService.delete(advancedRequests.id).subscribe((res) => {
      expect(res).toEqual(advancedRequests);
      expect(apiService.delete).toHaveBeenCalledOnceWith(`/advance_requests/${advancedRequests.id}`);
      done();
    });
  });

  it('fixDates(): should convert string values to dates', () => {
    //@ts-ignore
    expect(advanceRequestService.fixDates(extendedAdvReqWithoutDates)).toEqual(extendedAdvReqWithDates);
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

  it('createAdvReqWithFilesAndSubmit(): should create advanced request and submit it', (done) => {
    fileService.post.and.returnValue(of(fileObjectData3));
    spyOn(advanceRequestService, 'submit').and.returnValue(of(advancedRequests));

    advanceRequestService.createAdvReqWithFilesAndSubmit(advancedRequests, of(fileData1)).subscribe((res) => {
      expect(res).toEqual(advRequestFile);
      expect(advanceRequestService.submit).toHaveBeenCalledOnceWith(advancedRequests);
      done();
    });
  });
});
