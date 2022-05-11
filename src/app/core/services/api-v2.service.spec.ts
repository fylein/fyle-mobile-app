import { TestBed } from '@angular/core/testing';

import { ApiV2Service } from './api-v2.service';

xdescribe('ApiV2Service', () => {
  let service: ApiV2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiV2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
