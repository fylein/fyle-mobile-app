import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken} from '@capacitor/core';
import { forkJoin, from, iif, noop, of } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DeviceService } from './device.service';
import { UserService } from './user.service';
const { PushNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  ROOT_ENDPOINT: string;
  constructor(
    private userService: UserService,
    private deviceService: DeviceService,
    private httpClient: HttpClient
  ) { 
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  initPush() {
    //need to dicard for webapp
    this.registerPush();
  }

  registerPush() {
    PushNotifications.requestPermission().then( result => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });
 
    PushNotifications.addListener('registration',(token: PushNotificationToken) => {
      return this.postDeviceInfo(token.value).subscribe(noop);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
      console.log('Push received: ' + JSON.stringify(notification));
      return this.updateNotificationStatusAndRedirect(notification.data).subscribe(noop);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      //return this.pushNotificationService.updateNotificationStatusAndRedirect(notification.data).subscribe(noop);
    });
  }

  postDeviceInfo(token) {
    return forkJoin({
      userProperties$: this.userService.getProperties(),
      deviceInfo$ : this.deviceService.getDeviceInfo()
    }).pipe(
      map(res => {
        const deviceInfo = res.deviceInfo$;
        let userProperties = res.userProperties$;
        if (userProperties === null || userProperties === '') {
          userProperties = {
            devices: []
          };
        }
        const currenctDevice = {
          id: deviceInfo.uuid,
          fcm_token: token
        };
        userProperties.devices = userProperties.devices.filter(userDevice => {
          return userDevice.id !== currenctDevice.id;
        });

        userProperties.devices = userProperties.devices.concat(currenctDevice);
        console.log(userProperties);
        return userProperties;
      }),
      switchMap(userProperties => {
        return this.userService.upsertProperties(userProperties);
      })
    )
  }

  updateDeliveryStatus(notification_id) {
    return this.httpClient.post<any>(this.ROOT_ENDPOINT + '/notif' + '/notifications/' + notification_id + '/delivered','');
  }

  updateReadStatus(notification_id) {
    return this.httpClient.post<any>(this.ROOT_ENDPOINT + '/notif' + '/notifications/' + notification_id + '/read','');
  }

  updateNotificationStatusAndRedirect(notificationData) {
    return this.updateDeliveryStatus(notificationData.notification_id).pipe(
      concatMap(res => {
        return iif(() => notificationData.wasTapped,
          this.updateReadStatus(notificationData.notification_id),
          of(null)
        )
      })
    )
  }
}
