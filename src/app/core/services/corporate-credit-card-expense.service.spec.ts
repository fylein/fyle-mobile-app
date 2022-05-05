import { TestBed } from '@angular/core/testing';

import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';

xdescribe('CorporateCreditCardExpenseService', () => {
  let service: CorporateCreditCardExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorporateCreditCardExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
