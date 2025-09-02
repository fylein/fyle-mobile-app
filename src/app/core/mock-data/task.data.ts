import deepFreeze from 'deep-freeze-strict';

import { TASKEVENT } from '../models/task-event.enum';
import { TaskIcon } from '../models/task-icon.enum';

export const draftExpenseTaskSample = deepFreeze({
  hideAmount: true,
  amount: '132.57B',
  count: 161,
  header: 'Incomplete expenses',
  subheader: 'Fill in missing details for incomplete expenses',
  icon: TaskIcon.WARNING,
  ctas: [
    {
      content: 'Review expense',
      event: TASKEVENT.reviewExpenses,
    },
  ],
});

export const draftExpenseTaskSample2 = deepFreeze({
  hideAmount: true,
  amount: '76234.47',
  count: 339,
  header: 'Complete 339 expenses',
  subheader: 'Fill in missing details for incomplete expenses',
  icon: TaskIcon.WARNING,
  ctas: [
    {
      content: 'Complete',
      event: TASKEVENT.reviewExpenses,
    },
  ],
});

export const potentailDuplicateTaskSample = deepFreeze({
  hideAmount: true,
  count: 13,
  header: 'Merge duplicate expenses',
  subheader: 'Merge duplicate expenses present in your account',
  icon: TaskIcon.WARNING,
  ctas: [
    {
      content: 'Merge',
      event: TASKEVENT.openPotentialDuplicates,
    },
  ],
});

export const teamReportTaskSample = deepFreeze({
  hideAmount: true,
  amount: '5177243929.65',
  count: 2,
  header: "Approve team's 2 reports",
  subheader: 'Approve pending reports from your team.',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Approve',
      event: TASKEVENT.openTeamReport,
    },
  ],
});

export const sentBackReportTaskSample = deepFreeze({
  hideAmount: true,
  amount: '4500.00',
  count: 2,
  header: 'Review sent back reports',
  subheader: 'Fix issues in your reports to resubmit.',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Review',
      event: TASKEVENT.openSentBackReport,
    },
  ],
});

export const sentBackReportTaskSingularSample = deepFreeze({
  hideAmount: true,
  amount: '4500.00',
  count: 1,
  header: 'Review sent back report',
  subheader: 'Fix issues in your report to resubmit.',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Review',
      event: TASKEVENT.openSentBackReport,
    },
  ],
});

export const unreportedExpenseTaskSample = deepFreeze({
  hideAmount: true,
  amount: '142.26K',
  count: 13,
  header: 'Expenses are ready to report',
  subheader: 'Add complete expenses to a report and submit.',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Add to expense report',
      event: TASKEVENT.expensesAddToReport,
    },
  ],
});

export const unreportedExpenseTaskSample2 = deepFreeze({
  hideAmount: true,
  amount: '30.00',
  count: 3,
  header: 'Add 3 expenses to report',
  subheader: 'Add complete expenses to a report and submit.',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Add',
      event: TASKEVENT.expensesAddToReport,
    },
  ],
});

export const unsubmittedReportTaskSample = deepFreeze({
  hideAmount: true,
  amount: '93165.91',
  count: 2,
  header: 'Submit 2 expense reports',
  subheader: 'Submit reports for approval.',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Submit',
      event: TASKEVENT.openDraftReports,
    },
  ],
});

export const sentBackAdvanceTaskSample = deepFreeze({
  hideAmount: true,
  amount: '123370000.00',
  count: 5,
  header: 'Review sent back advances',
  subheader: 'Fix issues in your advances to resubmit.',
  icon: TaskIcon.ADVANCE,
  ctas: [
    {
      content: 'Review',
      event: TASKEVENT.openSentBackAdvance,
    },
  ],
});

export const addMobileNumberTask = deepFreeze({
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
});

export const verifyMobileNumberTask = deepFreeze({
  hideAmount: true,
  header: 'Opt-in to text receipts',
  subheader: 'Enable texting your receipts and instantly submit expenses',
  icon: TaskIcon.STARS,
  ctas: [
    {
      content: 'Opt-in',
      event: TASKEVENT.mobileNumberVerification,
    },
  ],
});

export const verifyMobileNumberTask2 = deepFreeze({
  hideAmount: true,
  header: 'Update phone number',
  subheader: 'Update your number to receive reminders for receipts through text messaging.',
  icon: TaskIcon.STARS,
  ctas: [
    {
      content: 'Update',
      event: TASKEVENT.mobileNumberVerification,
    },
  ],
});

export const commuteDeductionTask = deepFreeze({
  hideAmount: true,
  header: 'Add Commute Details',
  subheader: 'Add your Home and Work locations to easily deduct commute distance from your mileage expenses',
  icon: TaskIcon.LOCATION,
  ctas: [
    {
      content: 'Add',
      event: TASKEVENT.commuteDetails,
    },
  ],
});
