import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { apiAdvanceRequestAction } from '../mock-data/advance-request-actions.data';
import { advRequestFile, advRequestFile2 } from '../mock-data/advance-request-file.data';
import {
  advanceRequests,
  advancedRequests2,
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
  extendedAdvReqRes,
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
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DataTransformService } from './data-transform.service';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { TimezoneService } from './timezone.service';
import { SpenderService } from './platform/v1/spender/spender.service';
import { ApproverService } from './platform/v1/approver/approver.service';
import {
  advanceRequestPlatform,
  advanceRequestPlatformPulledBack,
  advanceRequestPlatformSentBack,
} from '../mock-data/platform/v1/advance-request-platform.data';
import { cloneDeep } from 'lodash';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
import { TranslocoService } from '@jsverse/transloco';
import { Comment } from '../models/platform/v1/comment.model';

describe('AdvanceRequestService', () => {
  let advanceRequestService: AdvanceRequestService;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: DateService;
  let fileService: jasmine.SpyObj<FileService>;
  let spenderService: jasmine.SpyObj<SpenderService>;
  let approverService: jasmine.SpyObj<ApproverService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const dataTransformServiceSpy = jasmine.createSpyObj('DataTransformService', ['unflatten']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['post']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
    const timezoneServiceSpy = jasmine.createSpyObj('TimezoneService', ['convertToUtc']);
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['post', 'get']);
    const approverServiceSpy = jasmine.createSpyObj('ApproverService', ['get', 'post']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.advanceRequest.sentBack': 'Sent Back',
        'services.advanceRequest.pending': 'Pending',
        'services.advanceRequest.approved': 'Approved',
        'services.advanceRequest.paid': 'Paid',
        'services.advanceRequest.rejected': 'Rejected',
        'services.advanceRequest.draft': 'Draft',
        'services.advanceRequest.pulledBack': 'Pulled Back',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        AdvanceRequestService,
        DateService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
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
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
        },
        {
          provide: TimezoneService,
          useValue: timezoneServiceSpy,
        },
        {
          provide: SpenderService,
          useValue: spenderServiceSpy,
        },
        {
          provide: ApproverService,
          useValue: approverServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    advanceRequestService = TestBed.inject(AdvanceRequestService);
    dateService = TestBed.inject(DateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataTransformService = TestBed.inject(DataTransformService) as jasmine.SpyObj<DataTransformService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
    approverService = TestBed.inject(ApproverService) as jasmine.SpyObj<ApproverService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
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

  it('getApproverAdvanceRequest(): should get an advance request from ID', (done) => {
    const advReqID = 'areqiwr3Wwiri';
    const expectedData = cloneDeep(extendedAdvReqRes);
    approverService.get.and.returnValue(of(advanceRequestPlatform));
    // @ts-ignore
    spyOn(advanceRequestService, 'fixDatesForPlatformFields').and.returnValue(advanceRequestPlatform.data[0]);

    advanceRequestService.getApproverAdvanceRequest(advReqID).subscribe((res) => {
      expect(res).toEqual(expectedData.data[0]);
      expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: {
          id: `eq.${advReqID}`,
        },
      });
      // @ts-ignore
      expect(advanceRequestService.fixDatesForPlatformFields).toHaveBeenCalledOnceWith(advanceRequestPlatform.data[0]);
      done();
    });
  });

  it('getSpenderPermissions(): should get advance request permissions from ID', (done) => {
    const advReqID = 'areqoVuT5I8OOy';
    spenderService.post.and.returnValue(of({ data: apiAdvanceRequestAction }));

    advanceRequestService.getSpenderPermissions(advReqID).subscribe((res) => {
      expect(res).toEqual(apiAdvanceRequestAction);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests/permissions', {
        data: { id: advReqID },
      });
      done();
    });
  });

  it('getApproverPermissions(): should get advance request permissions from ID', (done) => {
    const advReqID = 'areqoVuT5I8OOy';
    approverService.post.and.returnValue(of({ data: apiAdvanceRequestAction }));

    advanceRequestService.getApproverPermissions(advReqID).subscribe((res) => {
      expect(res).toEqual(apiAdvanceRequestAction);
      expect(approverService.post).toHaveBeenCalledOnceWith('/advance_requests/permissions', {
        data: { id: advReqID },
      });
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

  it('submit(): should submit an advance request using platform API', (done) => {
    const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
    spenderService.post.and.returnValue(of(mockPlatformResponse));

    advanceRequestService.submit(advanceRequests, false).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests/submit', {
        data: {
          ...advanceRequests,
          custom_fields: advanceRequests.custom_field_values.map((field) => ({
            ...field,
            type: (field as any).type || 'TEXT',
          })),
        },
      });
      done();
    });
  });

  it('submit(): should submit an advance request using platform API for approver', (done) => {
    const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
    approverService.post.and.returnValue(of(mockPlatformResponse));

    advanceRequestService.submit(advanceRequests, true).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(approverService.post).toHaveBeenCalledOnceWith('/advance_requests/submit', {
        data: {
          ...advanceRequests,
          custom_fields: advanceRequests.custom_field_values.map((field) => ({
            ...field,
            type: (field as any).type || 'TEXT',
          })),
        },
      });
      done();
    });
  });

  it('post(): should save a draft advance request', (done) => {
    spenderService.post.and.returnValue(of({ data: advanceRequestPlatform.data[0] }));

    advanceRequestService.post(draftAdvancedRequestParam).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests', {
        data: {
          ...draftAdvancedRequestParam,
          custom_fields: draftAdvancedRequestParam.custom_field_values.map((field) => ({
            ...field,
            type: (field as any).type || 'TEXT',
          })),
        },
      });
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

  it('sendBack(): should send back an advance request using platform API', (done) => {
    const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
    approverService.post.and.returnValue(of(mockPlatformResponse));

    const advReq = 'areqVU0Xr5suPC';
    const payload = {
      status: {
        comment: 'a comment',
      },
      notify: false,
    };

    advanceRequestService.sendBack(advReq, payload).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(approverService.post).toHaveBeenCalledOnceWith('/advance_requests/inquire', {
        data: {
          id: advReq,
          comment: 'a comment',
          notify: false,
        },
      });
      done();
    });
  });

  it('pullBackAdvanceRequest(): should pull back an advance request using platform API', (done) => {
    const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
    spenderService.post.and.returnValue(of(mockPlatformResponse));

    const payloadParam = {
      status: {
        comment: 'sdf',
      },
      notify: false,
    };

    const advanceID = 'areqMP09oaYXBf';

    advanceRequestService.pullBackAdvanceRequest(advanceID, payloadParam).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests/pull_back', {
        data: {
          id: advanceID,
          comment: 'sdf',
          notify: false,
        },
      });
      done();
    });
  });

  it('addApprover(): should add approver to an advance request using platform API', (done) => {
    const mockPlatformResponse = { data: pullBackAdvancedRequests };
    approverService.post.and.returnValue(of(mockPlatformResponse));
    const advanceID = 'areqMP09oaYXBf';

    const payload = {
      data: {
        id: advanceID,
        approver_email: 'ajain@fyle.in',
        comment: 'a comment',
      },
    };

    advanceRequestService.addApprover(advanceID, payload.data.approver_email, payload.data.comment).subscribe((res) => {
      expect(res).toEqual(pullBackAdvancedRequests);
      expect(approverService.post).toHaveBeenCalledOnceWith('/advance_requests/add_approver', payload);
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

  it('getActiveApproversByAdvanceRequestIdPlatformForApprover(): should get active approvers for team advance request using platform API', (done) => {
    const advID = 'areqiwr3Wwirr';
    //@ts-ignore
    approverService.get.and.returnValue(of(advanceRequestPlatform));

    const expectedApprovals = [
      {
        approver_name: 'John Doe',
        approver_email: 'john.doe@example.com',
        state: 'APPROVAL_PENDING',
      },
    ];

    advanceRequestService.getActiveApproversByAdvanceRequestIdPlatformForApprover(advID).subscribe((res) => {
      expect(res).toEqual(expectedApprovals);
      //@ts-ignore
      expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: { id: `eq.${advID}` },
      });
      done();
    });
  });

  it('getCommentsByAdvanceRequestIdPlatformForApprover(): should get comments for team advance request using platform API', (done) => {
    const advID = 'areqiwr3Wwirr';
    //@ts-ignore
    approverService.get.and.returnValue(of(advanceRequestPlatform));
    authService.getEou.and.resolveTo(apiEouRes);

    const expectedComments = [
      {
        st_id: 'st72VKetVkek',
        st_created_at: new Date('2025-04-28T10:27:40.776503+00:00'),
        st_org_user_id: null,
        st_comment: 'Approver ajain@fyle.in added by SYSTEM',
        st_advance_request_id: advID,
        us_full_name: null,
        us_email: null,
        isBotComment: true,
        isSelfComment: false,
        isOthersComment: false,
      },
      {
        st_id: 'stIIp14dChOt',
        st_created_at: new Date('2025-06-17T09:32:14.186Z'),
        st_org_user_id: 'uswjwgnwwgo',
        st_comment: 'Advance request submitted by John Doe',
        st_advance_request_id: advID,
        us_full_name: 'John Doe',
        us_email: 'john.doe@example.com',
        isBotComment: false,
        isSelfComment: false,
        isOthersComment: true,
      },
    ];

    advanceRequestService.getCommentsByAdvanceRequestIdPlatformForApprover(advID).subscribe((res) => {
      expect(res).toEqual(expectedComments);
      //@ts-ignore
      expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: { id: `eq.${advID}` },
      });
      done();
    });
  });

  it('getCommentsByAdvanceRequestIdPlatform(): should get comments for spender advance request using platform API', (done) => {
    const advID = 'areqiwr3Wwirr';
    //@ts-ignore
    spenderService.get.and.returnValue(of(advanceRequestPlatform));
    authService.getEou.and.resolveTo(apiEouRes);

    const expectedComments = [
      {
        st_id: 'st72VKetVkek',
        st_created_at: new Date('2025-04-28T10:27:40.776503+00:00'),
        st_org_user_id: null,
        st_comment: 'Approver ajain@fyle.in added by SYSTEM',
        st_advance_request_id: advID,
        us_full_name: null,
        us_email: null,
        isBotComment: true,
        isSelfComment: false,
        isOthersComment: false,
      },
      {
        st_id: 'stIIp14dChOt',
        st_created_at: new Date('2025-06-17T09:32:14.186Z'),
        st_org_user_id: 'uswjwgnwwgo',
        st_comment: 'Advance request submitted by John Doe',
        st_advance_request_id: advID,
        us_full_name: 'John Doe',
        us_email: 'john.doe@example.com',
        isBotComment: false,
        isSelfComment: false,
        isOthersComment: true,
      },
    ];

    advanceRequestService.getCommentsByAdvanceRequestIdPlatform(advID).subscribe((res) => {
      expect(res).toEqual(expectedComments);
      //@ts-ignore
      expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: { id: `eq.${advID}` },
      });
      done();
    });
  });

  describe('createAdvReqWithFilesAndSubmit():', () => {
    it('should create advanced request and submit it with the file', (done) => {
      fileService.post.and.returnValue(of(fileObjectData3));
      const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
      spenderService.post.and.returnValue(of(mockPlatformResponse));

      const mockFileObject = cloneDeep(fileData1);
      advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequests, of(mockFileObject)).subscribe((res) => {
        // The result should have the transformed advance request data
        expect(res.files[0].advance_request_id).toBe(advanceRequestPlatform.data[0].id);
        expect(res.advanceReq.id).toBe(advanceRequestPlatform.data[0].id);
        expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests/submit', {
          data: {
            ...advanceRequests,
            custom_fields: advanceRequests.custom_field_values.map((field) => ({
              ...field,
              type: field.type || 'TEXT',
            })),
          },
        });
        expect(fileService.post).toHaveBeenCalledOnceWith(mockFileObject[0]);
        done();
      });
    });

    it('should create advanced request and submit it without the file', (done) => {
      const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
      spenderService.post.and.returnValue(of(mockPlatformResponse));

      advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequests, of(null)).subscribe((res) => {
        // The result should have the transformed advance request data
        expect(res.files).toEqual([]);
        expect(res.advanceReq.id).toBe(advanceRequestPlatform.data[0].id);
        expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests/submit', {
          data: {
            ...advanceRequests,
            custom_fields: advanceRequests.custom_field_values.map((field) => ({
              ...field,
              type: field.type || 'TEXT',
            })),
          },
        });
        done();
      });
    });
  });

  describe('saveDraftAdvReqWithFiles():', () => {
    it('should save draft advance request along with the file', (done) => {
      fileService.post.and.returnValue(of(fileObjectData4));
      const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
      spenderService.post.and.returnValue(of(mockPlatformResponse));

      const mockFileObject = cloneDeep(fileData2);
      advanceRequestService.saveDraftAdvReqWithFiles(advancedRequests2, of(mockFileObject)).subscribe((res) => {
        expect(res.files[0].advance_request_id).toBe(advanceRequestPlatform.data[0].id);
        expect(res.advanceReq.id).toBe(advanceRequestPlatform.data[0].id);
        expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests', {
          data: {
            ...advancedRequests2,
            custom_fields: advancedRequests2.custom_field_values.map((field) => ({
              ...field,
              type: field.type || 'TEXT',
            })),
          },
        });
        expect(fileService.post).toHaveBeenCalledOnceWith(mockFileObject[0]);
        done();
      });
    });

    it('should save draft advance request without the file', (done) => {
      const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
      spenderService.post.and.returnValue(of(mockPlatformResponse));

      advanceRequestService.saveDraftAdvReqWithFiles(advancedRequests2, of(null)).subscribe((res) => {
        expect(res.files).toEqual([]);
        expect(res.advanceReq.id).toBe(advanceRequestPlatform.data[0].id);
        expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests', {
          data: {
            ...advancedRequests2,
            custom_fields: advancedRequests2.custom_field_values.map((field) => ({
              ...field,
              type: field.type || 'TEXT',
            })),
          },
        });
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
      expect(advanceRequestService.getSortOrder(sortingParam, sortingDirection)).toEqual('created_at.asc,id.desc');
    });

    it('param - approval date | direction - descending', () => {
      const sortingParam = SortingParam.approvalDate;

      const sortingDirection = SortingDirection.descending;

      //@ts-ignore
      expect(advanceRequestService.getSortOrder(sortingParam, sortingDirection)).toEqual(
        'last_approved_at.desc,id.desc'
      );
    });

    it('param - project | direction - ascending', () => {
      const sortingParam = SortingParam.project;

      const sortingDirection = SortingDirection.ascending;

      //@ts-ignore
      expect(advanceRequestService.getSortOrder(sortingParam, sortingDirection)).toEqual('project->name.asc,id.desc');
    });

    it('param - nothing specified | direction - ascending', () => {
      const sortingDirection = SortingDirection.ascending;

      //@ts-ignore
      expect(advanceRequestService.getSortOrder({}, sortingDirection)).toEqual('created_at.asc,id.desc');
    });
  });

  it('getTeamAdvanceRequestsCount(): should get team advance count', (done) => {
    spyOn(advanceRequestService, 'getTeamAdvanceRequestsPlatform').and.returnValue(of(teamAdvanceCountRes));

    const filters = {
      state: [AdvancesStates.pending],
      sortParam: undefined,
      sortDir: undefined,
    };

    advanceRequestService.getTeamAdvanceRequestsCount(filters).subscribe((res) => {
      expect(res).toEqual(teamAdvanceCountRes.count);
      expect(advanceRequestService.getTeamAdvanceRequestsPlatform).toHaveBeenCalledOnceWith({
        offset: 0,
        limit: 1,
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

  describe('getTeamAdvanceRequestsPlatform():', () => {
    let mockApiV2Res;
    let userId;
    let defaultParams;

    beforeEach(() => {
      authService.getEou.and.resolveTo(apiEouRes);
      mockApiV2Res = cloneDeep(advanceRequestPlatform);
      approverService.get.and.returnValue(of(mockApiV2Res));
      spyOn(advanceRequestService, 'transformToAdvanceRequest').and.returnValue(mockApiV2Res.data || []);

      userId = apiEouRes.ou.user_id;
      defaultParams = {
        offset: 0,
        limit: 1,
        filter: {
          sortParam: undefined,
          sortDir: undefined,
          state: [],
        },
      };

      authService.getEou.calls.reset();
      approverService.get.calls.reset();
    });

    it('should get all team advance requests | APPROVAL PENDING AND APPROVED', (done) => {
      defaultParams.filter.state = [AdvancesStates.pending, AdvancesStates.approved];

      const expectedParams = {
        offset: defaultParams.offset,
        limit: defaultParams.limit,
        state: 'in.(APPROVED, APPROVAL_PENDING)',
        or: `(approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_PENDING"}], approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_DONE"}])`,
        order: 'created_at.desc,id.desc',
      };

      advanceRequestService.getTeamAdvanceRequestsPlatform(defaultParams).subscribe((res) => {
        expect(res).toEqual(mockApiV2Res);
        expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: expectedParams,
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should get all team advance requests | APPROVAL PENDING', (done) => {
      defaultParams.filter.state = [AdvancesStates.pending];

      const expectedParams = {
        offset: defaultParams.offset,
        limit: defaultParams.limit,
        state: 'eq.APPROVAL_PENDING',
        approvals: `cs.[{"approver_user_id":"${userId}", "state":"APPROVAL_PENDING"}]`,
        order: 'created_at.desc,id.desc',
      };

      advanceRequestService.getTeamAdvanceRequestsPlatform(defaultParams).subscribe((res) => {
        expect(res).toEqual(mockApiV2Res);
        expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: expectedParams,
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should get all team advance requests | APPROVED', (done) => {
      defaultParams.filter.state = [AdvancesStates.approved];

      const expectedParams = {
        offset: defaultParams.offset,
        limit: defaultParams.limit,
        state: 'in.(APPROVED, APPROVAL_PENDING)',
        approvals: `cs.[{"approver_user_id":"${userId}", "state":"APPROVAL_DONE"}]`,
        order: 'created_at.desc,id.desc',
      };

      advanceRequestService.getTeamAdvanceRequestsPlatform(defaultParams).subscribe((res) => {
        expect(res).toEqual(mockApiV2Res);
        expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: expectedParams,
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should get all team advance requests | NO SPECIFIC STATE', (done) => {
      const expectedParams = {
        offset: defaultParams.offset,
        limit: defaultParams.limit,
        or: `(approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_PENDING"}], approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_DONE"}], approvals.cs.[{"approver_user_id":"${userId}", "state":"APPROVAL_REJECTED"}])`,
        order: 'created_at.desc,id.desc',
      };

      advanceRequestService.getTeamAdvanceRequestsPlatform(defaultParams).subscribe((res) => {
        expect(res).toEqual(mockApiV2Res);
        expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: expectedParams,
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('postCommentPlatform():', () => {
    it('should post a comment for spender advance request', (done) => {
      const advanceRequestId = 'areq123';
      const comment = 'Test comment';
      const expectedResponse: Comment = {
        id: 'stPFnRryn7DY',
        created_at: new Date('2025-04-29T05:20:49.391Z'),
        creator_user_id: 'ouUkCJf482XN',
        creator_type: 'USER',
        comment: 'Test comment',
        creator_user: {
          email: 'kartikey.rajvaidya@fyle.in',
          full_name: 'kartikey',
          id: 'usdM767Q2gox',
        },
      };

      spenderService.post.and.returnValue(of({ data: expectedResponse }));

      advanceRequestService.postCommentPlatform(advanceRequestId, comment).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
        expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests/comments', {
          data: {
            advance_request_id: advanceRequestId,
            comment,
          },
        });
        done();
      });
    });
  });

  describe('postCommentPlatformForApprover():', () => {
    it('should post a comment for approver advance request', (done) => {
      const advanceRequestId = 'areq456';
      const comment = 'Approver comment';
      const expectedResponse: Comment = {
        id: 'stPFnRryn7DY',
        created_at: new Date('2025-04-29T05:20:49.391Z'),
        creator_user_id: 'ouUkCJf482XN',
        creator_type: 'USER',
        comment: 'Approver comment',
        creator_user: {
          email: 'approver@fyle.in',
          full_name: 'Approver User',
          id: 'usdM767Q2gox',
        },
      };

      approverService.post.and.returnValue(of({ data: expectedResponse }));

      advanceRequestService.postCommentPlatformForApprover(advanceRequestId, comment).subscribe((res) => {
        expect(res).toEqual(expectedResponse);
        expect(approverService.post).toHaveBeenCalledOnceWith('/advance_requests/comments', {
          data: {
            advance_request_id: advanceRequestId,
            comment,
          },
        });
        done();
      });
    });
  });
});
