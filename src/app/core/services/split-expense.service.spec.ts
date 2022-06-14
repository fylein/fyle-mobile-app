import { TestBed } from '@angular/core/testing';

import { SplitExpenseService } from './split-expense.service';

xdescribe('SplitExpenseService', () => {
  let service: SplitExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SplitExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
