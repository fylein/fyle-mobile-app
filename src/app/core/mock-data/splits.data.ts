import { Splits } from '../models/platform/v1/splits.model';

export const splitsData1: Splits[] = [
  {
    claim_amount: 56.6,
    spent_at: new Date(),
    category_id: 750391,
    project_id: 92895,
    cost_center_id: null,
    foreign_amount: null,
    foriegn_currency: null,
    purpose: 'split test 1',
    custom_fields: [],
  },
];

export const splitData2: Splits[] = [
  {
    claim_amount: null,
    spent_at: new Date('Tue Jan 31 2023 22:30:00 GMT+0530 (India Standard Time)'),
    category_id: 16569,
    project_id: null,
    cost_center_id: null,
    foreign_amount: null,
    purpose: 'test_term',
    custom_fields: [
      {
        name: 'userlist',
        value: [],
      },
      {
        name: 'User List',
        value: [],
      },
    ],
  },
  {
    spent_at: new Date('Tue Jan 31 2023 22:30:00 GMT+0530 (India Standard Time)'),
    category_id: 123032,
    project_id: null,
    cost_center_id: 13795,
    purpose: 'test_term',
    foreign_amount: null,
    custom_fields: [
      {
        name: 'userlist',
        value: [],
      },
      {
        name: 'User List',
        value: [],
      },
    ],
    claim_amount: null,
  },
];
