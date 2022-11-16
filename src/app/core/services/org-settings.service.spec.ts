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
} from '../models/test-data/org-settings-data';

import { OrgSettingsService } from './org-settings.service';

const getApiData: OrgSettings = orgSettingsGetData;
const postApiData: OrgSettingsResponse = orgSettingsPostData;
const incomingTallyAccountObject: IncomingAccountObject = incomingTallyAccoutingObj;
const incomingQuickBooksAccountObject: IncomingAccountObject = incomingQuickbooksAccoutingObj;
const incomingAccountSettingsObject: IncomingAccountObject = incomingAccountSettingsObj;
const outgoingTallyAccountObject: AccountingExportSettings = outgoingTallyAccountObj;
const outgoingQuickbooksAccountObject: AccountingExportSettings = outgoingQuickbooksAccountObj;
const outgoingAccountSettingsObject: AccountingExportSettings = outgoingQuickbooksAccountObj;

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
    apiService.get.and.returnValue(of(getApiData));
    orgSettingsService.get().subscribe((res) => {
      expect(res).toBeTruthy(getApiData);
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
});
