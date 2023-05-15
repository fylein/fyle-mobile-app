import { TestBed } from '@angular/core/testing';

import { MobileNumberVerificationService } from './mobile-number-verification.service';

//TODO: Write unit tests for this service
xdescribe('MobileNumberVerificationService', () => {
  let service: MobileNumberVerificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileNumberVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
