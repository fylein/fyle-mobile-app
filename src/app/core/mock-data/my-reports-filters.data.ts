import deepFreeze from 'deep-freeze-strict';

import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';

export const filter1 = deepFreeze({
  state: 'approved',
  date: 'last_week',
  customDateStart: new Date('2023-01-01'),
  customDateEnd: new Date('2023-01-07'),
  sortParam: 'rp_created_at',
  sortDir: 'asc',
});

export const filter2 = deepFreeze({
  date: DateFilters.custom,
  customDateStart: new Date('2023-01-21'),
  customDateEnd: new Date('2023-01-31'),
});

export const filter3 = deepFreeze({
  state: ['active', 'completed'],
  date: DateFilters.thisWeek,
  sortParam: 'rp_created_at',
  sortDir: 'asc',
});

export const filter4 = deepFreeze({
  date: DateFilters.custom,
  customDateStart: new Date('2022-01-01'),
  customDateEnd: new Date('2022-01-31'),
});

export const filter5 = deepFreeze({
  date: DateFilters.custom,
  customDateStart: new Date('2022-01-01'),
  customDateEnd: null,
});

export const filter6 = deepFreeze({
  date: DateFilters.custom,
  customDateStart: null,
  customDateEnd: new Date('2022-01-31'),
});

export const filter7 = deepFreeze({
  date: DateFilters.thisWeek,
  customDateStart: new Date(),
  customDateEnd: new Date(),
});

export const filter8 = deepFreeze({
  date: DateFilters.thisMonth,
  customDateStart: null,
  customDateEnd: null,
});

export const filter9 = deepFreeze({
  date: DateFilters.thisWeek,
  customDateStart: null,
  customDateEnd: null,
});

export const filter10 = deepFreeze({
  date: DateFilters.lastMonth,
  customDateStart: null,
  customDateEnd: null,
});

export const filter11 = deepFreeze({
  date: null,
  customDateStart: null,
  customDateEnd: null,
});

export const filter12 = deepFreeze({
  date: DateFilters.all,
  customDateStart: new Date('2023-02-21T00:00:00.000Z'),
  customDateEnd: new Date('2023-02-23T00:00:00.000Z'),
});

export const filter13 = deepFreeze({
  state: ['DRAFT', 'APPROVER_PENDING', 'APPROVER_INQUIRY', 'APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'],
});

export const filter14 = deepFreeze({
  sortDir: 'desc',
  sortParam: 'rp_created_at',
  rp_state: 'APPROVED',
});
