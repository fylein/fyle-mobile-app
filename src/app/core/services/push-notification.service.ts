
import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {

  async initializePushNotifications(): Promise<void> {
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