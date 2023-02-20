import { EmailEventsObject } from '../models/email-events.model';

export const emailEvents: EmailEventsObject = {
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
  expensesAndReports: {
    eous_forward_email_to_user: {
      textLabel: 'When an expense is created via email',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    erpts_submitted: {
      textLabel: 'On submission of expense report',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    estatuses_created_txn: {
      textLabel: 'When a comment is left on an expense',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    estatuses_created_rpt: {
      textLabel: 'When a comment is left on a report',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    etxns_admin_removed: {
      textLabel: 'When an expense is removed',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    etxns_admin_updated: {
      textLabel: 'When an expense is edited by someone else',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    erpts_inquiry: {
      textLabel: 'When a reported expense is sent back',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    erpts_approved: {
      textLabel: 'When a report is approved',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    ereimbursements_completed: {
      textLabel: 'When a reimbursement is done',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
  },
  advances: {
    eadvance_requests_created: {
      textLabel: 'When an advance request is submitted',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    eadvance_requests_updated: {
      textLabel: 'When an advance request is updated',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    eadvance_requests_inquiry: {
      textLabel: 'When an advance request is sent back',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    eadvance_requests_approved: {
      textLabel: 'When an advance request is approved',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    eadvances_created: {
      textLabel: 'When an advance is assigned',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
    eadvance_requests_rejected: {
      textLabel: 'When an advance request is rejected',
      selected: true,
      email: {
        selected: true,
      },
      push: {
        selected: true,
      },
    },
  },
};
