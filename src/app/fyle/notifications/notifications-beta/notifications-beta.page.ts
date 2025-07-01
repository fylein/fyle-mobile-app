import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { finalize, forkJoin, from, map, Observable, switchMap, tap } from 'rxjs';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
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

  employeeSettings: EmployeeSettings;

  orgSettings: OrgSettings;

  private router = inject(Router);

  private notificationsBetaPageService = inject(NotificationsBetaPageService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private orgSettingsService = inject(OrgSettingsService);

  private authService = inject(AuthService);

  private employeesService = inject(EmployeesService);

  private modalController = inject(ModalController);

  private modalPropertiesService = inject(ModalPropertiesService);

  private trackingService = inject(TrackingService);

  ngOnInit(): void {
    this.getOrgSettings().subscribe(({ orgSettings, employeeSettings }) => {
      this.orgSettings = orgSettings;
      this.employeeSettings = employeeSettings;
      this.isAdvancesEnabled = this.orgSettings.advances?.allowed && this.orgSettings.advances?.enabled;

      this.initializeEmailNotificationsConfig();
      this.initializeDelegateNotification();
    });
  }

  initializeEmailNotificationsConfig(): void {
    const emailNotificationsConfig = this.notificationsBetaPageService.getEmailNotificationsConfig(
      this.orgSettings,
      this.employeeSettings
    );

    this.expenseNotificationsConfig = emailNotificationsConfig.expenseNotificationsConfig;
    this.expenseReportNotificationsConfig = emailNotificationsConfig.expenseReportNotificationsConfig;
    this.advanceNotificationsConfig = emailNotificationsConfig.advanceNotificationsConfig;
  }

  getOrgSettings(): Observable<{ orgSettings: OrgSettings; employeeSettings: EmployeeSettings }> {
    this.isLoading = true;
    return forkJoin({
      orgSettings: this.orgSettingsService.get(),
      employeeSettings: this.platformEmployeeSettingsService.get(),
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
      this.employeeSettings
    );
  }

  async openNotificationModal(notificationConfig: NotificationConfig): Promise<void> {
    const unsubscribedEventsByUser: string[] =
      this.employeeSettings.notification_settings.email_unsubscribed_events ?? [];

    const emailNotificationsModal = await this.modalController.create({
      component: EmailNotificationsComponent,
      componentProps: {
        title: notificationConfig.title,
        notifications: notificationConfig.notifications,
        employeeSettings: this.employeeSettings,
        unsubscribedEventsByUser,
      },
      ...this.modalPropertiesService.getModalDefaultProperties('email-notifications-modal'),
    });

    await emailNotificationsModal.present();
    const { data } = (await emailNotificationsModal.onWillDismiss()) as OverlayResponse<{
      employeeSettingsUpdated: boolean;
    }>;
    if (data?.employeeSettingsUpdated) {
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
}
