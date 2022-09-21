import { TestBed } from '@angular/core/testing';

import { OrgUserAuthGuard } from './org-user-auth.guard';

xdescribe('AuthGuard', () => {
  let guard: OrgUserAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OrgUserAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
