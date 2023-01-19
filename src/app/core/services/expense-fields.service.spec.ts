import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { defaultTxnFieldValuesData } from '../mock-data/default-txn-field-values.data';
import { expenseFieldObjData } from '../mock-data/expense-field-obj.data';
import { expenseFieldResponse, expenseFieldWithBillable, expenseFieldWithSeq } from '../mock-data/expense-field.data';
import {
  expenseFieldsMapResponse,
  expenseFieldsMapResponse2,
  txnFieldsData,
} from '../mock-data/expense-fields-map.data';
import { orgCategoryData } from '../mock-data/org-category.data';
import { extendedOrgUserResponse } from '../test-data/tasks.service.spec.data';
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

  it('getAllEnabled(): should get all enabled expense fields', (done) => {
    authService.getEou.and.returnValue(new Promise((resolve) => resolve(extendedOrgUserResponse)));
    apiService.get.and.returnValue(of(expenseFieldResponse));

    expenseFieldsService.getAllEnabled().subscribe((expenseFields) => {
      expect(expenseFields).toEqual(expenseFieldResponse);
      done();
    });
  });

  it('getDefaultTxnFieldValues(): should get the default values for transaction fields', () => {
    expect(expenseFieldsService.getDefaultTxnFieldValues(txnFieldsData)).toEqual(defaultTxnFieldValuesData);
  });

  it('formatBillableFields(): should format billable fields', () => {
    // @ts-ignore
    expect(expenseFieldsService.formatBillableFields(expenseFieldWithBillable)).toEqual(expenseFieldWithBillable);
  });

  it('getAllMap(): should get all expense fields map', (done) => {
    spyOn(expenseFieldsService, 'getAllEnabled').and.returnValue(of(expenseFieldWithSeq));

    expenseFieldsService.getAllMap().subscribe((expenseFieldsMap) => {
      expect(expenseFieldsMap).toEqual(expenseFieldsMapResponse2);
      done();
    });
  });

  it('filterbyCategory(): should filter expense fields by category', (done) => {
    const fields = ['purpose', 'txn_dt', 'vendor_id', 'org_category_id'];
    expenseFieldsService
      .filterByOrgCategoryId(expenseFieldsMapResponse, fields, orgCategoryData)
      .subscribe((expenseFields) => {
        expect(expenseFields).toEqual(expenseFieldObjData);
        done();
      });
  });
});
