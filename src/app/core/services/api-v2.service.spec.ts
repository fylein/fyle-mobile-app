import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ApiV2Service } from './api-v2.service';
import { of } from 'rxjs';
import { ExtendedReport } from '../models/report.model';
import { apiReportRes } from '../mock-data/api-reports.data';

describe('ApiV2Service', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let apiV2Service: ApiV2Service;
  let httpClient: jasmine.SpyObj<HttpClient>;

  const requestObj = {
    someKey: 'someValue',
  };

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

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

  describe('get():', () => {
    it('should make GET request without params', (done) => {
      httpClient.get.and.returnValue(of(apiReportRes));
      apiV2Service.get('/reports').subscribe((res) => {
        expect(res).toEqual(apiReportRes);
        expect(httpClient.get).toHaveBeenCalledOnceWith('https://staging.fyle.tech/v2/reports', {});
        done();
      });
    });

    it('should make GET request with params', (done) => {
      httpClient.get.and.returnValue(of(apiReportRes));

      apiV2Service
        .get<ExtendedReport, {}>('/reports', {
          params: requestObj,
        })
        .subscribe((res) => {
          expect(res).toEqual(apiReportRes);
          expect(httpClient.get).toHaveBeenCalledOnceWith('https://staging.fyle.tech/v2/reports', {
            params: requestObj,
          });
          done();
        });
    });
  });
});
