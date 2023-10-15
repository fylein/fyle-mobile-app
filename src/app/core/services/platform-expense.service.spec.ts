import { TestBed } from '@angular/core/testing';

import { PlatformExpenseService } from './platform-expense.service';

describe('PlatformExpenseService', () => {
  let service: PlatformExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatformExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
