import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AdvanceRequestPolicyService } from './advance-request-policy.service';
import { of } from 'rxjs';
import { checkPolicyWithRulesData } from '../mock-data/policy-violation-check.data';

describe('AdvanceRequestPolicyService', () => {
  const rootUrl = 'https://staging.fyle.tech';
  let advanceRequestPolicyService: AdvanceRequestPolicyService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        AdvanceRequestPolicyService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });
    advanceRequestPolicyService = TestBed.inject(AdvanceRequestPolicyService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    advanceRequestPolicyService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(advanceRequestPolicyService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(advanceRequestPolicyService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  it('getPolicyRules() : shoulg get the poilcy rules', () => {
    const expectedRules = ['policy desc 1', 'policy desc 2'];

    const result = advanceRequestPolicyService.getPolicyRules(checkPolicyWithRulesData);

    expect(result).toEqual(expectedRules);
  });

  it('servicePost(): should make POST request', (done) => {
    const requestObj = {
      someKey: 'someValue',
    };

    const apiResponse = {
      message: 'SUCCESS',
    };
    httpClient.post.and.returnValue(of(apiResponse));

    advanceRequestPolicyService.servicePost('/policy_check', requestObj, {}).subscribe((res) => {
      expect(res).toEqual(apiResponse);
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://staging.fyle.tech/policy/advance_requests/policy_check',
        requestObj
      );
      done();
    });
  });
});
