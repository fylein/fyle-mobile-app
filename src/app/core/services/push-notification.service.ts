import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { OrgUserService } from './org-user.service';
import { StorageService } from './storage.service';

export const PUSH_NOTIFICATIONS_PERMISSION_GRANTED_KEY = 'push_notifications_permission_granted_once';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private listenersInitialized = false;

  private orgUserService = inject(OrgUserService);

  private storageService = inject(StorageService);

  async initializePushNotifications(): Promise<void> {
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive) {
      this.storageService.set('push_notification_permission_set_once', true);
    }
    if (permission.receive === 'granted') {
      this.initListeners();
      await PushNotifications.register();
    }
  }

  setPermissionStorageKey(): void {
    this.storageService.set('push_notification_permission_set_once', true);
  }

  getPermissionStorageKey(): string {
    return 'push_notification_permission_set_once';
  }

  private initListeners(): void {
    if (this.listenersInitialized) {
      return;
    }

    this.listenersInitialized = true;

    PushNotifications.addListener('registration', (token: Token) => {
      const deviceToken = token?.value;
      console.log('token', token);
      console.log('deviceToken', deviceToken);

      if (deviceToken) {
        this.orgUserService.sendDeviceToken(deviceToken).subscribe();
      }
    });
    PushNotifications.addListener('registrationError', () => undefined);
    PushNotifications.addListener('pushNotificationActionPerformed', () => undefined);
  }
}

