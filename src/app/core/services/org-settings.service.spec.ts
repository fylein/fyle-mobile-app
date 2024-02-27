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

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        OrgSettingsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
      ],
    });
    orgSettingsService = TestBed.inject(OrgSettingsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(orgSettingsService).toBeTruthy();
  });

  it('should be able to get the org settings properly', (done) => {
    apiService.get.and.returnValue(of(postApiData));
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
    expect(orgSettingsService.getIncomingAccountingObject(outgoingTallyAccountObject)).toEqual(
      incomingTallyAccountObject
    );
  });

  it('should be able to set outgoing tally account object', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingTallyAccountObject)).toEqual(
      outgoingTallyAccountObject
    );
  });

  it('should be able to get incoming quick books account object', () => {
    expect(orgSettingsService.getIncomingAccountingObject(outgoingQuickbooksAccountObject)).toEqual(
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

  it('should be able to get the org settings properly for undefined amex feed enrollment values', (done) => {
    apiService.get.and.returnValue(of(orgSettingsAmexFeedDataRequest));
    orgSettingsService.get().subscribe((res) => {
      expect(res).toEqual(orgSettingsAmexFeedDataResponse);
      done();
    });
  });
});
