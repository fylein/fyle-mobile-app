import { TestBed } from '@angular/core/testing';

import { ExpenseAggregationService } from './expense-aggregation.service';

xdescribe('ExpenseAggregationService', () => {
  let service: ExpenseAggregationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseAggregationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
