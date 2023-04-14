import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema, ActionPerformed, Token } from '@capacitor/push-notifications';
import { forkJoin, iif, noop, of } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DeepLinkService } from './deep-link.service';
import { DeviceService } from './device.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  ROOT_ENDPOINT: string;

  constructor(
    private userService: UserService,
    private deviceService: DeviceService,
    private httpClient: HttpClient,
    private deepLinkService: DeepLinkService
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
    }
  }

  registerPush() {
    const that = this;
    // If we don't call removeAllListeners() then PushNotifications will start add listeners every time user open the app
    PushNotifications.removeAllListeners();
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register(); // Register with Apple / Google to receive push via APNS/FCM
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      that.postDeviceInfo(token.value).subscribe(noop);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      that.updateNotificationStatusAndRedirect(notification.data).subscribe(noop);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      that.updateNotificationStatusAndRedirect(notification.notification.data, true).subscribe(() => {
        that.deepLinkService.redirect(that.deepLinkService.getJsonFromUrl(notification.notification.data.cta_url));
      });
    });
  }

  postDeviceInfo(token) {
    return forkJoin({
      userProperties$: this.userService.getProperties(),
      deviceInfo$: this.deviceService.getDeviceInfo(),
    }).pipe(
      map((res) => {
        const deviceInfo = res.deviceInfo$;
        let userProperties = res.userProperties$;
        if (userProperties === null) {
          userProperties = {
            devices: [],
          };
        }
        const currenctDevice = {
          id: deviceInfo.uuid,
          fcm_token: token,
        };
        userProperties.devices = userProperties.devices.filter((userDevice) => userDevice.id !== currenctDevice.id);

        userProperties.devices = userProperties.devices.concat(currenctDevice);
        return userProperties;
      }),
      switchMap((userProperties) => this.userService.upsertProperties(userProperties))
    );
  }

  updateDeliveryStatus(notification_id) {
    return this.httpClient.post<any>(
      this.ROOT_ENDPOINT + '/notif' + '/notifications/' + notification_id + '/delivered',
      ''
    );
  }

  updateReadStatus(notification_id) {
    return this.httpClient.post<any>(this.ROOT_ENDPOINT + '/notif' + '/notifications/' + notification_id + '/read', '');
  }

  updateNotificationStatusAndRedirect(notificationData, wasTapped?: boolean) {
    return this.updateDeliveryStatus(notificationData.notification_id).pipe(
      concatMap(() =>
        iif(
          () => wasTapped,
          this.updateReadStatus(notificationData.notification_id),
          of(null).pipe(map(() => notificationData))
        )
      )
    );
  }
}
