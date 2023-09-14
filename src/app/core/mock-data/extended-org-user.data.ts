import { EouApiResponse } from '../models/eou-api-response.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

export const apiEouRes: ExtendedOrgUser = {
  ou: {
    id: 'ouX8dwsbLCLv',
    created_at: new Date('2018-02-01T02:32:25.267Z'),
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: 123,
    level_id: 'lvlPtroPaClQy',
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    sub_department: null,
    roles: ['FINANCE', 'ADMIN', 'APPROVER', 'FYLER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'AUDITOR', 'HOP', 'HOD', 'OWNER'],
    approver1_id: null,
    approver2_id: 'oubQzXeZbwbS',
    approver3_id: null,
    delegatee_id: null,
    delegation_start_at: null,
    delegation_end_at: null,
    title: 'director',
    status: 'ACTIVE',
    branch_ifsc: 'ICIC0002322',
    branch_account: null,
    mobile: '123456',
    mobile_verified: false,
    mobile_verified_at: null,
    mobile_verification_attempts_left: 3,
    is_primary: true,
    owner: false,
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
    special_email: 'receipts+ajain_6@fyle.ai',
    custom_field_values: [
      {
        id: 415,
        name: 'nj',
        value: 2222,
      },
      {
        id: 790,
        name: 'nj1233',
        value: 'hvgv',
      },
      {
        id: 792,
        name: 'nj12331',
        value: 'asdf',
      },
      {
        id: 793,
        name: 'nj123312',
        value: 'asd',
      },
      {
        id: 685,
        name: 'Hybrid human',
        value: null,
      },
    ],
    org_name: 'Staging Loaded',
    settings_id: 'ousS9MgDNQ6NB',
    default_cost_center_id: null,
    default_cost_center_name: null,
    default_cost_center_code: null,
    cost_center_ids: [13792, 13793, 13794, 14018, 13795],
  },
  org: {
    domain: 'fyle.in',
    currency: 'USD',
  },
  us: {
    id: 'usvKA4X8Ugcr',
    created_at: new Date('2016-06-13T12:21:16.803Z'),
    full_name: 'Abhishek Jain',
    email: 'ajain@fyle.in',
    email_verified_at: new Date('2022-09-06T05:26:19.898Z'),
    onboarded: true,
  },
  ap1: {
    full_name: null,
    email: null,
  },
  ap2: {
    full_name: 'AA23',
    email: 'ajain+12+12+1@fyle.in',
  },
  ap3: {
    full_name: null,
    email: null,
  },
  bb: {
    bank_name: 'ICICI BANK LIMITED',
  },
  dwolla: {
    customer_id: 'dwcJzfwZCgwkdfG',
    bank_account_added: true,
  },
};

export const eouRes2: ExtendedOrgUser = {
  ou: {
    id: 'ouX8dwsbLCLv',
    created_at: new Date('2018-02-01T02:32:25.267Z'),
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: 123,
    level_id: 'lvlPtroPaClQy',
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    sub_department: null,
    roles: ['FINANCE', 'ADMIN', 'APPROVER', 'FYLER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'AUDITOR', 'HOP', 'HOD', 'OWNER'],
    approver1_id: null,
    approver2_id: 'oubQzXeZbwbS',
    approver3_id: null,
    delegatee_id: null,
    delegation_start_at: null,
    delegation_end_at: null,
    title: 'director',
    status: 'ACTIVE',
    branch_ifsc: 'ICIC0002322',
    branch_account: null,
    mobile: '123456',
    mobile_verified: false,
    mobile_verified_at: null,
    is_primary: true,
    owner: false,
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
    special_email: 'receipts+ajain_6@fyle.ai',
    custom_field_values: [
      {
        id: 415,
        name: 'nj',
        value: 2222,
      },
    ],
    org_name: 'Staging Loaded',
    settings_id: 'ousS9MgDNQ6NB',
    default_cost_center_id: null,
    default_cost_center_name: null,
    default_cost_center_code: null,
    cost_center_ids: [13792, 13793, 13794, 14018, 13795, 13995, 9493, 9494, 13785, 13787, 13788, 13789, 13790, 13791],
  },
  org: {
    domain: 'fyle.in',
    currency: 'USD',
  },
  us: {
    id: 'usvKA4X8Ugcr',
    created_at: new Date('2016-06-13T12:21:16.803Z'),
    full_name: 'Abhishek Jain',
    email: 'ajain@fyle.in',
    email_verified_at: new Date('2022-09-06T05:26:19.898Z'),
    onboarded: true,
  },
  ap1: {
    full_name: null,
    email: null,
  },
  ap2: {
    full_name: 'AA23',
    email: 'ajain+12+12+1@fyle.in',
  },
  ap3: {
    full_name: null,
    email: null,
  },
  bb: {
    bank_name: 'ICICI BANK LIMITED',
  },
  dwolla: {
    customer_id: 'dwcJzfwZCgwkdfG',
    bank_account_added: true,
  },
};

export const eouRes3: ExtendedOrgUser = {
  ou: {
    id: 'ouX8dwsbLCLv',
    created_at: new Date('2018-02-01T02:32:25.267Z'),
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: 123,
    level_id: 'lvlPtroPaClQy',
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    sub_department: null,
    roles: ['ADMIN', 'APPROVER', 'FYLER', 'HOP', 'HOD', 'OWNER'],
    approver1_id: 'ouy8gYhZRK4E',
    approver2_id: null,
    approver3_id: null,
    delegatee_id: 'ouAIf3H1yhZj',
    delegation_start_at: new Date('2023-02-02T03:07:28.879Z'),
    delegation_end_at: null,
    title: 'director',
    status: 'ACTIVE',
    branch_ifsc: 'ICIC0002322',
    branch_account: '12123412221',
    mobile: '+12025559975',
    mobile_verified: false,
    mobile_verified_at: null,
    is_primary: true,
    owner: false,
    joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
    special_email: 'receipts+ajain_6@fyle.ai',
    custom_field_values: [
      {
        id: 685,
        name: 'Hybrid human',
        value: null,
      },
      {
        id: 430,
        name: 'UNum1',
        value: 1,
      },
      {
        id: 138,
        name: 'Driver salary limit',
        value: 1122,
      },
      {
        id: 139,
        name: 'Fuel limit',
        value: 1,
      },
      {
        id: 459,
        name: 'multi',
        value: '',
      },
      {
        id: 456,
        name: 'Place',
        value: null,
      },
      {
        id: 458,
        name: 'Location',
        value: null,
      },
      {
        id: 609,
        name: 'TCF',
        value: null,
      },
    ],
    org_name: 'Staging Loaded',
    settings_id: 'ousS9MgDNQ6NB',
    default_cost_center_id: null,
    default_cost_center_name: null,
    default_cost_center_code: null,
    cost_center_ids: [13792, 13793, 13794, 14018, 13795, 13995, 9493, 9494, 13785, 13787, 13788, 13789, 13790, 13791],
  },
  org: {
    domain: 'fyle.in',
    currency: 'INR',
  },
  us: {
    id: 'usvKA4X8Ugcr',
    created_at: new Date('2016-06-13T12:21:16.803Z'),
    full_name: 'Abhishek Jain',
    email: 'ajain@fyle.in',
    email_verified_at: new Date('2022-09-06T05:26:19.898Z'),
    onboarded: true,
  },
  ap1: {
    full_name: 'Aditya Gupta',
    email: 'aditya.g@fyle.in',
  },
  ap2: {
    full_name: null,
    email: null,
  },
  ap3: {
    full_name: null,
    email: null,
  },
  bb: {
    bank_name: 'ICICI BANK LIMITED',
  },
  dwolla: {
    customer_id: 'dwcJzfwZCgwkdfG',
    bank_account_added: true,
  },
};

export const eouFlattended: EouApiResponse = {
  ou_id: 'ouX8dwsbLCLv',
  ou_created_at: new Date('2018-02-01T02:32:25.267Z'),
  ou_org_id: 'orNVthTo2Zyo',
  ou_user_id: 'usvKA4X8Ugcr',
  ou_employee_id: '',
  ou_location: 'Mumbai',
  ou_level: 123,
  ou_level_id: 'lvlPtroPaClQy',
  ou_band:
    'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
  ou_rank: 1121212121,
  ou_business_unit:
    'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
  ou_department_id: 'deptpmQ0SsMO0S',
  ou_department: '0000000',
  ou_sub_department: null,
  ou_roles: ['ADMIN', 'APPROVER', 'FYLER', 'HOP', 'HOD', 'OWNER'],
  ou_approver1_id: 'ouy8gYhZRK4E',
  ou_approver2_id: null,
  ou_approver3_id: null,
  ou_delegatee_id: 'ouAIf3H1yhZj',
  ou_delegation_start_at: new Date('2023-02-02T03:07:28.879Z'),
  ou_delegation_end_at: null,
  ou_title: 'director',
  ou_status: 'ACTIVE',
  ou_branch_ifsc: 'ICIC0002322',
  ou_branch_account: '12123412221',
  ou_mobile: '+12025559975',
  ou_mobile_verified: false,
  ou_mobile_verified_at: null,
  ou_is_primary: true,
  ou_owner: false,
  ou_joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
  ou_special_email: 'receipts+ajain_6@fyle.ai',
  ou_custom_field_values: [
    {
      id: 685,
      name: 'Hybrid human',
      value: null,
    },
    {
      id: 430,
      name: 'UNum1',
      value: 1,
    },
    {
      id: 138,
      name: 'Driver salary limit',
      value: 1122,
    },
    {
      id: 139,
      name: 'Fuel limit',
      value: 1,
    },
    {
      id: 459,
      name: 'multi',
      value: '',
    },
    {
      id: 456,
      name: 'Place',
      value: null,
    },
    {
      id: 458,
      name: 'Location',
      value: null,
    },
  ],
  ou_org_name: 'Staging Loaded',
  org_domain: 'fyle.in',
  org_currency: 'INR',
  us_id: 'usvKA4X8Ugcr',
  us_created_at: new Date('2016-06-13T12:21:16.803Z'),
  us_full_name: 'Abhishek Jain',
  us_email: 'ajain@fyle.in',
  us_email_verified_at: new Date('2022-09-06T05:26:19.898Z'),
  us_onboarded: true,
  ap1_full_name: 'Aditya Gupta',
  ap1_email: 'aditya.g@fyle.in',
  ap2_full_name: null,
  ap2_email: null,
  ap3_full_name: null,
  ap3_email: null,
  bb_bank_name: 'ICICI BANK LIMITED',
  ou_settings_id: 'ousS9MgDNQ6NB',
  ou_default_cost_center_id: null,
  ou_default_cost_center_name: null,
  ou_default_cost_center_code: null,
  dwolla_customer_id: 'dwcJzfwZCgwkdfG',
  dwolla_bank_account_added: true,
  ou_cost_center_ids: [13792, 13793, 13794, 14018, 13795, 13995, 9493, 9494, 13785, 13787, 13788, 13789, 13790, 13791],
};

export const eouWithNoAttempts: ExtendedOrgUser = {
  ...apiEouRes,
  ou: {
    ...apiEouRes.ou,
    mobile_verification_attempts_left: 0,
  },
};
