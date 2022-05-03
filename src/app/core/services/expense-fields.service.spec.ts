import { TestBed } from '@angular/core/testing';

import { ExpenseFieldsService } from './expense-fields.service';

xdescribe('ExpenseFieldsService', () => {
  let service: ExpenseFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
