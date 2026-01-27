import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { DeepLinkService } from './deep-link.service';
import { TrackingService } from './tracking.service';
import { UserEventService } from './user-event.service';
import { OrgUserService } from './org-user.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private listenersInitialized = false;

  private deepLinkService: DeepLinkService = inject(DeepLinkService);

  private trackingService: TrackingService = inject(TrackingService);

  private userEventService: UserEventService = inject(UserEventService);

  private orgUserService: OrgUserService = inject(OrgUserService);

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

    this.addRegistrationListener();
    this.addRegistrationErrorListener();
    this.addNotificationClickListener();
  }

  private addRegistrationListener(): void {
    PushNotifications.addListener('registration', (token: Token) => {
      const tokenValue = token?.value;
      console.log('tokenValue', tokenValue);
      if (tokenValue) {
        this.orgUserService.sendDeviceToken(tokenValue).subscribe();
      }
      this.trackingService.eventTrack('Push Notification Registered');
    });
  }

  private addRegistrationErrorListener(): void {
    PushNotifications.addListener('registrationError', () => undefined);
  }

  private addNotificationClickListener(): void {
    PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
      const data = (event?.notification?.data as { cta_url?: string; notification_type?: string } | undefined) ?? {};
      const url = data.cta_url;
      const actionType = data.notification_type;

      if (!url || typeof url !== 'string') {
        return;
      }

      this.trackingService.eventTrack('Push Notification Clicked', { actionType });

      const redirectParams = this.deepLinkService.getJsonFromUrl(url);
      this.deepLinkService.redirect(redirectParams);
    });
  }
}

