import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExpensesService } from './expenses.service';
import { SpenderService } from './spender.service';
import { expenseData1 } from 'src/app/core/mock-data/platform/v1/expense.data';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let spenderService: jasmine.SpyObj<SpenderService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get']);
    TestBed.configureTestingModule({
      providers: [{ provide: SpenderService, useValue: spenderServiceSpy }],
    });
    service = TestBed.inject(ExpensesService);
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getById(): should return expense with the given id', (done) => {
    spenderService.get.and.returnValue(of({ data: [expenseData1] }));
    const expenseId = 'txOJVaaPxo9O';

    service.getById(expenseId).subscribe((res) => {
      expect(res).toBeTruthy();
      expect(res).toEqual(expenseData1);

      expect(spenderService.get).toHaveBeenCalledOnceWith(`/expenses`, {
        params: {
          id: `eq.${expenseId}`,
        },
      });
      done();
    });
  });
});
