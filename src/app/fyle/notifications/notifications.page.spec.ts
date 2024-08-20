import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NavController } from '@ionic/angular';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { notificationEventsData, notificationEventsData2 } from 'src/app/core/mock-data/notification-events.data';
import { orgSettingsWithUnsubscribeEvent } from 'src/app/core/mock-data/org-settings.data';
import {
  notificationDelegateeSettings1,
  notificationDelegateeSettings2,
  notificationDelegateeSettings3,
  orgUserSettingsData,
} from 'src/app/core/mock-data/org-user-settings.data';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { NotificationsPage } from './notifications.page';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';

export class NavMock {
  public navigateBack: Function = (url: string | any[], options: any) => {};
  public navigateForward: Function = (url: string | any[], options: any) => {};
  public navigateRoot: Function = (url: string | any[], options: any) => {};
}

describe('NotificationsPage', () => {
  let component: NotificationsPage;
  let fixture: ComponentFixture<NotificationsPage>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let fb: FormBuilder;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let router: jasmine.SpyObj<Router>;
  let navController: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', [
      'post',
      'clearOrgUserSettings',
      'get',
      'getNotificationEvents',
    ]);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getByParams']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [NotificationsPage],
      imports: [RouterTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: EmployeesService,
          useValue: employeesServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: NavController,
          useClass: NavMock,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPage);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    fb = TestBed.inject(FormBuilder);

    component.notificationForm = fb.group({
      notifyOption: [],
      pushEvents: new FormArray([]),
      emailEvents: new FormArray([]),
    });

    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    employeesService.getByParams.and.returnValue(of(null));
    authService.getEou.and.resolveTo(apiEouRes);
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    orgUserSettingsService.getNotificationEvents.and.returnValue(of(notificationEventsData));

    component.delegationOptions = ['Notify me and my delegate', 'Notify my delegate', 'Notify me only'];

    component.isAllSelected = {
      emailEvents: false,
      pushEvents: false,
    };
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getDelegateeSubscription():', () => {
    it('should only notify the delegatee', (done) => {
      component.orgUserSettings$ = of(notificationDelegateeSettings1);

      component.getDelegateeSubscription().subscribe((res) => {
        expect(res).toEqual('Notify my delegate');
        done();
      });
    });

    it('should only notify the user', (done) => {
      component.orgUserSettings$ = of(notificationDelegateeSettings2);

      component.getDelegateeSubscription().subscribe((res) => {
        expect(res).toEqual('Notify me only');
        done();
      });
    });

    it('should notify both the user and delegatee', (done) => {
      component.orgUserSettings$ = of(notificationDelegateeSettings3);

      component.getDelegateeSubscription().subscribe((res) => {
        expect(res).toEqual('Notify me and my delegate');
        done();
      });
    });
  });

  it('setEvents(): should set events', () => {
    component.setEvents(cloneDeep(notificationEventsData), cloneDeep(orgUserSettingsData));

    expect(component.emailEvents.length).not.toEqual(0);
    expect(component.pushEvents.length).not.toEqual(0);
  });

  it('goBack(): should go back to the profile page', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_profile']);
  });

  it('saveNotificationSettings(): should save notification settings', () => {
    component.setEvents(notificationEventsData, orgUserSettingsData);
    component.notificationEvents = cloneDeep(notificationEventsData);
    component.orgUserSettings = cloneDeep(orgUserSettingsData);
    orgUserSettingsService.post.and.returnValue(of(null));
    orgUserSettingsService.clearOrgUserSettings.and.returnValue(of(null));
    spyOn(component, 'navBack');

    component.saveNotificationSettings();

    expect(orgUserSettingsService.post).toHaveBeenCalledOnceWith(component.orgUserSettings);
    expect(orgUserSettingsService.clearOrgUserSettings).toHaveBeenCalledTimes(1);
    expect(component.navBack).toHaveBeenCalledTimes(1);
  });

  it('isAllEventsSubscribed(): should check if all events are subscribed', () => {
    component.orgUserSettings = orgUserSettingsData;

    component.isAllEventsSubscribed();

    expect(component.isAllSelected).toEqual({
      emailEvents: false,
      pushEvents: false,
    });
  });

  it('removeAdminUnsbscribedEvents(): should remove admin unsubscribe events', fakeAsync(() => {
    component.orgSettings$ = of(orgSettingsWithUnsubscribeEvent);
    component.orgSettings = orgSettingsWithUnsubscribeEvent;
    const mockNotificationEvents = cloneDeep(notificationEventsData2);
    component.notificationEvents = cloneDeep(mockNotificationEvents);

    component.removeAdminUnsbscribedEvents();
    tick(500);

    expect(Object.keys(component.notificationEvents.features)).toEqual(['expensesAndReports', 'advances']);
  }));

  it('updateAdvanceRequestFeatures(): should update advance request features', () => {
    const mockNotificationEvents = cloneDeep(notificationEventsData);
    component.notificationEvents = mockNotificationEvents;
    component.orgSettings$ = of(orgSettingsData);

    component.updateAdvanceRequestFeatures();

    expect(Object.keys(mockNotificationEvents.features).includes('advances')).toBeFalse();
  });

  describe('updateDelegateeNotifyPreference():', () => {
    it('should set settings to notify delegatee', () => {
      const mockOrgUserSettings = cloneDeep(orgUserSettingsData);
      component.orgUserSettings = mockOrgUserSettings;

      component.updateDelegateeNotifyPreference({
        value: 'Notify my delegate',
      });

      expect(component.orgUserSettings.notification_settings.notify_delegatee).toBeTrue();
      expect(component.orgUserSettings.notification_settings.notify_user).toBeFalse();
    });

    it('should set settings to notify delegatee and user', () => {
      const mockOrgUserSettings = cloneDeep(orgUserSettingsData);
      component.orgUserSettings = mockOrgUserSettings;

      component.updateDelegateeNotifyPreference({
        value: 'Notify me and my delegate',
      });

      expect(component.orgUserSettings.notification_settings.notify_delegatee).toBeTrue();
      expect(component.orgUserSettings.notification_settings.notify_user).toBeTrue();
    });

    it('should set settings to notify user', () => {
      const mockOrgUserSettings = cloneDeep(orgUserSettingsData);
      component.orgUserSettings = mockOrgUserSettings;

      component.updateDelegateeNotifyPreference({
        value: 'Notify me only',
      });

      expect(component.orgUserSettings.notification_settings.notify_delegatee).toBeFalse();
      expect(component.orgUserSettings.notification_settings.notify_user).toBeTrue();
    });
  });

  it('removeDisabledFeatures(): should remove disabled features', () => {
    spyOn(component, 'updateAdvanceRequestFeatures');
    component.notificationEvents = cloneDeep(notificationEventsData2);

    component.removeDisabledFeatures();

    expect(component.updateAdvanceRequestFeatures).toHaveBeenCalledTimes(1);
  });

  it('updateNotificationEvents(): should update notification events', () => {
    spyOn(component, 'removeAdminUnsbscribedEvents');
    spyOn(component, 'removeDisabledFeatures');

    component.updateNotificationEvents();

    expect(component.removeAdminUnsbscribedEvents).toHaveBeenCalledTimes(1);
    expect(component.removeDisabledFeatures).toHaveBeenCalledTimes(1);
  });

  describe('toggleAllSelected():', () => {
    beforeEach(() => {
      component.setEvents(notificationEventsData, orgUserSettingsData);
    });

    it('should set value if email event exists', fakeAsync(() => {
      component.isAllSelected = {
        emailEvents: true,
      };

      component.toggleAllSelected('email');
      tick(500);

      expect(component.emailEvents.getRawValue().length).not.toBe(0);
    }));

    it('should set value if email event does not exist', fakeAsync(() => {
      component.isAllSelected = {};

      component.toggleAllSelected('email');
      tick(500);

      expect(component.emailEvents.getRawValue().length).not.toBe(0);
    }));

    it('should set value if push event exists', fakeAsync(() => {
      component.isAllSelected = {
        pushEvents: true,
      };

      component.toggleAllSelected('push');
      tick(500);

      expect(component.emailEvents.getRawValue().length).not.toBe(0);
    }));

    it('should set value if push event does not exist', fakeAsync(() => {
      component.isAllSelected = {};

      component.toggleAllSelected('push');
      tick(500);

      expect(component.emailEvents.getRawValue().length).not.toBe(0);
    }));
  });

  it('ngOnInit(): should initialize the form and observables', (done) => {
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    spyOn(component, 'getDelegateeSubscription').and.returnValue(of('Notify my delegate'));
    authService.getEou.and.resolveTo(apiEouRes);
    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    orgUserSettingsService.getNotificationEvents.and.returnValue(of(notificationEventsData));

    spyOn(component, 'isAllEventsSubscribed');
    spyOn(component, 'updateNotificationEvents');
    spyOn(component, 'setEvents');
    spyOn(component, 'toggleEvents');

    component.ngOnInit();

    component.orgUserSettings$.subscribe((res) => {
      expect(res).toEqual(orgUserSettingsData);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
    });

    component.isDelegateePresent$.subscribe((res) => {
      expect(res).toBeFalse();
      expect(authService.getEou).toHaveBeenCalledTimes(1);
    });

    component.orgSettings$.subscribe((res) => {
      expect(res).toEqual(orgSettingsData);
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
    });

    component.notificationEvents$.subscribe((res) => {
      expect(res).toEqual(notificationEventsData);
      expect(orgUserSettingsService.getNotificationEvents).toHaveBeenCalledTimes(1);
    });

    expect(component.isAllEventsSubscribed).toHaveBeenCalledTimes(1);
    expect(component.updateNotificationEvents).toHaveBeenCalledTimes(1);
    expect(component.toggleEvents).toHaveBeenCalledTimes(1);
    expect(component.setEvents).toHaveBeenCalledTimes(1);
    done();
  });

  it('toggleEvents(): should toggle events on value change', fakeAsync(() => {
    component.isAllSelected = {
      emailEvents: true,
      pushEvents: false,
    };

    component.toggleEvents();
    tick(500);

    component.setEvents(notificationEventsData, orgUserSettingsData);
    tick(500);

    expect(component.isAllSelected).toEqual({
      emailEvents: false,
      pushEvents: false,
    });
  }));
});
