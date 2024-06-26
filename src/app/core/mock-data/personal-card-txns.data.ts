import deepFreeze from 'deep-freeze-strict';

import { PersonalCardTxn } from '../models/personal_card_txn.model';
import { ApiV2Response } from '../models/v2/api-v2-response.model';

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
