import deepFreeze from 'deep-freeze-strict';

import { MergeExpensesPayload } from '../models/merge-expenses-payload.model';

export const mergeExpensesPayload: MergeExpensesPayload = deepFreeze({
  source_expense_ids: ['txKj4PEIUAXw'],
  target_expense_id: 'txVNpvgTPW4Z',
  target_expense_fields: {
    source_account_id: 'accZ1IWjhjLv4',
    is_billable: true,
    currency: 'USD',
    amount: 114,
    project_id: 3943,
    tax_amount: 5.43,
    tax_group_id: 'tgwotEwriRB5',
    category_id: 16564,
    merchant: 'Australian Taxation Office',
    purpose: 'test_term',
    spent_at: new Date('2023-03-06T11:30:00.000Z'),
    file_ids: [],
    custom_fields: [
      {
        name: 'userlist',
        value: [],
      },
      {
        name: 'User List',
        value: [],
      },
      {
        name: 'test',
        value: '',
      },
      {
        name: 'category2',
        value: '',
      },
      {
        name: 'test 112',
        value: null,
      },
      {
        name: '2232323',
        value: null,
      },
      {
        name: 'select all 2',
        value: null,
      },
    ],
    locations: [],
  },
});
