import { TestBed } from '@angular/core/testing';

import { RouterApiService } from './router-api.service';

xdescribe('RouterApiService', () => {
  let service: RouterApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouterApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
