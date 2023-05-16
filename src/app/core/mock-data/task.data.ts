import { TASKEVENT } from '../models/task-event.enum';
import { TaskIcon } from '../models/task-icon.enum';

export const draftExpenseTaskSample = {
  amount: '132.57B',
  count: 161,
  header: 'Incomplete expenses',
  subheader: '161 expenses worth ₹132.57B  require additional information',
  icon: TaskIcon.WARNING,
  ctas: [
    {
      content: 'Review Expenses',
      event: TASKEVENT.reviewExpenses,
    },
  ],
};

export const potentailDuplicateTaskSample = {
  hideAmount: true,
  count: 13,
  header: '34 Potential Duplicates',
  subheader: 'We detected 34 expenses which may be duplicates',
  icon: TaskIcon.WARNING,
  ctas: [
    {
      content: 'Review',
      event: TASKEVENT.openPotentialDuplicates,
    },
  ],
};

export const teamReportTaskSample = {
  amount: '733.48K',
  count: 2,
  header: 'Reports to be approved',
  subheader: '2 reports worth ₹733.48K  require your approval',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Show Reports',
      event: TASKEVENT.openTeamReport,
    },
  ],
};

export const sentBackReportTaskSample = {
  amount: '44.53',
  count: 1,
  header: 'Report sent back!',
  subheader: '1 report worth ₹44.53  was sent back by your approver',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'View Report',
      event: TASKEVENT.openSentBackReport,
    },
  ],
};

export const unreportedExpenseTaskSample = {
  amount: '142.26K',
  count: 13,
  header: 'Expenses are ready to report',
  subheader: '13 expenses  worth ₹142.26K  can be added to a report',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Add to Report',
      event: TASKEVENT.expensesAddToReport,
    },
  ],
};

export const unsubmittedReportTaskSample = {
  amount: '0.00',
  count: 2,
  header: 'Unsubmitted reports',
  subheader: '2 reports remain in draft state',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Submit Reports',
      event: TASKEVENT.openDraftReports,
    },
  ],
};

export const sentBackAdvanceTaskSample = {
  amount: '123.37M',
  count: 5,
  header: 'Advances sent back!',
  subheader: '5 advances worth ₹123.37M  were sent back by your approver',
  icon: TaskIcon.ADVANCE,
  ctas: [
    {
      content: 'View Advances',
      event: TASKEVENT.openSentBackAdvance,
    },
  ],
};

export const mobileNumberVerificationTaskSample = {
  hideAmount: true,
  header: 'Add Mobile Number',
  subheader: 'Add and verify your mobile number to text the receipts directly',
  icon: TaskIcon.MOBILE,
  ctas: [
    {
      content: 'Add',
      event: TASKEVENT.mobileNumberVerification,
    },
  ],
};
