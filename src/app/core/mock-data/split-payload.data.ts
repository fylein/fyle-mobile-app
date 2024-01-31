import { SplitPayload } from '../models/platform/v1/split-payload.model';

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
