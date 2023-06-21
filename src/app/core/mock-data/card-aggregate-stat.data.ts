import { CardAggregateStats } from '../models/card-aggregate-stat.model';

export const cardAggregateStatParam: CardAggregateStats[] = [
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
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 5,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 371.87,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: 'PEX BANK',
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: '869',
      },
      {
        column_name: 'tx_state',
        column_value: 'COMPLETE',
      },
    ],
  },
];

export const cardAggregateStatParam2: CardAggregateStats[] = [
  {
    aggregates: [],
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
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 5,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 371.87,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: 'PEX BANK',
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: '869',
      },
      {
        column_name: 'tx_state',
        column_value: 'COMPLETE',
      },
    ],
  },
];

export const cardAggregateStatParam3: CardAggregateStats[] = [
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 4,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: null,
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
];
