import { TestBed } from '@angular/core/testing';

import { PlatformExpenseService } from './platform-expense.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { platformExpense1 } from '../mock-data/platform-expense.data';
import { of } from 'rxjs';

describe('PlatformExpenseService', () => {
  let service: PlatformExpenseService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [{ provide: SpenderPlatformV1ApiService, useValue: spenderPlatformV1ApiServiceSpy }],
    });
    service = TestBed.inject(PlatformExpenseService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getExpense(): should return expense with the given id', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: [platformExpense1] }));
    const expenseId = 'txOJVaaPxo9O';

    service.getExpense(expenseId).subscribe((res) => {
      expect(res).toBeTruthy();
      expect(res).toEqual(platformExpense1);

      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith(`/expenses`, {
        params: {
          id: `eq.${expenseId}`,
        },
      });
      done();
    });
  });
});
