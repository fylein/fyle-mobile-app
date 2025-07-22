import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
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
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { LoaderService } from 'src/app/core/services/loader.service';

describe('NotificationsBetaPage', () => {
  let component: NotificationsBetaPage;
  let fixture: ComponentFixture<NotificationsBetaPage>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let notificationsBetaPageService: jasmine.SpyObj<NotificationsBetaPageService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalPropertiesService: jasmine.SpyObj<ModalPropertiesService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const platformEmployeeSettingsServiceSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', [
      'get',
      'post',
      'clearEmployeeSettings',
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
    const launchDarklyServiceSpy = jasmine.createSpyObj('LaunchDarklyService', [
      'checkIfExpenseMarkedPersonalEventIsEnabled',
    ]);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule, NotificationsBetaPage],
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
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsServiceSpy,
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
        {
          provide: LaunchDarklyService,
          useValue: launchDarklyServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsBetaPage);
    component = fixture.componentInstance;

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    notificationsBetaPageService = TestBed.inject(
      NotificationsBetaPageService
    ) as jasmine.SpyObj<NotificationsBetaPageService>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalPropertiesService = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;

    // Setup default mock responses
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    authService.getEou.and.resolveTo(apiEouRes);
    employeesService.getByParams.and.returnValue(of(null));
    notificationsBetaPageService.getEmailNotificationsConfig.and.returnValue(mockEmailNotificationsConfig);
    notificationsBetaPageService.getInitialDelegateNotificationPreference.and.returnValue('onlyMe');
    launchDarklyService.checkIfExpenseMarkedPersonalEventIsEnabled.and.returnValue(of(false));
    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goBack(): should go back to the profile page', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_profile']);
  });

  describe('ngOnInit():', () => {
    it('ngOnInit(): should initialize the component with org settings and user settings', fakeAsync(() => {
      spyOn(component, 'initializeEmailNotificationsConfig');
      spyOn(component, 'initializeDelegateNotification');

      component.ngOnInit();
      tick();

      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(component.isAdvancesEnabled).toBe(orgSettingsData.advances?.allowed && orgSettingsData.advances?.enabled);
      expect(component.initializeEmailNotificationsConfig).toHaveBeenCalledTimes(1);
      expect(component.initializeDelegateNotification).toHaveBeenCalledTimes(1);
    }));

    it('ngOnInit(): should set isAdvancesEnabled to false when advances are not allowed', fakeAsync(() => {
      const orgSettingsWithoutAdvances = { ...orgSettingsData, advances: { allowed: false, enabled: false } };
      orgSettingsService.get.and.returnValue(of(orgSettingsWithoutAdvances));
      spyOn(component, 'initializeEmailNotificationsConfig');
      spyOn(component, 'initializeDelegateNotification');

      component.ngOnInit();
      tick();

      expect(component.orgSettings).toEqual(orgSettingsWithoutAdvances);
      expect(component.isAdvancesEnabled).toBeFalse();
      expect(component.initializeEmailNotificationsConfig).toHaveBeenCalledTimes(1);
      expect(component.initializeDelegateNotification).toHaveBeenCalledTimes(1);
    }));

    it('ngOnInit(): should set isAdvancesEnabled to true when advances are allowed and enabled', fakeAsync(() => {
      const orgSettingsWithAdvances = { ...orgSettingsData, advances: { allowed: true, enabled: true } };
      orgSettingsService.get.and.returnValue(of(orgSettingsWithAdvances));
      spyOn(component, 'initializeEmailNotificationsConfig');
      spyOn(component, 'initializeDelegateNotification');

      component.ngOnInit();
      tick();

      expect(component.orgSettings).toEqual(orgSettingsWithAdvances);
      expect(component.isAdvancesEnabled).toBeTrue();
      expect(component.initializeEmailNotificationsConfig).toHaveBeenCalledTimes(1);
      expect(component.initializeDelegateNotification).toHaveBeenCalledTimes(1);
    }));
  });

  describe('initializeEmailNotificationsConfig():', () => {
    it('should initialize email notifications config from service', () => {
      notificationsBetaPageService.getEmailNotificationsConfig.and.returnValue(mockEmailNotificationsConfig2);

      component.orgSettings = orgSettingsData;
      component.employeeSettings = employeeSettingsData;
      component.isExpenseMarkedPersonalEventEnabled = false;
      component.currentEou = apiEouRes;

      component.initializeEmailNotificationsConfig();

      expect(notificationsBetaPageService.getEmailNotificationsConfig).toHaveBeenCalledOnceWith(
        orgSettingsData,
        employeeSettingsData,
        apiEouRes,
        false
      );
      expect(component.expenseNotificationsConfig).toEqual(mockEmailNotificationsConfig2.expenseNotificationsConfig);
      expect(component.expenseReportNotificationsConfig).toEqual(
        mockEmailNotificationsConfig2.expenseReportNotificationsConfig
      );
      expect(component.advanceNotificationsConfig).toEqual(mockEmailNotificationsConfig2.advanceNotificationsConfig);
    });
  });

  describe('getOrgSettings():', () => {
    it('should fetch org settings and employee settings using forkJoin', (done) => {
      component.getOrgSettings().subscribe(({ orgSettings, employeeSettings }) => {
        expect(orgSettings).toEqual(orgSettingsData);
        expect(employeeSettings).toEqual(employeeSettingsData);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);

        done();
      });
    });
  });

  describe('initializeDelegateNotification():', () => {
    it('should initialize delegate notification when user has delegatees', (done) => {
      component.currentEou = apiEouRes;
      employeesService.getByParams.and.returnValue(of(platformEmployeeResponse));
      spyOn(component, 'initializeSelectedPreference');

      component.initializeDelegateNotification();

      component.isDelegateePresent$.subscribe((isDelegateePresent) => {
        expect(isDelegateePresent).toBeTrue();
        expect(employeesService.getByParams).toHaveBeenCalledWith({ user_id: `eq.${apiEouRes.us.id}` });
        expect(component.initializeSelectedPreference).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should not initialize delegate notification when user has no delegatees', (done) => {
      component.currentEou = apiEouRes;
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
        expect(employeesService.getByParams).toHaveBeenCalledWith({ user_id: `eq.${apiEouRes.us.id}` });
        expect(component.initializeSelectedPreference).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('updateDelegateNotificationPreference():', () => {
    beforeEach(() => {
      component.employeeSettings = cloneDeep(employeeSettingsData);
      platformEmployeeSettingsService.post.and.returnValue(of(component.employeeSettings));
    });

    it('should handle all preference values correctly', () => {
      const testCases = [
        { preference: 'onlyMe' as const, expectedDelegatee: false, expectedUser: true },
        { preference: 'onlyDelegate' as const, expectedDelegatee: true, expectedUser: false },
        { preference: 'both' as const, expectedDelegatee: true, expectedUser: true },
      ];

      testCases.forEach(({ preference, expectedDelegatee, expectedUser }) => {
        component.employeeSettings = cloneDeep(employeeSettingsData);
        component.selectedPreference = preference;

        component.updateDelegateNotificationPreference();

        expect(component.employeeSettings.notification_settings.notify_delegatee).toBe(expectedDelegatee);
        expect(component.employeeSettings.notification_settings.notify_user).toBe(expectedUser);
        expect(platformEmployeeSettingsService.post).toHaveBeenCalledWith(component.employeeSettings);
        expect(trackingService.eventTrack).toHaveBeenCalledWith(
          'Delegate notification preference updated from mobile app',
          {
            preference,
          }
        );
        expect(platformEmployeeSettingsService.clearEmployeeSettings).toHaveBeenCalled();
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
      component.employeeSettings = employeeSettingsData;
      modalPropertiesService.getModalDefaultProperties.and.returnValue(properties);
    });

    it('should open notification modal', fakeAsync(() => {
      const notificationModalSpy = jasmine.createSpyObj('notificationModal', ['present', 'onWillDismiss']);
      notificationModalSpy.onWillDismiss.and.resolveTo({
        data: { employeeSettingsUpdated: true },
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
          employeeSettings: component.employeeSettings,
          unsubscribedEventsByUser: component.employeeSettings.notification_settings.email_unsubscribed_events ?? [],
        },
        ...properties,
        initialBreakpoint: 0.5,
        breakpoints: [0, 0.5, 1],
      });
      expect(notificationModalSpy.present).toHaveBeenCalledTimes(1);
      expect(notificationModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(component.ngOnInit).toHaveBeenCalledTimes(1);
    }));

    it('should not call ngOnInit when employeeSettingsUpdated is false', fakeAsync(() => {
      const notificationModalSpy = jasmine.createSpyObj('notificationModal', ['present', 'onWillDismiss']);
      notificationModalSpy.onWillDismiss.and.resolveTo({
        data: { employeeSettingsUpdated: false },
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
          employeeSettings: component.employeeSettings,
          unsubscribedEventsByUser: component.employeeSettings.notification_settings.email_unsubscribed_events ?? [],
        },
        ...properties,
        initialBreakpoint: 0.5,
        breakpoints: [0, 0.5, 1],
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
