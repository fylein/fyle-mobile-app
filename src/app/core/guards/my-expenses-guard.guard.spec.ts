import { TestBed } from '@angular/core/testing';

import { MyExpensesGuardGuard } from './my-expenses-guard.guard';

describe('MyExpensesGuardGuard', () => {
  let guard: MyExpensesGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(MyExpensesGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
