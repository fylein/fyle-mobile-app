import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';

import { NotificationsPage } from './notifications.page';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  notificationDelegateeSettings1,
  notificationDelegateeSettings2,
  notificationDelegateeSettings3,
  orgUserSettingsData,
} from 'src/app/core/mock-data/org-user-settings.data';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { notificationEventsData } from 'src/app/core/mock-data/notification-events.data';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { orgSettingsWithUnsubscribeEvent } from 'src/app/core/mock-data/org-settings.data';
import { emailEvents } from 'src/app/core/mock-data/email-events.data';

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

  it('goBack(): should go back to the profile page', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_profile']);
  });

  it('isAllEventsSubscribed(): should check if all events are subscribed', () => {
    component.orgUserSettings = orgUserSettingsData;

    component.isAllEventsSubscribed();

    expect(component.isAllSelected).toEqual({
      emailEvents: false,
      pushEvents: false,
    });
  });

  it('updateNotificationEvents(): should update notification events', () => {
    spyOn(component, 'removeAdminUnsbscribedEvents');
    spyOn(component, 'removeDisabledFeatures');

    component.updateNotificationEvents();

    expect(component.removeAdminUnsbscribedEvents).toHaveBeenCalledTimes(1);
    expect(component.removeDisabledFeatures).toHaveBeenCalledTimes(1);
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
});
