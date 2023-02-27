import { ApiV2Response } from '../models/api-v2.model';
import { ExtendedAdvanceRequest } from '../models/extended_advance_request.model';

export const singleExtendedAdvReqRes: ApiV2Response<ExtendedAdvanceRequest> = {
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
      areq_custom_field_values:
        '[{"id":110,"name":"Test text","value":null,"type":null},{"id":111,"name":"Test Number","value":123,"type":null},{"id":112,"name":"Test Select","value":null,"type":null},{"id":113,"name":"test bool","value":false,"type":null},{"id":114,"name":"test multi","value":null,"type":null},{"id":115,"name":"test date","value":null,"type":null},{"id":134,"name":"Project Name","value":null,"type":null},{"id":136,"name":"231","value":false,"type":null}]',
      areq_id: 'areqdQ9jnokUva',
      areq_is_pulled_back: false,
      areq_is_sent_back: null,
      areq_last_updated_by:
        '{"user_id":"usvKA4X8Ugcr","org_user_id":"ouX8dwsbLCLv","org_id":"orNVthTo2Zyo","roles":["TRAVEL_ADMIN","FINANCE","ADMIN","APPROVER","FYLER","VERIFIER","PAYMENT_PROCESSOR","TRAVEL_AGENT","AUDITOR","HOP","HOD"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ouX8dwsbLCLv"}',
      areq_notes: null,
      areq_org_user_id: 'ouX8dwsbLCLv',
      areq_policy_amount: null,
      areq_policy_flag: false,
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
};

export const extendedAdvReqDraft: ExtendedAdvanceRequest = {
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
  areq_custom_field_values:
    '[{"id":111,"name":"Test Number","value":43,"type":null},{"id":112,"name":"Test Select","value":"ch09","type":null},{"id":113,"name":"test bool","value":false,"type":null},{"id":114,"name":"test multi","value":["ch89","ch763"],"type":null},{"id":115,"name":"test date","value":null,"type":null},{"id":134,"name":"Project Name","value":null,"type":null},{"id":136,"name":"231","value":true,"type":null},{"id":150,"name":"checking","value":true,"type":null},{"id":151,"name":"123","value":"34","type":null},{"id":152,"name":"Okay?","value":true,"type":null}]',
  areq_id: 'areqoVuT5I8OOy',
  areq_is_pulled_back: false,
  areq_is_sent_back: null,
  areq_last_updated_by:
    '{"user_id":"usvKA4X8Ugcr","org_user_id":"ouX8dwsbLCLv","org_id":"orNVthTo2Zyo","roles":["FINANCE","ADMIN","APPROVER","FYLER","VERIFIER","PAYMENT_PROCESSOR","AUDITOR","HOP","HOD","OWNER"],"scopes":[],"allowed_CIDRs":[],"cluster_domain":"\\"https://staging.fyle.tech\\"","proxy_org_user_id":null,"tpa_id":null,"tpa_name":null,"name":"ouX8dwsbLCLv"}',
  areq_notes: 'fd',
  areq_org_user_id: 'ouX8dwsbLCLv',
  areq_policy_amount: null,
  areq_policy_flag: false,
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
};

export const extendedAdvReqInquiry: ExtendedAdvanceRequest = {
  ...extendedAdvReqDraft,
  areq_state: 'INQUIRY',
};

export const extendedAdvReqSubmitted: ExtendedAdvanceRequest = {
  ...extendedAdvReqDraft,
  areq_state: 'SUBMITTED',
};

export const extendedAdvReqPaid: ExtendedAdvanceRequest = {
  ...extendedAdvReqDraft,
  areq_state: 'PAID',
};

export const extendedAdvReqApproved: ExtendedAdvanceRequest = {
  ...extendedAdvReqDraft,
  areq_state: 'APPROVED',
};

export const extendedAdvReqRejected: ExtendedAdvanceRequest = {
  ...extendedAdvReqDraft,
  areq_state: 'REJECTED',
};

export const extendedAdvReqPulledBack: ExtendedAdvanceRequest = {
  ...extendedAdvReqDraft,
  areq_is_pulled_back: true,
};

export const extendedAdvReqSentBack: ExtendedAdvanceRequest = {
  ...extendedAdvReqDraft,
  areq_is_sent_back: true,
};

export const extendedAdvReqWithoutDates = {
  ...extendedAdvReqDraft,
  areq_created_at: '2023-01-16T06:22:47.058Z',
  areq_updated_at: '2023-01-16T06:22:47.058Z',
  areq_approved_at: '2023-01-16T06:22:47.058Z',
};

export const extendedAdvReqWithDates = {
  ...extendedAdvReqDraft,
  areq_created_at: new Date('2023-01-16T06:22:47.058Z'),
  areq_updated_at: new Date('2023-01-16T06:22:47.058Z'),
  areq_approved_at: new Date('2023-01-16T06:22:47.058Z'),
};
