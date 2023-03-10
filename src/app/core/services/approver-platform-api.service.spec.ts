import { TestBed } from '@angular/core/testing';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { HttpClient } from '@angular/common/http';
import { ApproverExpensePolicyStatesData } from '../mock-data/platform-policy-expense.data';
import { of } from 'rxjs';

describe('ApproverPlatformApiService', () => {
  let approverPlatformService: ApproverPlatformApiService;
  let httpClient: jasmine.SpyObj<HttpClient>;
  const rootUrl = 'https://staging.fyle.tech';

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [
        ApproverPlatformApiService,
        {
          provide: HttpClient,
          useValue: httpSpy,
        },
      ],
    });
    approverPlatformService = TestBed.inject(ApproverPlatformApiService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    approverPlatformService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(approverPlatformService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(approverPlatformService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('get(): should get data from the API', (done) => {
    httpClient.get.and.returnValue(of(ApproverExpensePolicyStatesData));
    const url = '/expense_policy_states';

    const params = {
      expense_id: 'eq.txRNWeQRXhso',
    };

    approverPlatformService.get(url, params).subscribe((res) => {
      expect(res).toEqual(ApproverExpensePolicyStatesData);
      done();
    });
  });
});
