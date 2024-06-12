import { TestBed } from '@angular/core/testing';

import { OptInGuard } from './opt-in.guard';

describe('OptInGuard', () => {
  let guard: OptInGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OptInGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
