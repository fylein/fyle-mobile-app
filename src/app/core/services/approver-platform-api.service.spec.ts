import { TestBed } from '@angular/core/testing';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

describe('ApproverPlatformApiService', () => {
  let approverPlatformApiService: ApproverPlatformApiService;
  let httpTestingController: HttpTestingController;
  let httpClient: jasmine.SpyObj<HttpClient>;
  const rootUrl = 'https://staging.fyle.tech';

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApproverPlatformApiService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });
    approverPlatformApiService = TestBed.inject(ApproverPlatformApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    approverPlatformApiService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(approverPlatformApiService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(approverPlatformApiService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  describe('get():', () => {
    it('should make GET request without params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      approverPlatformApiService.get('/reports').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith('https://staging.fyle.tech/platform/v1/approver/reports', {});
        done();
      });
    });

    it('should make GET request with params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      approverPlatformApiService.get('/reports', { params: requestObj }).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith('https://staging.fyle.tech/platform/v1/approver/reports', {
          params: requestObj,
        });
        done();
      });
    });
  });

  describe('post():', () => {
    it('should make POST request without body', (done) => {
      httpClient.post.and.returnValue(of(apiResponse));

      approverPlatformApiService.post('/reports').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.post).toHaveBeenCalledOnceWith('https://staging.fyle.tech/platform/v1/approver/reports', {});
        done();
      });
    });

    it('should make POST request with body', (done) => {
      httpClient.post.and.returnValue(of(apiResponse));

      approverPlatformApiService.post('/reports', requestObj).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.post).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/platform/v1/approver/reports',
          requestObj
        );
        done();
      });
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
