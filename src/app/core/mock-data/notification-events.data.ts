import { NotificationEvents } from '../models/notification-events.model';

export const notificationEventsData: NotificationEvents = {
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
};

export const notificationEventsData2: NotificationEvents = {
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
};

export const notificationEventsData3: NotificationEvents = {
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
};
