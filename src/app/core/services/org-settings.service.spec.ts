import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  AccountingExportSettings,
  IncomingAccountObject,
  OrgSettings,
  OrgSettingsResponse,
} from '../models/org-settings.model';
import { ApiService } from './api.service';
import {
  orgSettingsGetData,
  incomingQuickbooksAccoutingObj,
  incomingTallyAccoutingObj,
  outgoingQuickbooksAccountObj,
  outgoingTallyAccountObj,
  orgSettingsPostData,
  incomingAccountSettingsObj,
  outgoingAccountSettingsObj,
  incomingAccountingObj,
  incomingTallyAccountingObjWithoutSettings,
  incomingQuickbooksAccountingObjWithoutSettings,
  outgoingAccountingQuickbooksObjWithoutSettings,
  outgoingAccountingTallyObjWithoutSettings,
  orgSettingsAmexFeedDataRequest,
  orgSettingsAmexFeedDataResponse,
} from '../test-data/org-settings.service.spec.data';

import { OrgSettingsService } from './org-settings.service';
import { cloneDeep } from 'lodash';
import { TranslocoService } from '@jsverse/transloco';

const getApiData: OrgSettings = orgSettingsGetData;
const postApiData: OrgSettingsResponse = orgSettingsPostData;
const incomingTallyAccountObject: IncomingAccountObject = incomingTallyAccoutingObj;
const incomingQuickBooksAccountObject: IncomingAccountObject = incomingQuickbooksAccoutingObj;
const incomingAccountSettingsObject: IncomingAccountObject = incomingAccountSettingsObj;
const outgoingTallyAccountObject: AccountingExportSettings = outgoingTallyAccountObj;
const outgoingQuickbooksAccountObject: AccountingExportSettings = outgoingQuickbooksAccountObj;
const outgoingAccountSettingsObject: AccountingExportSettings = outgoingAccountSettingsObj;
const incomingAccountingObject: IncomingAccountObject = incomingAccountingObj;
const outgoingAccountingTallyObjectWithoutSettings: AccountingExportSettings =
  outgoingAccountingTallyObjWithoutSettings;
const outgoingAccountingQuickbooksObjectWithoutSettings: AccountingExportSettings =
  outgoingAccountingQuickbooksObjWithoutSettings;
const incomingTallyAccountingObjectWithoutSettings: IncomingAccountObject = incomingTallyAccountingObjWithoutSettings;
const incomingQuickbooksAccountingObjectWithoutSettings: IncomingAccountObject =
  incomingQuickbooksAccountingObjWithoutSettings;

describe('OrgSettingsService', () => {
  let orgSettingsService: OrgSettingsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.orgSettings.currencyLayer': 'Currency Layer',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        OrgSettingsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    orgSettingsService = TestBed.inject(OrgSettingsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(orgSettingsService).toBeTruthy();
  });

  it('should be able to get the org settings properly', (done) => {
    const mockApiResponse = cloneDeep(postApiData);
    apiService.get.and.returnValue(of(mockApiResponse));
    orgSettingsService.get().subscribe((res) => {
      expect(res).toEqual(getApiData);
      done();
    });
  });

  it('should be able to update the org settings properly', (done) => {
    apiService.post.and.returnValue(of(postApiData));
    orgSettingsService.post(getApiData).subscribe((res) => {
      expect(res).toEqual(postApiData);
      done();
    });
  });

  it('should be able to get incoming tally account object', () => {
    const mockAccountingObject = cloneDeep(outgoingTallyAccountObject);
    expect(orgSettingsService.getIncomingAccountingObject(mockAccountingObject)).toEqual(incomingTallyAccountObject);
  });

  it('should be able to set outgoing tally account object', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingTallyAccountObject)).toEqual(
      outgoingTallyAccountObject
    );
  });

  it('should be able to get incoming quick books account object', () => {
    const mockAccountingObject = cloneDeep(outgoingQuickbooksAccountObject);
    expect(orgSettingsService.getIncomingAccountingObject(mockAccountingObject)).toEqual(
      incomingQuickBooksAccountObject
    );
  });

  it('should be able to set outgoing quickbooks account object', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingQuickBooksAccountObject)).toEqual(
      outgoingQuickbooksAccountObject
    );
  });

  it('should be able to get incoming account settings object', () => {
    expect(orgSettingsService.getIncomingAccountingObject(outgoingAccountSettingsObject)).toEqual(
      incomingAccountSettingsObject
    );
  });

  it('should be able to set outgoing account settings object', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingAccountSettingsObject)).toEqual(
      outgoingAccountSettingsObject
    );
  });

  it('should be able to get incoming accounting object when accounting export is passed as null', () => {
    expect(orgSettingsService.getIncomingAccountingObject(null)).toEqual(incomingAccountingObject);
  });

  it('should be able to set outgoing tally accounting object with empty settings', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingTallyAccountingObjectWithoutSettings)).toEqual(
      outgoingAccountingTallyObjectWithoutSettings
    );
  });

  it('should be able to set outgoing quickbooks accounting object with empty settings', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingQuickbooksAccountingObjectWithoutSettings)).toEqual(
      outgoingAccountingQuickbooksObjectWithoutSettings
    );
  });

  xit('should be able to get the org settings properly for undefined amex feed enrollment values', (done) => {
    apiService.get.and.returnValue(of(orgSettingsAmexFeedDataRequest));
    orgSettingsService.get().subscribe((res) => {
      expect(res).toEqual(orgSettingsAmexFeedDataResponse);
      done();
    });
  });
});
