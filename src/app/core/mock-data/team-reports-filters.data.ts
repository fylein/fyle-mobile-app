import { TeamReportsFilters } from '../models/team-reports-filters.model';

export const teamReportsFiltersData: Partial<TeamReportsFilters> = {
  sortDir: 'desc',
  sortParam: 'rp_created_at',
  date: 'custom',
};

export const teamReportsFiltersData2: Partial<TeamReportsFilters> = {
  sortDir: 'desc',
  state: 'DRAFT',
  sortParam: 'rp_created_at',
  date: 'custom',
  customDateStart: new Date('2023-01-01'),
  customDateEnd: new Date('2023-02-02'),
};

export const teamReportsFiltersParams: Partial<TeamReportsFilters> = {
  sortParam: 'rp_purpose',
  sortDir: 'asc',
};

export const teamReportsFiltersParams2: Partial<TeamReportsFilters> = {
  sortParam: 'rp_purpose',
  sortDir: 'desc',
};

export const teamReportsFiltersData3: Partial<TeamReportsFilters> = {
  state: 'DRAFT',
  date: 'custom',
  customDateStart: new Date('2023-01-01'),
  customDateEnd: new Date('2023-02-02'),
};

export const teamReportsFiltersData4: Partial<TeamReportsFilters> = {
  state: 'DRAFT',
  date: 'custom',
  customDateStart: undefined,
  customDateEnd: undefined,
};
