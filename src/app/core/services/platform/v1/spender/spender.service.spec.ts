import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SpenderService } from './spender.service';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

describe('SpenderService', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let spenderService: SpenderService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        SpenderService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });

    spenderService = TestBed.inject(SpenderService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    spenderService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(spenderService).toBeTruthy();
  });

  it('should set root url', () => {
    expect(spenderService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('should make GET request without params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));

    spenderService.get('/expense_fields').subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.get).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/spender/expense_fields', {});
      done();
    });
  });

  it('should make GET request with params', (done) => {
    httpClient.get.and.returnValue(of(apiResponse));

    spenderService
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

    spenderService.post('/expense_fields').subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith('https://staging.fyle.tech/platform/v1/spender/expense_fields', {});
      done();
    });
  });

  it('should make POST request with body', (done) => {
    httpClient.post.and.returnValue(of(apiResponse));

    spenderService.post('/expense_fields', requestObj).subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://staging.fyle.tech/platform/v1/spender/expense_fields',
        requestObj
      );
      done();
    });
  });
});
