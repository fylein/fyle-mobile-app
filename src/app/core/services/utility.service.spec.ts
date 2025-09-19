import { TestBed, fakeAsync } from '@angular/core/testing';
import dayjs from 'dayjs';
import * as lodash from 'lodash';
import { customFieldData1, customFieldData2 } from '../mock-data/custom-field.data';
import {
  allAdvanceRequestsRes,
  publicAdvanceRequestRes,
  singleExtendedAdvReqRes,
} from '../mock-data/extended-advance-request.data';
import { txnDataPayload } from '../mock-data/transaction.data';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingParam } from '../models/sorting-param.model';

import { UtilityService } from './utility.service';
import { cloneDeep } from 'lodash';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { FeatureConfigService } from './platform/v1/spender/feature-config.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { featureConfigOptInData } from '../mock-data/feature-config.data';

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
      authService.getEou.and.resolveTo(mockEou);
      featureConfigService.getConfiguration.and.throwError(error);

      utilityService.canShowOptInModal(featureConfig).subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
    });
  });
});
