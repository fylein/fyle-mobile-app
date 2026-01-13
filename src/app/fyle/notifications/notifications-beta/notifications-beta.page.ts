import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { finalize, forkJoin, from, map, Observable, tap } from 'rxjs';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { NotificationsBetaPageService } from './notifications-beta.page.service';
import { NotificationConfig } from 'src/app/core/models/notification-config.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonSkeletonText, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { EmailNotificationsComponent } from '../email-notifications/email-notifications.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { PushNotifications } from '@capacitor/push-notifications';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-notifications-beta',
  templateUrl: './notifications-beta.page.html',
  styleUrls: ['./notifications-beta.page.scss'],
  imports: [
    AsyncPipe,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    MatIcon,
    TranslocoPipe
  ],
})
export class NotificationsBetaPage implements OnInit {
  selectedPreference: 'onlyMe' | 'onlyDelegate' | 'both';

  isDelegateePresent$: Observable<boolean>;

  delegateNotificationOptions = [
    { label: 'Notify only me', value: 'onlyMe' },
    { label: 'Notify only my delegate', value: 'onlyDelegate' },
    { label: 'Notify both me and my delegate', value: 'both' },
  ];

  isLoading = false;

  isAdvancesEnabled = false;

  expenseNotificationsConfig: NotificationConfig;

  expenseReportNotificationsConfig: NotificationConfig;

  advanceNotificationsConfig: NotificationConfig;

  employeeSettings: EmployeeSettings;

  orgSettings: OrgSettings;

  currentEou: ExtendedOrgUser;

  isNotificationsDisabled = false;

  isInitialLoading: boolean;

  isPushPermissionDenied = false;

  showMobilePushColumn = false;

  private router = inject(Router);

