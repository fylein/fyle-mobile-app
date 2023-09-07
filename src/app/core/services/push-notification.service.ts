import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema, ActionPerformed, Token } from '@capacitor/push-notifications';
import { Observable, forkJoin, iif, noop, of } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DeepLinkService } from './deep-link.service';
import { DeviceService } from './device.service';
import { UserService } from './user.service';
import { PushNotificationData } from '../models/push-notification-data.model';
import { UserProperty } from '../models/v1/user-property.model';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  ROOT_ENDPOINT: string;

  constructor(
    private userService: UserService,
    private deviceService: DeviceService,
    private httpClient: HttpClient,
    private deepLinkService: DeepLinkService,
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  initPush(): void {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
    }
  }

  registerPush(): void {
    const that = this;
    // If we don't call removeAllListeners() then PushNotifications will start add listeners every time user open the app
    PushNotifications.removeAllListeners();
    PushNotifications.checkPermissions().then((result) => {
      if (!result.receive) {
        // Permissions not granted, request permissions
        PushNotifications.requestPermissions().then((result) => {
          if (result.receive === 'granted') {
            // Permissions granted, register for push notifications
            PushNotifications.register(); // Register with Apple / Google to receive push via APNS/FCM
          }
        });
      } else {
        // Permissions already granted, register for push notifications
        PushNotifications.register(); // Register with Apple / Google to receive push via APNS/FCM
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      that.postDeviceInfo(token.value).subscribe(noop);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      const notificationData = notification.data as PushNotificationData;
      that.updateNotificationStatusAndRedirect(notificationData).subscribe(noop);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      const notificationData = notification.notification.data as PushNotificationData;
      that.updateNotificationStatusAndRedirect(notificationData, true).subscribe(() => {
        const notificationData = notification.notification.data as PushNotificationData;
        that.deepLinkService.redirect(that.deepLinkService.getJsonFromUrl(notificationData.cta_url));
      });
    });
  }

  postDeviceInfo(token: string): Observable<UserProperty> {
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
      switchMap((userProperties) => this.userService.upsertProperties(userProperties)),
    );
  }

  updateDeliveryStatus(notification_id: number): Observable<PushNotificationData> {
    return this.httpClient.post<PushNotificationData>(
      this.ROOT_ENDPOINT + '/notif' + '/notifications/' + notification_id + '/delivered',
      '',
    );
  }

  updateReadStatus(notification_id: number): Observable<PushNotificationData> {
    return this.httpClient.post<PushNotificationData>(
      this.ROOT_ENDPOINT + '/notif' + '/notifications/' + notification_id + '/read',
      '',
    );
  }

  updateNotificationStatusAndRedirect(
    notificationData: PushNotificationData,
    wasTapped?: boolean,
  ): Observable<PushNotificationData> {
    return this.updateDeliveryStatus(notificationData.notification_id).pipe(
      concatMap(() =>
        iif(
          () => wasTapped,
          this.updateReadStatus(notificationData.notification_id),
          of(null).pipe(map(() => notificationData)),
        ),
      ),
    );
  }
}
