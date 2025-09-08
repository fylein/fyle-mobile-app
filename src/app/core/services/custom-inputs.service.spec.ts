import { DatePipe, DecimalPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { AuthService } from './auth.service';
import {
  platformApiResponse,
  authRespone,
  responseAfterAppliedFilter,
  filledCustomProperties,
  customProperties,
  filterTestData,
  filledDependentFields,
} from '../test-data/custom-inputs.spec.data';
import { CustomInputsService } from './custom-inputs.service';
import { expensesWithDependentFields } from '../mock-data/dependent-field-expenses.data';
import { CustomInput } from '../models/custom-input.model';
import { mockExpenseData } from '../mock-data/expense-field.data';
import { getTranslocoModule } from '../testing/transloco-testing.utils';

describe('CustomInputsService', () => {
  let customInputsService: CustomInputsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  const orgCatId = '110351';

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
      providers: [
        CustomInputsService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        DecimalPipe,
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        DatePipe,
      ],
    });

    customInputsService = TestBed.inject(CustomInputsService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(customInputsService).toBeTruthy();
  });

  it('should filter expense fields by category', () => {
    const result = customInputsService.filterByCategory(filterTestData, orgCatId);
    expect(result).toEqual(responseAfterAppliedFilter);
  });

  it('should get custom property to be displayed | USER LIST without value', () => {
    const testProperty = {
      name: 'userlist',
      value: [],
      type: 'USER_LIST',
      mandatory: false,
      options: ['scooby@fyle.com', 'mickey@wd.com', 'johnny@cn.com'],
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | MULTI SELECT', () => {
    const testProperty = {
      name: 'Multi Type',
      value: ['record1', 'record2'],
      type: 'MULTI_SELECT',
      mandatory: true,
      options: ['record1', 'record2', 'record3'],
    };

    const expectedProperty = 'record1, record2';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | TEXT without value', () => {
    const testProperty = {
      name: 'category2',
      value: '',
      type: 'TEXT',
      mandatory: false,
      options: null,
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | SELECT', () => {
    const testProperty = {
      name: 'Status',
      value: 'record1',
      type: 'SELECT',
      mandatory: false,
      options: ['record 1', 'record 2'],
    };

    const expectedProperty = 'record1';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | BOOLEAN with value', () => {
    const testProperty = {
      name: 'category2',
      value: true,
      type: 'BOOLEAN',
      mandatory: false,
      options: null,
    };

    const expectedProperty = 'Yes';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | BOOLEAN without value', () => {
    const testProperty = {
      name: 'category2',
      value: false,
      type: 'BOOLEAN',
      mandatory: false,
      options: null,
    };

    const expectedProperty = 'No';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | DATE with value', () => {
    const testProperty = {
      name: 'select all 2',
      value: '2022-02-25T05:44:36.169Z',
      type: 'DATE',
      mandatory: false,
      options: null,
    };

    const expectedProperty = 'Feb 25, 2022';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | DATE without value', () => {
    const testProperty = {
      name: 'select all 2',
      value: null,
      type: 'DATE',
      mandatory: false,
      options: null,
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | NUMBER', () => {
    const testProperty = {
      name: 'select all 2',
      value: 101,
      type: 'NUMBER',
      mandatory: false,
      options: null,
    };

    const expectedProperty = '101.00';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | NUMBER without value', () => {
    const testProperty = {
      name: 'select all 2',
      value: null,
      type: 'NUMBER',
      mandatory: false,
      options: null,
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | LOCATION without display value and with value object', () => {
    const testProperty = {
      name: 'select all 2',
      value: { val: ['some', 'location'], display: null },
      type: 'LOCATION',
      mandatory: false,
      options: null,
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | LOCATION without display object and with value object', () => {
    const testProperty = {
      name: 'select all 2',
      value: ['some', 'location'],
      type: 'LOCATION',
      mandatory: false,
      options: null,
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | LOCATION with display and value', () => {
    const testProperty = {
      name: 'select all 2',
      value: { val: ['some', 'location'], display: 'display' },
      type: 'LOCATION',
      mandatory: false,
      options: null,
    };

    const expectedProperty = 'display';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | LOCATION without value', () => {
    const testProperty = {
      name: 'select all 2',
      value: null,
      type: 'LOCATION',
      mandatory: false,
      options: null,
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should fill custom properties', (done) => {
    authService.getEou.and.resolveTo(authRespone);
    spenderPlatformV1ApiService.get.and.returnValue(of(platformApiResponse));
    const result = customInputsService.fillCustomProperties(orgCatId, customProperties);
    result.subscribe((res) => {
      expect(res).toEqual(filledCustomProperties);
      done();
    });
  });

  it('should append "(Deleted)" to field name when custom input is disabled', (done) => {
    const orgCategoryId = '147791';

    const customProperties: CustomInput[] = [];

    // Mock getAllinView method to return an observable with the mock data
    spyOn(customInputsService, 'getAll').and.returnValue(of(mockExpenseData));

    // Mock filterByCategory to return the mock object as the filtered result
    spyOn(customInputsService, 'filterByCategory').and.callFake((inputs, id) => {
      return inputs.filter((input) => input.org_category_ids.includes(Number(id)));
    });

    // Call fillCustomProperties and verify results
    customInputsService.fillCustomProperties(orgCategoryId, customProperties).subscribe((result) => {
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('testttt (Deleted)'); // Check for "(Deleted)"
      done();
    });
  });
});
