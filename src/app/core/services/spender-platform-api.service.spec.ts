import { TestBed } from '@angular/core/testing';

import { SpenderPlatformApiService } from './spender-platform-api.service';

xdescribe('SpenderPlatformApiService', () => {
  let service: SpenderPlatformApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpenderPlatformApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
