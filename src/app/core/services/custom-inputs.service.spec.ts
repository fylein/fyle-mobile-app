import { DatePipe, DecimalPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { from, lastValueFrom, of } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  apiResponse,
  authRespone,
  responseAfterAppliedFilter,
  filledCustomProperties,
  customProperties,
} from '../test-data/custom-inputs.spec.data';
import { CustomInputsService } from './custom-inputs.service';

describe('CustomInputsService', () => {
  let customInputsService: CustomInputsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  const orgId = 16582;
  const orgCatId = 110351;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    TestBed.configureTestingModule({
      providers: [
        CustomInputsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
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
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(customInputsService).toBeTruthy();
  });

  it('should filter expense fields by category', () => {
    const result = customInputsService.filterByCategory(apiResponse, orgId);
    expect(result).toEqual(responseAfterAppliedFilter);
  });

  it('should get custom property to be displayed | USER LIST', () => {
    const testProperty = {
      name: 'userlist',
      value: [],
      type: 'USER_LIST',
      mandatory: false,
      options: [],
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | MULTI SELECT', () => {
    const testProperty = {
      name: 'userlist',
      value: ['some', 'multi'],
      type: 'USER_LIST',
      mandatory: false,
      options: [],
    };

    const expectedProperty = 'some, multi';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | TEXT', () => {
    const testProperty = {
      name: 'category2',
      value: '',
      type: 'TEXT',
      mandatory: false,
      options: ['asdf', 'asdfa'],
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | BOOLEAN with value', () => {
    const testProperty = {
      name: 'category2',
      value: 'some value',
      type: 'BOOLEAN',
      mandatory: false,
      options: ['asdf', 'asdfa'],
    };

    const expectedProperty = 'Yes';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | BOOLEAN without value', () => {
    const testProperty = {
      name: 'category2',
      value: '',
      type: 'BOOLEAN',
      mandatory: false,
      options: ['asdf', 'asdfa'],
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
      options: [],
    };

    const expectedProperty = 'Feb 25, 2022';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | NUMBER', () => {
    const testProperty = {
      name: 'select all 2',
      value: 101,
      type: 'NUMBER',
      mandatory: false,
      options: [],
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
      options: [],
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | LOCATION without display and with only value', () => {
    const testProperty = {
      name: 'select all 2',
      value: ['some', 'location'],
      type: 'LOCATION',
      mandatory: false,
      options: [],
    };

    const expectedProperty = ['some', 'location'];

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | LOCATION with display and value', () => {
    const testProperty = {
      name: 'select all 2',
      value: { val: ['some', 'location'], display: 'display' },
      type: 'LOCATION',
      mandatory: false,
      options: [],
    };

    const expectedProperty = 'display';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | LOCATION without value', () => {
    const testProperty = {
      name: 'select all 2',
      value: { val: ['some', 'location'], display: null },
      type: 'LOCATION',
      mandatory: false,
      options: [],
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should get custom property to be displayed | LOCATION without value', () => {
    const testProperty = {
      name: 'select all 2',
      value: null,
      type: 'LOCATION',
      mandatory: false,
      options: [],
    };

    const expectedProperty = '-';

    const result = customInputsService.getCustomPropertyDisplayValue(testProperty);
    expect(result).toEqual(expectedProperty);
  });

  it('should fill custom properties', (done) => {
    authService.getEou.and.returnValue(Promise.resolve(authRespone));
    apiService.get.and.returnValue(of(apiResponse));
    const result = customInputsService.fillCustomProperties(orgCatId, customProperties, false);
    result.subscribe((res) => {
      expect(res).toEqual(filledCustomProperties);
      done();
    });
  });
});
