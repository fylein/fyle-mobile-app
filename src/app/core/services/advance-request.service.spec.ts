import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { apiAdvanceRequestAction } from '../mock-data/advance-request-actions.data';
import { advRequestFile, advRequestFile2 } from '../mock-data/advance-request-file.data';
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
import { advanceReqApprovals, advanceReqApprovalsPublic } from '../mock-data/approval.data';
import {
  customField2,
  customFields,
  expectedCustomFieldsWithDate,
  expectedCustomFieldsWoDate,
} from '../mock-data/custom-field.data';
import {
  allAdvanceRequestsRes,
  allTeamAdvanceRequestsRes,
  extendedAdvReqApproved,
  extendedAdvReqDraft,
  extendedAdvReqInquiry,
  extendedAdvReqPaid,
  extendedAdvReqPulledBack,
  extendedAdvReqRejected,
  extendedAdvReqSentBack,
  extendedAdvReqSubmitted,
  extendedAdvReqWithDates,
  extendedAdvReqWithoutDates,
  publicAdvanceRequestRes,
  publicAdvanceRequestResPulledBack,
  publicAdvanceRequestResSentBack,
  singleErqRes,
  singleErqUnflattened,
  singleExtendedAdvReqRes,
  teamAdvanceCountRes,
} from '../mock-data/extended-advance-request.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { fileObjectData3, fileObjectData4 } from '../mock-data/file-object.data';
import { fileData1, fileData2 } from '../mock-data/file.data';
import { AdvancesStates } from '../models/advances-states.model';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingParam } from '../models/sorting-param.model';
import { AdvanceRequestService } from './advance-request.service';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TimezoneService } from './timezone.service';
import { SpenderService } from './platform/v1/spender/spender.service';
import {
  advanceRequestPlatform,
  advanceRequestPlatformPulledBack,
  advanceRequestPlatformSentBack,
} from '../mock-data/platform/v1/advance-request-platform.data';
import { cloneDeep } from 'lodash';

