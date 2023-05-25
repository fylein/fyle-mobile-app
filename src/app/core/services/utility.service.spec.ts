import { TestBed } from '@angular/core/testing';
import * as dayjs from 'dayjs';
import * as lodash from 'lodash';
import { customFieldData1, customFieldData2 } from '../mock-data/custom-field.data';
import { allAdvanceRequestsRes, singleExtendedAdvReqRes } from '../mock-data/extended-advance-request.data';
import { txnDataPayload } from '../mock-data/transaction.data';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingParam } from '../models/sorting-param.model';

import { UtilityService } from './utility.service';

describe('UtilityService', () => {
  let utilityService: UtilityService;

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

  describe('generateRandomString():', () => {
    it('should return a string of the specified length', () => {
      const result = utilityService.generateRandomString(10);
      expect(result.length).toBe(10);
    });

    it('should return a random string', () => {
      const result1 = utilityService.generateRandomString(10);
      const result2 = utilityService.generateRandomString(10);
      expect(result1).not.toBe(result2);
    });

    it('should only contain valid characters', () => {
      const result = utilityService.generateRandomString(10);
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < result.length; i++) {
        expect(characters).toContain(result[i]);
      }
    });

    it('should return an empty string when length is 0', () => {
      const result = utilityService.generateRandomString(0);
      expect(result).toBe('');
    });

    it('should return an empty string when length is negative', () => {
      const result = utilityService.generateRandomString(-1);
      expect(result).toBe('');
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

    it('should sort advances by approval date', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue(allAdvanceRequestsRes.data);
      expect(utilityService.sortAllAdvances(1, SortingParam.approvalDate, allAdvanceRequestsRes.data)).toEqual(
        allAdvanceRequestsRes.data
      );
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(allAdvanceRequestsRes.data);
    });

    it('should sort advances by project', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue(allAdvanceRequestsRes.data);
      expect(
        utilityService.sortAllAdvances(SortingDirection.ascending, SortingParam.project, allAdvanceRequestsRes.data)
      ).toEqual(allAdvanceRequestsRes.data);
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

  it('should return 1 if sortingValue1 is greater than sortingValue2 and sortDir is ascending', () => {
    const sortingValue1 = 'project1';
    const sortingValue2 = 'project2';
    const sortDir = SortingDirection.ascending;
    const sortingParam = SortingParam.project;
    // @ts-ignore
    expect(utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam)).toBe(1);
  });

  it('should return -1 if sortingValue1 is greater than sortingValue2 and sortDir is descending', () => {
    const sortingValue1 = dayjs('2022-02-02');
    const sortingValue2 = dayjs('2022-02-01');
    const sortDir = SortingDirection.descending;
    const sortingParam = SortingParam.creationDate;
    // @ts-ignore
    expect(utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam)).toBe(-1);
  });

  it('should handle default sort if sortingValue1 and sortingValue2 are null', () => {
    const sortingValue1 = null;
    const sortingValue2 = null;
    const sortDir = SortingDirection.ascending;
    const sortingParam = SortingParam.creationDate;
    // @ts-ignore
    spyOn(utilityService, 'handleDefaultSort').and.returnValue(null);
    // @ts-ignore
    utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
    // @ts-ignore
    expect(utilityService.handleDefaultSort).toHaveBeenCalledWith(sortingValue1, sortingValue2, sortingParam);
  });
});
