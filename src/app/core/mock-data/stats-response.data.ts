import deepFreeze from 'deep-freeze-strict';

import { Datum, StatsResponse } from '../models/v2/stats-response.model';
// type StatsResponse = {
//   data: {
//     dimensions: string[];
//     name: string;
//     value?: Value[];
//     aggregates?: Aggregate[];
//     key?: Key[];
//   }[];
//   url: string;
//   scalar?: boolean;
//   dimension_1_1?: string;
//   aggregates?: string;
// };

export const apiAssignedCardDetailsRes = new StatsResponse({
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
});
