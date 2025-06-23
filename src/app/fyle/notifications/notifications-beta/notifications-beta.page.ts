import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { finalize, forkJoin, from, map, Observable, switchMap, tap } from 'rxjs';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { NotificationsBetaPageService } from './notifications-beta.page.service';
import { NotificationConfig } from 'src/app/core/models/notification-config.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { EmailNotificationsComponent } from '../email-notifications/email-notifications.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';

@Component({
  selector: 'app-notifications-beta',
  templateUrl: './notifications-beta.page.html',
  styleUrls: ['./notifications-beta.page.scss'],
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

  orgUserSettings: OrgUserSettings;

  orgSettings: OrgSettings;

  private router = inject(Router);

  private notificationsBetaPageService = inject(NotificationsBetaPageService);

  private orgUserSettingsService = inject(OrgUserSettingsService);

  private orgSettingsService = inject(OrgSettingsService);

  private authService = inject(AuthService);

  private employeesService = inject(EmployeesService);

  private modalController = inject(ModalController);

  private modalPropertiesService = inject(ModalPropertiesService);

  private trackingService = inject(TrackingService);

  ngOnInit(): void {
    this.getOrgSettings().subscribe(({ orgSettings, orgUserSettings }) => {
      this.orgSettings = orgSettings;
      this.orgUserSettings = orgUserSettings;
      this.isAdvancesEnabled = this.orgSettings.advances?.allowed && this.orgSettings.advances?.enabled;

      this.initializeEmailNotificationsConfig();
      this.initializeDelegateNotification();
    });
  }

  initializeEmailNotificationsConfig(): void {
    const emailNotificationsConfig = this.notificationsBetaPageService.getEmailNotificationsConfig(
      this.orgSettings,
      this.orgUserSettings
    );

    this.expenseNotificationsConfig = emailNotificationsConfig.expenseNotificationsConfig;
    this.expenseReportNotificationsConfig = emailNotificationsConfig.expenseReportNotificationsConfig;
    this.advanceNotificationsConfig = emailNotificationsConfig.advanceNotificationsConfig;
  }

  getOrgSettings(): Observable<{ orgSettings: OrgSettings; orgUserSettings: OrgUserSettings }> {
    this.isLoading = true;
    return forkJoin({
      orgSettings: this.orgSettingsService.get(),
      orgUserSettings: this.orgUserSettingsService.get(),
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    );
  }

  initializeDelegateNotification(): void {
    this.isDelegateePresent$ = from(this.authService.getEou()).pipe(
      switchMap((res) => this.employeesService.getByParams({ user_id: `eq.${res.us.id}` })),
      map((employeesResponse) => employeesResponse?.data[0]?.delegatees?.length > 0),
      tap((isDelegateePresent) => {
        if (isDelegateePresent) {
          this.initializeSelectedPreference();
        }
      })
    );
  }

  initializeSelectedPreference(): void {
    this.selectedPreference = this.notificationsBetaPageService.getInitialDelegateNotificationPreference(
      this.orgUserSettings
    );
  }

  async openNotificationModal(notificationConfig: NotificationConfig): Promise<void> {
    const unsubscribedEventsByUser: string[] =
      this.orgUserSettings.notification_settings.email?.unsubscribed_events ?? [];

    const emailNotificationsModal = await this.modalController.create({
      component: EmailNotificationsComponent,
      componentProps: {
        title: notificationConfig.title,
        notifications: notificationConfig.notifications,
        orgUserSettings: this.orgUserSettings,
        unsubscribedEventsByUser,
      },
      ...this.modalPropertiesService.getModalDefaultProperties(),
    });

    await emailNotificationsModal.present();
    const { data } = (await emailNotificationsModal.onWillDismiss()) as OverlayResponse<{
      orgUserSettingsUpdated: boolean;
    }>;
    if (data?.orgUserSettingsUpdated) {
      this.ngOnInit();
    }
  }

  selectPreference(value: 'onlyMe' | 'onlyDelegate' | 'both'): void {
    this.selectedPreference = value;
    this.updateDelegateNotificationPreference();
  }

  updateDelegateNotificationPreference(): void {
    switch (this.selectedPreference) {
      case 'onlyMe':
        this.orgUserSettings.notification_settings.notify_delegatee = false;
        this.orgUserSettings.notification_settings.notify_user = true;
        break;
      case 'onlyDelegate':
        this.orgUserSettings.notification_settings.notify_delegatee = true;
        this.orgUserSettings.notification_settings.notify_user = false;
        break;
      case 'both':
        this.orgUserSettings.notification_settings.notify_delegatee = true;
        this.orgUserSettings.notification_settings.notify_user = true;
        break;
    }

    this.orgUserSettingsService.post(this.orgUserSettings).subscribe(() => {
      this.trackingService.eventTrack('Delegate notification preference updated from mobile app', {
        preference: this.selectedPreference,
      });
      this.orgUserSettingsService.clearOrgUserSettings();
    });
  }

  goBack(): void {
    this.router.navigate(['/', 'enterprise', 'my_profile']);
  }
}
