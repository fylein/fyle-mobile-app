import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { NotificationsBetaPageService } from './notifications-beta.page.service';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { NotificationsBetaPage } from './notifications-beta.page';
import { NotificationEventsEnum } from 'src/app/core/models/notification-events.enum';
import {
  platformEmployeeData,
  platformEmployeeResponse,
} from 'src/app/core/mock-data/platform/v1/platform-employee.data';
import { cloneDeep } from 'lodash';
import {
  mockEmailNotificationsConfig,
  mockEmailNotificationsConfig2,
} from 'src/app/core/mock-data/notification-events.data';
import { EmailNotificationsComponent } from '../email-notifications/email-notifications.component';
import { properties } from 'src/app/core/mock-data/modal-properties.data';

fdescribe('NotificationsBetaPage', () => {
  let component: NotificationsBetaPage;
  let fixture: ComponentFixture<NotificationsBetaPage>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let notificationsBetaPageService: jasmine.SpyObj<NotificationsBetaPageService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', [
      'get',
      'post',
      'clearOrgUserSettings',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getByParams']);
    const notificationsBetaPageServiceSpy = jasmine.createSpyObj('NotificationsBetaPageService', [
      'getEmailNotificationsConfig',
      'getInitialDelegateNotificationPreference',
    ]);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesServiceSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['eventTrack']);

    TestBed.configureTestingModule({
      declarations: [NotificationsBetaPage],
      imports: [RouterTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: EmployeesService,
          useValue: employeesServiceSpy,
        },
        {
          provide: NotificationsBetaPageService,
          useValue: notificationsBetaPageServiceSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsBetaPage);
    component = fixture.componentInstance;

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    notificationsBetaPageService = TestBed.inject(
      NotificationsBetaPageService
    ) as jasmine.SpyObj<NotificationsBetaPageService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalPropertiesService = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;

    // Setup default mock responses
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    authService.getEou.and.resolveTo(apiEouRes);
    employeesService.getByParams.and.returnValue(of(null));
    notificationsBetaPageService.getEmailNotificationsConfig.and.returnValue(mockEmailNotificationsConfig);
    notificationsBetaPageService.getInitialDelegateNotificationPreference.and.returnValue('onlyMe');
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goBack(): should go back to the profile page', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_profile']);
  });

  describe('ngOnInit():', () => {
    it('ngOnInit(): should initialize the component with org settings and user settings', (done) => {
      spyOn(component, 'initializeEmailNotificationsConfig');
      spyOn(component, 'initializeDelegateNotification');

      component.ngOnInit();

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);

      component.getOrgSettings().subscribe(({ orgSettings, orgUserSettings }) => {
        expect(orgSettings).toEqual(orgSettingsData);
        expect(orgUserSettings).toEqual(orgUserSettingsData);
        expect(component.orgSettings).toEqual(orgSettingsData);
        expect(component.orgUserSettings).toEqual(orgUserSettingsData);
        expect(component.isAdvancesEnabled).toBe(
          orgSettingsData.advances?.allowed && orgSettingsData.advances?.enabled
        );
        expect(component.initializeEmailNotificationsConfig).toHaveBeenCalledTimes(1);
        expect(component.initializeDelegateNotification).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('ngOnInit(): should set isAdvancesEnabled to false when advances are not allowed', (done) => {
      const orgSettingsWithoutAdvances = { ...orgSettingsData, advances: { allowed: false, enabled: false } };
      orgSettingsService.get.and.returnValue(of(orgSettingsWithoutAdvances));
      spyOn(component, 'initializeEmailNotificationsConfig');
      spyOn(component, 'initializeDelegateNotification');

      component.ngOnInit();

      component.getOrgSettings().subscribe(({ orgSettings }) => {
        expect(orgSettings).toEqual(orgSettingsWithoutAdvances);
        expect(component.orgSettings).toEqual(orgSettingsWithoutAdvances);
        expect(component.isAdvancesEnabled).toBeFalse();
        expect(component.initializeEmailNotificationsConfig).toHaveBeenCalledTimes(1);
        expect(component.initializeDelegateNotification).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('ngOnInit(): should set isAdvancesEnabled to true when advances are allowed and enabled', (done) => {
      const orgSettingsWithAdvances = { ...orgSettingsData, advances: { allowed: true, enabled: true } };
      orgSettingsService.get.and.returnValue(of(orgSettingsWithAdvances));
      spyOn(component, 'initializeEmailNotificationsConfig');
      spyOn(component, 'initializeDelegateNotification');

      component.ngOnInit();

      component.getOrgSettings().subscribe(({ orgSettings }) => {
        expect(orgSettings).toEqual(orgSettingsWithAdvances);
        expect(component.orgSettings).toEqual(orgSettingsWithAdvances);
        expect(component.isAdvancesEnabled).toBeTrue();
        expect(component.initializeEmailNotificationsConfig).toHaveBeenCalledTimes(1);
        expect(component.initializeDelegateNotification).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('initializeEmailNotificationsConfig():', () => {
    it('should initialize email notifications config from service', () => {
      notificationsBetaPageService.getEmailNotificationsConfig.and.returnValue(mockEmailNotificationsConfig2);

      component.orgSettings = orgSettingsData;
      component.orgUserSettings = orgUserSettingsData;

      component.initializeEmailNotificationsConfig();

      expect(notificationsBetaPageService.getEmailNotificationsConfig).toHaveBeenCalledOnceWith(
        orgSettingsData,
        orgUserSettingsData
      );
      expect(component.expenseNotificationsConfig).toEqual(mockEmailNotificationsConfig2.expenseNotificationsConfig);
      expect(component.expenseReportNotificationsConfig).toEqual(
        mockEmailNotificationsConfig2.expenseReportNotificationsConfig
      );
      expect(component.advanceNotificationsConfig).toEqual(mockEmailNotificationsConfig2.advanceNotificationsConfig);
    });
  });

  describe('getOrgSettings():', () => {
    it('should fetch org settings and org user settings using forkJoin', (done) => {
      component.getOrgSettings().subscribe(({ orgSettings, orgUserSettings }) => {
        expect(orgSettings).toEqual(orgSettingsData);
        expect(orgUserSettings).toEqual(orgUserSettingsData);

        done();
      });
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('initializeDelegateNotification():', () => {
    it('should initialize delegate notification when user has delegatees', (done) => {
      employeesService.getByParams.and.returnValue(of(platformEmployeeResponse));
      spyOn(component, 'initializeSelectedPreference');

      component.initializeDelegateNotification();

      component.isDelegateePresent$.subscribe((isDelegateePresent) => {
        expect(isDelegateePresent).toBeTrue();
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(employeesService.getByParams).toHaveBeenCalledWith({ user_id: `eq.${apiEouRes.us.id}` });
        expect(component.initializeSelectedPreference).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should not initialize delegate notification when user has no delegatees', (done) => {
      const mockEmployeesResponseWithoutDelegatees = {
        ...platformEmployeeResponse,
        data: [
          {
            ...platformEmployeeData,
            delegatees: [],
          },
        ],
      };

      employeesService.getByParams.and.returnValue(of(mockEmployeesResponseWithoutDelegatees));
      spyOn(component, 'initializeSelectedPreference');

      component.initializeDelegateNotification();

      component.isDelegateePresent$.subscribe((isDelegateePresent) => {
        expect(isDelegateePresent).toBeFalse();
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(employeesService.getByParams).toHaveBeenCalledWith({ user_id: `eq.${apiEouRes.us.id}` });
        expect(component.initializeSelectedPreference).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('updateDelegateNotificationPreference():', () => {
    beforeEach(() => {
      component.orgUserSettings = cloneDeep(orgUserSettingsData);
      orgUserSettingsService.post.and.returnValue(of(component.orgUserSettings));
    });

    it('should handle all preference values correctly', () => {
      const testCases = [
        { preference: 'onlyMe' as const, expectedDelegatee: false, expectedUser: true },
        { preference: 'onlyDelegate' as const, expectedDelegatee: true, expectedUser: false },
        { preference: 'both' as const, expectedDelegatee: true, expectedUser: true },
      ];

      testCases.forEach(({ preference, expectedDelegatee, expectedUser }) => {
        component.orgUserSettings = cloneDeep(orgUserSettingsData);
        component.selectedPreference = preference;

        component.updateDelegateNotificationPreference();

        expect(component.orgUserSettings.notification_settings.notify_delegatee).toBe(expectedDelegatee);
        expect(component.orgUserSettings.notification_settings.notify_user).toBe(expectedUser);
        expect(orgUserSettingsService.post).toHaveBeenCalledWith(component.orgUserSettings);
        expect(trackingService.eventTrack).toHaveBeenCalledWith(
          'Delegate notification preference updated from mobile app',
          {
            preference,
          }
        );
        expect(orgUserSettingsService.clearOrgUserSettings).toHaveBeenCalled();
      });
    });
  });

  describe('initializeSelectedPreference():', () => {
    it('should initialize selected preference', () => {
      notificationsBetaPageService.getInitialDelegateNotificationPreference.and.returnValue('onlyMe');
      component.initializeSelectedPreference();
      expect(component.selectedPreference).toBe('onlyMe');

      notificationsBetaPageService.getInitialDelegateNotificationPreference.and.returnValue('onlyDelegate');
      component.initializeSelectedPreference();
      expect(component.selectedPreference).toBe('onlyDelegate');
    });
  });

  describe('openNotificationModal():', () => {
    beforeEach(() => {
      component.orgUserSettings = orgUserSettingsData;
      modalPropertiesService.getModalDefaultProperties.and.returnValue(properties);
    });

    it('should open notification modal', fakeAsync(() => {
      const notificationModalSpy = jasmine.createSpyObj('notificationModal', ['present', 'onWillDismiss']);
      notificationModalSpy.onWillDismiss.and.resolveTo({
        data: { orgUserSettingsUpdated: true },
      });
      modalController.create.and.resolveTo(notificationModalSpy);
      spyOn(component, 'ngOnInit');

      component.openNotificationModal(mockEmailNotificationsConfig.expenseNotificationsConfig);
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: EmailNotificationsComponent,
        componentProps: {
          title: mockEmailNotificationsConfig.expenseNotificationsConfig.title,
          notifications: mockEmailNotificationsConfig.expenseNotificationsConfig.notifications,
          orgUserSettings: component.orgUserSettings,
          unsubscribedEventsByUser: component.orgUserSettings.notification_settings.email?.unsubscribed_events ?? [],
        },
        ...properties,
      });
      expect(notificationModalSpy.present).toHaveBeenCalledTimes(1);
      expect(notificationModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(component.ngOnInit).toHaveBeenCalledTimes(1);
    }));

    it('should not call ngOnInit when orgUserSettingsUpdated is false', fakeAsync(() => {
      const notificationModalSpy = jasmine.createSpyObj('notificationModal', ['present', 'onWillDismiss']);
      notificationModalSpy.onWillDismiss.and.resolveTo({
        data: { orgUserSettingsUpdated: false },
      });
      modalController.create.and.resolveTo(notificationModalSpy);
      spyOn(component, 'ngOnInit');

      component.openNotificationModal(mockEmailNotificationsConfig.expenseNotificationsConfig);
      tick(100);

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: EmailNotificationsComponent,
        componentProps: {
          title: mockEmailNotificationsConfig.expenseNotificationsConfig.title,
          notifications: mockEmailNotificationsConfig.expenseNotificationsConfig.notifications,
          orgUserSettings: component.orgUserSettings,
          unsubscribedEventsByUser: component.orgUserSettings.notification_settings.email?.unsubscribed_events ?? [],
        },
        ...properties,
      });
      expect(notificationModalSpy.present).toHaveBeenCalledTimes(1);
      expect(notificationModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(component.ngOnInit).not.toHaveBeenCalled();
    }));
  });

  describe('selectPreference():', () => {
    it('should select preference', () => {
      spyOn(component, 'updateDelegateNotificationPreference');
      component.selectPreference('onlyMe');
      expect(component.selectedPreference).toBe('onlyMe');
      expect(component.updateDelegateNotificationPreference).toHaveBeenCalledTimes(1);
    });
  });
});
