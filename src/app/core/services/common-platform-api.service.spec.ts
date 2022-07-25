import { TestBed } from '@angular/core/testing';

import { CommonPlatformApiService } from './common-platform-api.service';

xdescribe('CommonPlatformApiService', () => {
  let service: CommonPlatformApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonPlatformApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
