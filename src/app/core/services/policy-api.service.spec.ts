import { TestBed } from '@angular/core/testing';

import { PolicyApiService } from './policy-api.service';

xdescribe('PolicyApiService', () => {
  let service: PolicyApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
