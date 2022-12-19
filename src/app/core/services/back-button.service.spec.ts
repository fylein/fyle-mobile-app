import { TestBed } from '@angular/core/testing';

import { BackButtonService } from './back-button.service';

xdescribe('BackButtonService', () => {
  let service: BackButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
