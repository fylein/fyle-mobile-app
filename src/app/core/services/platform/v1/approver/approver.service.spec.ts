import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApproverService } from './approver.service';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

describe('ApproverService', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let approverService: ApproverService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        ApproverService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });

    approverService = TestBed.inject(ApproverService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    approverService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(approverService).toBeTruthy();
  });

  it('should set root url', () => {
    expect(approverService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('should make GET request without params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));

    approverService.get('/expense_fields').subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.get).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/approver/expense_fields', {});
      done();
    });
  });

  it('should make GET request with params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));

    approverService
      .get('/expense_fields', {
        params: requestObj,
      })
      .subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/approver/expense_fields', {
          params: requestObj,
        });
        done();
      });
  });

  it('should make POST request without body', (done) => {
    httpClient.post.and.returnValue(of(apiResponse));

    approverService.post('/expense_fields').subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/approver/expense_fields', {});
      done();
    });
  });

  it('should make POST request with body', (done) => {
    httpClient.post.and.returnValue(of(apiResponse));

    approverService.post('/expense_fields', requestObj).subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://staging.fyle.tech/platform/v1/approver/expense_fields',
        requestObj
      );
      done();
    });
  });
});
