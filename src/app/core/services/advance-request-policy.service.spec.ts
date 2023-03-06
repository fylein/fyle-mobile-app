import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AdvanceRequestPolicyService } from './advance-request-policy.service';
import { of } from 'rxjs';

const requestObj = {
  someKey: 'someValue',
};

const apiResponse = {
  message: 'SUCCESS',
};

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
});
