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
import { CustomField } from '../models/custom_field.model';

fdescribe('CustomInputsService', () => {
  let customInputsService: CustomInputsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  const orgCatId = 110351;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    TestBed.configureTestingModule({
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
      SpenderPlatformV1ApiService
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

    const expectedProperty = 'some,location';

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

  it('should fill dependent field properties', (done) => {
    authService.getEou.and.resolveTo(authRespone);
    spenderPlatformV1ApiService.get.and.returnValue(of(platformApiResponse));
    const result = customInputsService.fillDependantFieldProperties(expensesWithDependentFields[0]);
    result.subscribe((res) => {
      expect(res).toEqual(filledDependentFields);
      done();
    });
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

  it('should return field name with "(Deleted)" when is_enabled is false', () => {
    const customInput = { is_enabled: false, field_name: 'Sample Field' };
    const result = customInput.is_enabled === false ? `${customInput.field_name} (Deleted)` : customInput.field_name;
    expect(result).toBe('Sample Field (Deleted)');
  });

  it('should return field name when is_enabled is true', () => {
    const customInput = { is_enabled: true, field_name: 'Sample Field' };
    const result = customInput.is_enabled === false ? `${customInput.field_name} (Deleted)` : customInput.field_name;
    expect(result).toBe('Sample Field');
  });

  it('should return true when is_enabled is true', () => {
    const customInput = { is_enabled: true };
    const property: CustomField = { name: 'Sample Name', value: null }; // Include name property
    const result =
      customInput.is_enabled ||
      (!customInput.is_enabled &&
        property.value !== null &&
        property.value !== undefined &&
        customInputsService.getCustomPropertyDisplayValue(property) !== '-');
    expect(result).toBe(true);
  });

  it('should return true when is_enabled is false and property.value is not null and not undefined and getCustomPropertyDisplayValue does not return "-"', () => {
    const customInput = { is_enabled: false };
    const property: CustomField = { name: 'Sample Name', value: 'some value' }; // Include name property

    // Mock the getCustomPropertyDisplayValue method
    spyOn(customInputsService, 'getCustomPropertyDisplayValue').and.returnValue('valid display value');

    const result =
      customInput.is_enabled ||
      (!customInput.is_enabled &&
        property.value !== null &&
        property.value !== undefined &&
        customInputsService.getCustomPropertyDisplayValue(property) !== '-');
    expect(result).toBe(true);
  });

  it('should return false when is_enabled is false and property.value is null', () => {
    const customInput = { is_enabled: false };
    const property: CustomField = { name: 'Sample Name', value: null }; // Include name property

    const result =
      customInput.is_enabled ||
      (!customInput.is_enabled &&
        property.value !== null &&
        property.value !== undefined &&
        customInputsService.getCustomPropertyDisplayValue(property) !== '-');
    expect(result).toBe(false);
  });

  it('should return false when is_enabled is false and getCustomPropertyDisplayValue returns "-"', () => {
    const customInput = { is_enabled: false };
    const property: CustomField = { name: 'Sample Name', value: 'some value' }; // Include name property

    // Mock the getCustomPropertyDisplayValue method to return "-"
    spyOn(customInputsService, 'getCustomPropertyDisplayValue').and.returnValue('-');

    const result =
      customInput.is_enabled ||
      (!customInput.is_enabled &&
        property.value !== null &&
        property.value !== undefined &&
        customInputsService.getCustomPropertyDisplayValue(property) !== '-');
    expect(result).toBe(false);
  });
});
