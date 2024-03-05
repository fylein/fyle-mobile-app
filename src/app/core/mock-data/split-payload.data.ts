import { SplitPayload } from '../models/platform/v1/split-payload.model';
import { splitsData1 } from './splits.data';

export const splitPayloadData1: SplitPayload = {
  id: 'sdfd2391',
  claim_amount: 1900,
  splits: [
    {
      claim_amount: 1900,
      spent_at: new Date('2020-06-01T01:18:19.292-08:00'),
      category_id: 49058,
      foreign_amount: 3768,
      purpose: 'Team lunch',
      project_id: 92895,
      cost_center_id: 1049,
      custom_fields: [
        {
          name: 'cf1',
          value: 'string1',
        },
      ],
    },
  ],
  report_id: 'rpvgnwlgw34',
  category_id: 49058,
  source: 'SLACK',
  spent_at: new Date('2020-06-01T01:18:19.292-08:00'),
  is_reimbursable: true,
  travel_classes: ['ECONOMY', 'BUSINESS'],
  locations: [],
  foreign_currency: 'GBP',
  foreign_amount: 3768,
  project_id: 92895,
  file_ids: ['fisjfwlrglw', 'fisjfwlrglw'],
  cost_center_id: 1049,
  source_account_id: 'acwbl222wlg',
  tax_amount: 0,
  tax_group_id: null,
  started_at: new Date('2020-06-01T01:18:19.292-08:00'),
  ended_at: new Date('2020-06-01T01:18:19.292-08:00'),
  merchant: 'Uber',
  purpose: 'Team lunch',
  is_billable: true,
  custom_fields: [
    {
      name: 'cf1',
      value: 'string1',
    },
  ],
};

export const splitPayloadData2: SplitPayload = {
  is_reimbursable: true,
  source: 'MOBILE',
  spent_at: new Date('Mon Feb 13 2023 22:30:00 GMT+0530 (India Standard Time)'),
  started_at: new Date('Mon Feb 13 2023 22:30:00 GMT+0530 (India Standard Time)'),
  ended_at: new Date('Mon Feb 13 2023 22:30:00 GMT+0530 (India Standard Time)'),
  claim_amount: 122,
  foreign_currency: null,
  foreign_amount: null,
  locations: [],
  custom_fields: [
    {
      id: 200227,
      mandatory: false,
      name: 'userlist',
      options: [],
      placeholder: 'userlist_custom_field',
      prefix: '',
      type: 'USER_LIST',
      value: [],
    },
    {
      id: 211326,
      mandatory: false,
      name: 'custom date',
      options: [],
      placeholder: 'helo date',
      prefix: '',
      type: 'DATE',
      value: '2023-02-13T17:00:00.000Z',
    },
  ],
  project_id: 3943,
  source_account_id: 'acc5APeygFjRd',
  tax_amount: 18.61,
  tax_group_id: 'tg3iWuqWhfzB',
  category_id: 16564,
  merchant: 'Australian Taxation Office',
  purpose: 'test_term',
  cost_center_id: 13795,
  is_billable: undefined,
  id: undefined,
  file_ids: ['fijCeF0G0jTl'],
  splits: splitsData1,
  travel_classes: [],
  report_id: 'rp0AGAoeQfQX',
};

export const splitPayloadData3: SplitPayload = {
  ...splitPayloadData2,
  category_id: 16569,
  is_reimbursable: null,
};
