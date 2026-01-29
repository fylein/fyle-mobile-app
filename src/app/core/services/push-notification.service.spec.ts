import { TestBed } from '@angular/core/testing';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { of } from 'rxjs';
import { DeepLinkService } from './deep-link.service';
import { OrgUserService } from './org-user.service';
import { PushNotificationService } from './push-notification.service';
import { TrackingService } from './tracking.service';
import { UserEventService } from './user-event.service';

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let deepLinkService: jasmine.SpyObj<DeepLinkService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let logoutCallback: () => void;

  beforeEach(() => {
    deepLinkService = jasmine.createSpyObj('DeepLinkService', ['getJsonFromUrl', 'redirect']);
    trackingService = jasmine.createSpyObj('TrackingService', ['eventTrack']);
    orgUserService = jasmine.createSpyObj('OrgUserService', ['sendDeviceToken']);
    userEventService = jasmine.createSpyObj('UserEventService', ['onLogout']);

    userEventService.onLogout.and.callFake((cb: () => void) => {
      logoutCallback = cb;
      return { unsubscribe: jasmine.createSpy('unsubscribe') } as any;
    });

    orgUserService.sendDeviceToken.and.returnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        PushNotificationService,
        { provide: DeepLinkService, useValue: deepLinkService },
        { provide: TrackingService, useValue: trackingService },
        { provide: OrgUserService, useValue: orgUserService },
        { provide: UserEventService, useValue: userEventService },
      ],
    });

    service = TestBed.inject(PushNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializePushNotifications(): should request permission and register when granted', async () => {
    const requestPermissionsSpy = spyOn(PushNotifications, 'requestPermissions').and.resolveTo(
      { receive: 'granted' } as any,
    );
    const registerSpy = spyOn(PushNotifications, 'register').and.resolveTo();
    spyOn(PushNotifications, 'addListener').and.resolveTo(
      { remove: jasmine.createSpy('remove') } as any,
    );
    const initListenersSpy = spyOn<any>(service as any, 'initListeners').and.callThrough();

    await service.initializePushNotifications();

    expect(requestPermissionsSpy).toHaveBeenCalled();
    expect(initListenersSpy).toHaveBeenCalledTimes(1);
    expect(registerSpy).toHaveBeenCalled();
  });

  it('initializePushNotifications(): should not register when permission is not granted', async () => {
    const requestPermissionsSpy = spyOn(PushNotifications, 'requestPermissions').and.resolveTo(
      { receive: 'denied' } as any,
    );
    const registerSpy = spyOn(PushNotifications, 'register').and.resolveTo();
    const initListenersSpy = spyOn<any>(service as any, 'initListeners').and.callThrough();

    await service.initializePushNotifications();

    expect(requestPermissionsSpy).toHaveBeenCalled();
    expect(initListenersSpy).not.toHaveBeenCalled();
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('checkPermissions(): should delegate to PushNotifications.checkPermissions', async () => {
    const permission = { receive: 'denied' } as any;
    const checkPermissionsSpy = spyOn(PushNotifications, 'checkPermissions').and.resolveTo(
      permission,
    );

    const result = await service.checkPermissions();

    expect(checkPermissionsSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(permission);
  });

  it('register(): should delegate to PushNotifications.register', async () => {
    const registerSpy = spyOn(PushNotifications, 'register').and.resolveTo();

    await service.register();

    expect(registerSpy).toHaveBeenCalledTimes(1);
  });

  it('unregister(): should delegate to PushNotifications.unregister', async () => {
    const unregisterSpy = spyOn(PushNotifications, 'unregister').and.resolveTo();

    await service.unregister();

    expect(unregisterSpy).toHaveBeenCalledTimes(1);
  });

  it('should send device token and track registration when registration event is received', () => {
    let registrationCallback: (token: Token) => void;

    spyOn(PushNotifications, 'addListener').and.callFake((eventName: string, cb: any) => {
      if (eventName === 'registration') {
        registrationCallback = cb;
      }
      return Promise.resolve({ remove: jasmine.createSpy('remove') } as any);
    });

    (service as any).addRegistrationListener();

    const token: Token = { value: 'test-device-token' } as any;
    registrationCallback(token);

    expect(orgUserService.sendDeviceToken).toHaveBeenCalledWith('test-device-token');
    expect(trackingService.eventTrack).toHaveBeenCalledWith('Push Notification Registered');
  });

  it('should handle notification click: track event and redirect using deep link service', () => {
    let clickCallback: (event: any) => void;

    spyOn(PushNotifications, 'addListener').and.callFake((eventName: string, cb: any) => {
      if (eventName === 'pushNotificationActionPerformed') {
        clickCallback = cb;
      }
      return Promise.resolve({ remove: jasmine.createSpy('remove') } as any);
    });

    (service as any).addNotificationClickListener();

    const redirectParams = { some: 'value' } as any;
    deepLinkService.getJsonFromUrl.and.returnValue(redirectParams);

    const event = {
      notification: {
        data: {
          cta_url: 'https://staging.fyle.tech/app/main#/enterprise/my_dashboard',
          notification_type: 'test_action',
        },
      },
    };

    clickCallback(event);

    expect(trackingService.eventTrack).toHaveBeenCalledWith('Push Notification Clicked', {
      actionType: 'test_action',
    });
    expect(deepLinkService.getJsonFromUrl).toHaveBeenCalledWith(
      'https://staging.fyle.tech/app/main#/enterprise/my_dashboard',
    );
    expect(deepLinkService.redirect).toHaveBeenCalledWith(redirectParams);
  });

  it('should not redirect when notification click event has no url', () => {
    let clickCallback: (event: any) => void;

    spyOn(PushNotifications, 'addListener').and.callFake((eventName: string, cb: any) => {
      if (eventName === 'pushNotificationActionPerformed') {
        clickCallback = cb;
      }
      return Promise.resolve({ remove: jasmine.createSpy('remove') } as any);
    });

    (service as any).addNotificationClickListener();

    const event = {
      notification: {
        data: {
          notification_type: 'test_action',
        },
      },
    };

    clickCallback(event);

    expect(trackingService.eventTrack).not.toHaveBeenCalledWith(
      'Push Notification Clicked',
      jasmine.anything(),
    );
    expect(deepLinkService.getJsonFromUrl).not.toHaveBeenCalled();
    expect(deepLinkService.redirect).not.toHaveBeenCalled();
  });

  it('should unregister push notifications on user logout', async () => {
    const unregisterSpy = spyOn(PushNotifications, 'unregister').and.resolveTo();
    const serviceUnregisterSpy = spyOn(service, 'unregister').and.callThrough();

    logoutCallback();

    await serviceUnregisterSpy.calls.mostRecent().returnValue;
    expect(serviceUnregisterSpy).toHaveBeenCalledTimes(1);
    expect(unregisterSpy).toHaveBeenCalledTimes(1);
  });
});
