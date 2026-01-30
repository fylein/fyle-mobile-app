import { Component, inject, Input, OnInit, OnDestroy, input } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
  Platform,
  PopoverController,
} from '@ionic/angular/standalone';
import { finalize, forkJoin, from, tap } from 'rxjs';
import { NotificationEventItem } from 'src/app/core/models/notification-event-item.model';
import { NotificationEventsEnum } from 'src/app/core/models/notification-events.enum';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { FyAlertInfoComponent } from 'src/app/shared/components/fy-alert-info/fy-alert-info.component';
import { PushNotifications } from '@capacitor/push-notifications';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FormButtonValidationDirective } from 'src/app/shared/directive/form-button-validation.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
@Component({
  selector: 'app-email-notifications',
  templateUrl: './email-notifications.component.html',
  styleUrls: ['./email-notifications.component.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    MatCheckbox,
    MatIcon,
    FyAlertInfoComponent,
    IonFooter,
    TranslocoPipe,
    FormButtonValidationDirective
  ],
})
export class EmailNotificationsComponent implements OnInit, OnDestroy {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() title: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() notifications: NotificationEventItem[];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() employeeSettings: EmployeeSettings;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() unsubscribedEventsByUser: string[];

  readonly unsubscribedPushEventsByUser = input<string[]>([]);

  isLongTitle = false;

  isIos = false;

  saveChangesLoader = false;

  selectAllEmail = false;

  selectAllMobile = false;

  selectAllPush = false;

  saveText: '' | 'Saved' | 'Saving...' = '';

  showMobilePushColumn = false;

  hasChanges = false;

  isPushPermissionDenied = false;

  appStateChangeListener: PluginListenerHandle | null = null;

  private platform = inject(Platform);

  nativeSettings = NativeSettings;

  private modalController = inject(ModalController);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private trackingService = inject(TrackingService);

  private popoverController = inject(PopoverController);

  private translocoService = inject(TranslocoService);

  private launchDarklyService = inject(LaunchDarklyService);

  private matSnackBar = inject(MatSnackBar);

  private snackbarProperties = inject(SnackbarPropertiesService);

  updateSaveText(text: 'Saved' | 'Saving...'): void {
    this.saveText = text;
  }

