export const apiTransactionUnreportedStatsRes = [
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

export const apiTransactionIncompleteStatsRes = [
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

export const apiReportStatsRes = {
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

export const expectedUnreportedExpStats = {
  count: 6,
  sum: 16748.73,
};

export const expectedIncompleteExpStats = {
  count: 1130,
  sum: 1148487.57555147,
};

export const expectedReportStats = {
  draft: {
    count: 6,
    sum: 93165.91,
  },
  report: {
    count: 45,
    sum: 5177243929.65219,
  },
  approved: {
    count: 56,
    sum: 28758273650702.816,
  },
  paymentPending: {
    count: 4,
    sum: 501602.12,
  },
};
