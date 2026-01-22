import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { DeepLinkService } from './deep-link.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private listenersInitialized = false;

  private deepLinkService = inject(DeepLinkService);

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

    PushNotifications.addListener('registration', () => undefined);
    PushNotifications.addListener('registrationError', () => undefined);
    PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
      const url = (event?.notification?.data as { url?: string } | undefined)?.url;

      if (!url || typeof url !== 'string') {
        return;
      }

      const redirectParams = this.deepLinkService.getJsonFromUrl(url);
      this.deepLinkService.redirect(redirectParams);
    });
  }
}

