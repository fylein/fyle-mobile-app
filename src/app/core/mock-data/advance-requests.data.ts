import { AdvanceRequests } from '../models/advance-requests.model';

export const advancedRequests: AdvanceRequests = {
  id: 'areqMP09oaYXBf',
  created_at: new Date('2023-02-23T16:24:01.335Z'),
  approved_at: null,
  purpose: 'some',
  notes: null,
  state: 'DRAFT',
  currency: 'USD',
  amount: 150,
  org_user_id: 'ouX8dwsbLCLv',
  advance_id: null,
  policy_amount: null,
  policy_flag: null,
  policy_state: 'SUCCESS',
  project_id: null,
  custom_field_values: [
    {
      id: 111,
      name: 'Test Number',
      value: 1,
    },
    {
      id: 112,
      name: 'Test Select',
      value: null,
    },
    {
      id: 113,
      name: 'test bool',
      value: false,
    },
    {
      id: 114,
      name: 'test multi',
      value: null,
    },
    {
      id: 115,
      name: 'test date',
      value: null,
    },
    {
      id: 134,
      name: 'Project Name',
      value: null,
    },
    {
      id: 136,
      name: '231',
      value: false,
    },
    {
      id: 150,
      name: 'checking',
      value: false,
    },
    {
      id: 151,
      name: '123',
      value: null,
    },
    {
      id: 152,
      name: 'Okay?',
      value: false,
    },
  ],
  updated_at: new Date('2023-02-23T11:46:17.569Z'),
  source: 'MOBILE',
  advance_request_number: 'AR/2023/02/R/3',
  updated_by: null,
  is_sent_back: false,
  is_pulled_back: true,
};

export const pullBackAdvancedRequests: AdvanceRequests = {
  ...advancedRequests,
  is_pulled_back: true,
};
