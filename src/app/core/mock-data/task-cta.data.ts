import { TaskCta } from '../models/task-cta.model';
import { TASKEVENT } from '../models/task-event.enum';

export const taskCtaData: TaskCta = {
  event: TASKEVENT.expensesAddToReport,
  content: 'Add To Report',
};

export const taskCtaData2: TaskCta = {
  event: TASKEVENT.openDraftReports,
  content: 'Draft Reports',
};

export const taskCtaData3: TaskCta = {
  event: TASKEVENT.openSentBackReport,
  content: 'Sent Back Report',
};

export const taskCtaData4: TaskCta = {
  event: TASKEVENT.reviewExpenses,
  content: 'Review Expenses',
};

export const taskCtaData5: TaskCta = {
  event: TASKEVENT.openTeamReport,
  content: 'Team Reports',
};

export const taskCtaData6: TaskCta = {
  event: TASKEVENT.openPotentialDuplicates,
  content: 'Potential Duplicates',
};

export const taskCtaData7: TaskCta = {
  event: TASKEVENT.openSentBackAdvance,
  content: 'Sent Back Advances',
};

export const taskCtaData8: TaskCta = {
  event: TASKEVENT.expensesCreateNewReport,
  content: 'Create New Report',
};
