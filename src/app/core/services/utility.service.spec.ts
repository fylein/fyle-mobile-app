import { TestBed } from '@angular/core/testing';
import * as lodash from 'lodash';
import { customFieldData1, customFieldData2 } from '../mock-data/custom-field.data';
import { allAdvanceRequestsRes, singleExtendedAdvReqRes } from '../mock-data/extended-advance-request.data';
import { txnDataPayload } from '../mock-data/transaction.data';
import { SortingParam } from '../models/sorting-param.model';

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

  describe('sortAllAdvances():', () => {
    it('should sort single advance', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue(singleExtendedAdvReqRes.data);
      expect(utilityService.sortAllAdvances(0, SortingParam.creationDate, singleExtendedAdvReqRes.data)).toEqual(
        singleExtendedAdvReqRes.data
      );
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(singleExtendedAdvReqRes.data);
    });

    it('should sort multiple advances', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue(allAdvanceRequestsRes.data);
      expect(utilityService.sortAllAdvances(1, SortingParam.creationDate, allAdvanceRequestsRes.data)).toEqual(
        allAdvanceRequestsRes.data
      );
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(allAdvanceRequestsRes.data);
    });
  });

  it('getEmailsFromString(): should return emails from a string', () => {
    const mockStr = 'Expense approved by dimple.kh@fyle.in';
    expect(utilityService.getEmailsFromString(mockStr)).toEqual(['dimple.kh@fyle.in']);
  });

  it('getAmountWithCurrencyFromString(): should return amount with currency from a string', () => {
    const mockStr = 'Expense will be capped to USD 100';
    expect(utilityService.getAmountWithCurrencyFromString(mockStr)).toEqual(
      mockStr.match(/capped to ([a-zA-Z]{1,3} \d+)/i)
    );
  });
});
