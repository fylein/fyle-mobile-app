import { TestBed } from '@angular/core/testing';

import { MergeExpensesService } from './merge-expenses.service';

describe('MergeExpensesService', () => {
  let service: MergeExpensesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MergeExpensesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
