import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { CostCentersService } from './cost-centers.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { OrgUserService } from './org-user.service';
import {
  orgUserSettingsData,
  orgUserSettingsData2,
  orgUserSettingsDataWoCCIDs,
} from '../mock-data/org-user-settings.data';
import { currentEouUnflatted } from '../test-data/org-user.service.spec.data';
import { emailEvents } from '../mock-data/email-events.data';
import { notificationEventsData, notificationEventsData3 } from '../mock-data/notification-events.data';
import { costCentersData2, costCentersData3 } from '../mock-data/cost-centers.data';
import { cloneDeep } from 'lodash';
import { TranslocoService } from '@jsverse/transloco';
describe('OrgUserSettingsService', () => {
  let orgUserSettingsService: OrgUserSettingsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let costCentersService: jasmine.SpyObj<CostCentersService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['getUserById']);
    const costCentersServiceSpy = jasmine.createSpyObj('CostCentersService', ['getAllActive']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.orgUserSettings.expensesAndReports': 'Expenses and reports',
        'services.orgUserSettings.advances': 'Advances',
        'services.orgUserSettings.expenseCreatedViaEmail': 'When an expense is created via email',
        'services.orgUserSettings.reportSubmitted': 'On submission of expense report',
        'services.orgUserSettings.commentOnExpense': 'When a comment is left on an expense',
        'services.orgUserSettings.commentOnReport': 'When a comment is left on a report',
        'services.orgUserSettings.expenseRemoved': 'When an expense is removed',
        'services.orgUserSettings.expenseEditedByOther': 'When an expense is edited by someone else',
        'services.orgUserSettings.reportSentBack': 'When a reported expense is sent back',
        'services.orgUserSettings.reportApproved': 'When a report is approved',
        'services.orgUserSettings.reimbursementDone': 'When a reimbursement is done',
        'services.orgUserSettings.advanceRequestSubmitted': 'When an advance request is submitted',
        'services.orgUserSettings.advanceRequestUpdated': 'When an advance request is updated',
        'services.orgUserSettings.advanceRequestSentBack': 'When an advance request is sent back',
        'services.orgUserSettings.advanceRequestApproved': 'When an advance request is approved',
        'services.orgUserSettings.advanceAssigned': 'When an advance is assigned',
        'services.orgUserSettings.advanceRequestRejected': 'When an advance request is rejected',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        OrgUserSettingsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
        {
          provide: CostCentersService,
          useValue: costCentersServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });

    orgUserSettingsService = TestBed.inject(OrgUserSettingsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    costCentersService = TestBed.inject(CostCentersService) as jasmine.SpyObj<CostCentersService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(orgUserSettingsService).toBeTruthy();
  });

  it("get(): should get user's org settings", (done) => {
    apiService.get.and.returnValue(of(orgUserSettingsData));

    orgUserSettingsService.get().subscribe((res) => {
      expect(res).toEqual(orgUserSettingsData);
      expect(apiService.get).toHaveBeenCalledOnceWith('/org_user_settings');
      done();
    });
  });

  it('post(): should send new org user settings', (done) => {
    apiService.post.and.returnValue(of(null));

    orgUserSettingsService.post(orgUserSettingsData).subscribe(() => {
      expect(apiService.post).toHaveBeenCalledOnceWith('/org_user_settings', orgUserSettingsData);
      done();
    });
  });

  it('getAllowedPaymentModes(): should get allowed payment modes', (done) => {
    spyOn(orgUserSettingsService, 'get').and.returnValue(of(orgUserSettingsData));

    orgUserSettingsService.getAllowedPaymentModes().subscribe((res) => {
      expect(res).toEqual(orgUserSettingsData.payment_mode_settings.allowed_payment_modes);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('clearOrgUserSettings(): should clear org user settings', (done) => {
    orgUserSettingsService.clearOrgUserSettings().subscribe((res) => {
      expect(res).toBeNull();
      done();
    });
  });

  it('getEmailEvents(): should get email events', () => {
    expect(orgUserSettingsService.getEmailEvents()).toEqual(emailEvents);
  });

  it('getNotificationEvents(): should get notification events', (done) => {
    orgUserSettingsService.getNotificationEvents().subscribe((res) => {
      expect(res).toEqual(cloneDeep(notificationEventsData3));
      done();
    });
  });

  it("getUserSettings(): should get user's settings", (done) => {
    apiService.get.and.returnValue(of(orgUserSettingsData2));

    const userID = 'ousS9MgDNQ6NB';

    orgUserSettingsService.getUserSettings(userID).subscribe((res) => {
      expect(res).toEqual(orgUserSettingsData2);
      expect(apiService.get).toHaveBeenCalledOnceWith(`/org_user_settings/${userID}`);
      done();
    });
  });

  it("getOrgUserSettingsById(): should get user's org settings from ID", (done) => {
    const userId = 'ouX8dwsbLCLv';
    orgUserService.getUserById.and.returnValue(of(currentEouUnflatted));
    spyOn(orgUserSettingsService, 'getUserSettings').and.returnValue(of(orgUserSettingsData));

    orgUserSettingsService.getOrgUserSettingsById(currentEouUnflatted.ou_id).subscribe((res) => {
      expect(res).toEqual(orgUserSettingsData);
      expect(orgUserService.getUserById).toHaveBeenCalledOnceWith(userId);
      expect(orgUserSettingsService.getUserSettings).toHaveBeenCalledOnceWith(currentEouUnflatted.ou_settings_id);
      done();
    });
  });

  describe('getAllowedCostCenters()', () => {
    it('should get the allowed cost-centers specific for a user', (done) => {
      costCentersService.getAllActive.and.returnValue(of(costCentersData2));

      orgUserSettingsService.getAllowedCostCenters(orgUserSettingsData).subscribe((res) => {
        expect(res).toEqual(costCentersData2);
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should get the allowed cost-centers', (done) => {
      costCentersService.getAllActive.and.returnValue(of(costCentersData3));

      orgUserSettingsService.getAllowedCostCenters(orgUserSettingsDataWoCCIDs).subscribe((res) => {
        expect(res).toEqual(costCentersData3);
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('getAllowedCostCentersByOuId(): should get allowed cost centers by org-user ID', (done) => {
    const userId = 'ousS9MgDNQ6NB';
    spyOn(orgUserSettingsService, 'getOrgUserSettingsById').and.returnValue(of(orgUserSettingsData));
    spyOn(orgUserSettingsService, 'getAllowedCostCenters').and.returnValue(of(costCentersData2));

    orgUserSettingsService.getAllowedCostCentersByOuId(userId).subscribe((res) => {
      expect(res).toEqual(costCentersData2);
      expect(orgUserSettingsService.getOrgUserSettingsById).toHaveBeenCalledOnceWith(userId);
      expect(orgUserSettingsService.getAllowedCostCenters).toHaveBeenCalledOnceWith(orgUserSettingsData, {
        isUserSpecific: true,
      });
      done();
    });
  });
});
