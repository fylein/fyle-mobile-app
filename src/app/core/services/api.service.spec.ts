import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { of } from 'rxjs';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

describe('ApiService', () => {
  let apiService: ApiService;
  const rootUrl = 'https://staging.fyle.tech';
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });
    apiService = TestBed.inject(ApiService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    apiService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(apiService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(apiService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  describe('post():', () => {
    it('should make POST request without body', (done) => {
      httpClient.post.and.returnValue(of(apiResponse));

      apiService.post('/advance_requests').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.post).toHaveBeenCalledOnceWith('https://staging.fyle.tech/api/advance_requests', {}, {});
        done();
      });
    });

    it('should make POST request with body', (done) => {
      httpClient.post.and.returnValue(of(apiResponse));

      apiService.post('/advance_requests', requestObj).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.post).toHaveBeenCalledOnceWith(
          'https://staging.fyle.tech/api/advance_requests',
          requestObj,
          {}
        );
        done();
      });
    });
  });

  describe('get():', () => {
    it('should make GET request without params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      apiService.get('/advance_requests').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith('https://staging.fyle.tech/api/advance_requests', {});
        done();
      });
    });

    it('should make GET request with params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      apiService.get('/advance_requests', { params: requestObj }).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith('https://staging.fyle.tech/api/advance_requests', {
          params: requestObj,
        });
        done();
      });
    });
  });

  describe('delete():', () => {
    it('should make a DELETE call with params', (done) => {
      httpClient.delete.and.returnValue(of(apiResponse));

      apiService.delete('/advance_requests', { params: requestObj }).subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.delete).toHaveBeenCalledOnceWith('https://staging.fyle.tech/api/advance_requests', {
          params: requestObj,
        });
        done();
      });
    });

    it('should make a DELETE call without params', (done) => {
      httpClient.delete.and.returnValue(of(apiResponse));

      apiService.delete('/advance_requests').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.delete).toHaveBeenCalledOnceWith('https://staging.fyle.tech/api/advance_requests', {});
        done();
      });
    });
  });
});