describe('AdvanceRequestService', () => {
  let advanceRequestService: AdvanceRequestService;
  let apiService: jasmine.SpyObj<ApiService>;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: DateService;
  let fileService: jasmine.SpyObj<FileService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;
  let spenderService: jasmine.SpyObj<SpenderService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const timezoneServiceSpy = jasmine.createSpyObj('TimezoneService', ['convertToUtc']);
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['post', 'get']);

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
        {
          provide: SpenderService,
          useValue: spenderServiceSpy,
        },
      ],
    });
    advanceRequestService = TestBed.inject(AdvanceRequestService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiv2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    timezoneService = TestBed.inject(TimezoneService) as jasmine.SpyObj<TimezoneService>;
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
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

  describe('getAdvanceRequestPlatform(): ', () => {
    it('should get an advance request from ID', (done) => {
      const advReqID = 'areqiwr3Wwiri';
      const expectedData = cloneDeep(publicAdvanceRequestRes);
      spenderService.get.and.returnValue(of(advanceRequestPlatform));
      // @ts-ignore
      spyOn(advanceRequestService, 'fixDatesForPlatformFields').and.returnValue(advanceRequestPlatform.data[0]);

      advanceRequestService.getAdvanceRequestPlatform(advReqID).subscribe((res) => {
        expect(res).toEqual(expectedData.data[0]);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            id: `eq.${advReqID}`,
          },
        });
        // @ts-ignore
        expect(advanceRequestService.fixDatesForPlatformFields).toHaveBeenCalledOnceWith(
          advanceRequestPlatform.data[0]
        );
        done();
      });
    });

    it('should get a sent back advance request from ID', (done) => {
      const advReqID = 'areqiwr3Wwirk';
      const expectedData = cloneDeep(publicAdvanceRequestResSentBack);
      spenderService.get.and.returnValue(of(advanceRequestPlatformSentBack));
      // @ts-ignore
      spyOn(advanceRequestService, 'fixDatesForPlatformFields').and.returnValue(advanceRequestPlatformSentBack.data[0]);

      advanceRequestService.getAdvanceRequestPlatform(advReqID).subscribe((res) => {
        expect(res).toEqual(expectedData.data[0]);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            id: `eq.${advReqID}`,
          },
        });
        // @ts-ignore
        expect(advanceRequestService.fixDatesForPlatformFields).toHaveBeenCalledOnceWith(
          advanceRequestPlatformSentBack.data[0]
        );
        done();
      });
    });

    it('should get a pulled back advance request from ID', (done) => {
      const advReqID = 'areqiwr3Wwirr';
      const expectedData = cloneDeep(publicAdvanceRequestResPulledBack);
      spenderService.get.and.returnValue(of(advanceRequestPlatformPulledBack));
      // @ts-ignore
      spyOn(advanceRequestService, 'fixDatesForPlatformFields').and.returnValue(
        // @ts-ignore
        advanceRequestPlatformPulledBack.data[0]
      );

      advanceRequestService.getAdvanceRequestPlatform(advReqID).subscribe((res) => {
        expect(res).toEqual(expectedData.data[0]);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            id: `eq.${advReqID}`,
          },
        });
        // @ts-ignore
        expect(advanceRequestService.fixDatesForPlatformFields).toHaveBeenCalledOnceWith(
          advanceRequestPlatformPulledBack.data[0]
        );
        done();
      });
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

  it('getAdvanceRequestStats(): should get advance request stats', (done) => {
    const statsResponse = {
      count: 2,
      total_amount: 12322,
    };
    spenderService.post.and.returnValue(of({ data: statsResponse }));

    const params = {
      state: 'eq.SENT_BACK',
    };
    advanceRequestService.getAdvanceRequestStats(params).subscribe((res) => {
      expect(res).toEqual(statsResponse);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests/stats', {
        data: {
          query_params: `state=${params.state}`,
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

  it('pullBackAdvanceRequest(): should pull back an advance requests', (done) => {
    apiService.post.and.returnValue(of(pullBackAdvancedRequests));

    const payloadParam = {
      status: {
        comment: 'sdf',
      },
      notify: false,
    };

    const advanceID = 'areqMP09oaYXBf';

    advanceRequestService.pullBackAdvanceRequest(advanceID, payloadParam).subscribe((res) => {
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
      const mockAdvanceReqData = cloneDeep(extendedAdvReqWithoutDates);
      //@ts-ignore
      expect(advanceRequestService.fixDates(mockAdvanceReqData)).toEqual(extendedAdvReqWithDates);
    });
  });

  it('fixDatesForPlatformFields(): should convert string values to dates', () => {
    const mockAdvanceReqData = cloneDeep(advanceRequestPlatform.data[0]);
    //@ts-ignore
    expect(advanceRequestService.fixDatesForPlatformFields(mockAdvanceReqData)).toEqual(advanceRequestPlatform.data[0]);
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

  it('getActiveApproversByAdvanceRequestId(): should get active approvers for an advance request', (done) => {
    const advID = 'areqiwr3Wwirr';
    //@ts-ignore
    spenderService.get.and.returnValue(of(advanceRequestPlatform));
    advanceRequestService.getActiveApproversByAdvanceRequestIdPlatform(advID).subscribe((res) => {
      expect(res).toEqual(advanceReqApprovalsPublic);
      //@ts-ignore
      expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: { id: `eq.${advID}` },
      });
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

      const mockFileObject = cloneDeep(fileData1);
      advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequests, of(mockFileObject)).subscribe((res) => {
        expect(res).toEqual(advRequestFile);
        expect(advanceRequestService.submit).toHaveBeenCalledOnceWith(advanceRequests);
        expect(fileService.post).toHaveBeenCalledOnceWith(mockFileObject[0]);
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

      const mockFileObject = cloneDeep(fileData2);
      advanceRequestService.saveDraftAdvReqWithFiles(advancedRequests2, of(mockFileObject)).subscribe((res) => {
        expect(res).toEqual(advRequestFile2);
        expect(advanceRequestService.saveDraft).toHaveBeenCalledOnceWith(advancedRequests2);
        expect(fileService.post).toHaveBeenCalledOnceWith(mockFileObject[0]);
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

  it('getEReqFromPlatform(): should get advance request', (done) => {
    spyOn(advanceRequestService, 'getAdvanceRequestPlatform').and.returnValue(of(publicAdvanceRequestRes.data[0]));
    dataTransformService.unflatten.and.returnValue(singleErqUnflattened);
    spyOn(dateService, 'fixDates').and.returnValue(of(expectedSingleErq));

    const advID = 'areqGzKF1Tne23';

    advanceRequestService.getEReqFromPlatform(advID).subscribe((res) => {
      expect(res).toEqual(singleErqUnflattened);
      expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(singleErqRes);
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(singleErqUnflattened.areq);
      done();
    });
  });

  describe('modifyAdvanceRequestCustomFields():', () => {
    it('should modify advance request custom fields', () => {
      const mockCustomFields = cloneDeep(customFields);
      expect(advanceRequestService.modifyAdvanceRequestCustomFields(mockCustomFields)).toEqual(
        expectedCustomFieldsWoDate
      );
    });

    it('should modify custom fields with date value', () => {
      const mockCustomFields = cloneDeep(customField2);
      expect(advanceRequestService.modifyAdvanceRequestCustomFields(mockCustomFields)).toEqual(
        expectedCustomFieldsWithDate
      );
    });
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

  describe('getSpenderAdvanceRequestsCount():', () => {
    it('should get advance request count', (done) => {
      spyOn(advanceRequestService, 'getSpenderAdvanceRequests').and.returnValue(of(publicAdvanceRequestRes));
      const queryParams = {
        advance_id: 'eq.null',
      };

      advanceRequestService.getSpenderAdvanceRequestsCount(queryParams).subscribe((res) => {
        expect(res).toEqual(publicAdvanceRequestRes.count);
        expect(advanceRequestService.getSpenderAdvanceRequests).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 1,
          queryParams: { ...queryParams },
        });
        done();
      });
    });

    it('should get advance request count without query parmas', (done) => {
      spyOn(advanceRequestService, 'getSpenderAdvanceRequests').and.returnValue(of(publicAdvanceRequestRes));

      advanceRequestService.getSpenderAdvanceRequestsCount().subscribe((res) => {
        expect(res).toEqual(publicAdvanceRequestRes.count);
        expect(advanceRequestService.getSpenderAdvanceRequests).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 1,
          queryParams: {},
        });
        done();
      });
    });
  });

  describe('getSpenderAdvanceRequests():', () => {
    it('should get all advance request', (done) => {
      spenderService.get.and.returnValue(of(advanceRequestPlatform));

      const param = {
        offset: 0,
        limit: 200,
        queryParams: {
          advance_id: 'eq.null',
          order: 'created_at.desc,id.desc',
        },
      };

      advanceRequestService.getSpenderAdvanceRequests(param).subscribe((res) => {
        expect(res).toEqual(publicAdvanceRequestRes);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: param.offset,
            limit: param.limit,
            ...param.queryParams,
          },
        });
        done();
      });
    });

    it('should get all advance request with default params', (done) => {
      spenderService.get.and.returnValue(of(advanceRequestPlatform));

      advanceRequestService.getSpenderAdvanceRequests().subscribe((res) => {
        expect(res).toEqual(publicAdvanceRequestRes);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: 0,
            limit: 200,
            advance_id: 'eq.null',
          },
        });
        done();
      });
    });
  });

  describe('getMyadvanceRequests():', () => {
    it('should get all advance request', (done) => {
      authService.getEou.and.resolveTo(apiEouRes);
      const mockApiV2Res = cloneDeep(allAdvanceRequestsRes);
      apiv2Service.get.and.returnValue(of(mockApiV2Res));

      const param = {
        offset: 0,
        limit: 10,
        queryParams: {
          areq_advance_id: 'is.null',
          order: 'areq_created_at.desc,areq_id.desc',
        },
      };

      advanceRequestService.getMyadvanceRequests(param).subscribe((res) => {
        expect(res).toEqual(mockApiV2Res);
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

    it('should get all advance request with default params', (done) => {
      authService.getEou.and.resolveTo(apiEouRes);
      const mockApiV2Res = cloneDeep(allAdvanceRequestsRes);
      apiv2Service.get.and.returnValue(of(mockApiV2Res));

      advanceRequestService.getMyadvanceRequests().subscribe((res) => {
        expect(res).toEqual(mockApiV2Res);
        expect(apiv2Service.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: 0,
            limit: 10,
            areq_org_user_id: 'eq.' + apiEouRes.ou.id,
          },
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
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

  describe('getTeamAdvanceRequests():', () => {
    it('should get all team advance requests | APPROVAL PENDING AND APPROVED', (done) => {
      authService.getEou.and.resolveTo(apiEouRes);
      const mockApiV2Res = cloneDeep(allTeamAdvanceRequestsRes);
      apiv2Service.get.and.returnValue(of(mockApiV2Res));

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
        expect(res).toEqual(mockApiV2Res);
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
      authService.getEou.and.resolveTo(apiEouRes);
      const mockApiV2Res = cloneDeep(allTeamAdvanceRequestsRes);
      apiv2Service.get.and.returnValue(of(mockApiV2Res));

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
        expect(res).toEqual(mockApiV2Res);
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
      authService.getEou.and.resolveTo(apiEouRes);
      const mockApiV2Res = cloneDeep(allTeamAdvanceRequestsRes);
      apiv2Service.get.and.returnValue(of(mockApiV2Res));

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
        expect(res).toEqual(mockApiV2Res);
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
