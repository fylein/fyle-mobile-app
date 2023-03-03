import { TestBed } from '@angular/core/testing';

import { SpenderPlatformV1ApiService } from './spender-platform-v1-beta-api.service';

xdescribe('SpenderPlatformV1ApiService', () => {
  let service: SpenderPlatformV1ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpenderPlatformV1ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
