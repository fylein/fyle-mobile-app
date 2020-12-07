import { TestBed } from '@angular/core/testing';

import { AdvanceRequestPolicyService } from './advance-request-policy.service';

describe('AdvanceRequestPolicyService', () => {
  let service: AdvanceRequestPolicyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvanceRequestPolicyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
