import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { StatusService } from './status.service';
import {
  getEstatusApiResponse,
  apiCommentsResponse,
  getApiResponse,
  updateReponseWithFlattenedEStatus,
} from '../test-data/status.service.spec.data';

describe('StatusService', () => {
  let statusService: StatusService;
  let apiService: jasmine.SpyObj<ApiService>;

  const type = 'transactions';
  const id = 'tx1oTNwgRdRq';

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        StatusService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
      ],
    });
    statusService = TestBed.inject(StatusService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(statusService).toBeTruthy();
  });

  it('should find all estatuses', (done) => {
    apiService.get.and.returnValue(of(getApiResponse));

    statusService.find(type, id).subscribe((res) => {
      expect(res).toEqual(getEstatusApiResponse);
      done();
    });
  });

  it('should return null instead of estatuses', (done) => {
    apiService.get.and.returnValue(of(null));

    statusService.find(type, id).subscribe((res) => {
      expect(res).toEqual(undefined);
      done();
    });
  });

  it('should use status map and update the comments accordingly by adding statuses', () => {
    const result = statusService.createStatusMap(apiCommentsResponse, 'reports');
    expect(result).toEqual(updateReponseWithFlattenedEStatus);
  });

  it('should find and return the latest comment', (done) => {
    apiService.get.and.returnValue(of(getApiResponse));

    const result = statusService.findLatestComment(id, type, 'POLICY');
    result.subscribe((res) => {
      expect(res).toEqual('food expenses are limited to rs 200 only');
      done();
    });
  });

  it('should post a new comment on object type', (done) => {
    const testComment = {
      id: 'stjIdPp8BX8O',
      created_at: new Date('2022-11-17T06:07:38.590Z'),
      org_user_id: 'ouX8dwsbLCLv',
      comment: 'a comment',
      diff: null,
      state: null,
      transaction_id: null,
      report_id: 'rpkpSa8guCuR',
      advance_request_id: null,
    };

    const objectId = 'rpkpSa8guCuR';
    const objectType = 'reports';
    const status = {
      comment: 'a comment',
    };
    apiService.post.and.returnValue(of(testComment));

    statusService.post(objectType, objectId, status).subscribe((res) => {
      expect(res).toEqual(testComment);
      done();
    });
  });
});
