import deepFreeze from 'deep-freeze-strict';

import { StatsDimensionResponse } from '../models/stats-dimension-response.model';

export const apiTxnUnreportedStatsRes: StatsDimensionResponse[] = deepFreeze([
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 6,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 16748.73,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const apiTxnUnreportedStatsEmptyRes: StatsDimensionResponse[] = deepFreeze([
  {
    aggregates: [],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const apiTxnIncompleteStatsRes: StatsDimensionResponse[] = deepFreeze([
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 1130,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 1148487.57555147,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const apiTxnIncompleteStatsEmptyRes: StatsDimensionResponse[] = deepFreeze([
  {
    aggregates: [],
    dimensions: [],
    name: 'scalar_stat',
  },
]);

export const apiUnreportedParams: Partial<StatsDimensionResponse> = deepFreeze({
  scalar: true,
  tx_state: 'in.(COMPLETE)',
  or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
  tx_report_id: 'is.null',
});

export const apiIncompleteParams: Partial<StatsDimensionResponse> = deepFreeze({
  scalar: true,
  tx_state: 'in.(DRAFT)',
  tx_report_id: 'is.null',
});

export const expectedReportRawStats: StatsDimensionResponse[] = deepFreeze([
  {
    aggregates: [
      {
        function_name: 'count(rp_id)',
        function_value: 3,
      },
      {
        function_name: 'sum(rp_amount)',
        function_value: 2804.2892810000003,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
]);
