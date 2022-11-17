import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { StatusService } from './status.service';

import { apiResponse, apiCommentsResponse, apiUpdatedCommentsReponse } from '../test-data/status.service.spec.data';

describe('StatusService', () => {
  let service: StatusService;
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
    service = TestBed.inject(StatusService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all estatuses', (done) => {
    apiService.get.and.returnValue(of(apiResponse));

    service.find(type, id).subscribe((res) => {
      expect(res).toEqual(apiResponse);
      done();
    });
  });

  it('should use status map and update the comments accordingly by adding statuses', () => {
    const result = service.createStatusMap(apiCommentsResponse, 'reports');
    expect(result).toEqual(apiUpdatedCommentsReponse);
  });

  it('should find and return the latest comment', (done) => {
    apiService.get.and.returnValue(of(apiResponse));

    const result = service.findLatestComment(id, type, 'POLICY');
    result.subscribe((res) => {
      expect(res).toEqual('food expenses are limited to rs 200 only');
      done();
    });
  });

  it('should post a new comment on object type', (done) => {
    const testComment = {
      id: 'stjIdPp8BX8O',
      created_at: '2022-11-17T06:07:38.590Z',
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
    const notify = false;

    apiService.post.and.returnValue(of(testComment));

    service.post(objectType, objectId, status, notify).subscribe((res) => {
      expect(res).toEqual(testComment);
      done();
    });
  });
});
