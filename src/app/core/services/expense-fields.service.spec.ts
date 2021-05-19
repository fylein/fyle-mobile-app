import { TestBed } from '@angular/core/testing';

import { ExpenseFieldsService } from './expense-fields.service';

describe('ExpenseFieldsService', () => {
  let service: ExpenseFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
