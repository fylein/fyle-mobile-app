import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { OrgUserService } from './org-user.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private listenersInitialized = false;

  private orgUserService = inject(OrgUserService);

  async initializePushNotifications(): Promise<void> {
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive === 'granted') {
      this.initListeners();
      await PushNotifications.register();
    }
  }

  private initListeners(): void {
    if (this.listenersInitialized) {
      return;
    }

    this.listenersInitialized = true;

    PushNotifications.addListener('registration', (token: Token) => {
      const deviceToken = token?.value;

      if (deviceToken) {
        this.orgUserService.sendDeviceToken(deviceToken).subscribe({
          // Ignore errors for now; push registration should not block app startup
          error: () => undefined,
        });
      }
    });
    PushNotifications.addListener('registrationError', () => undefined);
    PushNotifications.addListener('pushNotificationActionPerformed', () => undefined);
  }
}

