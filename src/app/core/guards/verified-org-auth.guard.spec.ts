import { TestBed } from '@angular/core/testing';

import { VerifiedOrgAuthGuard } from './verified-org-auth.guard';

xdescribe('AuthGuard', () => {
  let guard: VerifiedOrgAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(VerifiedOrgAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
