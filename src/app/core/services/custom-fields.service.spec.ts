import { TestBed } from '@angular/core/testing';
import { customPropertiesData } from '../mock-data/custom-property.data';
import { txnCustomPropertiesData, txnCustomPropertiesData3 } from '../mock-data/txn-custom-properties.data';
import { customInputData, platformApiResponse } from '../test-data/custom-inputs.spec.data';

import { CustomFieldsService } from './custom-fields.service';

describe('CustomFieldsService', () => {
  let customFieldsService: CustomFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    customFieldsService = TestBed.inject(CustomFieldsService);
  });

  it('should be created', () => {
    expect(customFieldsService).toBeTruthy();
  });

  describe('sortcustomFieldsByType():', () => {
    it('should sort custom fields by type in descending order', () => {
      const result = customFieldsService.sortcustomFieldsByType(txnCustomPropertiesData[0], txnCustomPropertiesData[2]);
      expect(result).toBe(-1);
    });

    it('should sort custom fields by type in ascending order', () => {
      const result = customFieldsService.sortcustomFieldsByType(txnCustomPropertiesData[2], txnCustomPropertiesData[0]);
      expect(result).toBe(1);
    });

    it('should return 0 for custom fields with the same type', () => {
      const result = customFieldsService.sortcustomFieldsByType(txnCustomPropertiesData[0], txnCustomPropertiesData[1]);
      expect(result).toBe(0);
    });
  });

  describe('setDefaultValue():', () => {
    it('should set default value to false for boolean type', () => {
      const result = customFieldsService.setDefaultValue(txnCustomPropertiesData3[0], 'BOOLEAN');
      expect(result.value).toBe(false);
    });

    it('should set default value to empty string for select type', () => {
      const result = customFieldsService.setDefaultValue(txnCustomPropertiesData3[1], 'SELECT');
      expect(result.value).toBe('');
    });

    it('should set default value to empty string for multi select type', () => {
      const result = customFieldsService.setDefaultValue(txnCustomPropertiesData[2], 'MULTI_SELECT');
      expect(result.value).toBe('');
    });

    it('should set default value to empty string for user select type', () => {
      const result = customFieldsService.setDefaultValue(txnCustomPropertiesData[0], 'USER_LIST');
      expect(result.value).toEqual([]);
    });
  });

  describe('setProperty():', () => {
    it('should set property for expense custom fields', () => {
      const result = customFieldsService.setProperty(null, platformApiResponse.data[0], []);
      expect(result).toEqual(txnCustomPropertiesData3[2]);
    });

    it('should set property for custom fields without is_mandatory', () => {
      const result = customFieldsService.setProperty(null, customInputData[1], []);
      expect(result).toEqual(txnCustomPropertiesData3[4]);
    });

    it('should set property for custom fields with custom properties', () => {
      const result = customFieldsService.setProperty(null, platformApiResponse.data[0], customPropertiesData);
      expect(result).toEqual(txnCustomPropertiesData3[2]);
    });

    it('should set property for custom fields with custom properties of type Date', () => {
      const result = customFieldsService.setProperty(null, customInputData[2], customPropertiesData);
      expect(result).toEqual(txnCustomPropertiesData3[5]);
    });
  });
});
