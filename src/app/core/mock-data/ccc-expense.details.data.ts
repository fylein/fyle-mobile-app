import deepFreeze from 'deep-freeze-strict';

import { CCCDetails } from '../models/ccc-expense-details.model';

export const expectedAssignedCCCStats: CCCDetails = deepFreeze({
  totalTxns: 1090,
  totalAmount: 589553.832,
  cardDetails: [
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
});

export const mastercardCCCStats: CCCDetails = deepFreeze({
  totalTxns: 12,
  totalAmount: 1874.4,
  cardDetails: [
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 6,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 937.2,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: 'MASTERCARD_BANK',
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: '5555',
        },
        {
          column_name: 'tx_state',
          column_value: 'DRAFT',
        },
      ],
    },
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 6,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 937.2,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: 'MASTERCARD_BANK',
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: '5555',
        },
        {
          column_name: 'tx_state',
          column_value: 'COMPLETE',
        },
      ],
    },
  ],
});

export const emptyCCCStats: CCCDetails = deepFreeze({
  totalTxns: 0,
  totalAmount: 0,
  cardDetails: [],
});
