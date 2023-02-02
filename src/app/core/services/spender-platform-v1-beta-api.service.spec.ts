import { TestBed } from '@angular/core/testing';

import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';

xdescribe('SpenderPlatformV1BetaApiService', () => {
  let service: SpenderPlatformV1BetaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpenderPlatformV1BetaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
