import { TestBed } from '@angular/core/testing';

import { ExpenseSuggestionsService } from './expense-suggestions.service';

describe('ExpenseSuggestionsService', () => {
  let service: ExpenseSuggestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseSuggestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
