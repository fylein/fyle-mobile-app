import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { DeepLinkService } from './deep-link.service';
import { TrackingService } from './tracking.service';
import { UserEventService } from './user-event.service';
import { OrgUserService } from './org-user.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private listenersInitialized = false;

  private deepLinkService: DeepLinkService = inject(DeepLinkService);

  private trackingService: TrackingService = inject(TrackingService);

  private userEventService: UserEventService = inject(UserEventService);

  private orgUserService: OrgUserService = inject(OrgUserService);

  private storageService: StorageService = inject(StorageService);

  constructor() {
    this.userEventService.onLogout(() => {
      void this.unregister();
    });
  }

  initializePushNotifications(): Promise<void> {
    return this.storageService.get<boolean>('push_notifications_permission_requested').then((alreadyRequested) => {
      if (alreadyRequested) {
        return;
      }

      return PushNotifications.requestPermissions().then((permission) => {
        if (permission.receive) {
          void this.storageService.set('push_notifications_permission_requested', true);
        }

        if (permission.receive === 'granted') {
          this.initListeners();
          return this.register();
        }

        return;
      });
    });
  }

  checkPermissions(): Promise<{ receive: string }> {
    return PushNotifications.checkPermissions();
  }

  unregister(): Promise<void> {
    return PushNotifications.unregister();
  }

  register(): Promise<void> {
    return PushNotifications.register();
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

  addRegistrationListener(): void {
    PushNotifications.addListener('registration', (token: Token) => {
      const tokenValue = token?.value;
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

