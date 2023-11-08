import { TestBed } from '@angular/core/testing';

import { SharedExpenseService } from './shared-expense.service';

describe('SharedExpenseService', () => {
  let service: SharedExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
