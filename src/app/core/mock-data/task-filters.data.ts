import { TaskFilters } from '../models/task-filters.model';

export const taskFiltersData: TaskFilters = {
  sentBackReports: true,
  draftReports: false,
  draftExpenses: true,
  unreportedExpenses: true,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
};

export const taskFiltersData2: TaskFilters = {
  sentBackReports: false,
  draftReports: false,
  draftExpenses: false,
  unreportedExpenses: false,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
};

export const taskFiltersParams: TaskFilters = {
  sentBackReports: true,
  draftReports: false,
  draftExpenses: false,
  unreportedExpenses: false,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
};

export const taskFiltersParams2: TaskFilters = {
  sentBackReports: false,
  draftReports: false,
  draftExpenses: true,
  unreportedExpenses: true,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
};

export const taskFiltersParams3: TaskFilters = {
  sentBackReports: true,
  draftReports: false,
  draftExpenses: true,
  unreportedExpenses: true,
  potentialDuplicates: false,
  teamReports: false,
  sentBackAdvances: false,
};
