import { TestBed } from '@angular/core/testing';

import { SignupDetailsService } from './signup-details.service';

describe('SignupDetailsService', () => {
  let service: SignupDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignupDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
