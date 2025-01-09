import deepFreeze from 'deep-freeze-strict';

import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformPersonalCardTxn } from '../models/platform/platform-personal-card-txn.model';
import { PlatformPersonalCardTxnState } from '../models/platform/platform-personal-card-txn-state.enum';
import { PlatformPersonalCardMatchedExpense } from '../models/platform/platform-personal-card-matched-expense.model';
import { TxnDetail } from '../models/v2/txn-detail.model';
import { PlatformPersonalCardQueryParams } from '../models/platform/platform-personal-card-query-params.model';

export const platformPersonalCardTxns: PlatformApiResponse<PlatformPersonalCardTxn[]> = deepFreeze({
  count: 3,
  data: [
    {
      transactionType: 'debit',
      amount: 200.0,
      category: 'Restaurants/Dining',
      created_at: new Date('2024-11-21T05:27:51.863181+00:00'),
      currency: 'USD',
      description: 'mocha',
      external_transaction_id: '57690734',
      foreign_amount: null,
      foreign_currency: null,
      id: 'btxndbZdAth0x4',
      matched_expense_ids: ['txjhfqMX9YuB'],
      matched_expenses: [
        {
          amount: 200,
          category_display_name: 'Unspecified',
          currency: 'USD',
          foreign_amount: null,
          foreign_currency: null,
          id: 'txjhfqMX9YuB',
          merchant: 'Mocha',
          no_of_files: 0,
          purpose: 'mocha',
          seq_num: 'E/2024/11/T/7',
          spent_at: new Date('2024-09-22T00:00:00+00:00'),
          state: 'COMPLETE',
        },
      ],
      merchant: 'Mocha',
      org_id: 'orrb8EW1zZsy',
      personal_card_id: 'bacczUA0bUKVTD',
      spent_at: new Date('2024-09-22T00:00:00+00:00'),
      state: PlatformPersonalCardTxnState.INITIALIZED,
      updated_at: new Date('2024-11-26T04:44:17.825002+00:00'),
      user_id: 'us2KhpQLpzX4',
    },
    {
      transactionType: 'debit',
      amount: 200.0,
      category: 'Restaurants/Dining',
      created_at: new Date('2024-11-21T05:27:51.863181+00:00'),
      currency: 'USD',
      description: 'mocha',
      external_transaction_id: '57690734',
      foreign_amount: null,
      foreign_currency: null,
      id: 'btxndbZdAth0x5',
      matched_expense_ids: ['txjhfqMX9YuB'],
      matched_expenses: [
        {
          amount: 200,
          category_display_name: 'Unspecified',
          currency: 'USD',
          foreign_amount: null,
          foreign_currency: null,
          id: 'txjhfqMX9YuB',
          merchant: 'Mocha',
          no_of_files: 0,
          purpose: 'mocha',
          seq_num: 'E/2024/11/T/7',
          spent_at: new Date('2024-09-22T00:00:00+00:00'),
          state: 'COMPLETE',
        },
      ],
      merchant: 'Mocha',
      org_id: 'orrb8EW1zZsy',
      personal_card_id: 'bacczUA0bUKVTD',
      spent_at: new Date('2024-09-22T00:00:00+00:00'),
      state: PlatformPersonalCardTxnState.MATCHED,
      updated_at: new Date('2024-11-26T04:44:17.825002+00:00'),
      user_id: 'us2KhpQLpzX4',
    },
    {
      transactionType: 'debit',
      amount: 200.0,
      category: 'Restaurants/Dining',
      created_at: new Date('2024-11-21T05:27:51.863181+00:00'),
      currency: 'USD',
      description: 'mocha',
      external_transaction_id: '57690734',
      foreign_amount: null,
      foreign_currency: null,
      id: 'btxndbZdAth0x6',
      matched_expense_ids: [],
      matched_expenses: [],
      merchant: 'Coffee',
      org_id: 'orrb8EW1zZsy',
      personal_card_id: 'bacczUA0bUKVTD',
      spent_at: new Date('2024-09-22T00:00:00+00:00'),
      state: PlatformPersonalCardTxnState.INITIALIZED,
      updated_at: new Date('2024-11-26T04:44:17.825002+00:00'),
      user_id: 'us2KhpQLpzX4',
    },
  ],
  offset: 0,
});

export const platformMatchExpenseResponse: PlatformApiResponse<PlatformPersonalCardTxn> = deepFreeze({
  data: {
    amount: 200.0,
    category: 'Restaurants/Dining',
    created_at: new Date('2024-11-21T05:27:51.863181+00:00'),
    currency: 'USD',
    description: 'mocha',
    external_transaction_id: '57690734',
    foreign_amount: null,
    foreign_currency: null,
    id: 'btxndbZdAth0x4',
    matched_expense_ids: ['tx3nHShG60zq'],
    matched_expenses: [
      {
        amount: 200,
        category_display_name: 'Unspecified',
        currency: 'USD',
        foreign_amount: null,
        foreign_currency: null,
        id: 'tx3nHShG60zq',
        merchant: 'Mocha',
        no_of_files: 0,
        purpose: 'mocha',
        seq_num: 'E/2024/11/T/7',
        spent_at: new Date('2024-09-22T00:00:00+00:00'),
        state: 'COMPLETE',
      },
    ],
    merchant: 'Mocha',
    org_id: 'orrb8EW1zZsy',
    personal_card_id: 'bacczUA0bUKVTD',
    spent_at: new Date('2024-09-22T00:00:00+00:00'),
    state: 'MATCHED' as PlatformPersonalCardTxnState,
    updated_at: new Date('2024-11-26T04:44:17.825002+00:00'),
    user_id: 'us2KhpQLpzX4',
  },
});

export const matchedExpensesPlatform: PlatformPersonalCardMatchedExpense[] = deepFreeze([
  {
    amount: 200,
    category_display_name: 'Unspecified',
    currency: 'USD',
    foreign_amount: null,
    foreign_currency: null,
    id: 'txjhfqMX9YuB',
    merchant: 'Mocha',
    no_of_files: 0,
    purpose: 'mocha',
    seq_num: 'E/2024/11/T/7',
    spent_at: new Date('2024-09-22T00:00:00+00:00'),
    state: 'COMPLETE',
  },
]);

export const transformedMatchedExpenses: TxnDetail[] = deepFreeze([
  {
    amount: 200,
    currency: 'USD',
    expense_number: 'E/2024/11/T/7',
    category_display_name: 'Unspecified',
    id: 'txjhfqMX9YuB',
    num_files: 0,
    purpose: 'mocha',
    state: 'COMPLETE',
    txn_dt: new Date('2024-09-22T00:00:00.000Z'),
  },
]);

export const platformQueryParams: PlatformPersonalCardQueryParams = deepFreeze({
  state: 'MATCHED',
  personal_card_id: 'btxndbZdAth0x4',
  amount: '100',
  or: ['amount', 'state'],
  q: 'query',
});

export const platformTxnsConfig = deepFreeze({
  offset: 0,
  limit: 10,
  queryParams: {
    state: 'in.(MATCHED)',
    personal_card_id: 'eq.baccLesaRlyvLY',
  },
});
