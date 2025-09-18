import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};
describe('SpenderPlatformV1ApiService', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let spenderPlatformV1ApiService: SpenderPlatformV1ApiService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        SpenderPlatformV1ApiService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });

    spenderPlatformV1ApiService = TestBed.inject(SpenderPlatformV1ApiService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    spenderPlatformV1ApiService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(spenderPlatformV1ApiService).toBeTruthy();
  });

  it('should set root url', () => {
    expect(spenderPlatformV1ApiService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('should make GET request without params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));

    spenderPlatformV1ApiService.get('/expense_fields').subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.get).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/spender/expense_fields', {});
      done();
    });
  });

  it('should make GET request with params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));

    spenderPlatformV1ApiService
      .get('/expense_fields', {
        params: requestObj,
      })
      .subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/spender/expense_fields', {
          params: requestObj,
        });
        done();
      });
  });

  it('should make POST request without body', (done) => {
    httpClient.post.and.returnValue(of(apiResponse));

    spenderPlatformV1ApiService.post('/expense_fields').subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/spender/expense_fields', {});
      done();
    });
  });

  it('should make POST request with body', (done) => {
    httpClient.post.and.returnValue(of(apiResponse));

    spenderPlatformV1ApiService.post('/expense_fields', requestObj).subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://staging.fyle.tech/platform/v1/spender/expense_fields',
        requestObj,
      );
      done();
    });
  });
});
