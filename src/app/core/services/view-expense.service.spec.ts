import { TestBed } from '@angular/core/testing';

import { ViewExpenseService } from './view-expense.service';

xdescribe('ViewExpenseService', () => {
  let service: ViewExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
