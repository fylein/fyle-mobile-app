import { StatsDimensionResponse } from '../models/stats-dimension-response.model';
import { ApiV2Response } from '../models/v2/api-v2-response.model';

export const apiTxnUnreportedStatsRes: StatsDimensionResponse[] = [
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
];

export const apiTxnUnreportedStatsEmptyRes: StatsDimensionResponse[] = [
  {
    aggregates: [],
    dimensions: [],
    name: 'scalar_stat',
  },
];

export const apiTxnIncompleteStatsRes: StatsDimensionResponse[] = [
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
];

export const apiTxnIncompleteStatsEmptyRes: StatsDimensionResponse[] = [
  {
    aggregates: [],
    dimensions: [],
    name: 'scalar_stat',
  },
];

export const apiUnreportedParams: Partial<StatsDimensionResponse> = {
  scalar: true,
  tx_state: 'in.(COMPLETE)',
  or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
  tx_report_id: 'is.null',
};

export const apiIncompleteParams: Partial<StatsDimensionResponse> = {
  scalar: true,
  tx_state: 'in.(DRAFT)',
  tx_report_id: 'is.null',
};

export const expectedReportRawStats: StatsDimensionResponse[] = [
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
];

export const apiAdvanceReqRes: Partial<ApiV2Response<StatsDimensionResponse>> = {
  data: [
    {
      aggregates: [
        {
          function_name: 'count(areq_id)',
          function_value: 0,
        },
        {
          function_name: 'sum(areq_amount)',
          function_value: null,
        },
      ],
      dimensions: [],
      name: 'scalar_stat',
    },
  ],
  url: '/v2/advance_requests/stats',
};
