import deepFreeze from 'deep-freeze-strict';

import { TASKEVENT } from '../models/task-event.enum';
import { TaskIcon } from '../models/task-icon.enum';

export const draftExpenseTaskSample = deepFreeze({
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
});

export const draftExpenseTaskSample2 = deepFreeze({
  amount: '132.57B',
  count: 339,
  header: 'Incomplete expenses',
  subheader: '339 expenses worth ₹132.57B  require additional information',
  icon: TaskIcon.WARNING,
  ctas: [
    {
      content: 'Review Expenses',
      event: TASKEVENT.reviewExpenses,
    },
  ],
});

export const potentailDuplicateTaskSample = deepFreeze({
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
});

export const teamReportTaskSample = deepFreeze({
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
});

export const sentBackReportTaskSample = deepFreeze({
  amount: '4.5K',
  count: 2,
  header: 'Reports sent back!',
  subheader: '2 reports worth ₹4.5K  were sent back by your approver',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'View Reports',
      event: TASKEVENT.openSentBackReport,
    },
  ],
});

export const sentBackReportTaskSingularSample = deepFreeze({
  amount: '4.5K',
  count: 1,
  header: 'Report sent back!',
  subheader: '1 report worth ₹4.5K  was sent back by your approver',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'View Report',
      event: TASKEVENT.openSentBackReport,
    },
  ],
});

export const unreportedExpenseTaskSample = deepFreeze({
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
});

export const unreportedExpenseTaskSample2 = deepFreeze({
  amount: '142.26K',
  count: 3,
  header: 'Expenses are ready to report',
  subheader: '3 expenses  worth ₹142.26K  can be added to a report',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Add to Report',
      event: TASKEVENT.expensesAddToReport,
    },
  ],
});

export const unsubmittedReportTaskSample = deepFreeze({
  amount: '93.17K',
  count: 2,
  header: 'Unsubmitted reports',
  subheader: '2 reports worth ₹93.17K  remain in draft state',
  icon: TaskIcon.REPORT,
  ctas: [
    {
      content: 'Submit Reports',
      event: TASKEVENT.openDraftReports,
    },
  ],
});

export const sentBackAdvanceTaskSample = deepFreeze({
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
  header: 'Opt in to text receipts',
  subheader: 'Opt-in to activate text messages for instant expense submission',
  icon: TaskIcon.STARS,
  ctas: [
    {
      content: 'Opt in',
      event: TASKEVENT.mobileNumberVerification,
    },
  ],
});

export const verifyMobileNumberTask2 = deepFreeze({
  hideAmount: true,
  header: 'Update phone number to opt in to text receipts',
  subheader: 'By updating mobile number to a +1 number, you will be eligible for opting into text messages.',
  icon: TaskIcon.STARS,
  ctas: [
    {
      content: 'Update and Opt in',
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
