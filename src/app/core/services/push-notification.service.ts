import { Injectable, NgZone, inject } from '@angular/core';
import { PushNotifications, Token, PermissionStatus } from '@capacitor/push-notifications';
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

  private notificationClickListenerInitialized = false;

  private deepLinkService: DeepLinkService = inject(DeepLinkService);

  private trackingService: TrackingService = inject(TrackingService);

  private userEventService: UserEventService = inject(UserEventService);

  private orgUserService: OrgUserService = inject(OrgUserService);

  private storageService: StorageService = inject(StorageService);

  private zone: NgZone = inject(NgZone);

  constructor() {
    this.userEventService.onLogout(() => {
      void this.unregister();
    });
  }

  /**
   * Initialize only the notification click listener.
   * This should be called as early as possible during app initialization
   * to catch notifications that launched the app from a killed state.
   */
  initializeNotificationClickListener(): void {
    if (this.notificationClickListenerInitialized) {
      return;
    }

    this.notificationClickListenerInitialized = true;
    this.addNotificationClickListener();
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

  checkPermissions(): Promise<PermissionStatus> {
    return PushNotifications.checkPermissions().then((permission: PermissionStatus) => {
      if (permission.receive === 'granted') {
        this.initListeners();
        void this.register();
      }

      return permission;
    });
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
    // Only add notification click listener if not already initialized
    // (it may have been initialized early via initializeNotificationClickListener)
    if (!this.notificationClickListenerInitialized) {
      this.notificationClickListenerInitialized = true;
      this.addNotificationClickListener();
    }
  }

  addRegistrationListener(): Promise<{ remove: () => void }> {
    return PushNotifications.addListener('registration', (token: Token) => {
      const tokenValue = token?.value;
      if (tokenValue) {
        this.orgUserService.sendDeviceToken(tokenValue).subscribe(() => {
          this.trackingService.eventTrack('Push Notification Registered');
        });
      }
    });
  }

  private addNotificationClickListener(): void {
    PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
      this.zone.run(() => {
        const data = (event?.notification?.data as { cta_url?: string; push_notification_type?: string }) ?? {};
        const url = data.cta_url;
        const actionType = data.push_notification_type;

        if (!url || typeof url !== 'string') {
          return;
        }

        this.trackingService.eventTrack('Push Notification Clicked', { actionType });

        const redirectParams = this.deepLinkService.getJsonFromUrl(url);
        this.deepLinkService.redirect(redirectParams, actionType);
      });
    });
  }
}

