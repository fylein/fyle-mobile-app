import { TestBed } from '@angular/core/testing';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ApproverExpensePolicyStatesData } from '../mock-data/platform-policy-expense.data';
import { HttpClient } from '@angular/common/http';
import { platformReportData } from '../mock-data/platform-report.data';
import { of } from 'rxjs';
import { PlatformReport } from '../models/platform/platform-report.model';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

fdescribe('ApproverPlatformApiService', () => {
  let approverPlatformService: ApproverPlatformApiService;
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
    approverPlatformService = TestBed.inject(ApproverPlatformApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    approverPlatformService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(approverPlatformService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(approverPlatformService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  describe('get():', () => {
    it('should make GET request without params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      approverPlatformService.get('/reports').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith('https://staging.fyle.tech/platform/v1/approver/reports', {});
        done();
      });
    });

    it('should make GET request with params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      approverPlatformService.get('/reports', { params: requestObj }).subscribe((res) => {
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

      approverPlatformService.post('/reports').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.post).toHaveBeenCalledOnceWith('https://staging.fyle.tech/platform/v1/approver/reports', {});
        done();
      });
    });

    it('should make POST request with body', (done) => {
      httpClient.post.and.returnValue(of(apiResponse));

      approverPlatformService.post('/reports', requestObj).subscribe((res) => {
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
