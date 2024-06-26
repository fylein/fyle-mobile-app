import deepFreeze from 'deep-freeze-strict';

import { CCCExpFlattened } from '../models/corporate-card-expense-flattened.model';

export const eCCCApiResponse: CCCExpFlattened[] = deepFreeze([
  {
    ccce_id: 'ccceYIJhT8Aj6U',
    ccce_created_at: new Date('2021-03-26T09:29:14.586Z'),
    ccce_updated_at: new Date('2022-01-07T11:53:53.588Z'),
    ccce_txn_dt: new Date('2018-06-26T10:00:00.000Z'),
    ccce_creator_id: null,
    ccce_orig_currency: null,
    ccce_orig_amount: null,
    ccce_currency: 'USD',
    ccce_amount: 30.98,
    ccce_description: 'AMAZON.COM, SEATTLE, WA',
    ccce_vendor: 'AMAZON.COM',
    ccce_payment_id: 'pay4KzfYhLEvS',
    ccce_state: 'IN_PROGRESS',
    personal: false,
    matched_by: 'ouX8dwsbLCLv',
    matched_at: new Date('2022-01-07T11:53:52.588Z'),
    tx_split_group_id: 'tx1FQMblw3XF',
    tx_split_group_user_amount: null,
    ccce_group_id: 'ccceYIJhT8Aj6U',
    reversed: false,
    bank_txn_id: 'btxnMy43OZokde',
    ccce_card_or_account_number: '869',
    ou_id: 'ouX8dwsbLCLv',
    ou_org_id: 'orNVthTo2Zyo',
    us_full_name: 'Abhishek Jain',
    us_email: 'ajain@fyle.in',
    ou_department_id: 'deptpmQ0SsMO0S',
    tx_project_id: null,
  },
]);
