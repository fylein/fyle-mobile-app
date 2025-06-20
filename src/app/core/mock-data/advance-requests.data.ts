import deepFreeze from 'deep-freeze-strict';

import { AdvanceRequests } from '../models/advance-requests.model';

export const advanceRequests: AdvanceRequests = deepFreeze({
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
});

export const pullBackAdvancedRequests: AdvanceRequests = deepFreeze({
  ...advanceRequests,
  is_pulled_back: true,
});

export const expectedSingleErq = deepFreeze({
  id: 'areqGzKF1Tne23',
  created_at: '2023-02-23T02:16:15.260Z',
  approved_at: null,
  purpose: 'some',
  notes: null,
  state: 'SUBMITTED',
  currency: 'USD',
  amount: 100,
  org_user_id: 'ouX8dwsbLCLv',
  advance_id: null,
  policy_amount: null,
  policy_flag: null,
  policy_state: 'SUCCESS',
  project_id: null,
  custom_field_values: null,
  updated_at: '2023-02-23T14:16:52.396Z',
  source: 'MOBILE',
  advance_request_number: 'AR/2023/02/R/4',
  updated_by: null,
  is_sent_back: null,
  is_pulled_back: null,
});

export const advancedRequests2: AdvanceRequests = deepFreeze({
  ...advanceRequests,
  id: 'areq99bN9mZgu1',
});

export const draftAdvancedRequestRes: AdvanceRequests = deepFreeze({
  id: 'areqo6m2UmDSfq',
  created_at: new Date('2023-02-24T12:28:18.700Z'),
  updated_at: new Date('2023-02-24T12:28:18.700Z'),
  approved_at: null,
  org_user_id: 'ouX8dwsbLCLv',
  purpose: 'some',
  notes: null,
  state: 'DRAFT',
  currency: 'USD',
  amount: 50,
  advance_id: null,
  project_id: null,
  source: 'MOBILE',
  advance_request_number: 'AR/2023/02/R/9',
  is_sent_back: null,
  is_pulled_back: null,
  policy_amount: null,
  policy_flag: null,
  policy_state: null,
  custom_field_values: [
    {
      id: 111,
      name: 'Test Number',
      value: 1123,
      type: null,
    },
    {
      id: 112,
      name: 'Test Select',
      value: null,
      type: null,
    },
    {
      id: 113,
      name: 'test bool',
      value: false,
      type: null,
    },
    {
      id: 114,
      name: 'test multi',
      value: null,
      type: null,
    },
    {
      id: 115,
      name: 'test date',
      value: null,
      type: null,
    },
    {
      id: 134,
      name: 'Project Name',
      value: null,
      type: null,
    },
    {
      id: 136,
      name: '231',
      value: false,
      type: null,
    },
    {
      id: 150,
      name: 'checking',
      value: false,
      type: null,
    },
    {
      id: 151,
      name: '123',
      value: null,
      type: null,
    },
    {
      id: 152,
      name: 'Okay?',
      value: false,
      type: null,
    },
  ],
});

export const draftAdvancedRequestParam = deepFreeze({
  org_user_id: 'ouX8dwsbLCLv',
  currency: 'USD',
  source: 'MOBILE',
  created_at: new Date('2023-02-23T22:58:18.412Z'),
  amount: 50,
  purpose: 'some',
  project_id: null,
  notes: null,
  custom_field_values: [
    {
      id: 111,
      name: 'Test Number',
      value: 1123,
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
});

export const rejectedAdvReqRes: AdvanceRequests = deepFreeze({
  id: 'areqVU0Xr5suPC',
  created_at: new Date('2023-02-24T12:48:00.608Z'),
  updated_at: new Date('2023-02-24T12:48:48.860Z'),
  approved_at: null,
  org_user_id: 'ourw7Hi4mmpO',
  purpose: 'A',
  notes: null,
  state: 'REJECTED',
  currency: 'USD',
  amount: 10,
  advance_id: null,
  project_id: null,
  source: 'WEBAPP',
  advance_request_number: 'AR/2023/02/R/12',
  is_sent_back: null,
  is_pulled_back: null,
  policy_amount: null,
  policy_flag: null,
  policy_state: 'SUCCESS',
  custom_field_values: [
    {
      id: 151,
      name: '123',
      value: null,
      type: 'TEXT',
    },
    {
      id: 134,
      name: 'Project Name',
      value: null,
      type: 'TEXT',
    },
    {
      id: 112,
      name: 'Test Select',
      value: '',
      type: 'SELECT',
    },
    {
      id: 111,
      name: 'Test Number',
      value: 121,
      type: 'NUMBER',
    },
    {
      id: 114,
      name: 'test multi',
      value: '',
      type: 'MULTI_SELECT',
    },
    {
      id: 115,
      name: 'test date',
      value: null,
      type: 'DATE',
    },
    {
      id: 150,
      name: 'checking',
      value: false,
      type: 'BOOLEAN',
    },
    {
      id: 152,
      name: 'Okay?',
      value: false,
      type: 'BOOLEAN',
    },
    {
      id: 113,
      name: 'test bool',
      value: false,
      type: 'BOOLEAN',
    },
    {
      id: 136,
      name: '231',
      value: false,
      type: 'BOOLEAN',
    },
  ],
});

export const checkPolicyAdvReqParam: AdvanceRequests = deepFreeze({
  id: 'areq4YujEm52Ub',
  created_at: new Date('2023-02-23T19:37:01.207Z'),
  approved_at: null,
  purpose: 'Food',
  notes: null,
  state: 'DRAFT',
  currency: 'USD',
  amount: 34,
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
      value: 123,
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
  ],
  updated_at: new Date('2023-02-24T14:40:14.147Z'),
  source: 'MOBILE',
  advance_request_number: 'AR/2023/02/R/15',
  updated_by: null,
  is_sent_back: null,
  is_pulled_back: true,
});

export const advanceRequests2: Partial<AdvanceRequests> = deepFreeze({
  ...advanceRequests,
  currency: 'USD',
  amount: 130,
  purpose: 'Test purpose',
  project_id: 168826,
  notes: 'Test notes',
  source: 'MOBILE',
  custom_field_values: null,
});

export const advanceRequests3: Partial<AdvanceRequests> = deepFreeze({
  org_user_id: 'ouX8dwsbLCLv',
  currency: 'USD',
  source: 'MOBILE',
  created_at: new Date(),
});
