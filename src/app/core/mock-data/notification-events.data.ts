import deepFreeze from 'deep-freeze-strict';

import { NotificationEvents } from '../models/notification-events.model';
import { NotificationConfig } from '../models/notification-config.model';
import { NotificationEventsEnum } from '../models/notification-events.enum';
import { NotificationEventItem } from '../models/notification-event-item.model';

export const notificationEventsData: NotificationEvents = deepFreeze({
  features: {
    expensesAndReports: {
      textLabel: 'Expenses and Reports',
      selected: true,
    },
    advances: {
      textLabel: 'Advances',
      selected: true,
    },
  },
  events: [
    {
      textLabel: 'When an expense is created via email',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'eous_forward_email_to_user',
    },
    {
      textLabel: 'On submission of expense report',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_submitted',
    },
    {
      textLabel: 'When a comment is left on an expense',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'estatuses_created_txn',
    },
    {
      textLabel: 'When a comment is left on a report',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'estatuses_created_rpt',
    },
    {
      textLabel: 'When an expense is removed',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'etxns_admin_removed',
    },
    {
      textLabel: 'When an expense is edited by someone else',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'etxns_admin_updated',
    },
    {
      textLabel: 'When a reported expense is sent back',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_inquiry',
    },
    {
      textLabel: 'When a report is approved',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_approved',
    },
    {
      textLabel: 'When a reimbursement is done',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'ereimbursements_completed',
    },
    {
      textLabel: 'When an advance request is submitted',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_created',
    },
    {
      textLabel: 'When an advance request is updated',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_updated',
    },
    {
      textLabel: 'When an advance request is sent back',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_inquiry',
    },
    {
      textLabel: 'When an advance request is approved',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_approved',
    },
    {
      textLabel: 'When an advance is assigned',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvances_created',
    },
    {
      textLabel: 'When an advance request is rejected',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_rejected',
    },
  ],
});

export const notificationEventsData2: NotificationEvents = deepFreeze({
  features: {
    expensesAndReports: {
      textLabel: 'Expenses and Reports',
      selected: true,
    },
    advances: {
      textLabel: 'Advances',
      selected: true,
    },
  },
  events: [
    {
      textLabel: 'When an expense is created via email',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'eous_forward_email_to_user',
    },
    {
      textLabel: 'On submission of expense report',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_submitted',
    },
    {
      textLabel: 'When a comment is left on an expense',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'estatuses_created_txn',
    },
    {
      textLabel: 'When a comment is left on a report',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'estatuses_created_rpt',
    },
    {
      textLabel: 'When an expense is removed',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'etxns_admin_removed',
    },
    {
      textLabel: 'When an expense is edited by someone else',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'etxns_admin_updated',
    },
    {
      textLabel: 'When a reported expense is sent back',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_inquiry',
    },
    {
      textLabel: 'When a report is approved',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_approved',
    },
    {
      textLabel: 'When a reimbursement is done',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'ereimbursements_completed',
    },
    {
      textLabel: 'When an advance request is submitted',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_created',
    },
    {
      textLabel: 'When an advance request is updated',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_updated',
    },
    {
      textLabel: 'When an advance request is sent back',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_inquiry',
    },
    {
      textLabel: 'When an advance request is approved',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_approved',
    },
    {
      textLabel: 'When an advance is assigned',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvances_created',
    },
    {
      textLabel: 'When an advance request is rejected',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_rejected',
    },
  ],
});

export const notificationEventsData3: NotificationEvents = deepFreeze({
  features: {
    expensesAndReports: {
      textLabel: 'Expenses and reports',
      selected: true,
    },
    advances: {
      textLabel: 'Advances',
      selected: true,
    },
  },
  events: [
    {
      textLabel: 'When an expense is created via email',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'eous_forward_email_to_user',
    },
    {
      textLabel: 'On submission of expense report',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_submitted',
    },
    {
      textLabel: 'When a comment is left on an expense',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'estatuses_created_txn',
    },
    {
      textLabel: 'When a comment is left on a report',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'estatuses_created_rpt',
    },
    {
      textLabel: 'When an expense is removed',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'etxns_admin_removed',
    },
    {
      textLabel: 'When an expense is edited by someone else',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'etxns_admin_updated',
    },
    {
      textLabel: 'When a reported expense is sent back',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_inquiry',
    },
    {
      textLabel: 'When a report is approved',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'erpts_approved',
    },
    {
      textLabel: 'When a reimbursement is done',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'expensesAndReports',
      eventType: 'ereimbursements_completed',
    },
    {
      textLabel: 'When an advance request is submitted',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_created',
    },
    {
      textLabel: 'When an advance request is updated',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_updated',
    },
    {
      textLabel: 'When an advance request is sent back',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_inquiry',
    },
    {
      textLabel: 'When an advance request is approved',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_approved',
    },
    {
      textLabel: 'When an advance is assigned',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvances_created',
    },
    {
      textLabel: 'When an advance request is rejected',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
      feature: 'advances',
      eventType: 'eadvance_requests_rejected',
    },
  ],
});

export const mockEmailNotificationsConfig: {
  expenseNotificationsConfig: NotificationConfig;
  expenseReportNotificationsConfig: NotificationConfig;
  advanceNotificationsConfig: NotificationConfig;
} = deepFreeze({
  expenseNotificationsConfig: { title: 'Expense notifications', notifications: [] },
  expenseReportNotificationsConfig: { title: 'Expense report notifications', notifications: [] },
  advanceNotificationsConfig: { title: 'Advance notifications', notifications: [] },
});

export const mockEmailNotificationsConfig2: {
  expenseNotificationsConfig: NotificationConfig;
  expenseReportNotificationsConfig: NotificationConfig;
  advanceNotificationsConfig: NotificationConfig;
} = deepFreeze({
  expenseNotificationsConfig: {
    title: 'Test Expense Notifications',
    notifications: [
      {
        event: 'When an expense is created via email',
        email: true,
        eventEnum: NotificationEventsEnum.EOUS_FORWARD_EMAIL_TO_USER,
      },
    ],
  },
  expenseReportNotificationsConfig: {
    title: 'Test Report Notifications',
    notifications: [
      {
        event: 'When an expense report is submitted',
        email: true,
        eventEnum: NotificationEventsEnum.ERPTS_SUBMITTED,
      },
    ],
  },
  advanceNotificationsConfig: {
    title: 'Test Advance Notifications',
    notifications: [
      {
        event: 'When an advance request is submitted',
        email: true,
        eventEnum: NotificationEventsEnum.EADVANCE_REQUESTS_CREATED,
      },
    ],
  },
});

export const expenseNotifications: NotificationEventItem[] = deepFreeze([
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
]);

export const expenseReportNotifications: NotificationEventItem[] = deepFreeze([
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
  {
    event: 'When an expense report is ready to process',
    email: true,
    eventEnum: NotificationEventsEnum.ERPTS_READY_TO_PROCESS,
  },
]);

export const advanceNotifications: NotificationEventItem[] = deepFreeze([
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
]);
