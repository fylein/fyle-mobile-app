import { TestBed } from '@angular/core/testing';
import dayjs from 'dayjs';
import * as lodash from 'lodash';
import { customFieldData1, customFieldData2 } from '../mock-data/custom-field.data';
import {
  publicAdvanceRequestRes,
} from '../mock-data/extended-advance-request.data';
import { txnDataPayload } from '../mock-data/transaction.data';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingParam } from '../models/sorting-param.model';
import { Transaction } from '../models/v1/transaction.model';

import { UtilityService } from './utility.service';
import { cloneDeep } from 'lodash';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { FeatureConfigService } from './platform/v1/spender/feature-config.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { featureConfigOptInData } from '../mock-data/feature-config.data';
import { txnCustomPropertiesData } from '../mock-data/txn-custom-properties.data';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';

describe('UtilityService', () => {
  let utilityService: UtilityService;
  let tokenService: jasmine.SpyObj<TokenService>;
  let authService: jasmine.SpyObj<AuthService>;
  let featureConfigService: jasmine.SpyObj<FeatureConfigService>;

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const featureConfigServiceSpy = jasmine.createSpyObj('FeatureConfigService', ['getConfiguration']);

    TestBed.configureTestingModule({
      providers: [
        UtilityService,
        {
          provide: TokenService,
          useValue: tokenServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: FeatureConfigService,
          useValue: featureConfigServiceSpy,
        },
      ],
    });
    utilityService = TestBed.inject(UtilityService);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    featureConfigService = TestBed.inject(FeatureConfigService) as jasmine.SpyObj<FeatureConfigService>;
  });

  it('should be created', () => {
    expect(utilityService).toBeTruthy();
  });

  it('should discard null characters', () => {
    const mockStr = 'Fyle\u0000 Expense!\u0000';
    expect(utilityService.discardNullChar(mockStr)).toEqual(
      mockStr.replace(/[\u0000][\u0008-\u0009][\u000A-\u000C][\u005C]/g, ''),
    );
  });

  describe('refineNestedObject():', () => {
    it('should return the nested object when the custom field type is number, string etc', () => {
      const mockCustomField = cloneDeep(customFieldData1);
      expect(utilityService.refineNestedObject(mockCustomField)).toEqual(customFieldData1);
    });

    it('should return the nested object when the custom field type is select', () => {
      spyOn(utilityService, 'discardNullChar').and.returnValue('select-1');
      const mockCustomFieldData = cloneDeep(customFieldData2);
      expect(utilityService.refineNestedObject(mockCustomFieldData)).toEqual(customFieldData2);
      expect(utilityService.discardNullChar).toHaveBeenCalledOnceWith('select-1');
    });

    it('should discard null characters when custom field type is TEXT and value is a string', () => {
      spyOn(utilityService, 'discardNullChar').and.returnValue('cleaned-text');
      const mockCustomField = [
        {
          id: 1,
          name: 'text_field',
          type: 'TEXT',
          value: 'text\u0000with\u0000null',
        },
      ];
      const result = utilityService.refineNestedObject(mockCustomField);
      expect(utilityService.discardNullChar).toHaveBeenCalledWith('text\u0000with\u0000null');
      expect(result[0].value).toBe('cleaned-text');
    });

    it('should not process fields with null or undefined values', () => {
      const mockCustomField = [
        {
          id: 1,
          name: 'text_field',
          type: 'TEXT',
          value: null,
        },
        {
          id: 2,
          name: 'select_field',
          type: 'SELECT',
          value: undefined,
        },
      ];
      spyOn(utilityService, 'discardNullChar');
      const result = utilityService.refineNestedObject(mockCustomField);
      expect(utilityService.discardNullChar).not.toHaveBeenCalled();
      expect(result[0].value).toBeNull();
      expect(result[1].value).toBeUndefined();
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

    it('should not process fields not in fieldsToCheck', () => {
      const data = { purpose: 'test\u0000', otherField: 'test\u0000' } as Partial<Transaction>;
      const fieldsToCheck = ['purpose'];
      spyOn(utilityService, 'discardNullChar').and.callFake((str) => str.replace(/\u0000/g, ''));
      const result = utilityService.discardRedundantCharacters(data, fieldsToCheck);
      expect(utilityService.discardNullChar).toHaveBeenCalledWith('test\u0000');
      expect(result.purpose).toBe('test');
      expect((result as { otherField?: string }).otherField).toBe('test\u0000');
    });

    it('should handle null or undefined field values', () => {
      const data = { purpose: null, vendor: undefined };
      const fieldsToCheck = ['purpose', 'vendor'];
      spyOn(utilityService, 'discardNullChar');
      const result = utilityService.discardRedundantCharacters(data, fieldsToCheck);
      expect(utilityService.discardNullChar).not.toHaveBeenCalled();
      expect(result.purpose).toBeNull();
      expect(result.vendor).toBeUndefined();
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
      spyOn(lodash, 'cloneDeep').and.returnValue(publicAdvanceRequestRes.data);
      expect(utilityService.sortAllAdvances(0, SortingParam.creationDate, publicAdvanceRequestRes.data)).toEqual(
        publicAdvanceRequestRes.data,
      );
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(publicAdvanceRequestRes.data);
    });

    it('should sort multiple advances', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue(publicAdvanceRequestRes.data);
      expect(utilityService.sortAllAdvances(1, SortingParam.creationDate, publicAdvanceRequestRes.data)).toEqual(
        publicAdvanceRequestRes.data,
      );
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(publicAdvanceRequestRes.data);
    });

    it('should sort advances by approval date', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue(publicAdvanceRequestRes.data);
      expect(utilityService.sortAllAdvances(1, SortingParam.approvalDate, publicAdvanceRequestRes.data)).toEqual(
        publicAdvanceRequestRes.data,
      );
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(publicAdvanceRequestRes.data);
    });

    it('should sort advances by project', () => {
      spyOn(lodash, 'cloneDeep').and.returnValue(publicAdvanceRequestRes.data);
      expect(
        utilityService.sortAllAdvances(SortingDirection.ascending, SortingParam.project, publicAdvanceRequestRes.data),
      ).toEqual(publicAdvanceRequestRes.data);
      expect(lodash.cloneDeep).toHaveBeenCalledOnceWith(publicAdvanceRequestRes.data);
    });
  });

  it('getEmailsFromString(): should return emails from a string', () => {
    const mockStr = 'Expense approved by dimple.kh@fyle.in';
    expect(utilityService.getEmailsFromString(mockStr)).toEqual(['dimple.kh@fyle.in']);
  });

  it('getAmountWithCurrencyFromString(): should return amount with currency from a string', () => {
    const mockStr = 'Expense will be capped to USD 100';
    expect(utilityService.getAmountWithCurrencyFromString(mockStr)).toEqual(
      mockStr.match(/capped to ([a-zA-Z]{1,3} \d+)/i),
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

  describe('isUserFromINCluster():', () => {
    it('should return true if user is from IN cluster', async () => {
      tokenService.getClusterDomain.and.resolveTo('in1.fylehq.com');
      const result = await utilityService.isUserFromINCluster();
      expect(result).toBeTrue();
    });

    it('should return false if user is not from IN cluster', async () => {
      tokenService.getClusterDomain.and.resolveTo('us1.fylehq.com');
      const result = await utilityService.isUserFromINCluster();
      expect(result).toBeFalse();
    });
  });

  it('canShowOptInAfterAddingCard(): should return canShowOptInAfterAddingCard$ as boolean value', () => {
    utilityService.canShowOptInAfterAddingCard$ = new BehaviorSubject<boolean>(true);

    const canShowOptIn = utilityService.canShowOptInAfterAddingCard();

    expect(canShowOptIn).toBeTrue();
  });

  it('toggleShowOptInAfterAddingCard(): should change the value of canShowOptInAfterAddingCard$', () => {
    utilityService.canShowOptInAfterAddingCard$ = new BehaviorSubject<boolean>(true);

    utilityService.toggleShowOptInAfterAddingCard(false);

    expect(utilityService.canShowOptInAfterAddingCard$.value).toBeFalse();
  });

  it('canShowOptInAfterExpenseCreation(): should return canShowOptInAfterExpenseCreation$ as boolean value', () => {
    utilityService.canShowOptInAfterExpenseCreation$ = new BehaviorSubject<boolean>(true);

    const canShowOptIn = utilityService.canShowOptInAfterExpenseCreation();

    expect(canShowOptIn).toBeTrue();
  });

  it('toggleShowOptInAfterExpenseCreation(): should change the value of canShowOptInAfterExpenseCreation$', () => {
    utilityService.canShowOptInAfterExpenseCreation$ = new BehaviorSubject<boolean>(true);

    utilityService.toggleShowOptInAfterExpenseCreation(false);

    expect(utilityService.canShowOptInAfterExpenseCreation$.value).toBeFalse();
  });

  describe('canShowOptInModal():', () => {
    beforeEach(() => {
      authService.getEou.and.resolveTo(apiEouRes);
    });

    it('should return false if user is present in IN cluster', (done) => {
      const featureConfig = {
        feature: 'OPT_IN',
        key: 'SHOW_OPT_IN_AFTER_ADDING_CARD',
      };
      spyOn(utilityService, 'isUserFromINCluster').and.resolveTo(true);

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false if org has currency other than USD or CAD', (done) => {
      const featureConfig = {
        feature: 'OPT_IN',
        key: 'SHOW_OPT_IN_AFTER_ADDING_CARD',
      };
      spyOn(utilityService, 'isUserFromINCluster').and.resolveTo(false);
      const mockEou = cloneDeep(apiEouRes);
      mockEou.org.currency = 'INR';
      authService.getEou.and.resolveTo(mockEou);

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false if number is added but does not contain +1 at start', (done) => {
      const featureConfig = {
        feature: 'OPT_IN',
        key: 'SHOW_OPT_IN_AFTER_ADDING_CARD',
      };
      spyOn(utilityService, 'isUserFromINCluster').and.resolveTo(false);
      const mockEou = cloneDeep(apiEouRes);
      mockEou.ou.mobile = '+911234567890';
      authService.getEou.and.resolveTo(mockEou);

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should check feature config and return true if count shown is 0', (done) => {
      const featureConfig = {
        feature: 'OPT_IN',
        key: 'SHOW_OPT_IN_AFTER_ADDING_CARD',
      };
      spyOn(utilityService, 'isUserFromINCluster').and.resolveTo(false);
      const mockEou = cloneDeep(apiEouRes);
      mockEou.ou.mobile = '+11234567890';
      mockEou.org.currency = 'USD';
      authService.getEou.and.resolveTo(mockEou);
      featureConfigService.getConfiguration.and.returnValue(of(featureConfigOptInData));

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should check feature config and return true if value is null', (done) => {
      const featureConfig = {
        feature: 'OPT_IN',
        key: 'SHOW_OPT_IN_AFTER_ADDING_CARD',
      };
      spyOn(utilityService, 'isUserFromINCluster').and.resolveTo(false);
      const mockEou = cloneDeep(apiEouRes);
      mockEou.ou.mobile = '+11234567890';
      mockEou.org.currency = 'USD';
      authService.getEou.and.resolveTo(mockEou);
      const mockFeatureConfig = cloneDeep(featureConfigOptInData);
      mockFeatureConfig.value = null;
      featureConfigService.getConfiguration.and.returnValue(of(mockFeatureConfig));

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should check feature config and return true if API returns undefined', (done) => {
      const featureConfig = {
        feature: 'OPT_IN',
        key: 'SHOW_OPT_IN_AFTER_ADDING_CARD',
      };
      spyOn(utilityService, 'isUserFromINCluster').and.resolveTo(false);
      const mockEou = cloneDeep(apiEouRes);
      mockEou.ou.mobile = '+11234567890';
      mockEou.org.currency = 'USD';
      authService.getEou.and.resolveTo(mockEou);
      featureConfigService.getConfiguration.and.returnValue(of(undefined));

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
    });

    it('should return false if API call fails', (done) => {
      const error = new Error('unhandledError');
      const featureConfig = {
        feature: 'OPT_IN',
        key: 'SHOW_OPT_IN_AFTER_ADDING_CARD',
      };
      spyOn(utilityService, 'isUserFromINCluster').and.resolveTo(false);
      const mockEou = cloneDeep(apiEouRes);
      mockEou.ou.mobile = '+11234567890';
      mockEou.org.currency = 'USD';
      authService.getEou.and.resolveTo(mockEou);
      featureConfigService.getConfiguration.and.throwError(error);

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should return false if mobile_verified is true', (done) => {
      const featureConfig = {
        feature: 'OPT_IN',
        key: 'SHOW_OPT_IN_AFTER_ADDING_CARD',
      };
      spyOn(utilityService, 'isUserFromINCluster').and.resolveTo(false);
      const mockEou = cloneDeep(apiEouRes);
      mockEou.ou.mobile_verified = true;
      mockEou.ou.mobile = '+11234567890';
      mockEou.org.currency = 'USD';
      authService.getEou.and.resolveTo(mockEou);

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });
  });

  describe('searchArrayStream():', () => {
    it('should filter items by search text', (done) => {
      const items = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' },
      ];
      const searchText = 'app';

      of(items)
        .pipe(utilityService.searchArrayStream(searchText))
        .subscribe((result) => {
          expect(result.length).toBe(1);
          expect(result[0].label).toBe('Apple');
          done();
        });
    });

    it('should return all items when search text is empty', (done) => {
      const items = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ];

      of(items)
        .pipe(utilityService.searchArrayStream(''))
        .subscribe((result) => {
          expect(result.length).toBe(2);
          done();
        });
    });

    it('should return all items when search text is not provided', (done) => {
      const items = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ];

      of(items)
        .pipe(utilityService.searchArrayStream(null as unknown as string))
        .subscribe((result) => {
          expect(result.length).toBe(2);
          done();
        });
    });

    it('should filter case-insensitively', (done) => {
      const items = [
        { label: 'Apple', value: 'apple' },
        { label: 'BANANA', value: 'banana' },
      ];

      of(items)
        .pipe(utilityService.searchArrayStream('ban'))
        .subscribe((result) => {
          expect(result.length).toBe(1);
          expect(result[0].label).toBe('BANANA');
          done();
        });
    });

    it('should exclude items with null or empty labels', (done) => {
      const items = [
        { label: 'Apple', value: 'apple' },
        { label: '', value: 'empty' },
        { label: null as unknown as string, value: 'null' },
      ];

      of(items)
        .pipe(utilityService.searchArrayStream('app'))
        .subscribe((result) => {
          expect(result.length).toBe(1);
          expect(result[0].label).toBe('Apple');
          done();
        });
    });
  });

  describe('traverse():', () => {
    it('should traverse an array and apply callback to each element', () => {
      const callback = jasmine.createSpy('callback').and.callFake((x) => x);
      const array = cloneDeep(txnCustomPropertiesData.slice(0, 2));

      const result = utilityService.traverse(array, callback);

      expect(callback).toHaveBeenCalled();
      expect(Array.isArray(result)).toBeTrue();
    });

    it('should traverse an object and apply callback to each property', () => {
      const callback = jasmine.createSpy('callback').and.callFake((x) => x);
      const obj = cloneDeep(txnCustomPropertiesData[0]);

      const result = utilityService.traverse(obj, callback);

      expect(callback).toHaveBeenCalled();
      expect(typeof result).toBe('object');
    });

    it('should apply callback directly to Date objects', () => {
      const callback = jasmine.createSpy('callback').and.returnValue(new Date('2024-01-01'));
      const date = new Date('2023-01-01');

      const result = utilityService.traverse(date as unknown as TxnCustomProperties, callback);

      expect(callback).toHaveBeenCalledWith(date);
      expect(result).toEqual(new Date('2024-01-01'));
    });

    it('should handle null values', () => {
      const callback = jasmine.createSpy('callback').and.returnValue(null);
      const result = utilityService.traverse(null as unknown as TxnCustomProperties, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('traverseArray():', () => {
    it('should traverse array and apply callback recursively', () => {
      const callback = jasmine.createSpy('callback').and.callFake((x) => x);
      const array = cloneDeep(txnCustomPropertiesData.slice(0, 2));

      const result = utilityService.traverseArray(array, callback);

      expect(Array.isArray(result)).toBeTrue();
      expect(result.length).toBe(array.length);
    });

    it('should handle empty array', () => {
      const callback = jasmine.createSpy('callback');
      const result = utilityService.traverseArray([], callback);
      expect(result).toEqual([]);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('traverseObject():', () => {
    it('should traverse object and apply callback recursively', () => {
      const callback = jasmine.createSpy('callback').and.callFake((x) => x);
      const obj = cloneDeep(txnCustomPropertiesData[0]);

      const result = utilityService.traverseObject(obj, callback);

      expect(typeof result).toBe('object');
      expect(callback).toHaveBeenCalled();
    });

    it('should handle object with nested properties', () => {
      const callback = jasmine.createSpy('callback').and.callFake((x) => x);
      const obj = {
        id: 1,
        name: 'test',
        nested: {
          value: 'nested-value',
        },
      };

      const result = utilityService.traverseObject(obj as unknown as TxnCustomProperties, callback);

      expect(result).toBeDefined();
    });
  });

  describe('webPathToBase64():', () => {
    it('should convert webPath to base64 string', async () => {
      const mockBlob = new Blob(['test content'], { type: 'image/png' });
      spyOn(window, 'fetch').and.resolveTo({
        blob: () => Promise.resolve(mockBlob),
        ok: true,
      } as Response);

      const result = await utilityService.webPathToBase64('https://example.com/image.png');

      expect(result).toContain('data:');
      expect(result).toContain('base64,');
      expect(window.fetch).toHaveBeenCalledWith('https://example.com/image.png');
    });

    it('should reject on fetch error', async () => {
      const error = new Error('Fetch failed');
      spyOn(window, 'fetch').and.rejectWith(error);

      await expectAsync(utilityService.webPathToBase64('https://example.com/image.png')).toBeRejectedWith(error);
    });

    it('should reject on FileReader error', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      spyOn(window, 'fetch').and.resolveTo({
        blob: () => Promise.resolve(mockBlob),
        ok: true,
      } as Response);

      // Mock FileReader to simulate error
      const originalFileReader = window.FileReader;
      const mockFileReader = jasmine.createSpy('FileReader').and.returnValue({
        readAsDataURL: function (blob: Blob) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Read error') as unknown as ProgressEvent);
            }
          }, 0);
        },
      } as unknown as FileReader);
      (window as unknown as { FileReader: typeof FileReader }).FileReader = mockFileReader as unknown as typeof FileReader;

      try {
        await utilityService.webPathToBase64('https://example.com/image.png');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        (window as unknown as { FileReader: typeof FileReader }).FileReader = originalFileReader;
      }
    });
  });

  describe('compareSortingValues():', () => {
    it('should return 1 when sortingValue1 is greater than sortingValue2 for string ascending', () => {
      const sortingValue1 = 'zebra';
      const sortingValue2 = 'apple';
      const sortDir = SortingDirection.ascending;
      const sortingParam = SortingParam.project;
      // @ts-ignore
      const result = utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
      expect(result).toBe(1);
    });

    it('should return 1 when sortingValue1 is less than sortingValue2 for string ascending (localeCompare truthy)', () => {
      const sortingValue1 = 'apple';
      const sortingValue2 = 'zebra';
      const sortDir = SortingDirection.ascending;
      const sortingParam = SortingParam.project;
      // Implementation uses localeCompare() ? 1 : -1, so any non-zero (incl. negative) returns 1
      // @ts-ignore
      const result = utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
      expect(result).toBe(1);
    });

    it('should return -1 when sortingValue1 is greater than sortingValue2 for string descending', () => {
      const sortingValue1 = 'zebra';
      const sortingValue2 = 'apple';
      const sortDir = SortingDirection.descending;
      const sortingParam = SortingParam.project;
      // @ts-ignore
      const result = utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
      expect(result).toBe(-1);
    });

    it('should return -1 when sortingValue1 is less than sortingValue2 for string descending (localeCompare truthy)', () => {
      const sortingValue1 = 'apple';
      const sortingValue2 = 'zebra';
      const sortDir = SortingDirection.descending;
      const sortingParam = SortingParam.project;
      // Implementation uses localeCompare() ? -1 : 1, so any non-zero returns -1
      // @ts-ignore
      const result = utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
      expect(result).toBe(-1);
    });

    it('should return 1 when sortingValue1 is after sortingValue2 for dayjs ascending', () => {
      const sortingValue1 = dayjs('2022-02-02');
      const sortingValue2 = dayjs('2022-02-01');
      const sortDir = SortingDirection.ascending;
      const sortingParam = SortingParam.creationDate;
      // @ts-ignore
      const result = utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
      expect(result).toBe(1);
    });

    it('should return -1 when sortingValue1 is before sortingValue2 for dayjs ascending', () => {
      const sortingValue1 = dayjs('2022-02-01');
      const sortingValue2 = dayjs('2022-02-02');
      const sortDir = SortingDirection.ascending;
      const sortingParam = SortingParam.creationDate;
      // @ts-ignore
      const result = utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
      expect(result).toBe(-1);
    });

    it('should return 1 when sortingValue1 is before sortingValue2 for dayjs descending', () => {
      const sortingValue1 = dayjs('2022-02-01');
      const sortingValue2 = dayjs('2022-02-02');
      const sortDir = SortingDirection.descending;
      const sortingParam = SortingParam.creationDate;
      // @ts-ignore
      const result = utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
      expect(result).toBe(1);
    });

    it('should return -1 when sortingValue1 is after sortingValue2 for dayjs descending', () => {
      const sortingValue1 = dayjs('2022-02-02');
      const sortingValue2 = dayjs('2022-02-01');
      const sortDir = SortingDirection.descending;
      const sortingParam = SortingParam.creationDate;
      // @ts-ignore
      const result = utilityService.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortingParam);
      expect(result).toBe(-1);
    });
  });
});