  private notificationsBetaPageService = inject(NotificationsBetaPageService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private orgSettingsService = inject(PlatformOrgSettingsService);

  private authService = inject(AuthService);

  private employeesService = inject(EmployeesService);

  private modalController = inject(ModalController);

  private modalPropertiesService = inject(ModalPropertiesService);

  private trackingService = inject(TrackingService);

  private launchDarklyService = inject(LaunchDarklyService);

  nativeSettings = NativeSettings;

  ngOnInit(): void {
    this.isInitialLoading = true;
    forkJoin({
      orgData: this.getOrgSettings(),
      isPushNotifUiEnabled: this.launchDarklyService.getVariation('show_push_notif_ui', false),
      permissionStatus: from(PushNotifications.checkPermissions()),
    }).subscribe(({ orgData, isPushNotifUiEnabled, permissionStatus }) => {
      const { orgSettings, employeeSettings, currentEou } = orgData;
      this.orgSettings = orgSettings;
      this.employeeSettings = employeeSettings;
      this.currentEou = currentEou;
      this.isAdvancesEnabled = this.orgSettings.advances?.allowed && this.orgSettings.advances?.enabled;

      this.showMobilePushColumn = isPushNotifUiEnabled;
      this.isPushPermissionDenied = isPushNotifUiEnabled && permissionStatus.receive !== 'granted';

      this.initializeEmailNotificationsConfig();
      this.initializeDelegateNotification();
    });
  }

  initializeEmailNotificationsConfig(): void {
    const emailNotificationsConfig = this.notificationsBetaPageService.getEmailNotificationsConfig(
      this.orgSettings,
      this.employeeSettings,
      this.currentEou,
    );

    this.expenseNotificationsConfig = emailNotificationsConfig.expenseNotificationsConfig;
    this.expenseReportNotificationsConfig = emailNotificationsConfig.expenseReportNotificationsConfig;
    this.advanceNotificationsConfig = emailNotificationsConfig.advanceNotificationsConfig;

    this.isNotificationsDisabled =
      this.expenseNotificationsConfig.notifications.length === 0 &&
      this.expenseReportNotificationsConfig.notifications.length === 0 &&
      this.advanceNotificationsConfig.notifications.length === 0;
  }

  getOrgSettings(): Observable<{
    orgSettings: OrgSettings;
    employeeSettings: EmployeeSettings;
    currentEou: ExtendedOrgUser;
  }> {
    return forkJoin({
      orgSettings: this.orgSettingsService.get(),
      employeeSettings: this.platformEmployeeSettingsService.get(),
      currentEou: from(this.authService.getEou()),
    }).pipe(finalize(() => (this.isInitialLoading = false)));
  }

  initializeDelegateNotification(): void {
    if (!this.currentEou?.us?.id) {
      this.isDelegateePresent$ = from(Promise.resolve(false));
      return;
    }

    this.isDelegateePresent$ = from(this.employeesService.getByParams({ user_id: `eq.${this.currentEou.us.id}` })).pipe(
      map((employeesResponse) => employeesResponse?.data[0]?.delegatees?.length > 0),
      tap((isDelegateePresent) => {
        if (isDelegateePresent) {
          this.initializeSelectedPreference();
        }
      }),
    );
  }

  initializeSelectedPreference(): void {
    this.selectedPreference = this.notificationsBetaPageService.getInitialDelegateNotificationPreference(
      this.employeeSettings,
    );
  }

  async openNotificationModal(notificationConfig: NotificationConfig): Promise<void> {
    const unsubscribedEventsByUser: string[] =
      this.employeeSettings.notification_settings.email_unsubscribed_events ?? [];
    const unsubscribedPushEventsByUser: string[] =
      this.employeeSettings.notification_settings.push_unsubscribed_events ?? [];

    // Take a deep copy of the current notification settings so we can restore
    // them if the modal is closed without saving.
    const originalNotificationSettings: EmployeeSettings['notification_settings'] = {
      email_allowed: this.employeeSettings.notification_settings.email_allowed,
      email_enabled: this.employeeSettings.notification_settings.email_enabled,
      email_unsubscribed_events: [...this.employeeSettings.notification_settings.email_unsubscribed_events],
      push_allowed: this.employeeSettings.notification_settings.push_allowed,
      push_enabled: this.employeeSettings.notification_settings.push_enabled,
      push_unsubscribed_events: [...this.employeeSettings.notification_settings.push_unsubscribed_events],
      notify_user: this.employeeSettings.notification_settings.notify_user,
      notify_delegatee: this.employeeSettings.notification_settings.notify_delegatee,
    };

    // Use a cloned notifications array so changes inside the modal don't mutate
    // the cached config on this page unless the user actually saves.
    const clonedNotifications = notificationConfig.notifications.map((notification) => ({ ...notification }));

    const emailNotificationsModal = await this.modalController.create({
      component: EmailNotificationsComponent,
      componentProps: {
        title: notificationConfig.title,
        notifications: clonedNotifications,
        employeeSettings: this.employeeSettings,
        unsubscribedEventsByUser,
        unsubscribedPushEventsByUser,
      },
      ...this.modalPropertiesService.getModalDefaultProperties(),
      initialBreakpoint: 1,
      breakpoints: [0, 1],
    });

    await emailNotificationsModal.present();
    const { data } = (await emailNotificationsModal.onWillDismiss()) as OverlayResponse<{
      employeeSettingsUpdated: boolean;
    }>;
    if (data?.employeeSettingsUpdated) {
      // Refetch fresh employee settings (cache is already busted by the POST)
      this.platformEmployeeSettingsService.get().subscribe((employeeSettings) => {
        this.employeeSettings = employeeSettings;
        this.initializeEmailNotificationsConfig();
        this.initializeDelegateNotification();
      });
    } else {
      this.employeeSettings.notification_settings = originalNotificationSettings;
      this.platformEmployeeSettingsService.clearEmployeeSettings().subscribe();
    }
  }

  selectPreference(value: 'onlyMe' | 'onlyDelegate' | 'both'): void {
    this.selectedPreference = value;
    this.updateDelegateNotificationPreference();
  }

  updateDelegateNotificationPreference(): void {
    switch (this.selectedPreference) {
      case 'onlyMe':
        this.employeeSettings.notification_settings.notify_delegatee = false;
        this.employeeSettings.notification_settings.notify_user = true;
        break;
      case 'onlyDelegate':
        this.employeeSettings.notification_settings.notify_delegatee = true;
        this.employeeSettings.notification_settings.notify_user = false;
        break;
      case 'both':
        this.employeeSettings.notification_settings.notify_delegatee = true;
        this.employeeSettings.notification_settings.notify_user = true;
        break;
    }

    this.platformEmployeeSettingsService.post(this.employeeSettings).subscribe(() => {
      this.trackingService.eventTrack('Delegate notification preference updated from mobile app', {
        preference: this.selectedPreference,
      });
      this.platformEmployeeSettingsService.clearEmployeeSettings();
    });
  }

  goBack(): void {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }

  openDeviceSettings(): void {
    this.nativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
  }
}
