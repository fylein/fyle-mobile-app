import deepFreeze from 'deep-freeze-strict';

import { AccessTokenData } from '../models/access-token-data.model';
import { EouApiResponse } from '../models/eou-api-response.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

export const currentEouRes: ExtendedOrgUser = deepFreeze({
  ou: {
    id: 'ouX8dwsbLCLv',
    created_at: new Date('2018-02-01T02:32:25.267Z'),
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: null,
    location: 'Mumbai',
    level: 123,
    level_id: 'lvlPtroPaClQy',
    band: 'Very Long Level name',
    rank: 1121212121,
    business_unit: 'A very long Business Unit',
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
    mobile: null,
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
    cost_center_ids: [13792, 13793, 13794],
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
});

export const currentEouUnflatted: EouApiResponse = deepFreeze({
  ou_id: 'ouX8dwsbLCLv',
  ou_created_at: new Date('2018-02-01T02:32:25.267Z'),
  ou_org_id: 'orNVthTo2Zyo',
  ou_user_id: 'usvKA4X8Ugcr',
  ou_employee_id: null,
  ou_location: 'Mumbai',
  ou_level: 123,
  ou_level_id: 'lvlPtroPaClQy',
  ou_band: 'Very Long Level name',
  ou_business_unit: 'A very long Business Unit',
  ou_department_id: 'deptpmQ0SsMO0S',
  ou_department: '0000000',
  ou_sub_department: null,
  ou_roles: [
    'FINANCE',
    'ADMIN',
    'APPROVER',
    'FYLER',
    'VERIFIER',
    'PAYMENT_PROCESSOR',
    'AUDITOR',
    'HOP',
    'HOD',
    'OWNER',
  ],
  ou_approver1_id: null,
  ou_approver2_id: 'oubQzXeZbwbS',
  ou_approver3_id: null,
  ou_delegatee_id: null,
  ou_delegation_start_at: null,
  ou_delegation_end_at: null,
  ou_title: 'director',
  ou_status: 'ACTIVE',
  ou_branch_ifsc: 'ICIC0002322',
  ou_branch_account: null,
  ou_mobile: null,
  ou_mobile_verified: false,
  ou_mobile_verified_at: null,
  ou_is_primary: true,
  ou_owner: false,
  ou_joining_dt: new Date('2017-07-25T00:00:00.000+0000'),
  ou_special_email: 'receipts+ajain_6@fyle.ai',
  ou_custom_field_values: [
    {
      id: 415,
      name: 'nj',
      value: 2222,
    },
    {
      id: 685,
      name: 'Hybrid human',
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
  ap1_full_name: null,
  ap1_email: null,
  ap2_full_name: 'AA23',
  ap2_email: 'ajain+12+12+1@fyle.in',
  ap3_full_name: null,
  ap3_email: null,
  bb_bank_name: 'ICICI BANK LIMITED',
  ou_settings_id: 'ousS9MgDNQ6NB',
  ou_default_cost_center_id: null,
  ou_default_cost_center_name: null,
  ou_default_cost_center_code: null,
  dwolla_customer_id: 'dwcJzfwZCgwkdfG',
  dwolla_bank_account_added: true,
  ou_cost_center_ids: [13792, 13793, 13794],
});

export const employeesRes = deepFreeze({
  count: 95,
  data: [
    {
      email: 'abhishek.kumar@fyle.in',
      full_name: 'Abhi',
    },
    {
      email: 'ajain+sp@fyle.in',
      full_name: 'Abhishek',
    },
    {
      email: 'ajain+fyle123@fyle.in',
      full_name: 'Abhishet CPM',
    },
    {
      email: 'aditya.agrawal@fyle.in',
      full_name: 'Adi',
    },
    {
      email: 'adithya.kavuluru@fyle.in',
      full_name: 'adithya',
    },
  ],
  offset: 0,
});

export const employeesParamsRes = deepFreeze({
  count: 929,
  data: [
    {
      id: 'oubQzXeZbwbS',
      roles: '["FYLER","APPROVER","HOD","HOP"]',
      is_enabled: true,
      has_accepted_invite: true,
      email: 'ajain+12+12+1@fyle.in',
      full_name: 'AA23',
      user_id: 'usTdvbcxOqjs',
      is_selected: false,
    },
    {
      id: 'ouXYHXfr4w0b',
      roles: '["FYLER","APPROVER","HOP"]',
      is_enabled: true,
      has_accepted_invite: false,
      email: 'aaaaaaa@aaaabbbb.com',
      full_name: 'AAA',
      user_id: 'usBBavu872gu',
      is_selected: false,
    },
    {
      ou_id: 'ouX8dwsbLCLv',
      ou_roles: '["FINANCE","ADMIN","APPROVER","FYLER","VERIFIER","PAYMENT_PROCESSOR","AUDITOR","HOP","HOD","OWNER"]',
      is_enabled: true,
      has_accepted_invite: true,
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
      user_id: 'usvKA4X8Ugcr',
    },
  ],
  offset: 0,
});

export const eouListWithDisabledUser = deepFreeze([
  {
    ou: {
      id: 'ouwszMqKW1JR',
      created_at: new Date('2022-10-28T07:49:52.161Z'),
      org_id: 'orNVthTo2Zyo',
      user_id: 'us6kdyOIYUCM',
      employee_id: null,
      location: null,
      level: null,
      level_id: null,
      band: null,
      rank: null,
      business_unit: null,
      department_id: null,
      department: null,
      sub_department: null,
      roles: ['VERIFIER', 'FYLER', 'APPROVER'],
      approver1_id: null,
      approver2_id: null,
      approver3_id: null,
      delegatee_id: 'ouX8dwsbLCLv',
      delegation_start_at: new Date('2022-10-28T08:49:29.110Z'),
      delegation_end_at: null,
      title: null,
      status: 'ACTIVE',
      branch_ifsc: null,
      branch_account: null,
      mobile: null,
      mobile_verified: false,
      mobile_verified_at: null,
      is_primary: true,
      owner: null,
      joining_dt: null,
      special_email: 'receipts+staging+sumanth_a+1001_fkke@fyle.ai',
      custom_field_values: [
        {
          id: 682,
          name: 'sdadadasda',
          value: null,
        },
        {
          id: 685,
          name: 'Hybrid human',
          value: null,
        },
      ],
      org_name: 'Staging Loaded',
      settings_id: 'ousn9VC3oWNVc',
      default_cost_center_id: null,
      default_cost_center_name: null,
      default_cost_center_code: null,
      cost_center_ids: [13794, 13790],
    },
    org: {
      domain: 'fyle.in',
      currency: 'INR',
    },
    us: {
      id: 'us6kdyOIYUCM',
      created_at: new Date('2022-10-28T07:49:51.961Z'),
      full_name: 'sumanth',
      email: 'sumanth.a+1001@fyle.in',
      email_verified_at: new Date('2022-11-17T06:21:49.560Z'),
      onboarded: false,
    },
    ap1: {
      full_name: null,
      email: null,
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
      bank_name: null,
    },
    dwolla: {
      customer_id: null,
      bank_account_added: null,
    },
  },
  {
    ou: {
      id: 'ouu3FCyJkapO',
      created_at: new Date('2018-03-12T06:17:28.827Z'),
      org_id: 'orNVthTo2Zyo',
      user_id: 'usQo18yCqdts',
      employee_id: null,
      location: null,
      level: null,
      level_id: null,
      band: null,
      rank: null,
      business_unit: null,
      department_id: null,
      department: null,
      sub_department: null,
      roles: ['APPROVER', 'FYLER'],
      approver1_id: null,
      approver2_id: null,
      approver3_id: null,
      delegatee_id: 'ouX8dwsbLCLv',
      delegation_start_at: new Date('2019-12-17T15:51:28.753Z'),
      delegation_end_at: null,
      title: null,
      status: 'DISABLED',
      branch_ifsc: null,
      branch_account: null,
      mobile: null,
      mobile_verified: false,
      mobile_verified_at: null,
      is_primary: true,
      owner: null,
      joining_dt: null,
      special_email: 'receipts+nithin_vempati_2@fyle.ai',
      custom_field_values: [],
      org_name: 'Staging Loaded',
      settings_id: 'ousksWx362FIX',
      default_cost_center_id: null,
      default_cost_center_name: null,
      default_cost_center_code: null,
      cost_center_ids: [13696, 13701, 6281],
    },
    org: {
      domain: 'fyle.in',
      currency: 'INR',
    },
    us: {
      id: 'usQo18yCqdts',
      created_at: new Date('2018-01-22T13:15:54.696Z'),
      full_name: 'nithin',
      email: 'nithin.vempati@fyle.in',
      email_verified_at: new Date('2019-08-01T13:46:15.963Z'),
      onboarded: false,
    },
    ap1: {
      full_name: null,
      email: null,
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
      bank_name: null,
    },
    dwolla: {
      customer_id: null,
      bank_account_added: null,
    },
  },
]);

export const switchToDelegatorParams = deepFreeze({
  id: 'ou5qrPJbGfWM',
  created_at: new Date('2019-06-20T07:33:45.690Z'),
  org_id: 'orNVthTo2Zyo',
  user_id: 'usBkJD1Um174',
  employee_id: 1234,
  location: null,
  level: 123,
  level_id: 'lvlPtroPaClQy',
  band: 'Very Long Level name',
  business_unit: null,
  department_id: 'deptYSONXoGd64',
  department: 'blah',
  sub_department: null,
  roles: ['FYLER', 'VERIFIER'],
  approver1_id: 'ouHgqeUOCrFP',
  approver2_id: null,
  approver3_id: 'ouwu0kuvZMT1',
  delegatee_id: 'ourw7Hi4mmpO',
  delegation_start_at: new Date('2019-12-18T10:00:00.000Z'),
  delegation_end_at: null,
  title: 'C-Suite',
  status: 'ACTIVE',
  branch_ifsc: null,
  branch_account: null,
  mobile: '9480056450',
  mobile_verified: false,
  mobile_verified_at: null,
  is_primary: false,
  owner: null,
  joining_dt: null,
  special_email: 'receipts+shishira_ms_2@fyle.ai',
  custom_field_values: [
    {
      id: 682,
      name: 'sdadadasda',
      value: null,
    },
    {
      id: 432,
      name: 'USelect',
      value: 'cho1',
    },
  ],
  org_name: 'Staging Loaded',
  settings_id: 'ous4ZBukeQJrN',
  default_cost_center_id: null,
  default_cost_center_name: null,
  default_cost_center_code: null,
  cost_center_ids: [13696, 14018, 13701],
});

export const extendedOrgUserResponse = deepFreeze({
  ou: {
    id: 'ou5qrPJbGfWM',
    created_at: new Date('2019-06-20T07:33:45.690Z'),
    org_id: 'orNVthTo2Zyo',
    user_id: 'usBkJD1Um174',
    employee_id: 1234,
    location: null,
    level: 123,
    level_id: 'lvlPtroPaClQy',
    band: 'Very Long Level name',
    rank: 1121212121,
    business_unit: null,
    department_id: 'deptYSONXoGd64',
    department: 'blah',
    sub_department: null,
    roles: ['FYLER', 'VERIFIER'],
    approver1_id: 'ouHgqeUOCrFP',
    approver2_id: null,
    approver3_id: 'ouwu0kuvZMT1',
    delegatee_id: 'ourw7Hi4mmpO',
    delegation_start_at: new Date('2019-12-18T10:00:00.000Z'),
    delegation_end_at: null,
    title: 'C-Suite',
    status: 'ACTIVE',
    branch_ifsc: null,
    branch_account: null,
    mobile: '9480056450',
    mobile_verified: false,
    mobile_verified_at: null,
    is_primary: false,
    owner: null,
    joining_dt: null,
    special_email: 'receipts+shishira_ms_2@fyle.ai',
    custom_field_values: [
      {
        id: 682,
        name: 'sdadadasda',
        value: null,
      },
      {
        id: 432,
        name: 'USelect',
        value: 'cho1',
      },
    ],
    org_name: 'Staging Loaded',
    settings_id: 'ous4ZBukeQJrN',
    default_cost_center_id: null,
    default_cost_center_name: null,
    default_cost_center_code: null,
    cost_center_ids: [13696, 14018],
  },
  org: {
    domain: 'fyle.in',
    currency: 'INR',
  },
  us: {
    id: 'usBkJD1Um174',
    created_at: new Date('2019-05-08T12:53:32.373Z'),
    full_name: 'Shishi',
    email: 'shishira.ms@fyle.in',
    email_verified_at: new Date('2022-09-06T06:03:36.156Z'),
    onboarded: true,
  },
  ap1: {
    full_name: 'Pradeep g',
    email: 'pradeep.gupta@fyle.in',
  },
  ap2: {
    full_name: null,
    email: null,
  },
  ap3: {
    full_name: 'Arun tvs',
    email: 'arun.tvs@fyle.in',
  },
  bb: {
    bank_name: null,
  },
  dwolla: {
    customer_id: 'dwcMdzMqqWLD9Ds',
    bank_account_added: null,
  },
});

export const postUserParam = deepFreeze({
  full_name: 'Dimple',
  email: 'dimple.kh+321@fyle.in',
  password: 'Test@1234523456',
});

export const postUserResponse = deepFreeze({
  created_at: new Date('2023-01-05T08:44:47.180Z'),
  email: 'dimple.kh+321@fyle.in',
  email_verified_at: new Date('2023-01-05T08:46:21.970Z'),
  full_name: 'Dimple',
  id: 'usXHGWJ1UXMP',
  onboarded: false,
  password: 'Test@1234523456',
});

export const postOrgUser = deepFreeze({
  id: 'ou5tyO64Eg0L',
  created_at: new Date('2021-11-17T02:54:07.855Z'),
  updated_at: new Date('2023-01-05T08:57:31.543Z'),
  joining_dt: null,
  org_id: 'orYtMVz2qisQ',
  user_id: 'usMjLibmye7s',
  employee_id: null,
  location: null,
  level_id: null,
  business_unit: null,
  department_id: null,
  roles: ['FYLER', 'APPROVER', 'HOP'],
  approver1_id: null,
  approver2_id: null,
  approver3_id: null,
  title: null,
  special_email: 'receipts+dimple_kh_dfjd@fyle.ai',
  status: 'ACTIVE',
  branch_ifsc: null,
  branch_account: null,
  mobile: '8546994598',
  mobile_verified: false,
  mobile_verified_at: null,
  owner: null,
  delegatee_id: null,
  delegation_start_at: null,
  delegation_end_at: null,
  custom_field_values: [],
  dwolla_customers_metadata_id: null,
  bank_account_type: null,
  bank_routing_number: null,
});

export const accessTokenData: AccessTokenData = deepFreeze({
  allowed_CIDRs: '[]',
  cluster_domain: '"https://staging.fyle.tech"',
  exp: 1672915952,
  iat: 1672912352,
  iss: 'FyleApp',
  org_id: 'orYtMVz2qisQ',
  org_user_id: 'ou5tyO64Eg0L',
  roles: '["FYLER","APPROVER","HOP"]',
  scopes: '[]',
  user_id: 'usMjLibmye7s',
  version: '3',
});

export const accessTokenWithProxyOrgUserId: AccessTokenData = deepFreeze({
  allowed_CIDRs: '[]',
  cluster_domain: '"https://staging.fyle.tech"',
  exp: 1672915952,
  iat: 1672912352,
  iss: 'FyleApp',
  org_id: 'orYtMVz2qisQ',
  org_user_id: 'ou5tyO64Eg0L',
  proxy_org_user_id: 'ourw7Hi4mmpO',
  roles: '["FYLER","APPROVER","HOP"]',
  scopes: '[]',
  user_id: 'usMjLibmye7s',
  version: '3',
});
