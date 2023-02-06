import { Aggregate, Value, Key } from '../models/v2/stats-response.model';

type StatsResponse = {
  data: {
    dimensions: string[];
    name: string;
    value?: Value[];
    aggregates?: Aggregate[];
    key?: Key[];
  }[];
  url: string;
  scalar?: boolean;
  dimension_1_1?: string;
  aggregates?: string;
};

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

export const apiReportStatsEmptyRes: StatsResponse = {
  data: [
    {
      dimensions: ['rp_state'],
      name: '1',
      value: [
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
      ],
    },
  ],
  url: '/v2/reports/stats',
};

export const apiAssignedCardDetailsRes: StatsResponse = {
  data: [
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 1090,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 589553.832,
        },
      ],
      dimensions: [],
      name: 'scalar_stat',
    },
    {
      dimensions: ['corporate_credit_card_bank_name'],
      name: '1',
      value: [
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 4,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 3494,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: 'DAMNA',
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: '8698',
            },
            {
              column_name: 'tx_state',
              column_value: 'COMPLETE',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 964,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 568437,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: 'DAMNA',
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: '8698',
            },
            {
              column_name: 'tx_state',
              column_value: 'DRAFT',
            },
          ],
        },
      ],
    },
  ],
  url: '/v2/expenses_and_ccce/stats',
};

export const apiReportStatsRawRes: StatsResponse = {
  data: [
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
  ],
  url: '/v2/reports/stats',
};

export const txnStats: StatsResponse = {
  data: [
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 8,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 10583.73,
        },
      ],
      dimensions: [],
      name: 'scalar_stat',
    },
  ],
  url: '/v2/expenses/stats',
};
