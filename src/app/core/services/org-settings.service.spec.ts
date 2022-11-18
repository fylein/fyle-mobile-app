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
  outgoingAccountingObj,
  incomingTallyAccountingObjWithoutSettings,
  incomingQuickbooksAccountingObjWithoutSettings,
} from '../models/test-data/org-settings-data';

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
const outgoingAccountingObject: AccountingExportSettings = outgoingAccountingObj;
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
      expect(res).toBeTruthy(postApiData);
      done();
    });
  });

  it('should be able to update the org settings properly', (done) => {
    apiService.post.and.returnValue(of(postApiData));
    orgSettingsService.post(getApiData).subscribe((res) => {
      expect(res).toBeTruthy(postApiData);
      done();
    });
  });

  it('should be able to get incoming tally account object', () => {
    expect(orgSettingsService.getIncomingAccountingObject(outgoingTallyAccountObject)).toBeTruthy(
      incomingTallyAccountObject
    );
  });

  it('should be able to set outgoing tally account object', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingTallyAccountObject)).toBeTruthy(
      outgoingTallyAccountObject
    );
  });

  it('should be able to get incoming quick books account object', () => {
    expect(orgSettingsService.getIncomingAccountingObject(outgoingQuickbooksAccountObject)).toBeTruthy(
      incomingQuickBooksAccountObject
    );
  });

  it('should be able to set outgoing quickbooks account object', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingQuickBooksAccountObject)).toBeTruthy(
      outgoingQuickbooksAccountObject
    );
  });

  it('should be able to get incoming account settings object', () => {
    expect(orgSettingsService.getIncomingAccountingObject(outgoingAccountSettingsObject)).toBeTruthy(
      incomingAccountSettingsObject
    );
  });

  it('should be able to set outgoing account settings object', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingAccountSettingsObject)).toBeTruthy(
      outgoingAccountSettingsObject
    );
  });

  it('should be able to get incoming accounting object when accounting export is passed as null', () => {
    expect(orgSettingsService.getIncomingAccountingObject(null)).toBeTruthy(incomingAccountingObject);
  });

  it('should be able to set outgoing taly accounting object with empty settings', () => {
    expect(orgSettingsService.setOutgoingAccountingObject(incomingTallyAccountingObjectWithoutSettings)).toBeTruthy(
      outgoingAccountingObject
    );
  });

  it('should be able to set outgoing quickbooks accounting object with empty settings', () => {
    expect(
      orgSettingsService.setOutgoingAccountingObject(incomingQuickbooksAccountingObjectWithoutSettings)
    ).toBeTruthy(outgoingAccountingObject);
  });
});
