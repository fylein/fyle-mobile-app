import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PushNotificationService } from './push-notification.service';
import { DeepLinkService } from './deep-link.service';
import { DeviceService } from './device.service';
import { UserService } from './user.service';
import { of } from 'rxjs';

describe('PushNotificationService', () => {
  let pushNotificationService: PushNotificationService;
  let userService: jasmine.SpyObj<UserService>;
  let deepLinkService: jasmine.SpyObj<DeepLinkService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let httpMock: HttpTestingController;

  const rootUrl = 'https://staging.fyle.tech';

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', ['getProperties', 'upsertProperties']);
    deepLinkService = jasmine.createSpyObj('DeepLinkService', ['getJsonFromUrl', 'redirect']);
    deviceService = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PushNotificationService,
        { provide: UserService, useValue: userService },
        { provide: DeepLinkService, useValue: deepLinkService },
        { provide: DeviceService, useValue: deviceService },
      ],
    });
    pushNotificationService = TestBed.inject(PushNotificationService);
    httpMock = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    deepLinkService = TestBed.inject(DeepLinkService) as jasmine.SpyObj<DeepLinkService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;

    pushNotificationService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(pushNotificationService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(pushNotificationService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('updateDeliveryStatus(): should send a POST request to update the delivery status', (done) => {
    const notificationId = 123;
    pushNotificationService.updateDeliveryStatus(notificationId).subscribe((result) => {
      expect(result).toBeDefined();
      done();
    });

    const req = httpMock.expectOne(
      `${pushNotificationService.ROOT_ENDPOINT}/notif/notifications/${notificationId}/delivered`
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual('');
    req.flush({});
  });

  it('should send a POST request to update the read status', (done) => {
    const notificationId = 123;
    pushNotificationService.updateReadStatus(notificationId).subscribe((result) => {
      expect(result).toBeDefined();
      done();
    });

    const req = httpMock.expectOne(
      `${pushNotificationService.ROOT_ENDPOINT}/notif/notifications/${notificationId}/read`
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual('');
    req.flush({});
  });

  describe('updateNotificationStatusAndRedirect():', () => {
    const notificationData = { notification_id: 123 };
    const wasTapped = true;

    beforeEach(() => {
      spyOn(pushNotificationService, 'updateReadStatus').and.returnValue(of(null));
    });

    it('should call updateDeliveryStatus with the correct notification ID', () => {
      pushNotificationService.updateNotificationStatusAndRedirect(notificationData, wasTapped).subscribe(() => {
        expect(pushNotificationService.updateReadStatus).toHaveBeenCalledWith(notificationData.notification_id);
      });

      const req = httpMock.expectOne(
        `${pushNotificationService.ROOT_ENDPOINT}/notif/notifications/${notificationData.notification_id}/delivered`
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual('');
      req.flush({});
    });

    it('should return notificationData when the notification is not clicked', () => {
      pushNotificationService.updateNotificationStatusAndRedirect(notificationData, false).subscribe((result) => {
        expect(result).toEqual(notificationData);
        expect(pushNotificationService.updateReadStatus).toHaveBeenCalledOnceWith(notificationData.notification_id);
      });

      const req = httpMock.expectOne(
        `${pushNotificationService.ROOT_ENDPOINT}/notif/notifications/${notificationData.notification_id}/delivered`
      );
      req.flush({});
    });
  });
});
