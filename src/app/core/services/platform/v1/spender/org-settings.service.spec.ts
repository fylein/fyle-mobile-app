import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  AccountingExportSettings,
  IncomingAccountObject,
  OrgSettings,
  OrgSettingsResponse,
} from 'src/app/core/models/org-settings.model';
import { SpenderService } from './spender.service';
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
  orgSettingsAmexFeedDataRequest,
  orgSettingsAmexFeedDataResponse,
} from 'src/app/core/test-data/org-settings.service.spec.data';

import { PlatformOrgSettingsService } from './org-settings.service';
import { cloneDeep } from 'lodash';
import { TranslocoService } from '@jsverse/transloco';
import { DateService } from '../shared/date.service';

const getApiData: OrgSettings = orgSettingsGetData;
const postApiData: OrgSettingsResponse = orgSettingsPostData;
const incomingTallyAccountObject: IncomingAccountObject = incomingTallyAccoutingObj;
const incomingQuickBooksAccountObject: IncomingAccountObject = incomingQuickbooksAccoutingObj;
const incomingAccountSettingsObject: IncomingAccountObject = incomingAccountSettingsObj;
const outgoingTallyAccountObject: AccountingExportSettings = outgoingTallyAccountObj;
const outgoingQuickbooksAccountObject: AccountingExportSettings = outgoingQuickbooksAccountObj;
const outgoingAccountSettingsObject: AccountingExportSettings = outgoingAccountSettingsObj;
const incomingAccountingObject: IncomingAccountObject = incomingAccountingObj;

describe('PlatformOrgSettingsService', () => {
  let orgSettingsService: PlatformOrgSettingsService;
  let apiService: jasmine.SpyObj<SpenderService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  let dateService: jasmine.SpyObj<DateService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['fixDates']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.orgSettings.currencyLayer': 'Currency Layer',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PlatformOrgSettingsService,
        {
          provide: SpenderService,
          useValue: spenderServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
      ],
    });
    orgSettingsService = TestBed.inject(PlatformOrgSettingsService);
    apiService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
  });

  it('should be created', () => {
    expect(orgSettingsService).toBeTruthy();
  });

  it('should be able to get the org settings properly', (done) => {
    apiService.get.and.returnValue(of({ data: cloneDeep(postApiData) }));
    orgSettingsService.get().subscribe((res) => {
      const expected = {
        ...getApiData,
        auto_report_submission_settings: {
          expense_grouping_dimensions: [],
        },
      };
      expect(res).toEqual(expected);
      done();
    });
  });

  it('should be able to get incoming tally account object', () => {
    const mockAccountingObject = cloneDeep(outgoingTallyAccountObject);
    expect(orgSettingsService.getIncomingAccountingObject(mockAccountingObject)).toEqual(incomingTallyAccountObject);
  });

  it('should be able to get incoming quick books account object', () => {
    const mockAccountingObject = cloneDeep(outgoingQuickbooksAccountObject);
    expect(orgSettingsService.getIncomingAccountingObject(mockAccountingObject)).toEqual(
      incomingQuickBooksAccountObject,
    );
  });

  it('should be able to get incoming account settings object', () => {
    expect(orgSettingsService.getIncomingAccountingObject(outgoingAccountSettingsObject)).toEqual(
      incomingAccountSettingsObject,
    );
  });

  it('should be able to get incoming accounting object when accounting export is passed as null', () => {
    expect(orgSettingsService.getIncomingAccountingObject(null)).toEqual(incomingAccountingObject);
  });

  xit('should be able to get the org settings properly for undefined amex feed enrollment values', (done) => {
    apiService.get.and.returnValue(of(orgSettingsAmexFeedDataRequest));
    orgSettingsService.get().subscribe((res) => {
      expect(res).toEqual(orgSettingsAmexFeedDataResponse);
      done();
    });
  });
});
