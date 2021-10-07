import { TestBed } from '@angular/core/testing';

import { TeamExpenseService } from './team-expense.service';

describe('TeamExpenseService', () => {
  let service: TeamExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
