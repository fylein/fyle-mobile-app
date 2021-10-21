import { TestBed } from '@angular/core/testing';

import { ViewExpensesService } from './view-expenses.service';

describe('TeamExpenseService', () => {
  let service: ViewExpensesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewExpensesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
