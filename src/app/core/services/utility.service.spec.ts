import { TestBed } from '@angular/core/testing';
import { customFieldData1, customFieldData2 } from '../mock-data/custom-field.data';
import { txnDataPayload } from '../mock-data/transaction.data';

import { UtilityService } from './utility.service';

describe('UtilityService', () => {
  let utilityService: UtilityService;
  const EPOCH = 19700101;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilityService],
    });
    utilityService = TestBed.inject(UtilityService);
  });

  it('should be created', () => {
    expect(utilityService).toBeTruthy();
  });

  it('should discard null characters', () => {
    const mockStr = 'Fyle\u0000 Expense!\u0000';
    expect(utilityService.discardNullChar(mockStr)).toEqual(
      mockStr.replace(/[\u0000][\u0008-\u0009][\u000A-\u000C][\u005C]/g, '')
    );
  });

  describe('refineNestedObject():', () => {
    it('should return the nested object when the custom field type is number, string etc', () => {
      expect(utilityService.refineNestedObject(customFieldData1)).toEqual(customFieldData1);
    });

    it('should return the nested object when the custom field type is select', () => {
      spyOn(utilityService, 'discardNullChar').and.returnValue('select-1');
      expect(utilityService.refineNestedObject(customFieldData2)).toEqual(customFieldData2);
      expect(utilityService.discardNullChar).toHaveBeenCalledOnceWith('select-1');
    });
  });

  describe('discardRedundantCharacters():', () => {
    it('should discard redundant characters from the data', () => {
      const fieldsToCheck = ['purpose', 'vendor', 'train_travel_class', 'bus_travel_class'];
      spyOn(utilityService, 'refineNestedObject').and.returnValue(txnDataPayload.custom_properties);
      spyOn(utilityService, 'discardNullChar').and.callThrough();
      expect(utilityService.discardRedundantCharacters(txnDataPayload, fieldsToCheck)).toEqual(txnDataPayload);
      expect(utilityService.refineNestedObject).toHaveBeenCalledOnceWith(txnDataPayload.custom_properties);
    });
  });
});
