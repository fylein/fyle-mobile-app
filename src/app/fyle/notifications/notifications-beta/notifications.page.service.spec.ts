import { TestBed } from '@angular/core/testing';
import { NotificationsPageService } from './notifications.page.service';
import { NotificationEventsEnum } from 'src/app/core/models/notification-events.enum';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { cloneDeep } from 'lodash';
import {
  advanceNotifications,
  expenseNotifications,
  expenseReportNotifications,
} from 'src/app/core/mock-data/notification-events.data';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';

fdescribe('NotificationsPageService', () => {
  let service: NotificationsPageService;
  let mockCurrentEou: ExtendedOrgUser;
  let mockIsExpenseMarkedPersonalEventEnabled: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationsPageService],
    });
    service = TestBed.inject(NotificationsPageService);

    // Setup mock data
    mockCurrentEou = apiEouRes;
    mockIsExpenseMarkedPersonalEventEnabled = false;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInitialDelegateNotificationPreference():', () => {
    it('should return "onlyMe" when notify_user is true and notify_delegatee is false', () => {
      const employeeSettings = cloneDeep(employeeSettingsData);
      employeeSettings.notification_settings.notify_user = true;
      employeeSettings.notification_settings.notify_delegatee = false;

      const result = service.getInitialDelegateNotificationPreference(employeeSettings);

      expect(result).toBe('onlyMe');
    });

    it('should return "onlyDelegate" when notify_user is false and notify_delegatee is true', () => {
      const employeeSettings = cloneDeep(employeeSettingsData);
      employeeSettings.notification_settings.notify_user = false;
      employeeSettings.notification_settings.notify_delegatee = true;

      const result = service.getInitialDelegateNotificationPreference(employeeSettings);

      expect(result).toBe('onlyDelegate');
    });

    it('should return "both" when both notify_user and notify_delegatee are true', () => {
      const employeeSettings = cloneDeep(employeeSettingsData);
      employeeSettings.notification_settings.notify_user = true;
      employeeSettings.notification_settings.notify_delegatee = true;

      const result = service.getInitialDelegateNotificationPreference(employeeSettings);

      expect(result).toBe('both');
    });
  });

  describe('getExpenseNotifications():', () => {
    it('should return expense notifications with correct structure', () => {
      const result = service.getExpenseNotifications(mockCurrentEou);
      expect(result).toEqual(expenseNotifications);
    });

    it('should return 5 expense notifications', () => {
      const result = service.getExpenseNotifications(mockCurrentEou);
      expect(result.length).toBe(5);
    });
  });

  describe('getReportNotifications():', () => {
    it('should return report notifications with correct structure', () => {
      const result = service.getReportNotifications(mockCurrentEou);
      expect(result).toEqual(expenseReportNotifications);
    });

    it('should return 6 report notifications', () => {
      const result = service.getReportNotifications(mockCurrentEou);
      expect(result.length).toBe(6);
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
    let employeeSettings: any;

    beforeEach(() => {
      orgSettings = cloneDeep(orgSettingsData);
      employeeSettings = cloneDeep(employeeSettingsData);
    });

    it('should return email notifications config with correct structure', () => {
      const result = service.getEmailNotificationsConfig(orgSettings, employeeSettings, mockCurrentEou);

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

      const result = service.getEmailNotificationsConfig(orgSettings, employeeSettings, mockCurrentEou);

      const expenseNotifications = result.expenseNotificationsConfig.notifications;
      const filteredNotification = expenseNotifications.find(
        (notification) => notification.eventEnum === NotificationEventsEnum.EOUS_FORWARD_EMAIL_TO_USER,
      );

      expect(filteredNotification).toBeUndefined();
    });

    it('should apply user preferences to filter notifications', () => {
      employeeSettings.notification_settings.email_unsubscribed_events = [NotificationEventsEnum.ERPTS_SUBMITTED];

      const result = service.getEmailNotificationsConfig(orgSettings, employeeSettings, mockCurrentEou);

      const reportNotifications = result.expenseReportNotificationsConfig.notifications;
      const userUnsubscribedNotification = reportNotifications.find(
        (notification) => notification.eventEnum === NotificationEventsEnum.ERPTS_SUBMITTED,
      );

      expect(userUnsubscribedNotification?.email).toBeFalse();
    });

    it('should handle empty admin unsubscribed events', () => {
      orgSettings.admin_email_settings = {
        unsubscribed_events: [],
      };

      const result = service.getEmailNotificationsConfig(orgSettings, employeeSettings, mockCurrentEou);

      expect(result.expenseNotificationsConfig.notifications.length).toBe(5);
      expect(result.expenseReportNotificationsConfig.notifications.length).toBe(6);
      expect(result.advanceNotificationsConfig.notifications.length).toBe(6);
    });

    it('should handle empty user unsubscribed events', () => {
      employeeSettings.notification_settings.email_unsubscribed_events = [];

      const result = service.getEmailNotificationsConfig(orgSettings, employeeSettings, mockCurrentEou);

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
      employeeSettings.notification_settings.email_unsubscribed_events = [NotificationEventsEnum.ERPTS_SUBMITTED];

      const result = service.getEmailNotificationsConfig(orgSettings, employeeSettings, mockCurrentEou);

      // Expense notifications should be filtered by admin (4 remaining, 1 removed)
      expect(result.expenseNotificationsConfig.notifications.length).toBe(4);

      // Report notifications should have one with email: false due to user preference
      const reportNotifications = result.expenseReportNotificationsConfig.notifications;
      const userUnsubscribedNotification = reportNotifications.find(
        (notification) => notification.eventEnum === NotificationEventsEnum.ERPTS_SUBMITTED,
      );
      expect(userUnsubscribedNotification?.email).toBeFalse();

      // Advance notifications should remain unchanged
      expect(result.advanceNotificationsConfig.notifications.length).toBe(6);
    });
  });
});
