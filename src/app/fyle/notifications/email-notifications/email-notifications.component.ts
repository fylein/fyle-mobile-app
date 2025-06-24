import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { finalize, tap } from 'rxjs';
import { NotificationEventItem } from 'src/app/core/models/notification-event-item.model';
import { NotificationEventsEnum } from 'src/app/core/models/notification-events.enum';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-email-notifications',
  templateUrl: './email-notifications.component.html',
  styleUrls: ['./email-notifications.component.scss'],
})
export class EmailNotificationsComponent implements OnInit {
  @Input() title: string;

  @Input() notifications: NotificationEventItem[];

  @Input() orgUserSettings: OrgUserSettings;

  @Input() unsubscribedEventsByUser: string[];

  isIos = false;

  selectAll = false;

  saveText: '' | 'Saved' | 'Saving...' = '';

  private platform = inject(Platform);

  private modalController = inject(ModalController);

  private orgUserSettingsService = inject(OrgUserSettingsService);

  private trackingService = inject(TrackingService);

  updateSaveText(text: 'Saved' | 'Saving...'): void {
    this.saveText = text;
  }

  closeModal(): void {
    // saveText === 'Saved' implies the user has made changes
    const data = {
      orgUserSettingsUpdated: this.saveText === 'Saved',
    };
    this.modalController.dismiss(data);
  }

  updateSelectAll(): void {
    this.selectAll = this.notifications.every((n) => n.email);
  }

  toggleAllNotifications(selectAll: boolean): void {
    const isSelected = selectAll;
    this.notifications = this.notifications.map((notification) => ({ ...notification, email: isSelected }));
    this.updateSelectAll();

    this.updateNotificationSettings();
  }

  toggleNotification(updatedNotification: NotificationEventItem): void {
    const updatedNotifications = this.notifications.map((notification) =>
      notification.eventEnum === updatedNotification.eventEnum
        ? { ...notification, email: updatedNotification.email }
        : notification
    );
    this.notifications = updatedNotifications;
    this.updateSelectAll();

    this.updateNotificationSettings();
  }

  updateNotificationSettings(): void {
    const currentEventTypes = new Set(this.notifications.map((notification) => notification.eventEnum));

    // Keep events unsubscribed from other notification types
    const otherUnsubscribedEvents = this.unsubscribedEventsByUser.filter(
      (event) => !currentEventTypes.has(event as NotificationEventsEnum)
    );

    // Add events that are currently unsubscribed in this modal
    const currentlyUnsubscribedEvents = this.notifications
      .filter((notification) => !notification.email)
      .map((notification) => notification.eventEnum);

    const updatedUnsubscribedEventsByUser = [...otherUnsubscribedEvents, ...currentlyUnsubscribedEvents];

    this.orgUserSettings.notification_settings.email.unsubscribed_events = updatedUnsubscribedEventsByUser;
    this.updateOrgUserSettings();

    this.trackingService.eventTrack('Email notifications updated from mobile app', {
      unsubscribedEvents: updatedUnsubscribedEventsByUser,
    });
  }

  updateOrgUserSettings(): void {
    this.updateSaveText('Saving...');
    this.orgUserSettingsService
      .post(this.orgUserSettings)
      .pipe(
        tap(() => this.orgUserSettingsService.clearOrgUserSettings()),
        finalize(() => this.updateSaveText('Saved'))
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.isIos = this.platform.is('ios');
    this.updateSelectAll();
  }
}
