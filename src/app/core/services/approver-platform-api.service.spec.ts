import { TestBed } from '@angular/core/testing';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ApproverExpensePolicyStatesData } from '../mock-data/platform-policy-expense.data';
import { HttpClient } from '@angular/common/http';

describe('ApproverPlatformApiService', () => {
  let approverPlatformService: ApproverPlatformApiService;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  const rootUrl = 'https://staging.fyle.tech';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApproverPlatformApiService],
    });
    approverPlatformService = TestBed.inject(ApproverPlatformApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    approverPlatformService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(approverPlatformService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(approverPlatformService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('get(): should get data from the API', (done) => {
    const url = '/expense_policy_states';
    approverPlatformService.get(url).subscribe((res) => {
      expect(res).toEqual(ApproverExpensePolicyStatesData);
    });
    const req = httpTestingController.expectOne(`${rootUrl}/platform/v1/approver${url}`);
    expect(req.request.method).toEqual('GET');
    req.flush(ApproverExpensePolicyStatesData);
    done();
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
