import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { CostCentersService } from './cost-centers.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { OrgUserService } from './org-user.service';
import { orgUserSettingsData } from '../mock-data/org-user-settings.data';
import { emailEvents } from '../mock-data/email-events.data';
import { notificationEventsData } from '../mock-data/notification-events.data';

describe('OrgUserSettingsService', () => {
  let orgUserSettingsService: OrgUserSettingsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let costCentersService: jasmine.SpyObj<CostCentersService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['getUserById']);
    const costCentersServiceSpy = jasmine.createSpyObj('CostCentersService', ['getAllActive']);

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
      ],
    });

    orgUserSettingsService = TestBed.inject(OrgUserSettingsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    costCentersService = TestBed.inject(CostCentersService) as jasmine.SpyObj<CostCentersService>;
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
      expect(res).toEqual(null);
      done();
    });
  });

  it('getEmailEvents(): should get email events', () => {
    expect(orgUserSettingsService.getEmailEvents()).toEqual(emailEvents);
  });

  it('getNotificationEvents(): should get notification events', (done) => {
    orgUserSettingsService.getNotificationEvents().subscribe((res) => {
      expect(res).toEqual(notificationEventsData);
      done();
    });
  });
});
