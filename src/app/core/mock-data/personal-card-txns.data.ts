import deepFreeze from 'deep-freeze-strict';

import { PersonalCardTxn } from '../models/personal_card_txn.model';
import { ApiV2Response } from '../models/v2/api-v2-response.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformPersonalCardTxn } from '../models/platform/platform-personal-card-txn.model';
import { PlatformPersonalCardTxnState } from '../models/platform/platform-personal-card-txn-state.enum';
import { PlatformPersonalCardMatchedExpense } from '../models/platform/platform-personal-card-matched-expense.model';
import { TxnDetail } from '../models/v2/txn-detail.model';
import { PlatformPersonalCardQueryParams } from '../models/platform/platform-personal-card-query-params.model';

export const apiPersonalCardTxnsRes: ApiV2Response<PersonalCardTxn> = deepFreeze({
  count: 1,
  data: [
    {
      _search_document:
        "'200':1 '200.00':2 'card':5 'debit':4,18 'huskyteambkstore':11 'purchase':6 'usd':3 'wa':16 'xx':8 'xx/xx':7 'xxp':9 'xxx':13,14 'xxx-xxx-xxxx':12 'xxxx':15 'xxxxuw':10 'xxxxx':17",
      ba_account_number: 'xxxx2345',
      ba_bank_name: 'Dag Site yodlee',
      ba_id: 'baccLesaRlyvLY',
      ba_mask: '2345',
      ba_nickname: 'Robin',
      btxn_amount: 200,
      btxn_created_at: new Date('2021-11-11T06:42:30.129062'),
      btxn_currency: 'USD',
      btxn_description: 'Debit Card Purchase XX/XX XX:XXp #XXXXUW HUSKYTEAMBKSTORE XXX-XXX-XXXX WA XXXXX',
      btxn_external_id: '31703918',
      btxn_id: 'btxn6Kur2OMWeq',
      btxn_orig_amount: null,
      btxn_orig_currency: null,
      btxn_status: 'HIDDEN',
      btxn_transaction_dt: new Date('2021-09-19T10:00:00'),
      btxn_transaction_type: 'debit',
      btxn_updated_at: new Date('2022-03-04T07:34:52.408835'),
      btxn_vendor: null,
      tx_matched_at: null,
      tx_split_group_id: null,
      txn_details: null,
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/personal_bank_transactions',
});

export const matchedPersonalCardTxn: PersonalCardTxn = deepFreeze({
  _search_document:
    "'200':1 '200.00':2 'card':5 'debit':4,18 'huskyteambkstore':11 'purchase':6 'usd':3 'wa':16 'xx':8 'xx/xx':7 'xxp':9 'xxx':13,14 'xxx-xxx-xxxx':12 'xxxx':15 'xxxxuw':10 'xxxxx':17",
  ba_account_number: 'xxxx2345',
  ba_bank_name: 'Dag Site yodlee',
  ba_id: 'baccLesaRlyvLY',
  ba_mask: '2345',
  ba_nickname: 'Robin',
  btxn_amount: 200,
  btxn_created_at: new Date('2021-11-11T06:42:30.129062'),
  btxn_currency: 'USD',
  btxn_description: 'Debit Card Purchase XX/XX XX:XXp #XXXXUW HUSKYTEAMBKSTORE XXX-XXX-XXXX WA XXXXX',
  btxn_external_id: '31703918',
  btxn_id: 'btxn6Kur2OMWeq',
  btxn_orig_amount: null,
  btxn_orig_currency: null,
  btxn_status: 'MATCHED',
  btxn_transaction_dt: new Date('2021-09-19T10:00:00'),
  btxn_transaction_type: 'debit',
  btxn_updated_at: new Date('2022-03-04T07:34:52.408835'),
  btxn_vendor: null,
  tx_matched_at: null,
  tx_split_group_id: null,
  txn_details: [
    {
      amount: 57.69,
      category: 'Bus',
      category_display_name: 'Bus / Travelling - Inland',
      currency: 'USD',
      expense_number: 'E/2022/07/T/48',
      id: 'txhLBlo6XN4k',
      num_files: 0,
      purpose: 'ADOBE *CREATIVE CLOUD',
      state: 'APPROVED',
      sub_category: 'Travelling - Inland',
      txn_dt: new Date('2019-06-19T06:30:00'),
      user_can_delete: true,
      vendor_id: 29200,
      vendor_name: 'Office & Shipping',
    },
  ],
});

export const platformPersonalCardTxns: PlatformApiResponse<PlatformPersonalCardTxn[]> = deepFreeze({
  count: 2,
  data: [
    {
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
      state: 'MATCHED' as PlatformPersonalCardTxnState,
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

export const transformedPlatformPersonalCardTxns: Partial<ApiV2Response<PersonalCardTxn>> = deepFreeze({
  count: 2,
  offset: 0,
  data: [
    {
      btxn_id: 'btxndbZdAth0x4',
      btxn_created_at: new Date('2024-11-21T05:27:51.863Z'),
      btxn_updated_at: new Date('2024-11-26T04:44:17.825Z'),
      ba_id: 'bacczUA0bUKVTD',
      btxn_amount: 200,
      btxn_currency: 'USD',
      btxn_description: 'mocha',
      btxn_external_id: '57690734',
      btxn_transaction_dt: new Date('2024-09-22T00:00:00.000Z'),
      btxn_orig_amount: null,
      btxn_orig_currency: null,
      btxn_status: 'MATCHED',
      btxn_vendor: 'Mocha',
      tx_split_group_id: 'txjhfqMX9YuB',
      btxn_transaction_type: 'debit',
      ba_account_number: 'manually add',
      txn_details: [
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
      ],
    },
  ],
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

export const publicQueryParams = deepFreeze({
  btxn_status: 'MATCHED',
  ba_id: 'btxndbZdAth0x4',
  _search_document: 'fts.query',
  amount: '100',
  or: ['amount', 'state'],
});

export const platformQueryParams: PlatformPersonalCardQueryParams = deepFreeze({
  state: 'MATCHED',
  personal_card_id: 'btxndbZdAth0x4',
  amount: '100',
  or: ['amount', 'state'],
  q: 'query',
});

export const publicTxnsConfig = deepFreeze({
  offset: 0,
  limit: 10,
  queryParams: {
    btxn_status: 'in.(MATCHED)',
    ba_id: 'eq.baccLesaRlyvLY',
  },
});

export const platformTxnsConfig = deepFreeze({
  offset: 0,
  limit: 10,
  queryParams: {
    state: 'in.(MATCHED)',
    personal_card_id: 'eq.baccLesaRlyvLY',
  },
});
