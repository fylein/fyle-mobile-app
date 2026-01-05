import { Component, inject, Input, OnInit } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController, Platform } from '@ionic/angular/standalone';
import { finalize, tap } from 'rxjs';
import { NotificationEventItem } from 'src/app/core/models/notification-event-item.model';
import { NotificationEventsEnum } from 'src/app/core/models/notification-events.enum';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-notifications',
  templateUrl: './email-notifications.component.html',
  styleUrls: ['./email-notifications.component.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    MatCheckbox,
    MatIcon
  ],
})
export class EmailNotificationsComponent implements OnInit {
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

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() unsubscribedPushEventsByUser: string[];

  isLongTitle = false;

  isIos = false;

  selectAll = false;

  selectAllPush = false;

  saveText: '' | 'Saved' | 'Saving...' = '';

  showMobilePushColumn = false;

  private platform = inject(Platform);

  private modalController = inject(ModalController);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private trackingService = inject(TrackingService);

  updateSaveText(text: 'Saved' | 'Saving...'): void {
    this.saveText = text;
  }

  closeModal(): void {
    // saveText === 'Saved' implies the user has made changes
    const data = {
      employeeSettingsUpdated: this.saveText === 'Saved',
    };
    this.modalController.dismiss(data);
  }

  updateSelectAll(): void {
    this.selectAll = this.notifications.every((n) => n.email);
    this.selectAllPush = this.notifications.every((n) => n.push ?? true);
  }

  toggleAllNotifications(selectAll: boolean, type: 'email' | 'push'): void {
    const isSelected = selectAll;
    this.notifications = this.notifications.map((notification) => ({ ...notification, [type]: isSelected }));
    this.updateSelectAll();

    this.updateNotificationSettings();
  }

  toggleNotification(updatedNotification: NotificationEventItem, type: 'email' | 'push' = 'email'): void {
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
    const otherPushUnsubscribedEvents = (this.unsubscribedPushEventsByUser ?? []).filter(
      (event) => !currentEventTypes.has(event as NotificationEventsEnum),
    );

    // PUSH: Add events that are currently unsubscribed in this modal
    const currentlyPushUnsubscribedEvents = this.notifications
      .filter((notification) => notification.push === false)
      .map((notification) => notification.eventEnum);

    const updatedPushUnsubscribedEventsByUser = [
      ...otherPushUnsubscribedEvents,
      ...currentlyPushUnsubscribedEvents,
    ];

    this.employeeSettings.notification_settings.push_unsubscribed_events = updatedPushUnsubscribedEventsByUser;
    this.updateEmployeeSettings();

    this.trackingService.eventTrack('Email notifications updated from mobile app', {
      unsubscribedEvents: updatedEmailUnsubscribedEventsByUser,
      pushUnsubscribedEvents: updatedPushUnsubscribedEventsByUser,
    });
  }

  updateEmployeeSettings(): void {
    this.updateSaveText('Saving...');
    this.platformEmployeeSettingsService
      .post(this.employeeSettings)
      .pipe(
        tap(() => this.platformEmployeeSettingsService.clearEmployeeSettings()),
        finalize(() => this.updateSaveText('Saved')),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');
    this.isLongTitle = this.title.length > 25;
    this.updateSelectAll();

    this.showMobilePushColumn =
      this.title === 'Expense notifications' || this.title === 'Expense report notifications';
  }
}
