    // PushNotifications.requestPermissions().then((result) => {
    //   if (result.receive === 'granted') {
    //     // Register with Apple / Google to receive push via APNS/FCM
    //     PushNotifications.register();
    //   } else {
    //     // Show some error
    //   }
    // });

    // PushNotifications.addListener('registration', (token: Token) => {
    //   alert('Push registration success, token: ' + token.value);
    // });

    // PushNotifications.addListener('registrationError', (error: any) => {
    //   alert('Error on registration: ' + JSON.stringify(error));
    // });

    // PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    //   alert('Push received: ' + JSON.stringify(notification));
    // });

    // PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
    //   alert('Push action performed: ' + JSON.stringify(notification));
    // });

    import { Injectable } from '@angular/core';
    import { PushNotifications } from '@capacitor/push-notifications';

    @Injectable({
      providedIn: 'root',
    })
    export class PushNotificationService {
      constructor() {
        this.initializePushNotifications();
      }

      initializePushNotifications(): Promise<void> {
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive === 'granted') {
          return PushNotifications.register();
        }
      }

      listenForPushNotifications(): void {
        PushNotifications.addListener('registration', () => {
            // TODO: Add API call to send the token to backend
        });
      }

      listenForPushNotificationsError(): void {
        PushNotifications.addListener('registrationError', () => {
            // TODO: Add a tracker to check registration error
        });
      }

      listenForPushNotificationsActionPerformed(): void {
        PushNotifications.addListener('pushNotificationActionPerformed', () => {
            // TODO: Add redirections for actions performed
        });
      }
    }