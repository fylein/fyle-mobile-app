import { TestBed } from '@angular/core/testing';

import { AppVersionService } from './app-version.service';

xdescribe('AppVersionService', () => {
  let service: AppVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
