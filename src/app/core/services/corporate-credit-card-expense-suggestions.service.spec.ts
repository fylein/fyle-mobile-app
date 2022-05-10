import { TestBed } from '@angular/core/testing';

import { CorporateCreditCardExpenseSuggestionsService } from './corporate-credit-card-expense-suggestions.service';

xdescribe('CorporateCreditCardExpenseSuggestionsService', () => {
  let service: CorporateCreditCardExpenseSuggestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorporateCreditCardExpenseSuggestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
