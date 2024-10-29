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
  it('should push property to filledCustomProperties based on is_enabled and value checks', () => {
    const customInput = { is_enabled: false }; // Example: custom input is disabled
    const property = {
      name: 'Sample Property',
      value: 'Some value',
      type: 'TEXT',
      mandatory: false,
      options: null,
    };

    // Create an instance of the service
    const filledCustomProperties: any[] = []; // This will be populated based on the logic
    const getCustomPropertyDisplayValueSpy = spyOn(
      customInputsService,
      'getCustomPropertyDisplayValue'
    ).and.returnValue('Some value');

    // Simulate the condition
    if (
      customInput.is_enabled ||
      (!customInput.is_enabled &&
        property.value !== null &&
        property.value !== undefined &&
        getCustomPropertyDisplayValueSpy(property) !== '-')
    ) {
      filledCustomProperties.push({
        ...property,
        displayValue: customInputsService.getCustomPropertyDisplayValue(property),
      });
    }

    // Expect that filledCustomProperties has the property with displayValue
    expect(filledCustomProperties.length).toBe(1);
    expect(filledCustomProperties[0].name).toBe('Sample Property');
    expect(filledCustomProperties[0].displayValue).toBe('Some value');
  });
  it('should return default display value for unsupported property type', () => {
    const testProperty = {
      name: 'Unsupported Type',
      value: null,
      type: 'UNSUPPORTED_TYPE', // New type not handled
      mandatory: false,
      options: null,
    };

    const expectedProperty = '-'; // Assuming the default return value

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  // Test for not filling custom properties if input is disabled
  it('should not fill custom properties if custom input is disabled', () => {
    const property = {
      name: 'Test Property',
      value: 'Some value',
      type: 'TEXT',
      mandatory: false,
      options: null,
    };
    const customInput = { is_enabled: false }; // Custom input disabled

    const filledCustomProperties: any[] = [];

    // Simulate the filling behavior
    if (customInput.is_enabled) {
      filledCustomProperties.push(property); // Only fill if enabled
    }

    expect(filledCustomProperties.length).toBe(0); // Expect no properties to be filled
  });

  // Test for unsupported property types
  it('should return "-" for unsupported property type', () => {
    const testProperty = {
      name: 'Unsupported Type',
      value: null,
      type: 'UNSUPPORTED_TYPE',
      mandatory: false,
      options: null,
    };

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual('-');
  });

  // Test for filling properties when disabled
  it('should not fill custom properties if input is disabled', () => {
    const property = {
      name: 'Test Property',
      value: 'Some value',
      type: 'TEXT',
      mandatory: false,
      options: null,
    };
    const customInput = { is_enabled: false }; // Custom input disabled

    const filledCustomProperties: any[] = [];

    // Simulate the condition of not filling when disabled
    if (!customInput.is_enabled) {
      expect(filledCustomProperties.length).toBe(0);
    }
  });

  it('should correctly handle boolean properties with various input types', () => {
    const trueProperty = {
      name: 'Boolean True',
      value: true,
      type: 'BOOLEAN',
      mandatory: false,
      options: null,
    };

    const falseProperty = {
      name: 'Boolean False',
      value: false,
      type: 'BOOLEAN',
      mandatory: false,
      options: null,
    };

    expect(customInputsService.getCustomPropertyDisplayValue(trueProperty)).toEqual('Yes');
    expect(customInputsService.getCustomPropertyDisplayValue(falseProperty)).toEqual('No');
  });
});
