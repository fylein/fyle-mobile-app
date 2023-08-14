import { TestBed } from '@angular/core/testing';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ApproverExpensePolicyStatesData } from '../mock-data/platform-policy-expense.data';
import { HttpClient } from '@angular/common/http';
import { platformReportData } from '../mock-data/platform-report.data';
import { of } from 'rxjs';
import { PlatformReport } from '../models/platform/platform-report.model';

fdescribe('ApproverPlatformApiService', () => {
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
    it('should get data from the API without config', (done) => {
      const url = '/expense_policy_states';
      approverPlatformApiService.get(url).subscribe((res) => {
        expect(res).toEqual(ApproverExpensePolicyStatesData);
        done();
      });
      const req = httpTestingController.expectOne(`${rootUrl}/platform/v1/approver${url}`);
      expect(req.request.method).toEqual('GET');
      req.flush(ApproverExpensePolicyStatesData);
    });

    it('should get data from the API with config', (done) => {
      const url = '/expense_policy_states';
      const exp_id = {
        expense_id: 'eq.txRNWeQRXhso',
      };
      approverPlatformApiService.get(url, { params: exp_id }).subscribe((res) => {
        expect(res).toEqual(ApproverExpensePolicyStatesData);
        done();
      });
      const req = httpTestingController.expectOne(
        `${rootUrl}/platform/v1/approver${url}?expense_id=${exp_id.expense_id}`
      );
      expect(req.request.method).toEqual('GET');
      expect(req.request.params.get('expense_id')).toEqual(exp_id.expense_id);
      req.flush(ApproverExpensePolicyStatesData);
    });
  });

  describe('post():', () => {
    it('should make POST request without body', (done) => {
      httpClient.post.and.returnValue(of(platformReportData));

      approverPlatformApiService.post('/reports').subscribe((res) => {
        expect(res).toEqual(platformReportData);
        expect(httpClient.post).toHaveBeenCalledOnceWith(`${rootUrl}/platform/v1/approver/reports`, {});
        done();
      });
    });

    it('should make POST request with body', (done) => {
      httpClient.post.and.returnValue(of(platformReportData));

      const params: { data: Pick<PlatformReport, 'id' | 'source' | 'purpose'> } = {
        data: {
          id: platformReportData.id,
          source: platformReportData.source,
          purpose: platformReportData.purpose,
        },
      };

      approverPlatformApiService.post('/reports', params).subscribe((res) => {
        expect(res).toEqual(platformReportData);
        expect(httpClient.post).toHaveBeenCalledOnceWith(`${rootUrl}/platform/v1/approver/reports`, params);
        done();
      });
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
