import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  dependentFieldValuesApiParams,
  dependentFieldValuesApiResponse,
  dependentFieldValuesApiResponseForSearchQuery,
  dependentFieldValuesMethodParams,
  dependentFieldValuesWithSearchQueryApiParams,
  dependentFieldValuesWithSearchQueryMethodParams,
} from '../test-data/dependent-fields.service.spec.data';

import { DependentFieldsService } from './dependent-fields.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { CustomInputsService } from './custom-inputs.service';

describe('DependentFieldsService', () => {
  let dependentFieldsService: DependentFieldsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll']);

    TestBed.configureTestingModule({
      providers: [
        DependentFieldsService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: CustomInputsService,
          useValue: customInputsServiceSpy,
        },
      ],
    });

    dependentFieldsService = TestBed.inject(DependentFieldsService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
  });

  it('should be created', () => {
    expect(dependentFieldsService).toBeTruthy();
  });

  it('getOptionsForDependentField(): should return all options for dependent field', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(dependentFieldValuesApiResponse));

    const result = dependentFieldsService.getOptionsForDependentField(dependentFieldValuesMethodParams);
    result.subscribe((res) => {
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith(
        '/dependent_expense_field_values',
        dependentFieldValuesApiParams
      );
      expect(res).toEqual(dependentFieldValuesApiResponse.data);
      done();
    });
  });

  it('getOptionsForDependentField(): should return options for dependent field based on search query', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(dependentFieldValuesApiResponseForSearchQuery));

    const result = dependentFieldsService.getOptionsForDependentField(dependentFieldValuesWithSearchQueryMethodParams);
    result.subscribe((res) => {
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith(
        '/dependent_expense_field_values',
        dependentFieldValuesWithSearchQueryApiParams
      );
      expect(res).toEqual(dependentFieldValuesApiResponseForSearchQuery.data);
      done();
    });
  });
});
