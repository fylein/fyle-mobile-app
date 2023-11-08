import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { defaultTxnFieldValuesData } from '../mock-data/default-txn-field-values.data';
import { expenseFieldObjData } from '../mock-data/expense-field-obj.data';
import {
  expenseFieldWithBillable,
  expenseFieldWithSeq,
  platformExpenseFieldResponse,
  transformedResponse,
} from '../mock-data/expense-field.data';
import {
  expenseFieldsMapResponse,
  expenseFieldsMapResponse2,
  txnFieldsData,
} from '../mock-data/expense-fields-map.data';
import { orgCategoryData } from '../mock-data/org-category.data';
import { extendedOrgUserResponse } from '../test-data/tasks.service.spec.data';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { AuthService } from './auth.service';

import { ExpenseFieldsService } from './expense-fields.service';

describe('ExpenseFieldsService', () => {
  let expenseFieldsService: ExpenseFieldsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    TestBed.configureTestingModule({
      providers: [
        ExpenseFieldsService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    });

    expenseFieldsService = TestBed.inject(ExpenseFieldsService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(expenseFieldsService).toBeTruthy();
  });

  it('getAllEnabled(): should get all enabled expense fields', (done) => {
    authService.getEou.and.returnValue(new Promise((resolve) => resolve(extendedOrgUserResponse)));
    spenderPlatformV1ApiService.get.and.returnValue(of(platformExpenseFieldResponse));

    expenseFieldsService.getAllEnabled().subscribe((expenseFields) => {
      expect(expenseFields).toEqual(transformedResponse);
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

  it('should return correct mapping for column name', () => {
    expect(expenseFieldsService.getColumnName('spent_at')).toBe('txn_dt');
    expect(expenseFieldsService.getColumnName('category_id')).toBe('org_category_id');
    expect(expenseFieldsService.getColumnName('merchant')).toBe('vendor_id');
    expect(expenseFieldsService.getColumnName('is_billable')).toBe('billable');
    expect(expenseFieldsService.getColumnName('started_at')).toBe('from_dt');
    expect(expenseFieldsService.getColumnName('ended_at')).toBe('to_dt');
    expect(expenseFieldsService.getColumnName('per_diem_num_days')).toBe('num_days');
    expect(expenseFieldsService.getColumnName('locations[0]')).toBe('location1');
    expect(expenseFieldsService.getColumnName('locations[1]')).toBe('location2');
    expect(expenseFieldsService.getColumnName('travel_classes[0]', 1)).toBe('flight_journey_travel_class');
    expect(expenseFieldsService.getColumnName('travel_classes[0]', 2)).toBe('bus_travel_class');
    expect(expenseFieldsService.getColumnName('travel_classes[0]', 3)).toBe('train_travel_class');
    expect(expenseFieldsService.getColumnName('travel_classes[1]', 1)).toBe('flight_return_travel_class');

    //For other fields, the column_name should remain the same
    expect(expenseFieldsService.getColumnName('project_id')).toBe('project_id');
  });
});
