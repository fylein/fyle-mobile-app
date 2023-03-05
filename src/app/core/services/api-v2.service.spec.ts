import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ApiV2Service } from './api-v2.service';
import { of } from 'rxjs';

describe('ApiV2Service', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let apiV2Service: ApiV2Service;
  let httpClient: jasmine.SpyObj<HttpClient>;

  const requestObj = {
    someKey: 'someValue',
  };

  const apiResponse = {
    message: 'SUCCESS',
  };

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        ApiV2Service,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });

    apiV2Service = TestBed.inject(ApiV2Service);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    apiV2Service.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(apiV2Service).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(apiV2Service.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('get():should make GET request without params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));

    apiV2Service.get('/reports').subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.get).toHaveBeenCalledWith('https://staging.fyle.tech/v2/reports', {});
      done();
    });
  });
});
