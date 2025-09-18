import { TestBed } from '@angular/core/testing';
import { PlatformCommonApiService } from './platform-common-api.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

describe('PlatformCommonApiService', () => {
  let platformCommonApiService: PlatformCommonApiService;
  let httpTestingController: HttpTestingController;
  let httpClient: jasmine.SpyObj<HttpClient>;
  const rootUrl = 'https://staging.fyle.tech';

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        PlatformCommonApiService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
        provideHttpClientTesting(),
      ],
    });
    platformCommonApiService = TestBed.inject(PlatformCommonApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    platformCommonApiService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(platformCommonApiService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(platformCommonApiService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  describe('get():', () => {
    it('should make GET request without params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      platformCommonApiService.get('/currency/list').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/platform/v1/common/currency/list',
          {},
        );
        done();
      });
    });

    it('should make GET request with params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      platformCommonApiService.get('/currency/exchange_rate', { params: requestObj }).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/platform/v1/common/currency/exchange_rate',
          {
            params: requestObj,
          },
        );
        done();
      });
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
