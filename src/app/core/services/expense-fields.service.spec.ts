import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

import { ExpenseFieldsService } from './expense-fields.service';

describe('ExpenseFieldsService', () => {
  let expenseFieldsService: ExpenseFieldsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    TestBed.configureTestingModule({
      providers: [
        ExpenseFieldsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    });

    expenseFieldsService = TestBed.inject(ExpenseFieldsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(expenseFieldsService).toBeTruthy();
  });
});
