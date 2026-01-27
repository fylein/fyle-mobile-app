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
    const deepLinkServiceSpy = jasmine.createSpyObj('DeepLinkService', ['getJsonFromUrl', 'redirect']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['eventTrack']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['sendDeviceToken']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['onLogout']);

    userEventServiceSpy.onLogout.and.callFake((cb: () => void) => {
      logoutCallback = cb;
      return { unsubscribe: jasmine.createSpy('unsubscribe') } as any;
    });

    TestBed.configureTestingModule({
      providers: [
        PushNotificationService,
        { provide: DeepLinkService, useValue: deepLinkServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
      ],
    });

    service = TestBed.inject(PushNotificationService);
    deepLinkService = TestBed.inject(DeepLinkService) as jasmine.SpyObj<DeepLinkService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializePushNotifications(): should request permission and register when granted', async () => {
    const requestPermissionsSpy = spyOn(PushNotifications as any, 'requestPermissions').and.resolveTo(
      { receive: 'granted' } as any,
    );
    const registerSpy = spyOn(PushNotifications as any, 'register').and.resolveTo();
    spyOn(PushNotifications as any, 'addListener').and.returnValue(
      Promise.resolve({ remove: jasmine.createSpy('remove') } as any),
    );
    const initListenersSpy = spyOn<any>(service as any, 'initListeners').and.callThrough();

    await service.initializePushNotifications();

    expect(requestPermissionsSpy).toHaveBeenCalled();
    expect(initListenersSpy).toHaveBeenCalledTimes(1);
    expect(registerSpy).toHaveBeenCalled();
  });

  it('initializePushNotifications(): should not register when permission is not granted', async () => {
    const requestPermissionsSpy = spyOn(PushNotifications as any, 'requestPermissions').and.resolveTo(
      { receive: 'denied' } as any,
    );
    const registerSpy = spyOn(PushNotifications as any, 'register').and.resolveTo();
    const initListenersSpy = spyOn<any>(service as any, 'initListeners').and.callThrough();

    await service.initializePushNotifications();

    expect(requestPermissionsSpy).toHaveBeenCalled();
    expect(initListenersSpy).not.toHaveBeenCalled();
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should send device token and track registration when registration event is received', async () => {
    let registrationCallback: (token: Token) => void;

    spyOn(PushNotifications as any, 'addListener').and.callFake((eventName: string, cb: any) => {
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

    spyOn(PushNotifications as any, 'addListener').and.callFake((eventName: string, cb: any) => {
      if (eventName === 'pushNotificationActionPerformed') {
        clickCallback = cb;
      }
      return Promise.resolve({ remove: jasmine.createSpy('remove') } as any);
    });

    const redirectParams = { some: 'value' } as any;
    deepLinkService.getJsonFromUrl.and.returnValue(redirectParams);

    (service as any).addNotificationClickListener();

    const event = {
      notification: {
        data: {
          url: 'https://staging.fyle.tech/app/main#/enterprise/my_dashboard',
          actionType: 'test_action',
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

    spyOn(PushNotifications as any, 'addListener').and.callFake((eventName: string, cb: any) => {
      if (eventName === 'pushNotificationActionPerformed') {
        clickCallback = cb;
      }
      return Promise.resolve({ remove: jasmine.createSpy('remove') } as any);
    });

    (service as any).addNotificationClickListener();

    const event = {
      notification: {
        data: {
          actionType: 'test_action',
        },
      },
    };

    clickCallback(event);

    expect(trackingService.eventTrack).not.toHaveBeenCalledWith('Push Notification Clicked', jasmine.anything());
    expect(deepLinkService.getJsonFromUrl).not.toHaveBeenCalled();
    expect(deepLinkService.redirect).not.toHaveBeenCalled();
  });

  it('should unregister push notifications on user logout', async () => {
    const unregisterSpy = spyOn(PushNotifications as any, 'unregister').and.resolveTo();
    const serviceUnregisterSpy = spyOn(service, 'unregister').and.callThrough();

    logoutCallback();

    await serviceUnregisterSpy.calls.mostRecent().returnValue;
    expect(serviceUnregisterSpy).toHaveBeenCalledTimes(1);
    expect(unregisterSpy).toHaveBeenCalledTimes(1);
  });
});
