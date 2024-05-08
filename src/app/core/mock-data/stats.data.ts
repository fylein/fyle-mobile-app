import deepFreeze from 'deep-freeze-strict';

import { Stats } from '../models/stats.model';

export const expectedUnreportedExpStats: Stats = deepFreeze({
  count: 6,
  sum: 16748.73,
});

export const expectedIncompleteExpStats: Stats = deepFreeze({
  count: 1130,
  sum: 1148487.57555147,
});

export const expectedEmptyStats: Stats = deepFreeze({
  count: undefined,
  sum: undefined,
});

export const expectedUnreportedExpStats2: Stats = deepFreeze({
  count: 3,
  sum: 30,
});

export const expectedIncompleteExpStats2: Stats = deepFreeze({
  count: 339,
  sum: 76234.47290692403,
});

export const emptyStatsAgg: Stats = deepFreeze({
  count: 0,
  sum: 0,
});
