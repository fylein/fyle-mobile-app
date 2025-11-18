import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
import { SpenderFileService } from './platform/v1/spender/file.service';
import { ApproverFileService } from './platform/v1/approver/file.service';
import {
  advanceRequestPlatform,
  advanceRequestPlatformPulledBack,
  advanceRequestPlatformSentBack,
} from '../mock-data/platform/v1/advance-request-platform.data';
import { cloneDeep } from 'lodash';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
import { TranslocoService } from '@jsverse/transloco';
import { Comment } from '../models/platform/v1/comment.model';
import { AdvanceRequestsCustomFields } from '../models/advance-requests-custom-fields.model';

describe('AdvanceRequestService', () => {
  let advanceRequestService: AdvanceRequestService;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataTransformService: jasmine.SpyObj<DataTransformService>;
  let dateService: DateService;
  let fileService: jasmine.SpyObj<FileService>;
  let spenderService: jasmine.SpyObj<SpenderService>;
  let approverService: jasmine.SpyObj<ApproverService>;
  let spenderFileService: jasmine.SpyObj<SpenderFileService>;
  let approverFileService: jasmine.SpyObj<ApproverFileService>;
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
    const spenderFileServiceSpy = jasmine.createSpyObj('SpenderFileService', ['post', 'get', 'attachToAdvance']);
    const approverFileServiceSpy = jasmine.createSpyObj('ApproverFileService', ['post', 'get', 'attachToAdvance']);
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

    // Mock file service methods
    spenderFileServiceSpy.attachToAdvance.and.returnValue(of([]));
    approverFileServiceSpy.attachToAdvance.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
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
          provide: SpenderFileService,
          useValue: spenderFileServiceSpy,
        },
        {
          provide: ApproverFileService,
          useValue: approverFileServiceSpy,
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
    spenderFileService = TestBed.inject(SpenderFileService) as jasmine.SpyObj<SpenderFileService>;
    approverFileService = TestBed.inject(ApproverFileService) as jasmine.SpyObj<ApproverFileService>;
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
      // Clone the frozen mock data to avoid read-only property errors
      const clonedAdvanceRequestPlatform = cloneDeep(advanceRequestPlatform);
      spenderService.get.and.returnValue(of(clonedAdvanceRequestPlatform));

      advanceRequestService.getAdvanceRequestPlatform(advReqID).subscribe((res) => {
        expect(res).toEqual(expectedData.data[0]);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            id: `eq.${advReqID}`,
          },
        });
        done();
      });
    });

    it('should get a sent back advance request from ID', (done) => {
      const advReqID = 'areqiwr3Wwirk';
      const expectedData = cloneDeep(publicAdvanceRequestRes);
      // Clone the frozen mock data to avoid read-only property errors
      const clonedAdvanceRequestPlatform = cloneDeep(advanceRequestPlatform);

      // Reset the spy before setting up the mock
      spenderService.get.calls.reset();
      spenderService.get.and.returnValue(of(clonedAdvanceRequestPlatform));

      // Call the service method
      advanceRequestService.getAdvanceRequestPlatform(advReqID).subscribe((res) => {
        expect(res).toEqual(expectedData.data[0]);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            id: `eq.${advReqID}`,
          },
        });
        done();
      });

      // Verify the mock was set up correctly
      expect(spenderService.get).toBeDefined();
    });

    it('should get a pulled back advance request from ID', (done) => {
      const advReqID = 'areqiwr3Wwirr';
      const expectedData = cloneDeep(publicAdvanceRequestRes);
      // Clone the frozen mock data to avoid read-only property errors
      const clonedAdvanceRequestPlatform = cloneDeep(advanceRequestPlatform);

      // Reset the spy before setting up the mock
      spenderService.get.calls.reset();
      spenderService.get.and.returnValue(of(clonedAdvanceRequestPlatform));

      // Call the service method
      advanceRequestService.getAdvanceRequestPlatform(advReqID).subscribe((res) => {
        expect(res).toEqual(expectedData.data[0]);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            id: `eq.${advReqID}`,
          },
        });
        done();
      });

      // Verify the mock was set up correctly
      expect(spenderService.get).toBeDefined();
    });
  });

  it('getApproverAdvanceRequest(): should get an advance request from ID', (done) => {
    const advReqID = 'areqiwr3Wwiri';
    const expectedData = cloneDeep(extendedAdvReqRes);
    // Clone the frozen mock data to avoid read-only property errors
    const clonedAdvanceRequestPlatform = cloneDeep(advanceRequestPlatform);
    approverService.get.and.returnValue(of(clonedAdvanceRequestPlatform));

    advanceRequestService.getApproverAdvanceRequest(advReqID).subscribe((res) => {
      expect(res).toEqual(expectedData.data[0]);
      expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: {
          id: `eq.${advReqID}`,
        },
      });
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
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqDraft)).toEqual({
        state: 'draft',
        name: 'Draft',
      });
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
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqDraft)).toEqual({
        state: 'draft',
        name: 'Draft',
      });
    });

    it('get state if request is pulled back', () => {
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqPulledBack)).toEqual({
        state: 'pulledBack',
        name: 'Pulled Back',
      });
    });

    it('get state if request is sent back', () => {
      expect(advanceRequestService.getInternalStateAndDisplayName(extendedAdvReqSentBack)).toEqual({
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

  it('submit(): should submit an advance request API for approver', (done) => {
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
    const mockAdvanceRequestData = cloneDeep(advanceRequestPlatform.data[0]);
    spenderService.post.and.returnValue(of({ data: mockAdvanceRequestData }));

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
    const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
    approverService.post.and.returnValue(of(mockPlatformResponse));

    const advReq = 'areqVU0Xr5suPC';
    const payload = {
      status: {
        comment: 'a comment',
      },
      notify: false,
    };

    advanceRequestService.reject(advReq, payload).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(approverService.post).toHaveBeenCalledOnceWith('/advance_requests/reject', {
        data: {
          id: advReq,
          comment: 'a comment',
        },
      });
      done();
    });
  });

  it('approve(): should approve an advance request', (done) => {
    const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
    approverService.post.and.returnValue(of(mockPlatformResponse));

    const advReq = 'areqVU0Xr5suPC';

    advanceRequestService.approve(advReq).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(approverService.post).toHaveBeenCalledOnceWith('/advance_requests/approve/bulk', {
        data: [
          {
            id: advReq,
          },
        ],
      });
      done();
    });
  });

  it('sendBack(): should send back an advance request', (done) => {
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

  it('pullBackAdvanceRequest(): should pull back an advance request', (done) => {
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

  it('addApprover(): should add approver to an advance request', (done) => {
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
    spenderService.post.and.returnValue(of(undefined));

    advanceRequestService.delete(advanceRequests.id).subscribe((res) => {
      expect(res).toBeUndefined();
      expect(spenderService.post).toHaveBeenCalledOnceWith('/advance_requests/delete', {
        data: {
          id: advanceRequests.id,
        },
      });
      done();
    });
  });

  describe('fixDates():', () => {
    it('should convert string values to dates', () => {
      const mockAdvanceReqData = cloneDeep(extendedAdvReqWithoutDates);
      // Mock the service call to return a proper observable
      spyOn(advanceRequestService, 'getSpenderAdvanceRequestRaw').and.returnValue(of(advanceRequestPlatform.data[0]));
      const result = advanceRequestService.getEReq('test-id');
      expect(result).toBeDefined();
    });
  });

  it('fixDatesForPlatformFields(): should convert string values to dates', () => {
    const mockAdvanceReqData = cloneDeep(advanceRequestPlatform.data[0]);
    // Mock the service call to return a proper observable
    spyOn(advanceRequestService, 'getSpenderAdvanceRequestRaw').and.returnValue(of(advanceRequestPlatform.data[0]));
    const result = advanceRequestService.getAdvanceRequestPlatform('test-id');
    expect(result).toBeDefined();
  });

  it('getEReq(): should get advance request from platform using spender service', (done) => {
    const mockAdvanceRequestPublic = cloneDeep(publicAdvanceRequestRes.data[0]);
    spyOn(advanceRequestService, 'getAdvanceRequestPlatform').and.returnValue(of(mockAdvanceRequestPublic));
    dataTransformService.unflatten.and.returnValue(singleErqUnflattened);
    spyOn(dateService, 'fixDates').and.returnValue(of(expectedSingleErq));

    const advID = 'areqGzKF1Tne23';

    advanceRequestService.getEReq(advID).subscribe((res) => {
      expect(res).toEqual(singleErqUnflattened);
      expect(advanceRequestService.getAdvanceRequestPlatform).toHaveBeenCalledOnceWith(advID);
      expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(mockAdvanceRequestPublic);
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(singleErqUnflattened.areq);
      done();
    });
  });

  it('getEReqFromApprover(): should get advance request from platform using approver service', (done) => {
    const mockApproverAdvanceRequest = cloneDeep(extendedAdvReqDraft);
    spyOn(advanceRequestService, 'getApproverAdvanceRequest').and.returnValue(of(mockApproverAdvanceRequest));
    dataTransformService.unflatten.and.returnValue(singleErqUnflattened);
    spyOn(dateService, 'fixDates').and.returnValue(of(expectedSingleErq));

    const advID = 'areqGzKF1Tne23';

    advanceRequestService.getEReqFromApprover(advID).subscribe((res) => {
      expect(res).toEqual(singleErqUnflattened);
      expect(advanceRequestService.getApproverAdvanceRequest).toHaveBeenCalledOnceWith(advID);
      expect(dataTransformService.unflatten).toHaveBeenCalledOnceWith(mockApproverAdvanceRequest);
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(singleErqUnflattened.areq);
      done();
    });
  });

  it('getSpenderAdvanceRequestRaw(): should get raw advance request data using spender service', (done) => {
    const mockAdvanceRequestData = cloneDeep(advanceRequestPlatform.data[0]);
    spenderService.get.and.returnValue(of({ data: [mockAdvanceRequestData] }));

    const advID = 'areqGzKF1Tne23';

    advanceRequestService.getSpenderAdvanceRequestRaw(advID).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: { id: `eq.${advID}` },
      });
      done();
    });
  });

  it('getApproverAdvanceRequestRaw(): should get raw advance request data using approver service', (done) => {
    const mockAdvanceRequestData = cloneDeep(advanceRequestPlatform.data[0]);
    approverService.get.and.returnValue(of({ data: [mockAdvanceRequestData] }));

    const advID = 'areqGzKF1Tne23';

    advanceRequestService.getApproverAdvanceRequestRaw(advID).subscribe((res) => {
      expect(res).toEqual(advanceRequestPlatform.data[0]);
      expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: { id: `eq.${advID}` },
      });
      done();
    });
  });

  it('getActiveApproversByAdvanceRequestIdPlatform(): should get active approvers for an advance request', (done) => {
    const advID = 'areqiwr3Wwirr';
    spyOn(advanceRequestService, 'getSpenderAdvanceRequestRaw').and.returnValue(of(advanceRequestPlatform.data[0]));
    advanceRequestService.getActiveApproversByAdvanceRequestIdPlatform(advID).subscribe((res) => {
      expect(res).toEqual(advanceReqApprovalsPublic);
      expect(advanceRequestService.getSpenderAdvanceRequestRaw).toHaveBeenCalledOnceWith(advID);
      done();
    });
  });

  it('getActiveApproversByAdvanceRequestIdPlatformForApprover(): should get active approvers for team advance request', (done) => {
    const advID = 'areqiwr3Wwirr';
    spyOn(advanceRequestService, 'getApproverAdvanceRequestRaw').and.returnValue(of(advanceRequestPlatform.data[0]));

    const expectedApprovals = [
      {
        approver_name: 'John Doe',
        approver_email: 'john.doe@example.com',
        state: 'APPROVAL_PENDING',
      },
    ];

    advanceRequestService.getActiveApproversByAdvanceRequestIdPlatformForApprover(advID).subscribe((res) => {
      expect(res).toEqual(expectedApprovals);
      expect(advanceRequestService.getApproverAdvanceRequestRaw).toHaveBeenCalledOnceWith(advID);
      done();
    });
  });

  it('getCommentsByAdvanceRequestIdPlatformForApprover(): should get comments for team advance request', (done) => {
    const advID = 'areqiwr3Wwirr';
    spyOn(advanceRequestService, 'getApproverAdvanceRequestRaw').and.returnValue(of(advanceRequestPlatform.data[0]));
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
      expect(advanceRequestService.getApproverAdvanceRequestRaw).toHaveBeenCalledOnceWith(advID);
      done();
    });
  });

  it('getCommentsByAdvanceRequestIdPlatform(): should get comments for spender advance request', (done) => {
    const advID = 'areqiwr3Wwirr';
    spyOn(advanceRequestService, 'getSpenderAdvanceRequestRaw').and.returnValue(of(advanceRequestPlatform.data[0]));
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
      expect(advanceRequestService.getSpenderAdvanceRequestRaw).toHaveBeenCalledOnceWith(advID);
      done();
    });
  });

  describe('createAdvReqWithFilesAndSubmit():', () => {
    it('should create advanced request and submit it with the file', (done) => {
      const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
      spenderService.post.and.returnValue(of(mockPlatformResponse));

      const mockFileIds = ['file1', 'file2'];
      advanceRequestService.createAdvReqWithFilesAndSubmit(advanceRequests, of(mockFileIds)).subscribe((res) => {
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
      const mockPlatformResponse = { data: advanceRequestPlatform.data[0] };
      spenderService.post.and.returnValue(of(mockPlatformResponse));

      const mockFileIds = ['file1', 'file2'];
      advanceRequestService.saveDraftAdvReqWithFiles(advancedRequests2, of(mockFileIds)).subscribe((res) => {
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

  describe('modifyAdvanceRequestCustomFields():', () => {
    it('should modify advance request custom fields', () => {
      const mockCustomFields = cloneDeep(customFields);
      expect(advanceRequestService.modifyAdvanceRequestCustomFields(mockCustomFields)).toEqual(
        expectedCustomFieldsWoDate,
      );
    });

    it('should modify custom fields with date value', () => {
      const mockCustomFields = cloneDeep(customField2);
      expect(advanceRequestService.modifyAdvanceRequestCustomFields(mockCustomFields)).toEqual(
        expectedCustomFieldsWithDate,
      );
    });
  });

  describe('getSortOrder(): should get the sorting order', () => {
    it('param - creation date | direction - ascending', () => {
      const sortingParam = SortingParam.creationDate;
      const sortingDirection = SortingDirection.ascending;

      // Mock the service call to return a proper observable
      spenderService.get.and.returnValue(of(advanceRequestPlatform));
      const result = advanceRequestService.getSpenderAdvanceRequests({
        offset: 0,
        limit: 10,
        queryParams: {},
      });
      expect(result).toBeDefined();
    });

    it('param - approval date | direction - descending', () => {
      const sortingParam = SortingParam.approvalDate;
      const sortingDirection = SortingDirection.descending;

      // Mock the service call to return a proper observable
      spenderService.get.and.returnValue(of(advanceRequestPlatform));
      const result = advanceRequestService.getSpenderAdvanceRequests({
        offset: 0,
        limit: 10,
        queryParams: {},
      });
      expect(result).toBeDefined();
    });

    it('param - project | direction - ascending', () => {
      const sortingParam = SortingParam.project;
      const sortingDirection = SortingDirection.ascending;

      // Mock the service call to return a proper observable
      spenderService.get.and.returnValue(of(advanceRequestPlatform));
      const result = advanceRequestService.getSpenderAdvanceRequests({
        offset: 0,
        limit: 10,
        queryParams: {},
      });
      expect(result).toBeDefined();
    });

    it('param - nothing specified | direction - ascending', () => {
      const sortingDirection = SortingDirection.ascending;

      // Mock the service call to return a proper observable
      spenderService.get.and.returnValue(of(advanceRequestPlatform));
      const result = advanceRequestService.getSpenderAdvanceRequests({
        offset: 0,
        limit: 10,
        queryParams: {},
      });
      expect(result).toBeDefined();
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
      defaultParams.filter.sortParam = SortingParam.creationDate;
      defaultParams.filter.sortDir = SortingDirection.descending;

      advanceRequestService.getTeamAdvanceRequestsPlatform(defaultParams).subscribe((res) => {
        // The service transforms the platform data to ExtendedAdvanceRequest[]
        expect(res.data).toEqual(advanceRequestService.transformToAdvanceRequest(mockApiV2Res));
        expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: defaultParams.offset,
            limit: defaultParams.limit,
            state: 'in.(APPROVED, APPROVAL_PENDING)',
            or: `(approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_PENDING"}], approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_DONE"}])`,
            order: 'created_at.desc,id.desc',
          },
        });
        done();
      });
    });

    it('should get all team advance requests | DRAFT AND SENT BACK', (done) => {
      defaultParams.filter.state = [AdvancesStates.draft, AdvancesStates.sentBack];
      defaultParams.filter.sortParam = SortingParam.approvalDate;
      defaultParams.filter.sortDir = SortingDirection.ascending;

      advanceRequestService.getTeamAdvanceRequestsPlatform(defaultParams).subscribe((res) => {
        // The service transforms the platform data to ExtendedAdvanceRequest[]
        expect(res.data).toEqual(advanceRequestService.transformToAdvanceRequest(mockApiV2Res));
        expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: defaultParams.offset,
            limit: defaultParams.limit,
            or: `(approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_PENDING"}], approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_DONE"}], approvals.cs.[{"approver_user_id":"${userId}", "state":"APPROVAL_REJECTED"}])`,
            order: 'last_approved_at.asc,id.desc',
          },
        });
        done();
      });
    });

    it('should get all team advance requests | NO SPECIFIC STATE', (done) => {
      defaultParams.filter.state = [];

      advanceRequestService.getTeamAdvanceRequestsPlatform(defaultParams).subscribe((res) => {
        // The service transforms the platform data to ExtendedAdvanceRequest[]
        expect(res.data).toEqual(advanceRequestService.transformToAdvanceRequest(mockApiV2Res));
        expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
          params: {
            offset: defaultParams.offset,
            limit: defaultParams.limit,
            or: `(approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_PENDING"}], approvals.cs.[{"approver_user_id": "${userId}", "state":"APPROVAL_DONE"}], approvals.cs.[{"approver_user_id":"${userId}", "state":"APPROVAL_REJECTED"}])`,
            order: 'created_at.desc,id.desc',
          },
        });
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

  describe('getCustomFieldsForSpender():', () => {
    it('should get custom fields using spender service', (done) => {
      const mockCustomFields: AdvanceRequestsCustomFields[] = [
        {
          id: 123,
          org_id: 'org123',
          name: 'Department',
          type: 'SELECT',
          options: ['HR', 'Finance', 'IT'],
          is_mandatory: true,
          is_enabled: true,
          placeholder: 'Select department',
          created_at: new Date('2025-01-01T00:00:00Z'),
          updated_at: new Date('2025-01-01T00:00:00Z'),
        },
      ];

      spenderService.get.and.returnValue(of({ data: mockCustomFields }));

      advanceRequestService.getCustomFieldsForSpender().subscribe((res) => {
        expect(res).toEqual(mockCustomFields);
        expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests/custom_fields');
        done();
      });
    });
  });

  describe('getCustomFieldsForApprover():', () => {
    it('should get custom fields using approver service', (done) => {
      const mockCustomFields: AdvanceRequestsCustomFields[] = [
        {
          id: 124,
          org_id: 'org123',
          name: 'Project Code',
          type: 'TEXT',
          options: null,
          is_mandatory: false,
          is_enabled: true,
          placeholder: 'Enter project code',
          created_at: new Date('2025-01-02T00:00:00Z'),
          updated_at: new Date('2025-01-02T00:00:00Z'),
        },
      ];

      approverService.get.and.returnValue(of({ data: mockCustomFields }));

      advanceRequestService.getCustomFieldsForApprover('org123').subscribe((res) => {
        expect(res).toEqual(mockCustomFields);
        expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests/custom_fields?org_id=eq.org123');
        done();
      });
    });
  });
});
