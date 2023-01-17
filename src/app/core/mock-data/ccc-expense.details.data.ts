import { CCCDetails } from '../models/ccc-expense-details.model';

export const expectedAssignedCCCStats: CCCDetails = {
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
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 107,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 6598.172,
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
          column_value: 'DRAFT',
        },
      ],
    },
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 8,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 2612.83,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: 'TEST-999',
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: '6975',
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
          function_value: 1,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 5782.73,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: null,
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: 'Sample-Bank-xxx3420',
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
          function_value: 1,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 2257.23,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: null,
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: 'Sample-Bank-xxxxxx-99171',
        },
        {
          column_name: 'tx_state',
          column_value: 'DRAFT',
        },
      ],
    },
  ],
};