  async closeModal(): Promise<void> {
    if (this.hasChanges) {
      const title = this.translocoService.translate('emailNotifications.unsavedChangesTitle');
      const message = this.translocoService.translate('emailNotifications.unsavedChangesMessage');
      const primaryCtaText = this.translocoService.translate('emailNotifications.unsavedChangesPrimaryCta');
      const secondaryCtaText = this.translocoService.translate('emailNotifications.unsavedChangesSecondaryCta');

      const unsavedChangesPopOver = await this.popoverController.create({
        component: PopupAlertComponent,
        componentProps: {
          title,
          message,
          primaryCta: {
            text: primaryCtaText,
            action: 'discard',
            type: 'alert',
          },
          secondaryCta: {
            text: secondaryCtaText,
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });

      await unsavedChangesPopOver.present();

      const { data } = (await unsavedChangesPopOver.onWillDismiss()) as { data: { action: string } };

      if (data && data.action === 'discard') {
        this.hasChanges = false;
        this.modalController.dismiss({ employeeSettingsUpdated: false });
      }
    } else {
      this.modalController.dismiss({ employeeSettingsUpdated: false });
    }
  }

  updateSelectAll(): void {
    this.selectAllEmail = this.notifications.every((n) => n.email);
    this.selectAllMobile = this.notifications.every((n) => n.mobile ?? true);
  }

  toggleAllNotifications(selectAll: boolean, type: 'email' | 'mobile'): void {
    const isSelected = selectAll;
    this.notifications = this.notifications.map((notification) => ({ ...notification, [type]: isSelected }));
    this.updateSelectAll();

    this.updateNotificationSettings();
  }

  toggleNotification(updatedNotification: NotificationEventItem, type: 'email' | 'mobile' = 'email'): void {
    updatedNotification[type] = !updatedNotification[type];
    this.updateSelectAll();
    this.updateNotificationSettings();
  }

  updateNotificationSettings(): void {
    const currentEventTypes = new Set(this.notifications.map((notification) => notification.eventEnum));

    // EMAIL: Keep events unsubscribed from other notification types
    const otherEmailUnsubscribedEvents = this.unsubscribedEventsByUser.filter(
      (event) => !currentEventTypes.has(event as NotificationEventsEnum),
    );

    // EMAIL: Add events that are currently unsubscribed in this modal
    const currentlyEmailUnsubscribedEvents = this.notifications
      .filter((notification) => !notification.email)
      .map((notification) => notification.eventEnum);

    const updatedEmailUnsubscribedEventsByUser = [
      ...otherEmailUnsubscribedEvents,
      ...currentlyEmailUnsubscribedEvents,
    ];

    this.employeeSettings.notification_settings.email_unsubscribed_events = updatedEmailUnsubscribedEventsByUser;

    // PUSH: Keep events unsubscribed from other notification types
    const otherPushUnsubscribedEvents = (this.unsubscribedPushEventsByUser() ?? []).filter(
      (event) => !currentEventTypes.has(event as NotificationEventsEnum),
    );

    // PUSH: Add events that are currently unsubscribed in this modal
    const currentlyPushUnsubscribedEvents = this.notifications
      .filter((notification) => notification.mobile === false)
      .map((notification) => notification.eventEnum);

    const updatedPushUnsubscribedEventsByUser = [
      ...otherPushUnsubscribedEvents,
      ...currentlyPushUnsubscribedEvents,
    ];

    this.employeeSettings.notification_settings.push_unsubscribed_events = updatedPushUnsubscribedEventsByUser;

    // Mark that there are unsaved changes which can be persisted via CTA
    this.hasChanges = true;
  }

  updateEmployeeSettings(): void {
    this.saveChangesLoader = true;
    this.platformEmployeeSettingsService
      .post(this.employeeSettings)
      .pipe(
        tap(() => this.platformEmployeeSettingsService.clearEmployeeSettings()),
        finalize(() => {
          this.saveChangesLoader = false;
        }),
      )
      .subscribe({
        next: () => {
          this.showSuccessToast();
          this.modalController.dismiss({ employeeSettingsUpdated: true });
        },
      });
  }

  private showSuccessToast(): void {
    const message = this.translocoService.translate('emailNotifications.notificationsUpdatedSuccessMessage');
    this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('success', { message }),
      panelClass: 'msb-success',
    });
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  saveChanges(): void {
    // Ensure notification settings are in sync with current UI state
    this.updateNotificationSettings();

    const emailUnsubscribedEvents =
      this.employeeSettings.notification_settings.email_unsubscribed_events ?? [];
    const pushUnsubscribedEvents =
      this.employeeSettings.notification_settings.push_unsubscribed_events ?? [];

    this.updateEmployeeSettings();

    this.trackingService.eventTrack('Email notifications updated from mobile app', {
      unsubscribedEvents: emailUnsubscribedEvents,
      pushUnsubscribedEvents,
    });

    this.hasChanges = false;
  }

  openDeviceSettings(): void {
    this.nativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
  }

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');
    this.isLongTitle = this.title.length > 20;
    this.updateSelectAll();

    const isPushColumnSupportedForTitle =
      this.title === 'Expense notifications' || this.title === 'Expense report notifications';

    forkJoin({
      isPushNotifUiEnabled: this.launchDarklyService.getVariation('show_push_notif_ui', false),
      permissionStatus: from(PushNotifications.checkPermissions()),
    }).subscribe(({ isPushNotifUiEnabled, permissionStatus }) => {
      this.showMobilePushColumn = isPushNotifUiEnabled && isPushColumnSupportedForTitle;
      this.isPushPermissionDenied =
        isPushNotifUiEnabled && isPushColumnSupportedForTitle && permissionStatus.receive !== 'granted';

      if (this.showMobilePushColumn) {
        this.startAppStateListener();
      }
    });
  }

  ngOnDestroy(): void {
    this.appStateChangeListener?.remove();
    this.appStateChangeListener = null;
  }

  private startAppStateListener(): void {
    if (this.appStateChangeListener) {
      return;
    }

    // Only register native app state listeners on native platforms.
    if (typeof (Capacitor as any).isNativePlatform === 'function' && !Capacitor.isNativePlatform()) {
      return;
    }

    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive || !this.showMobilePushColumn) {
        return;
      }

      return PushNotifications.checkPermissions().then((latestPermission) => {
        const hasPermission = latestPermission.receive === 'granted';

        if (hasPermission && this.isPushPermissionDenied) {
          this.isPushPermissionDenied = false;
          return PushNotifications.register();
        } else if (!hasPermission) {
          this.isPushPermissionDenied = true;
        }

        return;
      });
    }).then((listener) => {
      this.appStateChangeListener = listener;
    });
  }
}
