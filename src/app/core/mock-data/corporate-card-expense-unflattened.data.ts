import deepFreeze from 'deep-freeze-strict';

import { CCCExpUnflattened } from '../models/corporate-card-expense-unflattened.model';

export const expectedECccResponse: CCCExpUnflattened[] = deepFreeze([
  {
    ccce: {
      id: 'ccceYIJhT8Aj6U',
      created_at: '2021-03-26T09:29:14.586Z',
      updated_at: '2022-01-07T11:53:53.588Z',
      txn_dt: '2018-06-26T10:00:00.000Z',
      creator_id: null,
      orig_currency: null,
      orig_amount: null,
      currency: 'USD',
      amount: 30.98,
      description: 'AMAZON.COM, SEATTLE, WA',
      vendor: 'AMAZON.COM',
      payment_id: 'pay4KzfYhLEvS',
      state: 'IN_PROGRESS',
      group_id: 'ccceYIJhT8Aj6U',
      card_or_account_number: '869',
    },
    personal: false,
    matched: {
      by: 'ouX8dwsbLCLv',
      at: new Date('2022-01-07T11:53:52.588Z'),
    },
    tx: {
      split_group_id: 'tx1FQMblw3XF',
      split_group_user_amount: null,
      project_id: null,
    },
    reversed: false,
    bank: {
      txn_id: 'btxnMy43OZokde',
    },
    ou: {
      id: 'ouX8dwsbLCLv',
      org_id: 'orNVthTo2Zyo',
      department_id: 'deptpmQ0SsMO0S',
    },
    us: {
      full_name: 'Abhishek Jain',
      email: 'ajain@fyle.in',
    },
  },
]);

export const eCCCData1: CCCExpUnflattened = deepFreeze({
  ...expectedECccResponse[0],
  ccce: {
    ...expectedECccResponse[0].ccce,
    corporate_credit_card_account_number: '123456789',
  },
  flow: 'newCCCFlow',
});

export const eCCCData2: CCCExpUnflattened = deepFreeze({
  ...expectedECccResponse[0],
  ccce: {
    ...expectedECccResponse[0].ccce,
    corporate_credit_card_account_number: '123456789',
    vendor: null,
  },
});

export const eCCCData3: CCCExpUnflattened = deepFreeze({
  ...expectedECccResponse[0],
  flow: 'newCCCFlow',
  ccce: {
    ...expectedECccResponse[0].ccce,
    corporate_credit_card_account_number: '123456789',
  },
});
