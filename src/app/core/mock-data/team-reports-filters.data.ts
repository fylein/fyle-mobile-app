import deepFreeze from 'deep-freeze-strict';

import { TeamReportsFilters } from '../models/team-reports-filters.model';

export const teamReportsFiltersData: Partial<TeamReportsFilters> = deepFreeze({
  sortDir: 'desc',
  sortParam: 'created_at',
  date: 'custom',
});

export const teamReportsFiltersData2: Partial<TeamReportsFilters> = deepFreeze({
  sortDir: 'desc',
  state: 'DRAFT',
  sortParam: 'created_at',
  date: 'custom',
  customDateStart: new Date('2023-01-01'),
  customDateEnd: new Date('2023-02-02'),
});

export const teamReportsFiltersParams: Partial<TeamReportsFilters> = deepFreeze({
  sortParam: 'purpose',
  sortDir: 'asc',
});

export const teamReportsFiltersParams2: Partial<TeamReportsFilters> = deepFreeze({
  sortParam: 'purpose',
  sortDir: 'desc',
});

export const teamReportsFiltersData3: Partial<TeamReportsFilters> = deepFreeze({
  state: 'DRAFT',
  date: 'custom',
  customDateStart: new Date('2023-01-01'),
  customDateEnd: new Date('2023-02-02'),
});

export const teamReportsFiltersData4: Partial<TeamReportsFilters> = deepFreeze({
  state: 'DRAFT',
  date: 'custom',
  customDateStart: undefined,
  customDateEnd: undefined,
});

export const teamReportsFiltersParams3: Partial<TeamReportsFilters> = deepFreeze({
  state: ['DRAFT', 'PAID', 'CANCELLED'],
});

export const teamReportsFiltersParams4: Partial<TeamReportsFilters> = deepFreeze({
  sortParam: 'last_submitted_at',
  sortDir: 'asc',
});

export const teamReportsFiltersParams5: Partial<TeamReportsFilters> = deepFreeze({
  sortParam: 'amount',
  sortDir: 'desc',
});

export const teamReportsFiltersParams6: Partial<TeamReportsFilters> = deepFreeze({
  sortParam: 'purpose',
  sortDir: 'asc',
});

export const teamReportsFiltersParams7: Partial<TeamReportsFilters> = deepFreeze({
  date: 'thisWeek',
});
