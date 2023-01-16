import { StatsResponse } from '../models/v2/stats-response.model';

export const apiReportStatsRes: StatsResponse = {
  data: [
    {
      dimensions: ['rp_state'],
      name: '1',
      value: [
        {
          aggregates: [
            {
              function_name: 'sum(rp_amount)',
              function_value: 28758273650702.816,
            },
            {
              function_name: 'count(rp_id)',
              function_value: 56,
            },
          ],
          key: [
            {
              column_name: 'rp_state',
              column_value: 'APPROVED',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'sum(rp_amount)',
              function_value: 642147.297922,
            },
            {
              function_name: 'count(rp_id)',
              function_value: 2,
            },
          ],
          key: [
            {
              column_name: 'rp_state',
              column_value: 'APPROVER_INQUIRY',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'sum(rp_amount)',
              function_value: 5177243929.65219,
            },
            {
              function_name: 'count(rp_id)',
              function_value: 45,
            },
          ],
          key: [
            {
              column_name: 'rp_state',
              column_value: 'APPROVER_PENDING',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'sum(rp_amount)',
              function_value: 93165.91,
            },
            {
              function_name: 'count(rp_id)',
              function_value: 6,
            },
          ],
          key: [
            {
              column_name: 'rp_state',
              column_value: 'DRAFT',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'sum(rp_amount)',
              function_value: 1221297040.1711,
            },
            {
              function_name: 'count(rp_id)',
              function_value: 33,
            },
          ],
          key: [
            {
              column_name: 'rp_state',
              column_value: 'PAID',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'sum(rp_amount)',
              function_value: 501602.12,
            },
            {
              function_name: 'count(rp_id)',
              function_value: 4,
            },
          ],
          key: [
            {
              column_name: 'rp_state',
              column_value: 'PAYMENT_PENDING',
            },
          ],
        },
      ],
    },
  ],
  url: '/v2/reports/stats',
};

export const apiReportStatParams: Partial<StatsResponse> = {
  scalar: false,
  dimension_1_1: 'rp_state',
  aggregates: 'sum(rp_amount),count(rp_id)',
};
