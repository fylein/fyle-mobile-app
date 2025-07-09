import { Injectable } from '@angular/core';
import { NotificationConfig } from 'src/app/core/models/notification-config.model';
import { NotificationEventItem } from 'src/app/core/models/notification-event-item.model';
import { NotificationEventsEnum } from 'src/app/core/models/notification-events.enum';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsBetaPageService {
  getInitialDelegateNotificationPreference(employeeSettings: EmployeeSettings): 'onlyMe' | 'onlyDelegate' | 'both' {
    const notificationSettings = employeeSettings.notification_settings;
    if (notificationSettings.notify_user === true && notificationSettings.notify_delegatee === false) {
      return 'onlyMe';
    } else if (notificationSettings.notify_user === false && notificationSettings.notify_delegatee === true) {
      return 'onlyDelegate';
    } else {
      return 'both';
    }
  }

  getExpenseNotifications(): NotificationEventItem[] {
    return [
      {
        event: 'When an expense is created via email',
        email: true,
        eventEnum: NotificationEventsEnum.EOUS_FORWARD_EMAIL_TO_USER,
      },
      {
        event: 'When a comment is left on an expense',
        email: true,
        eventEnum: NotificationEventsEnum.ESTATUSES_CREATED_TXN,
      },
      {
        event: 'When an approver/admin removes an expense from the expense report',
        email: true,
        eventEnum: NotificationEventsEnum.ETXNS_ADMIN_REMOVED,
      },
      {
        event: 'When an approver/admin edits an expense',
        email: true,
        eventEnum: NotificationEventsEnum.ETXNS_ADMIN_UPDATED,
      },
    ];
  }

  getReportNotifications(): NotificationEventItem[] {
    return [
      {
        event: 'When an expense report is submitted',
        email: true,
        eventEnum: NotificationEventsEnum.ERPTS_SUBMITTED,
      },
      {
        event: 'When an expense report is sent back',
        email: true,
        eventEnum: NotificationEventsEnum.ERPTS_INQUIRY,
      },
      {
        event: 'When a comment is left on an expense report',
        email: true,
        eventEnum: NotificationEventsEnum.ESTATUSES_CREATED_RPT,
      },
      {
        event: 'When an expense report is approved',
        email: true,
        eventEnum: NotificationEventsEnum.ERPTS_APPROVED,
      },
      {
        event: 'When a reimbursement is processed',
        email: true,
        eventEnum: NotificationEventsEnum.EREIMBURSEMENTS_COMPLETED,
      },
    ];
  }

  getAdvanceNotifications(): NotificationEventItem[] {
    return [
      {
        event: 'When an advance request is submitted',
        email: true,
        eventEnum: NotificationEventsEnum.EADVANCE_REQUESTS_CREATED,
      },
      {
        event: 'When an advance request is updated',
        email: true,
        eventEnum: NotificationEventsEnum.EADVANCE_REQUESTS_UPDATED,
      },
      {
        event: 'When an advance request is sent back',
        email: true,
        eventEnum: NotificationEventsEnum.EADVANCE_REQUESTS_INQUIRY,
      },
      {
        event: 'When an advance request is approved',
        email: true,
        eventEnum: NotificationEventsEnum.EADVANCE_REQUESTS_APPROVED,
      },
      {
        event: 'When an advance is assigned',
        email: true,
        eventEnum: NotificationEventsEnum.EADVANCES_CREATED,
      },
      {
        event: 'When an advance request is rejected',
        email: true,
        eventEnum: NotificationEventsEnum.EADVANCE_REQUESTS_REJECTED,
      },
    ];
  }

  getEmailNotificationsConfig(
    orgSettings: OrgSettings,
    employeeSettings: EmployeeSettings
  ): {
    expenseNotificationsConfig: NotificationConfig;
    expenseReportNotificationsConfig: NotificationConfig;
    advanceNotificationsConfig: NotificationConfig;
  } {
    const unsubscribedEventsByAdmin: string[] = orgSettings.admin_email_settings?.unsubscribed_events ?? [];
    const unsubscribedEventsByUser: string[] = employeeSettings.notification_settings.email_unsubscribed_events ?? [];

    // Filter out admin-disabled notifications first, then apply user preferences
    const processNotifications = (notifications: NotificationEventItem[]): NotificationEventItem[] =>
      notifications
        .filter((notification) => !unsubscribedEventsByAdmin.includes(notification.eventEnum))
        .map((notification) => ({
          ...notification,
          email: !unsubscribedEventsByUser.includes(notification.eventEnum),
        }));

    const expenseNotifications = processNotifications(this.getExpenseNotifications());
    const reportNotifications = processNotifications(this.getReportNotifications());
    const advanceNotifications = processNotifications(this.getAdvanceNotifications());

    const expenseNotificationsConfig = {
      title: 'Expense notifications',
      notifications: expenseNotifications,
    };

    const expenseReportNotificationsConfig = {
      title: 'Expense report notifications',
      notifications: reportNotifications,
    };

    const advanceNotificationsConfig = {
      title: 'Advance notifications',
      notifications: advanceNotifications,
    };

    return {
      expenseNotificationsConfig,
      expenseReportNotificationsConfig,
      advanceNotificationsConfig,
    };
  }
}
