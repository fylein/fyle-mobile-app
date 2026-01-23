import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { DeepLinkService } from './deep-link.service';
import { TrackingService } from './tracking.service';
import { UserEventService } from './user-event.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private listenersInitialized = false;

  private deepLinkService: DeepLinkService = inject(DeepLinkService);

  private trackingService: TrackingService = inject(TrackingService);

  private userEventService: UserEventService = inject(UserEventService);

  constructor() {
    this.userEventService.onLogout(() => {
      void this.unregister();
    });
  }

  async initializePushNotifications(): Promise<void> {
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive === 'granted') {
      this.initListeners();
      await PushNotifications.register();
    }
  }

  async unregister(): Promise<void> {
    await PushNotifications.unregister();
  }

  private initListeners(): void {
    if (this.listenersInitialized) {
      return;
    }

    this.listenersInitialized = true;

    PushNotifications.addListener('registration', (token: Token) => {
      const tokenValue = token?.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.trackingService.eventTrack('Push Notification Registered');
    });
    PushNotifications.addListener('registrationError', () => undefined);
    PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
      const data = (event?.notification?.data as { url?: string; actionType?: string } | undefined) ?? {};
      const url = data.url;
      const actionType = data.actionType;

      if (!url || typeof url !== 'string') {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.trackingService.eventTrack('Push Notification Clicked', { actionType });

      const redirectParams = this.deepLinkService.getJsonFromUrl(url);
      this.deepLinkService.redirect(redirectParams);
    });
  }
}

