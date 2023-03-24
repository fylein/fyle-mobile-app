import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PushNotificationService } from './push-notification.service';
import { DeepLinkService } from './deep-link.service';
import { DeviceService } from './device.service';
import { UserService } from './user.service';

describe('PushNotificationService', () => {
  let pushNotificationService: PushNotificationService;
  let userService: jasmine.SpyObj<UserService>;
  let deepLinkService: jasmine.SpyObj<DeepLinkService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let httpMock: HttpTestingController;

  const rootUrl = 'https://staging.fyle.tech';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pushNotificationService = TestBed.inject(PushNotificationService);
  });

  it('should be created', () => {
    expect(pushNotificationService).toBeTruthy();
  });
});
