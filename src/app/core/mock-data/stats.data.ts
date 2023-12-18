import { Stats } from '../models/stats.model';

export const expectedUnreportedExpStats: Stats = {
  count: 6,
  sum: 16748.73,
};

export const expectedIncompleteExpStats: Stats = {
  count: 1130,
  sum: 1148487.57555147,
};

export const expectedEmptyStats: Stats = {
  count: undefined,
  sum: undefined,
};

export const expectedUnreportedExpStats2: Stats = {
  count: 3,
  sum: 30,
};

export const emptyStatsAgg: Stats = {
  count: 0,
  sum: 0,
};
