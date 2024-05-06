import deepFreeze from 'deep-freeze-strict';

import { TaskFilters } from '../models/task-filters.model';

export const taskFiltersData: TaskFilters = deepFreeze({
  sentBackReports: true,
  draftReports: false,
  draftExpenses: true,
  unreportedExpenses: true,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
});

export const taskFiltersData2: TaskFilters = deepFreeze({
  sentBackReports: false,
  draftReports: false,
  draftExpenses: false,
  unreportedExpenses: false,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
});

export const taskFiltersParams: TaskFilters = deepFreeze({
  sentBackReports: true,
  draftReports: false,
  draftExpenses: false,
  unreportedExpenses: false,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
});

export const taskFiltersParams2: TaskFilters = deepFreeze({
  sentBackReports: false,
  draftReports: false,
  draftExpenses: true,
  unreportedExpenses: true,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
});

export const taskFiltersParams3: TaskFilters = deepFreeze({
  sentBackReports: true,
  draftReports: false,
  draftExpenses: true,
  unreportedExpenses: true,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
});

export const taskFiltersParams4: TaskFilters = deepFreeze({
  ...taskFiltersData2,
  unreportedExpenses: true,
  draftExpenses: true,
  potentialDuplicates: true,
});

export const taskFiltersParams5: TaskFilters = deepFreeze({
  ...taskFiltersData2,
  draftReports: true,
  sentBackReports: true,
});

export const taskFiltersParams6: TaskFilters = deepFreeze({
  ...taskFiltersData2,
  teamReports: true,
});

export const taskFiltersParams7: TaskFilters = deepFreeze({
  ...taskFiltersData2,
  sentBackAdvances: true,
});
