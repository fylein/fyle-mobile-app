import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExpensesService } from './expenses.service';
import { ApproverService } from './approver.service';
import { expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let approverService: jasmine.SpyObj<ApproverService>;

  beforeEach(() => {
    const approverServiceSpy = jasmine.createSpyObj('ApproverService', ['get']);
    TestBed.configureTestingModule({
      providers: [{ provide: ApproverService, useValue: approverServiceSpy }],
    });
    service = TestBed.inject(ExpensesService);
    approverService = TestBed.inject(ApproverService) as jasmine.SpyObj<ApproverService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getExpenseById(): should return expense with the given id', (done) => {
    approverService.get.and.returnValue(of({ data: [expenseData] }));
    const expenseId = 'txOJVaaPxo9O';

    service.getExpenseById(expenseId).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response).toEqual(expenseData);

      expect(approverService.get).toHaveBeenCalledOnceWith(`/expenses`, {
        params: {
          id: `eq.${expenseId}`,
        },
      });
      done();
    });
  });
});
