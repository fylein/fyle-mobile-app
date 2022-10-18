import { TestBed } from '@angular/core/testing';

import { ApproverPlatformApiService } from './approver-platform-api.service';

xdescribe('ApproverPlatformApiService', () => {
  let service: ApproverPlatformApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApproverPlatformApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
