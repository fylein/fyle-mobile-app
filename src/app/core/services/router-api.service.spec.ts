import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { RouterApiService } from './router-api.service';
import { of } from 'rxjs';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

describe('RouterApiService', () => {
  let routerApiService: RouterApiService;
  let httpClient: jasmine.SpyObj<HttpClient>;
  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        RouterApiService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });

    routerApiService = TestBed.inject(RouterApiService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(routerApiService).toBeTruthy();
  });

  it('should make POST call with params', (done) => {
    httpClient.post.and.returnValue(of(apiResponse));
    routerApiService.post('/invitation_requests', requestObj).subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith('/routerapi/invitation_requests', requestObj);
      done();
    });
  });

  describe('get():', () => {
    it('should make GET request without params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));
      routerApiService.get('/invitation_requests').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledWith('/routerapi/invitation_requests', {});
        done();
      });
    });

    it('should make GET request with params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));
      routerApiService
        .get('/invitation_requests', {
          params: requestObj,
        })
        .subscribe((res) => {
          expect(res).toEqual(apiResponse);
          expect(httpClient.get).toHaveBeenCalledWith('/routerapi/invitation_requests', {
            params: requestObj,
          });
          done();
        });
    });
  });
});
