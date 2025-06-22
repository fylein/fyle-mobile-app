import { TestBed } from '@angular/core/testing';
import { NotificationsBetaPageService } from './notifications-beta.page.service';
import { NotificationEventsEnum } from 'src/app/core/models/notification-events.enum';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { cloneDeep } from 'lodash';
import {
  advanceNotifications,
  expenseNotifications,
  expenseReportNotifications,
} from 'src/app/core/mock-data/notification-events.data';

fdescribe('NotificationsBetaPageService', () => {
  let service: NotificationsBetaPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationsBetaPageService],
    });
    service = TestBed.inject(NotificationsBetaPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInitialDelegateNotificationPreference():', () => {
    it('should return "onlyMe" when notify_user is true and notify_delegatee is false', () => {
      const orgUserSettings = cloneDeep(orgUserSettingsData);
      orgUserSettings.notification_settings.notify_user = true;
      orgUserSettings.notification_settings.notify_delegatee = false;

      const result = service.getInitialDelegateNotificationPreference(orgUserSettings);

      expect(result).toBe('onlyMe');
    });

    it('should return "onlyDelegate" when notify_user is false and notify_delegatee is true', () => {
      const orgUserSettings = cloneDeep(orgUserSettingsData);
      orgUserSettings.notification_settings.notify_user = false;
      orgUserSettings.notification_settings.notify_delegatee = true;

      const result = service.getInitialDelegateNotificationPreference(orgUserSettings);

      expect(result).toBe('onlyDelegate');
    });

    it('should return "both" when both notify_user and notify_delegatee are true', () => {
      const orgUserSettings = cloneDeep(orgUserSettingsData);
      orgUserSettings.notification_settings.notify_user = true;
      orgUserSettings.notification_settings.notify_delegatee = true;

      const result = service.getInitialDelegateNotificationPreference(orgUserSettings);

      expect(result).toBe('both');
    });
  });

  describe('getExpenseNotifications():', () => {
    it('should return expense notifications with correct structure', () => {
      const result = service.getExpenseNotifications();
      expect(result).toEqual(expenseNotifications);
    });

    it('should return 4 expense notifications', () => {
      const result = service.getExpenseNotifications();
      expect(result.length).toBe(4);
    });
  });

  describe('getReportNotifications():', () => {
    it('should return report notifications with correct structure', () => {
      const result = service.getReportNotifications();
      expect(result).toEqual(expenseReportNotifications);
    });

    it('should return 5 report notifications', () => {
      const result = service.getReportNotifications();
      expect(result.length).toBe(5);
    });
  });

  describe('getAdvanceNotifications():', () => {
    it('should return advance notifications with correct structure', () => {
      const result = service.getAdvanceNotifications();
      expect(result).toEqual(advanceNotifications);
    });

    it('should return 6 advance notifications', () => {
      const result = service.getAdvanceNotifications();
      expect(result.length).toBe(6);
    });
  });

  describe('getEmailNotificationsConfig():', () => {
    let orgSettings: any;
    let orgUserSettings: any;

    beforeEach(() => {
      orgSettings = cloneDeep(orgSettingsData);
      orgUserSettings = cloneDeep(orgUserSettingsData);
    });

    it('should return email notifications config with correct structure', () => {
      const result = service.getEmailNotificationsConfig(orgSettings, orgUserSettings);

      expect(result).toEqual({
        expenseNotificationsConfig: {
          title: 'Expense notifications',
          notifications: jasmine.any(Array),
        },
        expenseReportNotificationsConfig: {
          title: 'Expense report notifications',
          notifications: jasmine.any(Array),
        },
        advanceNotificationsConfig: {
          title: 'Advance notifications',
          notifications: jasmine.any(Array),
        },
      });
    });

    it('should filter out admin-disabled notifications', () => {
      orgSettings.admin_email_settings = {
        unsubscribed_events: [NotificationEventsEnum.EOUS_FORWARD_EMAIL_TO_USER],
      };

      const result = service.getEmailNotificationsConfig(orgSettings, orgUserSettings);

      const expenseNotifications = result.expenseNotificationsConfig.notifications;
      const filteredNotification = expenseNotifications.find(
        (notification) => notification.eventEnum === NotificationEventsEnum.EOUS_FORWARD_EMAIL_TO_USER
      );

      expect(filteredNotification).toBeUndefined();
    });

    it('should apply user preferences to filter notifications', () => {
      orgUserSettings.notification_settings.email = {
        unsubscribed_events: [NotificationEventsEnum.ERPTS_SUBMITTED],
      };

      const result = service.getEmailNotificationsConfig(orgSettings, orgUserSettings);

      const reportNotifications = result.expenseReportNotificationsConfig.notifications;
      const userUnsubscribedNotification = reportNotifications.find(
        (notification) => notification.eventEnum === NotificationEventsEnum.ERPTS_SUBMITTED
      );

      expect(userUnsubscribedNotification?.email).toBeFalse();
    });

    it('should handle empty admin unsubscribed events', () => {
      orgSettings.admin_email_settings = {
        unsubscribed_events: [],
      };

      const result = service.getEmailNotificationsConfig(orgSettings, orgUserSettings);

      expect(result.expenseNotificationsConfig.notifications.length).toBe(4);
      expect(result.expenseReportNotificationsConfig.notifications.length).toBe(5);
      expect(result.advanceNotificationsConfig.notifications.length).toBe(6);
    });

    it('should handle empty user unsubscribed events', () => {
      orgUserSettings.notification_settings.email = {
        unsubscribed_events: [],
      };

      const result = service.getEmailNotificationsConfig(orgSettings, orgUserSettings);

      const allNotifications = [
        ...result.expenseNotificationsConfig.notifications,
        ...result.expenseReportNotificationsConfig.notifications,
        ...result.advanceNotificationsConfig.notifications,
      ];

      allNotifications.forEach((notification) => {
        expect(notification.email).toBeTrue();
      });
    });

    it('should apply both admin and user filters correctly', () => {
      // Admin disables one expense notification
      orgSettings.admin_email_settings = {
        unsubscribed_events: [NotificationEventsEnum.EOUS_FORWARD_EMAIL_TO_USER],
      };

      // User unsubscribes from one report notification
      orgUserSettings.notification_settings.email = {
        unsubscribed_events: [NotificationEventsEnum.ERPTS_SUBMITTED],
      };

      const result = service.getEmailNotificationsConfig(orgSettings, orgUserSettings);

      // Expense notifications should be filtered by admin (3 remaining, 1 removed)
      expect(result.expenseNotificationsConfig.notifications.length).toBe(3);

      // Report notifications should have one with email: false due to user preference
      const reportNotifications = result.expenseReportNotificationsConfig.notifications;
      const userUnsubscribedNotification = reportNotifications.find(
        (notification) => notification.eventEnum === NotificationEventsEnum.ERPTS_SUBMITTED
      );
      expect(userUnsubscribedNotification?.email).toBeFalse();

      // Advance notifications should remain unchanged
      expect(result.advanceNotificationsConfig.notifications.length).toBe(6);
    });
  });
});
