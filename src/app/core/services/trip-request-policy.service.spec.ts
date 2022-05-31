import { TestBed } from '@angular/core/testing';

import { TripRequestPolicyService } from './trip-request-policy.service';

xdescribe('TripRequestPolicyService', () => {
  let service: TripRequestPolicyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripRequestPolicyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
