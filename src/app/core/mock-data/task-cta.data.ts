import deepFreeze from 'deep-freeze-strict';

import { TaskCta } from '../models/task-cta.model';
import { TASKEVENT } from '../models/task-event.enum';

export const taskCtaData: TaskCta = deepFreeze({
  event: TASKEVENT.expensesAddToReport,
  content: 'Add To Report',
});

export const taskCtaData2: TaskCta = deepFreeze({
  event: TASKEVENT.openDraftReports,
  content: 'Draft Reports',
});

export const taskCtaData3: TaskCta = deepFreeze({
  event: TASKEVENT.openSentBackReport,
  content: 'Sent Back Report',
});

export const taskCtaData4: TaskCta = deepFreeze({
  event: TASKEVENT.reviewExpenses,
  content: 'Review expenses',
});

export const taskCtaData5: TaskCta = deepFreeze({
  event: TASKEVENT.openTeamReport,
  content: 'Team Reports',
});

export const taskCtaData6: TaskCta = deepFreeze({
  event: TASKEVENT.openPotentialDuplicates,
  content: 'Potential Duplicates',
});

export const taskCtaData7: TaskCta = deepFreeze({
  event: TASKEVENT.openSentBackAdvance,
  content: 'Sent Back Advances',
});

export const taskCtaData8: TaskCta = deepFreeze({
  event: TASKEVENT.expensesCreateNewReport,
  content: 'Create New Report',
});

export const taskCtaData9: TaskCta = deepFreeze({
  event: TASKEVENT.mobileNumberVerification,
  content: 'Verify Mobile Number',
});

export const taskCtaData10: TaskCta = deepFreeze({
  event: TASKEVENT.commuteDetails,
  content: 'Add Commute Details',
});

export const taskCtaData11: TaskCta = deepFreeze({
  event: TASKEVENT.addCorporateCard,
  content: 'Add corporate card',
});
