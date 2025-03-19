import deepFreeze from 'deep-freeze-strict';

import { cloneDeep } from 'lodash';
import { ApiV2Response } from '../models/api-v2.model';
import { ExtendedAdvanceRequestPublic } from '../models/extended-advance-request-public.model';
import { ExtendedAdvanceRequest } from '../models/extended_advance_request.model';

export const singleExtendedAdvReqRes: ApiV2Response<ExtendedAdvanceRequest> = deepFreeze({
  count: 1,
  data: [
    {
      _search_document:
        "'123':1 '213':2 'a':6,12,18,24 'abhishek':30 'ajain@fyle.in':32 'ar/2022/05/r/6':3 'business':9,15,21,27 'director':4 'indeed':11,17,23,29 'jain':31 'long':8,14,20,26 'mumbai':5 'unit':10,16,22,28 'very':7,13,19,25",
      advance_request_approvals: {
        ouIQcqEf9Mve: {
          state: 'APPROVAL_DISABLED',
        },
        ouXYHXfr4w0b: {
          state: 'APPROVAL_DISABLED',
        },
        oul4Zj5uQge0: {
          state: 'APPROVAL_PENDING',
        },
      },
      areq_advance_id: null,
      areq_advance_request_number: 'AR/2022/05/R/6',
      areq_amount: 123,
      areq_approval_state: ['APPROVAL_PENDING', 'APPROVAL_DISABLED', 'APPROVAL_DISABLED'],
      areq_approved_at: null,
      areq_approvers_ids: ['oul4Zj5uQge0'],
      areq_created_at: new Date('2022-05-27T08:33:32.879009'),
      areq_currency: 'USD',
      areq_custom_field_values: [
        { id: 110, name: 'Test text', value: null, type: null },
        { id: 111, name: 'Test Number', value: 123, type: null },
        { id: 112, name: 'Test Select', value: null, type: null },
        { id: 113, name: 'test bool', value: false, type: null },
        { id: 114, name: 'test multi', value: null, type: null },
        { id: 115, name: 'test date', value: null, type: null },
        { id: 134, name: 'Project Name', value: null, type: null },
        { id: 136, name: '231', value: false, type: null },
      ],
      areq_id: 'areqdQ9jnokUva',
      areq_is_pulled_back: false,
      areq_is_sent_back: null,
      areq_last_updated_by:
        '{"user_id":"usvKA4X8Ugcr","org_user_id":"ouX8dwsbLCLv","org_id":"orNVthTo2Zyo","roles":["TRAVEL_ADMIN","FINANCE","ADMIN","APPROVER","FYLER","VERIFIER","PAYMENT_PROCESSOR","TRAVEL_AGENT","AUDITOR","HOP","HOD"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ouX8dwsbLCLv"}',
      areq_notes: null,
      areq_org_user_id: 'ouX8dwsbLCLv',
      areq_policy_amount: null,
      areq_policy_state: 'SUCCESS',
      areq_project_id: null,
      areq_purpose: '213',
      areq_source: 'MOBILE',
      areq_state: 'APPROVAL_PENDING',
      areq_updated_at: new Date('2023-01-03T03:50:52.641197'),
      custom_properties: {
        231: false,
        project_name: null,
        test_bool: false,
        test_date: null,
        test_multi: null,
        test_number: 123,
        test_select: null,
        test_text: null,
      },
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: '123',
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '+12025559975',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_sub_department: null,
      ou_title: 'director',
      project_code: null,
      project_name: null,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/advance_requests',
});

export const extendedAdvReqDraft: ExtendedAdvanceRequest = deepFreeze({
  _search_document:
    "'54':1 'a':7,13,19,25 'abhishek':31 'ajain@fyle.in':33 'ar/2023/01/r/4':3 'business':10,16,22,28 'director':5 'fd':4 'indeed':12,18,24,30 'jain':32 'long':9,15,21,27 'mumbai':6 'tggg':2 'unit':11,17,23,29 'very':8,14,20,26",
  advance_request_approvals: null,
  areq_advance_id: null,
  areq_advance_request_number: 'AR/2023/01/R/4',
  areq_amount: 54,
  areq_approval_state: null,
  areq_approved_at: null,
  areq_approvers_ids: null,
  areq_created_at: new Date('2023-01-16T06:22:47.058Z'),
  areq_currency: 'USD',
  areq_custom_field_values: [
    { id: 111, name: 'Test Number', value: 43, type: null },
    { id: 112, name: 'Test Select', value: 'ch09', type: null },
    { id: 113, name: 'test bool', value: false, type: null },
    { id: 114, name: 'test multi', value: ['ch89', 'ch763'], type: null },
    { id: 115, name: 'test date', value: null, type: null },
    { id: 134, name: 'Project Name', value: null, type: null },
    { id: 136, name: '231', value: true, type: null },
    { id: 150, name: 'checking', value: true, type: null },
    { id: 151, name: '123', value: '34', type: null },
    { id: 152, name: 'Okay?', value: true, type: null },
  ],
  areq_id: 'areqoVuT5I8OOy',
  areq_is_pulled_back: false,
  areq_is_sent_back: null,
  areq_last_updated_by:
    '{"user_id":"usvKA4X8Ugcr","org_user_id":"ouX8dwsbLCLv","org_id":"orNVthTo2Zyo","roles":["FINANCE","ADMIN","APPROVER","FYLER","VERIFIER","PAYMENT_PROCESSOR","AUDITOR","HOP","HOD","OWNER"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ouX8dwsbLCLv"}',
  areq_notes: 'fd',
  areq_org_user_id: 'ouX8dwsbLCLv',
  areq_policy_amount: null,
  areq_policy_state: null,
  areq_project_id: null,
  areq_purpose: 'tggg',
  areq_source: 'MOBILE',
  areq_state: 'DRAFT',
  areq_updated_at: new Date('2023-01-16T06:22:47.058Z'),
  custom_properties: {
    123: '34',
    231: true,
    checking: true,
    okay_: true,
    project_name: null,
    test_bool: false,
    test_date: null,
    test_multi: ['ch89', 'ch763'],
    test_number: 43,
    test_select: 'ch09',
  },
  ou_business_unit:
    'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
  ou_department: '0000000',
  ou_department_id: 'deptpmQ0SsMO0S',
  ou_employee_id: '',
  ou_id: 'ouX8dwsbLCLv',
  ou_level: '123',
  ou_level_id: 'lvlPtroPaClQy',
  ou_location: 'Mumbai',
  ou_mobile: '+12025559975',
  ou_org_id: 'orNVthTo2Zyo',
  ou_org_name: 'Staging Loaded',
  ou_sub_department: null,
  ou_title: 'director',
  project_code: null,
  project_name: null,
  us_email: 'ajain@fyle.in',
  us_full_name: 'Abhishek Jain',
});

export const extendedAdvReqInquiry: ExtendedAdvanceRequest = deepFreeze({
  ...extendedAdvReqDraft,
  areq_state: 'INQUIRY',
});

export const extendedAdvReqSubmitted: ExtendedAdvanceRequest = deepFreeze({
  ...extendedAdvReqDraft,
  areq_state: 'SUBMITTED',
});

export const extendedAdvReqPaid: ExtendedAdvanceRequest = deepFreeze({
  ...extendedAdvReqDraft,
  areq_state: 'PAID',
});

export const extendedAdvReqApproved: ExtendedAdvanceRequest = deepFreeze({
  ...extendedAdvReqDraft,
  areq_state: 'APPROVED',
});

export const extendedAdvReqRejected: ExtendedAdvanceRequest = deepFreeze({
  ...extendedAdvReqDraft,
  areq_state: 'REJECTED',
});

export const extendedAdvReqPulledBack: ExtendedAdvanceRequest = deepFreeze({
  ...extendedAdvReqDraft,
  areq_is_pulled_back: true,
});

export const extendedAdvReqSentBack: ExtendedAdvanceRequest = deepFreeze({
  ...extendedAdvReqDraft,
  areq_is_sent_back: true,
});

export const extendedAdvReqWithoutDates = deepFreeze({
  ...extendedAdvReqDraft,
  areq_created_at: '2023-01-16T06:22:47.058Z',
  areq_updated_at: '2023-01-16T06:22:47.058Z',
  areq_approved_at: '2023-01-16T06:22:47.058Z',
});

export const extendedAdvReqWithDates = deepFreeze({
  ...extendedAdvReqDraft,
  areq_created_at: new Date('2023-01-16T06:22:47.058Z'),
  areq_updated_at: new Date('2023-01-16T06:22:47.058Z'),
  areq_approved_at: new Date('2023-01-16T06:22:47.058Z'),
});

export const withoutDatesAdv = deepFreeze({
  _search_document:
    "'54':1 'a':7,13,19,25 'abhishek':31 'ajain@fyle.in':33 'ar/2023/01/r/4':3 'business':10,16,22,28 'director':5 'fd':4 'indeed':12,18,24,30 'jain':32 'long':9,15,21,27 'mumbai':6 'tggg':2 'unit':11,17,23,29 'very':8,14,20,26",
  advance_request_approvals: null,
  areq_advance_id: null,
  areq_advance_request_number: 'AR/2023/01/R/4',
  areq_amount: 54,
  areq_approval_state: null,
  areq_approved_at: null,
  areq_approvers_ids: null,
  areq_currency: 'USD',
  areq_custom_field_values: [
    { id: 111, name: 'Test Number', value: 43, type: null },
    { id: 112, name: 'Test Select', value: 'ch09', type: null },
    { id: 113, name: 'test bool', value: false, type: null },
    { id: 114, name: 'test multi', value: ['ch89', 'ch763'], type: null },
    { id: 115, name: 'test date', value: null, type: null },
    { id: 134, name: 'Project Name', value: null, type: null },
    { id: 136, name: '231', value: true, type: null },
    { id: 150, name: 'checking', value: true, type: null },
    { id: 151, name: '123', value: '34', type: null },
    { id: 152, name: 'Okay?', value: true, type: null },
  ],
  areq_id: 'areqoVuT5I8OOy',
  areq_is_pulled_back: false,
  areq_is_sent_back: null,
  areq_last_updated_by:
    '{"user_id":"usvKA4X8Ugcr","org_user_id":"ouX8dwsbLCLv","org_id":"orNVthTo2Zyo","roles":["FINANCE","ADMIN","APPROVER","FYLER","VERIFIER","PAYMENT_PROCESSOR","AUDITOR","HOP","HOD","OWNER"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ouX8dwsbLCLv"}',
  areq_notes: 'fd',
  areq_org_user_id: 'ouX8dwsbLCLv',
  areq_policy_amount: null,
  areq_policy_state: null,
  areq_project_id: null,
  areq_purpose: 'tggg',
  areq_source: 'MOBILE',
  areq_state: 'DRAFT',
  custom_properties: {
    123: '34',
    231: true,
    checking: true,
    okay_: true,
    project_name: null,
    test_bool: false,
    test_date: null,
    test_multi: ['ch89', 'ch763'],
    test_number: 43,
    test_select: 'ch09',
  },
  ou_business_unit:
    'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
  ou_department: '0000000',
  ou_department_id: 'deptpmQ0SsMO0S',
  ou_employee_id: '',
  ou_id: 'ouX8dwsbLCLv',
  ou_level: '123',
  ou_level_id: 'lvlPtroPaClQy',
  ou_location: 'Mumbai',
  ou_mobile: '+12025559975',
  ou_org_id: 'orNVthTo2Zyo',
  ou_org_name: 'Staging Loaded',
  ou_sub_department: null,
  ou_title: 'director',
  project_code: null,
  project_name: null,
  us_email: 'ajain@fyle.in',
  us_full_name: 'Abhishek Jain',
});

export const singleErqRes: ExtendedAdvanceRequestPublic = deepFreeze({
  areq_advance_request_number: 'A/2020/10/T/95',
  areq_advance_id: 'advjrgwlk2Q',
  areq_amount: 47.99,
  areq_approved_at: new Date('2020-06-14T13:14:55.201Z'),
  areq_created_at: new Date('2020-06-01T13:14:54.804Z'),
  areq_currency: 'USD',
  areq_id: 'areqiwr3Wwirr',
  areq_notes: 'onsite client meeting',
  areq_org_user_id: 'outGt9ju6qP',
  areq_project_id: '1234',
  areq_purpose: 'onsite client meeting',
  areq_source: 'WEBAPP',
  areq_state: 'DRAFT',
  areq_updated_at: new Date('2020-06-11T13:14:55.201Z'),
  ou_department: 'Tech',
  ou_department_id: 'deptCjFrZcE0rH',
  ou_id: 'outGt9ju6qP',
  ou_org_id: 'orwruogwnngg',
  ou_sub_department: 'Tech',
  us_email: 'john.doe@example.com',
  us_full_name: 'John Doe',
  areq_is_pulled_back: false,
  ou_employee_id: 'outGt9ju6qP',
  areq_custom_field_values: [
    {
      name: 'checking',
      value: 'true',
      type: 'BOOLEAN',
    },
  ],
  areq_is_sent_back: false,
  project_name: 'Fast and Furious',
  project_code: 'C1234',
});

export const singleErqUnflattened = deepFreeze({
  areq: {
    id: 'areqGzKF1Tne23',
    created_at: new Date('2023-02-23T13:16:15.260Z'),
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
    updated_at: new Date('2023-02-23T14:16:52.396Z'),
    source: 'MOBILE',
    advance_request_number: 'AR/2023/02/R/4',
    updated_by: null,
    is_sent_back: null,
    is_pulled_back: null,
  },
  ou: {
    id: 'ouX8dwsbLCLv',
    org_id: 'orNVthTo2Zyo',
    org_name: 'Staging Loaded',
    employee_id: '',
    location: 'Mumbai',
    level: '123',
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department: '0000000',
    title: 'director',
    mobile: '+12025559975',
    sub_department: null,
    department_id: 'deptpmQ0SsMO0S',
  },
  us: {
    full_name: 'Abhishek Jain',
    email: 'ajain@fyle.in',
    name: 'Abhishek Jain',
  },
  project: {
    code: null,
    name: null,
  },
  advance: {
    id: null,
  },
  policy: {
    amount: null,
    flag: null,
    state: 'SUCCESS',
  },
  new: {
    state: 'APPROVAL_PENDING',
  },
});

export const teamAdvanceCountRes: ApiV2Response<ExtendedAdvanceRequest> = deepFreeze({
  count: 43,
  data: [
    {
      _search_document: "'8.01':1 'abc':5 'another':2 'ar/2023/02/r/13':4 'dimple':6 'dimple.kh@fyle.in':7 'purpose':3",
      advance_request_approvals: {
        ouPipAaqakKi: {
          state: 'APPROVAL_DISABLED',
        },
        ouX8dwsbLCLv: {
          state: 'APPROVAL_DONE',
        },
        ouy8gYhZRK4E: {
          state: 'APPROVAL_PENDING',
        },
      },
      areq_advance_id: null,
      areq_advance_request_number: 'AR/2023/02/R/13',
      areq_amount: 8.01,
      areq_approval_state: ['APPROVAL_PENDING', 'APPROVAL_DONE', 'APPROVAL_DISABLED'],
      areq_approved_at: null,
      areq_approvers_ids: ['ouy8gYhZRK4E', 'ouX8dwsbLCLv'],
      areq_created_at: new Date('2023-02-24T07:33:43.876Z'),
      areq_currency: 'USD',
      areq_custom_field_values: [
        { id: 151, name: '123', value: null, type: 'TEXT' },
        { id: 134, name: 'Project Name', value: null, type: 'TEXT' },
        { id: 112, name: 'Test Select', value: '', type: 'SELECT' },
        { id: 111, name: 'Test Number', value: 123, type: 'NUMBER' },
        { id: 114, name: 'test multi', value: '', type: 'MULTI_SELECT' },
        { id: 115, name: 'test date', value: null, type: 'DATE' },
        { id: 150, name: 'checking', value: false, type: 'BOOLEAN' },
        { id: 152, name: 'Okay?', value: false, type: 'BOOLEAN' },
        { id: 113, name: 'test bool', value: false, type: 'BOOLEAN' },
        { id: 136, name: '231', value: false, type: 'BOOLEAN' },
      ],
      areq_id: 'areqL8NTcQ1G8J',
      areq_is_pulled_back: false,
      areq_is_sent_back: null,
      areq_last_updated_by:
        '{"user_id":"usMjLibmye7s","org_user_id":"ourw7Hi4mmpO","org_id":"orNVthTo2Zyo","roles":["FYLER","FINANCE","ADMIN","APPROVER","VERIFIER","PAYMENT_PROCESSOR","HOP"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ourw7Hi4mmpO"}',
      areq_notes: null,
      areq_org_user_id: 'ourw7Hi4mmpO',
      areq_policy_amount: null,
      areq_policy_state: 'SUCCESS',
      areq_project_id: null,
      areq_purpose: 'Another purpose',
      areq_source: 'WEBAPP',
      areq_state: 'APPROVAL_PENDING',
      areq_updated_at: new Date('2023-02-24T08:23:16.383Z'),
      custom_properties: {
        123: null,
        231: false,
        checking: false,
        okay_: false,
        project_name: null,
        test_bool: false,
        test_date: null,
        test_multi: '',
        test_number: 123,
        test_select: '',
      },
      ou_business_unit: null,
      ou_department: 'blah',
      ou_department_id: 'deptYSONXoGd64',
      ou_employee_id: 'abc',
      ou_id: 'ourw7Hi4mmpO',
      ou_level: '3-A--1',
      ou_level_id: 'lvl7Lme2OI5FH',
      ou_location: null,
      ou_mobile: '+918546994597',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_sub_department: null,
      ou_title: null,
      project_code: null,
      project_name: null,
      us_email: 'dimple.kh@fyle.in',
      us_full_name: 'Dimple',
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/advance_requests',
});

export const allAdvanceRequestsRes: ApiV2Response<ExtendedAdvanceRequest> = deepFreeze({
  count: 107,
  data: [
    {
      _search_document:
        "'34':1 'a':6,12,18,24 'abhishek':30 'ajain@fyle.in':32 'ar/2023/02/r/15':3 'business':9,15,21,27 'director':4 'food':2 'indeed':11,17,23,29 'jain':31 'long':8,14,20,26 'mumbai':5 'unit':10,16,22,28 'very':7,13,19,25",
      advance_request_approvals: null,
      areq_advance_id: null,
      areq_advance_request_number: 'AR/2023/02/R/15',
      areq_amount: 34,
      areq_approval_state: null,
      areq_approved_at: null,
      areq_approvers_ids: null,
      areq_created_at: new Date('2023-02-28T14:37:01.207795'),
      areq_currency: 'USD',
      areq_custom_field_values: [
        { id: 111, name: 'Test Number', value: 123, type: null },
        { id: 112, name: 'Test Select', value: null, type: null },
        { id: 113, name: 'test bool', value: false, type: null },
        { id: 114, name: 'test multi', value: null, type: null },
        { id: 115, name: 'test date', value: null, type: null },
        { id: 134, name: 'Project Name', value: null, type: null },
        { id: 136, name: '231', value: false, type: null },
        { id: 150, name: 'checking', value: false, type: null },
        { id: 151, name: '123', value: null, type: null },
        { id: 152, name: 'Okay?', value: false, type: null },
      ],
      areq_id: 'areq4YujEm52Ub',
      areq_is_pulled_back: false,
      areq_is_sent_back: false,
      areq_last_updated_by:
        '{"user_id":"usvKA4X8Ugcr","org_user_id":"ouX8dwsbLCLv","org_id":"orNVthTo2Zyo","roles":["ADMIN","APPROVER","FYLER","HOP","HOD","OWNER"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ouX8dwsbLCLv"}',
      areq_notes: null,
      areq_org_user_id: 'ouX8dwsbLCLv',
      areq_policy_amount: null,
      areq_policy_state: 'SUCCESS',
      areq_project_id: null,
      areq_purpose: 'Food',
      areq_source: 'MOBILE',
      areq_state: 'APPROVAL_PENDING',
      areq_updated_at: new Date('2023-02-24T14:40:26.48429'),
      custom_properties: {
        123: null,
        231: false,
        checking: false,
        okay_: false,
        project_name: null,
        test_bool: false,
        test_date: null,
        test_multi: null,
        test_number: 123,
        test_select: null,
      },
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: '123',
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '+12025559975',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_sub_department: null,
      ou_title: 'director',
      project_code: null,
      project_name: null,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
    {
      _search_document:
        "'50':1 'a':6,12,18,24 'abhishek':30 'ajain@fyle.in':32 'ar/2023/02/r/9':3 'business':9,15,21,27 'director':4 'indeed':11,17,23,29 'jain':31 'long':8,14,20,26 'mumbai':5 'some':2 'unit':10,16,22,28 'very':7,13,19,25",
      advance_request_approvals: null,
      areq_advance_id: null,
      areq_advance_request_number: 'AR/2023/02/R/9',
      areq_amount: 50,
      areq_approval_state: null,
      areq_approved_at: new Date('2023-02-10T12:28:18.700028'),
      areq_approvers_ids: null,
      areq_created_at: new Date('2023-02-25T12:28:18.700028'),
      areq_currency: 'USD',
      areq_custom_field_values: [
        { id: 111, name: 'Test Number', value: 1123, type: null },
        { id: 112, name: 'Test Select', value: null, type: null },
        { id: 113, name: 'test bool', value: false, type: null },
        { id: 114, name: 'test multi', value: null, type: null },
        { id: 115, name: 'test date', value: null, type: null },
        { id: 134, name: 'Project Name', value: null, type: null },
        { id: 136, name: '231', value: false, type: null },
        { id: 150, name: 'checking', value: false, type: null },
        { id: 151, name: '123', value: null, type: null },
        { id: 152, name: 'Okay?', value: false, type: null },
      ],
      areq_id: 'areqo6m2UmDSfq',
      areq_is_pulled_back: false,
      areq_is_sent_back: null,
      areq_last_updated_by:
        '{"user_id":"usvKA4X8Ugcr","org_user_id":"ouX8dwsbLCLv","org_id":"orNVthTo2Zyo","roles":["ADMIN","APPROVER","FYLER","HOP","HOD","OWNER"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ouX8dwsbLCLv"}',
      areq_notes: null,
      areq_org_user_id: 'ouX8dwsbLCLv',
      areq_policy_amount: null,
      areq_policy_state: null,
      areq_project_id: '1343',
      areq_purpose: 'some',
      areq_source: 'MOBILE',
      areq_state: 'DRAFT',
      areq_updated_at: new Date('2023-02-24T12:28:18.700028'),
      custom_properties: {
        123: null,
        231: false,
        checking: false,
        okay_: false,
        project_name: null,
        test_bool: false,
        test_date: null,
        test_multi: null,
        test_number: 1123,
        test_select: null,
      },
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: '123',
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '+12025559975',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_sub_department: null,
      ou_title: 'director',
      project_code: null,
      project_name: 'project bengaluru',
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
  ],
  limit: 10,
  offset: 0,
  url: '/v2/advance_requests',
});

export const publicAdvanceRequestRes: ApiV2Response<ExtendedAdvanceRequestPublic> = deepFreeze({
  count: 1,
  data: [
    {
      areq_advance_request_number: 'A/2020/10/T/95',
      areq_advance_id: 'advjrgwlk2Q',
      areq_amount: 47.99,
      areq_approved_at: new Date('2020-06-14T13:14:55.201Z'),
      areq_created_at: new Date('2020-06-01T13:14:54.804Z'),
      areq_currency: 'USD',
      areq_id: 'areqiwr3Wwirr',
      areq_notes: 'onsite client meeting',
      areq_org_user_id: 'outGt9ju6qP',
      areq_project_id: '1234',
      areq_purpose: 'onsite client meeting',
      areq_source: 'WEBAPP',
      areq_state: 'DRAFT',
      areq_updated_at: new Date('2020-06-11T13:14:55.201Z'),
      ou_department: 'Tech',
      ou_department_id: 'deptCjFrZcE0rH',
      ou_id: 'outGt9ju6qP',
      ou_org_id: 'orwruogwnngg',
      ou_sub_department: 'Tech',
      us_email: 'john.doe@example.com',
      us_full_name: 'John Doe',
      areq_is_pulled_back: false,
      ou_employee_id: 'outGt9ju6qP',
      areq_custom_field_values: [{ name: 'checking', value: 'true', type: 'BOOLEAN' }],
      areq_is_sent_back: false,
      project_name: 'Fast and Furious',
      project_code: 'C1234',
    },
  ],
  offset: 0,
});

export const publicAdvanceRequestResSentBack: ApiV2Response<ExtendedAdvanceRequestPublic> = deepFreeze({
  count: 1,
  data: [
    {
      ...cloneDeep(publicAdvanceRequestRes.data[0]),
      areq_state: 'INQUIRY',
      areq_is_pulled_back: false,
      areq_is_sent_back: true,
      areq_id: 'areqiwr3Wwirk',
    },
  ],
  offset: 0,
});

export const publicAdvanceRequestResPulledBack: ApiV2Response<ExtendedAdvanceRequestPublic> = deepFreeze({
  count: 1,
  data: [
    {
      ...cloneDeep(publicAdvanceRequestRes.data[0]),
      areq_state: 'DRAFT',
      areq_is_pulled_back: true,
      areq_is_sent_back: false,
      areq_id: 'areqiwr3Wwirl',
    },
  ],
  offset: 0,
});

export const publicAdvanceRequestRes2: ApiV2Response<ExtendedAdvanceRequestPublic> = deepFreeze({
  ...publicAdvanceRequestRes,
  count: 250,
});

export const publicAdvanceRequestRes3: ExtendedAdvanceRequestPublic = deepFreeze({
  ...publicAdvanceRequestRes.data[0],
  type: 'request',
  currency: 'USD',
  amount: 47.99,
  created_at: new Date('2020-06-01T13:14:54.804Z'),
  purpose: 'onsite client meeting',
  state: 'DRAFT',
  areq_is_pulled_back: true,
});

export const publicAdvanceRequestRes4: ExtendedAdvanceRequestPublic = deepFreeze({
  ...publicAdvanceRequestRes.data[0],
  type: 'request',
  currency: 'USD',
  amount: 47.99,
  created_at: new Date('2020-06-01T13:14:54.804Z'),
  purpose: 'onsite client meeting',
  state: 'DRAFT',
  areq_is_sent_back: true,
});

export const publicAdvanceRequestRes5: ApiV2Response<ExtendedAdvanceRequestPublic> = deepFreeze({
  count: 1,
  data: [
    {
      areq_advance_request_number: 'A/2020/10/T/95',
      areq_advance_id: 'advjrgwlk2Q',
      areq_amount: 47.99,
      areq_approved_at: new Date('2020-06-14T13:14:55.201Z'),
      areq_created_at: new Date('2020-06-01T13:14:54.804Z'),
      areq_currency: 'USD',
      areq_id: 'areqiwr3Wwirr',
      areq_notes: 'onsite client meeting',
      areq_org_user_id: 'outGt9ju6qP',
      areq_project_id: '1234',
      areq_purpose: 'onsite client meeting',
      areq_source: 'WEBAPP',
      areq_state: 'DRAFT',
      areq_updated_at: new Date('2020-06-11T13:14:55.201Z'),
      ou_department: 'Tech',
      ou_department_id: 'deptCjFrZcE0rH',
      ou_id: 'outGt9ju6qP',
      ou_org_id: 'orwruogwnngg',
      ou_sub_department: 'Tech',
      us_email: 'john.doe@example.com',
      us_full_name: 'John Doe',
      areq_is_pulled_back: true,
      ou_employee_id: 'outGt9ju6qP',
      areq_custom_field_values: [{ name: 'checking', value: 'true', type: 'BOOLEAN' }],
      areq_is_sent_back: false,
      project_name: 'Fast and Furious',
      project_code: 'C1234',
    },
  ],
  offset: 0,
});

export const publicAdvanceRequestRes6: ExtendedAdvanceRequestPublic = deepFreeze({
  ...publicAdvanceRequestRes.data[0],
  type: 'request',
  currency: 'USD',
  amount: 47.99,
  created_at: new Date('2020-06-01T13:14:54.804Z'),
  purpose: 'onsite client meeting',
  state: 'DRAFT',
  areq_is_sent_back: false,
  areq_is_pulled_back: true,
});

export const allTeamAdvanceRequestsRes: ApiV2Response<ExtendedAdvanceRequest> = deepFreeze({
  count: 43,
  data: [
    {
      _search_document: "'8.01':1 'abc':5 'another':2 'ar/2023/02/r/13':4 'dimple':6 'dimple.kh@fyle.in':7 'purpose':3",
      advance_request_approvals: {
        ouPipAaqakKi: {
          state: 'APPROVAL_DISABLED',
        },
        ouX8dwsbLCLv: {
          state: 'APPROVAL_DONE',
        },
        ouy8gYhZRK4E: {
          state: 'APPROVAL_PENDING',
        },
      },
      areq_advance_id: null,
      areq_advance_request_number: 'AR/2023/02/R/13',
      areq_amount: 8.01,
      areq_approval_state: ['APPROVAL_PENDING', 'APPROVAL_DONE', 'APPROVAL_DISABLED'],
      areq_approved_at: null,
      areq_approvers_ids: ['ouy8gYhZRK4E', 'ouX8dwsbLCLv'],
      areq_created_at: new Date('2023-02-24T13:03:43.876378'),
      areq_currency: 'USD',
      areq_custom_field_values: [
        { id: 151, name: '123', value: null, type: 'TEXT' },
        { id: 134, name: 'Project Name', value: null, type: 'TEXT' },
        { id: 112, name: 'Test Select', value: '', type: 'SELECT' },
        { id: 111, name: 'Test Number', value: 123, type: 'NUMBER' },
        { id: 114, name: 'test multi', value: '', type: 'MULTI_SELECT' },
        { id: 115, name: 'test date', value: null, type: 'DATE' },
        { id: 150, name: 'checking', value: false, type: 'BOOLEAN' },
        { id: 152, name: 'Okay?', value: false, type: 'BOOLEAN' },
        { id: 113, name: 'test bool', value: false, type: 'BOOLEAN' },
        { id: 136, name: '231', value: false, type: 'BOOLEAN' },
      ],
      areq_id: 'areqL8NTcQ1G8J',
      areq_is_pulled_back: false,
      areq_is_sent_back: null,
      areq_last_updated_by:
        '{"user_id":"usMjLibmye7s","org_user_id":"ourw7Hi4mmpO","org_id":"orNVthTo2Zyo","roles":["FYLER","FINANCE","ADMIN","APPROVER","VERIFIER","PAYMENT_PROCESSOR","HOP"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ourw7Hi4mmpO"}',
      areq_notes: null,
      areq_org_user_id: 'ourw7Hi4mmpO',
      areq_policy_amount: null,
      areq_policy_state: 'SUCCESS',
      areq_project_id: null,
      areq_purpose: 'Another purpose',
      areq_source: 'WEBAPP',
      areq_state: 'APPROVAL_PENDING',
      areq_updated_at: new Date('2023-02-24T13:53:16.383228'),
      custom_properties: {
        123: null,
        231: false,
        checking: false,
        okay_: false,
        project_name: null,
        test_bool: false,
        test_date: null,
        test_multi: '',
        test_number: 123,
        test_select: '',
      },
      ou_business_unit: null,
      ou_department: 'blah',
      ou_department_id: 'deptYSONXoGd64',
      ou_employee_id: 'abc',
      ou_id: 'ourw7Hi4mmpO',
      ou_level: '3-A--1',
      ou_level_id: 'lvl7Lme2OI5FH',
      ou_location: null,
      ou_mobile: '+918546994597',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_sub_department: null,
      ou_title: null,
      project_code: null,
      project_name: null,
      us_email: 'dimple.kh@fyle.in',
      us_full_name: 'Dimple',
    },
    {
      _search_document: "'10':1 'a':2 'abc':4 'ar/2023/02/r/12':3 'dimple':5 'dimple.kh@fyle.in':6",
      advance_request_approvals: {
        ouX8dwsbLCLv: {
          state: 'APPROVAL_REJECTED',
        },
        ouy8gYhZRK4E: {
          state: 'APPROVAL_PENDING',
        },
      },
      areq_advance_id: null,
      areq_advance_request_number: 'AR/2023/02/R/12',
      areq_amount: 10,
      areq_approval_state: ['APPROVAL_PENDING', 'APPROVAL_REJECTED'],
      areq_approved_at: null,
      areq_approvers_ids: ['ouy8gYhZRK4E', 'ouX8dwsbLCLv'],
      areq_created_at: new Date('2023-02-24T12:48:00.608458'),
      areq_currency: 'USD',
      areq_custom_field_values: [
        { id: 151, name: '123', value: null, type: 'TEXT' },
        { id: 134, name: 'Project Name', value: null, type: 'TEXT' },
        { id: 112, name: 'Test Select', value: '', type: 'SELECT' },
        { id: 111, name: 'Test Number', value: 121, type: 'NUMBER' },
        { id: 114, name: 'test multi', value: '', type: 'MULTI_SELECT' },
        { id: 115, name: 'test date', value: null, type: 'DATE' },
        { id: 150, name: 'checking', value: false, type: 'BOOLEAN' },
        { id: 152, name: 'Okay?', value: false, type: 'BOOLEAN' },
        { id: 113, name: 'test bool', value: false, type: 'BOOLEAN' },
        { id: 136, name: '231', value: false, type: 'BOOLEAN' },
      ],
      areq_id: 'areqVU0Xr5suPC',
      areq_is_pulled_back: false,
      areq_is_sent_back: null,
      areq_last_updated_by:
        '{"user_id":"usMjLibmye7s","org_user_id":"ourw7Hi4mmpO","org_id":"orNVthTo2Zyo","roles":["FYLER","FINANCE","ADMIN","APPROVER","VERIFIER","PAYMENT_PROCESSOR","HOP"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ourw7Hi4mmpO"}',
      areq_notes: null,
      areq_org_user_id: 'ourw7Hi4mmpO',
      areq_policy_amount: null,
      areq_policy_state: 'SUCCESS',
      areq_project_id: null,
      areq_purpose: 'A',
      areq_source: 'WEBAPP',
      areq_state: 'REJECTED',
      areq_updated_at: new Date('2023-02-24T12:48:48.860163'),
      custom_properties: {
        123: null,
        231: false,
        checking: false,
        okay_: false,
        project_name: null,
        test_bool: false,
        test_date: null,
        test_multi: '',
        test_number: 121,
        test_select: '',
      },
      ou_business_unit: null,
      ou_department: 'blah',
      ou_department_id: 'deptYSONXoGd64',
      ou_employee_id: 'abc',
      ou_id: 'ourw7Hi4mmpO',
      ou_level: '3-A--1',
      ou_level_id: 'lvl7Lme2OI5FH',
      ou_location: null,
      ou_mobile: '+918546994597',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_sub_department: null,
      ou_title: null,
      project_code: null,
      project_name: null,
      us_email: 'dimple.kh@fyle.in',
      us_full_name: 'Dimple',
    },
  ],
  limit: 10,
  offset: 0,
  url: '/v2/advance_requests',
});

export const myAdvanceRequestsData2: ApiV2Response<ExtendedAdvanceRequest> = deepFreeze({
  ...allTeamAdvanceRequestsRes,
  count: 11,
});

export const myAdvanceRequestsData3: ExtendedAdvanceRequest = deepFreeze({
  ...singleExtendedAdvReqRes.data[0],
  areq_state: 'DRAFT',
  areq_is_sent_back: true,
});

export const myAdvanceRequestsData4: ExtendedAdvanceRequest = deepFreeze({
  ...singleExtendedAdvReqRes.data[0],
  areq_state: 'DRAFT',
  areq_is_sent_back: false,
  areq_is_pulled_back: false,
});

export const myAdvanceRequestData5: ExtendedAdvanceRequest = deepFreeze({
  ...singleExtendedAdvReqRes.data[0],
  type: 'request',
  currency: 'USD',
  amount: 123,
  created_at: new Date('2022-05-27T08:33:32.879009'),
  purpose: '213',
  state: 'APPROVAL_PENDING',
});
