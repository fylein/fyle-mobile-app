import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformExpenseField } from '../models/platform/platform-expense-field.model';
import { ExpenseField } from '../models/v1/expense-field.model';

export const expenseFieldResponse: ExpenseField[] = [
  {
    id: 2,
    created_at: new Date('2018-01-31T23:50:27.221Z'),
    created_by: {
      user_id: 'SYSTEM',
      org_user_id: null,
      org_id: null,
      roles: [],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: null,
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: null,
    },
    updated_at: new Date('2023-01-13T11:45:00.655Z'),
    updated_by: {
      user_id: 'usEyHSLj6aHw',
      org_user_id: 'ou9KVQTZWIFk',
      org_id: 'orNVthTo2Zyo',
      roles: ['FYLER', 'ADMIN', 'APPROVER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'SUPER_ADMIN', 'HOP'],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: '"https://staging.fyle.tech"',
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: 'ou9KVQTZWIFk',
    },
    org_id: 'orNVthTo2Zyo',
    column_name: 'bus_travel_class',
    field_name: 'Bus travel Class\\/',
    seq: 1,
    type: 'SELECT',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    placeholder: 'TEST',
    default_value: null,
    options: ['eco', 'business', 'jhgjg'],
    org_category_ids: [
      17283, 49621, 83060, 87409, 87441, 101148, 101149, 101151, 102676, 102757, 105705, 106574, 110168, 110597, 114563,
    ],
    code: null,
    roles_editable: ['FYLER', 'APPROVER', 'TRAVEL_ADMIN', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'ADMIN'],
  },
  {
    id: 3,
    created_at: new Date('2018-01-31T23:50:27.221Z'),
    created_by: {
      user_id: 'SYSTEM',
      org_user_id: null,
      org_id: null,
      roles: [],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: null,
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: null,
    },
    updated_at: new Date('2023-01-13T11:45:00.655Z'),
    updated_by: {
      user_id: 'usEyHSLj6aHw',
      org_user_id: 'ou9KVQTZWIFk',
      org_id: 'orNVthTo2Zyo',
      roles: ['FYLER', 'ADMIN', 'APPROVER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'SUPER_ADMIN', 'HOP'],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: '"https://staging.fyle.tech"',
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: 'ou9KVQTZWIFk',
    },
    org_id: 'orNVthTo2Zyo',
    column_name: 'cost_center_id',
    field_name: 'Cost Center',
    seq: 1,
    type: 'SELECT',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    placeholder: 'Select Cost Center',
    default_value: null,
    options: [],
    org_category_ids: [
      16558, 16559, 16560, 16561, 16562, 16563, 16564, 16565, 16566, 16567, 16568, 16569, 16570, 16571, 16572, 16573,
    ],
    code: null,
    roles_editable: [
      'TRAVEL_ADMIN',
      'PAYMENT_PROCESSOR',
      'VERIFIER',
      'FINANCE',
      'ADMIN',
      'FYLER',
      'APPROVER',
      'TRAVEL_AGENT',
    ],
    field: 'cost_center_id',
  },
  {
    id: 6,
    created_at: new Date('2018-01-31T23:50:27.221Z'),
    created_by: {
      user_id: 'SYSTEM',
      org_user_id: null,
      org_id: null,
      roles: [],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: null,
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: null,
    },
    updated_at: new Date('2023-01-13T11:45:00.655Z'),
    updated_by: {
      user_id: 'usEyHSLj6aHw',
      org_user_id: 'ou9KVQTZWIFk',
      org_id: 'orNVthTo2Zyo',
      roles: ['FYLER', 'ADMIN', 'APPROVER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'SUPER_ADMIN', 'HOP'],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: '"https://staging.fyle.tech"',
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: 'ou9KVQTZWIFk',
    },
    org_id: 'orNVthTo2Zyo',
    column_name: 'distance',
    field_name: 'Distance',
    seq: 1,
    type: 'NUMBER',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    placeholder: 'Enter Distance',
    default_value: null,
    options: [],
    org_category_ids: [16565, 52525, 58348, 58349, 115914, 115970, 117013, 123032, 197625],
    code: null,
    roles_editable: ['FYLER', 'APPROVER', 'TRAVEL_ADMIN', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'ADMIN'],
  },
];

export const platformExpenseFieldResponse: PlatformApiResponse<PlatformExpenseField> = {
  count: 5,
  data: [
    {
      category_ids: [214309, 214310, 214311, 214312],
      code: null,
      column_name: 'purpose',
      created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
      default_value: null,
      field_name: 'Purpose',
      id: 214657,
      is_custom: false,
      is_enabled: true,
      is_mandatory: false,
      options: [],
      org_id: 'orOTDe765hQp',
      placeholder: 'E.g. Client Meeting',
      seq: 1,
      type: 'TEXT',
      updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
      parent_field_id: 12345,
    },
    {
      category_ids: [214309, 214310, 214311],
      code: null,
      column_name: 'spent_at',
      created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
      default_value: null,
      field_name: 'Date of Spend',
      id: 214658,
      is_custom: false,
      is_enabled: true,
      is_mandatory: true,
      options: [],
      org_id: 'orOTDe765hQp',
      placeholder: 'Select Date',
      seq: 1,
      type: 'DATE',
      updated_at: new Date('2023-02-02T13:44:00.708837+00:00'),
      parent_field_id: 112312,
    },
    {
      category_ids: [214317],
      code: null,
      column_name: 'spent_at',
      created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
      default_value: null,
      field_name: 'Date of Travel',
      id: 214659,
      is_custom: false,
      is_enabled: true,
      is_mandatory: false,
      options: [],
      org_id: 'orOTDe765hQp',
      placeholder: 'Select Date',
      seq: 2,
      type: 'DATE',
      updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
      parent_field_id: null,
    },
    {
      category_ids: [214310, 214311, 214312, 214313],
      code: null,
      column_name: 'merchant',
      created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
      default_value: null,
      field_name: 'Merchant',
      id: 214660,
      is_custom: false,
      is_enabled: true,
      is_mandatory: false,
      options: [],
      org_id: 'orOTDe765hQp',
      placeholder: 'E.g. Uber',
      seq: 1,
      type: 'SELECT',
      updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
      parent_field_id: 834652,
    },
    {
      category_ids: [214309, 214310, 214311, 214312],
      code: null,
      column_name: 'cost_center_id',
      created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
      default_value: null,
      field_name: 'Cost Center',
      id: 214661,
      is_custom: false,
      is_enabled: true,
      is_mandatory: true,
      options: [],
      org_id: 'orOTDe765hQp',
      placeholder: 'Select Cost Center',
      seq: 1,
      type: 'SELECT',
      updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
      parent_field_id: null,
    },
  ],
  offset: 0,
};

export const transformedResponse: ExpenseField[] = [
  {
    id: 214657,
    code: null,
    column_name: 'purpose',
    created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
    default_value: null,
    field_name: 'Purpose',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [214309, 214310, 214311, 214312],
    org_id: 'orOTDe765hQp',
    placeholder: 'E.g. Client Meeting',
    seq: 1,
    type: 'TEXT',
    updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
    parent_field_id: 12345,
  },
  {
    id: 214658,
    code: null,
    column_name: 'txn_dt',
    created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
    default_value: null,
    field_name: 'Date of Spend',
    is_custom: false,
    is_enabled: true,
    is_mandatory: true,
    options: [],
    org_category_ids: [214309, 214310, 214311],
    org_id: 'orOTDe765hQp',
    placeholder: 'Select Date',
    seq: 1,
    type: 'DATE',
    updated_at: new Date('2023-02-02T13:44:00.708837+00:00'),
    parent_field_id: 112312,
  },
  {
    id: 214659,
    code: null,
    column_name: 'txn_dt',
    created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
    default_value: null,
    field_name: 'Date of Travel',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [214317],
    org_id: 'orOTDe765hQp',
    placeholder: 'Select Date',
    seq: 2,
    type: 'DATE',
    updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
    parent_field_id: null,
  },
  {
    id: 214660,
    code: null,
    column_name: 'vendor_id',
    created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
    default_value: null,
    field_name: 'Merchant',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [214310, 214311, 214312, 214313],
    org_id: 'orOTDe765hQp',
    placeholder: 'E.g. Uber',
    seq: 1,
    type: 'SELECT',
    updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
    parent_field_id: 834652,
  },
  {
    id: 214661,
    code: null,
    column_name: 'cost_center_id',
    created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
    default_value: null,
    field_name: 'Cost Center',
    is_custom: false,
    is_enabled: true,
    is_mandatory: true,
    options: [],
    org_category_ids: [214309, 214310, 214311, 214312],
    org_id: 'orOTDe765hQp',
    placeholder: 'Select Cost Center',
    seq: 1,
    type: 'SELECT',
    updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
    parent_field_id: null,
  },
];

export const expenseFieldWithBillable: ExpenseField[] = [
  {
    id: 188990,
    created_at: new Date('2021-07-29T11:05:38.811Z'),
    created_by: {
      user_id: 'SYSTEM',
      org_user_id: null,
      org_id: null,
      roles: [],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: null,
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: null,
    },
    updated_at: new Date('2023-01-16T21:03:00.122Z'),
    updated_by: {
      user_id: 'usEyHSLj6aHw',
      org_user_id: 'ou9KVQTZWIFk',
      org_id: 'orNVthTo2Zyo',
      roles: ['FYLER', 'ADMIN', 'APPROVER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'SUPER_ADMIN', 'HOP'],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: '"https://staging.fyle.tech"',
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: 'ou9KVQTZWIFk',
    },
    org_id: 'orNVthTo2Zyo',
    column_name: 'billable',
    field_name: 'Billable',
    seq: 1,
    type: 'BOOLEAN',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    placeholder: 'Billable',
    default_value: false,
    options: [],
    org_category_ids: [],
    code: null,
    roles_editable: [
      'FYLER',
      'APPROVER',
      'TRAVEL_ADMIN',
      'VERIFIER',
      'PAYMENT_PROCESSOR',
      'FINANCE',
      'ADMIN',
      'TRAVEL_AGENT',
      'OWNER',
      'AUDITOR',
    ],
    field: 'billable',
  },
];

export const expenseFieldWithSeq: ExpenseField[] = [
  {
    id: 2,
    created_at: new Date('2018-01-31T23:50:27.221Z'),
    created_by: {
      user_id: 'SYSTEM',
      org_user_id: null,
      org_id: null,
      roles: [],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: null,
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: null,
    },
    updated_at: new Date('2023-01-13T11:45:00.655Z'),
    updated_by: {
      user_id: 'usEyHSLj6aHw',
      org_user_id: 'ou9KVQTZWIFk',
      org_id: 'orNVthTo2Zyo',
      roles: ['FYLER', 'ADMIN', 'APPROVER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'SUPER_ADMIN', 'HOP'],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: '"https://staging.fyle.tech"',
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: 'ou9KVQTZWIFk',
    },
    org_id: 'orNVthTo2Zyo',
    column_name: 'bus_travel_class',
    field_name: 'Bus travel Class\\/',
    seq: 1,
    type: 'SELECT',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    placeholder: 'TEST',
    default_value: null,
    options: ['eco', 'business', 'jhgjg'],
    org_category_ids: [
      17283, 49621, 83060, 87409, 87441, 101148, 101149, 101151, 102676, 102757, 105705, 106574, 110168, 110597, 114563,
    ],
    code: null,
    roles_editable: ['FYLER', 'APPROVER', 'TRAVEL_ADMIN', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'ADMIN'],
  },
  {
    id: 3,
    created_at: new Date('2018-01-31T23:50:27.221Z'),
    created_by: {
      user_id: 'SYSTEM',
      org_user_id: null,
      org_id: null,
      roles: [],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: null,
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: null,
    },
    updated_at: new Date('2023-01-13T11:45:00.655Z'),
    updated_by: {
      user_id: 'usEyHSLj6aHw',
      org_user_id: 'ou9KVQTZWIFk',
      org_id: 'orNVthTo2Zyo',
      roles: ['FYLER', 'ADMIN', 'APPROVER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'SUPER_ADMIN', 'HOP'],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: '"https://staging.fyle.tech"',
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: 'ou9KVQTZWIFk',
    },
    org_id: 'orNVthTo2Zyo',
    column_name: 'cost_center_id',
    field_name: 'Cost Center',
    seq: 1,
    type: 'SELECT',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    placeholder: 'Select Cost Center',
    default_value: null,
    options: [],
    org_category_ids: [
      16558, 16559, 16560, 16561, 16562, 16563, 16564, 16565, 16566, 16567, 16568, 16569, 16570, 16571, 16572, 16573,
    ],
    code: null,
    roles_editable: [
      'TRAVEL_ADMIN',
      'PAYMENT_PROCESSOR',
      'VERIFIER',
      'FINANCE',
      'ADMIN',
      'FYLER',
      'APPROVER',
      'TRAVEL_AGENT',
    ],
    field: 'cost_center_id',
  },
  {
    id: 6,
    created_at: new Date('2018-01-31T23:50:27.221Z'),
    created_by: {
      user_id: 'SYSTEM',
      org_user_id: null,
      org_id: null,
      roles: [],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: null,
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: null,
    },
    updated_at: new Date('2023-01-13T11:45:00.655Z'),
    updated_by: {
      user_id: 'usEyHSLj6aHw',
      org_user_id: 'ou9KVQTZWIFk',
      org_id: 'orNVthTo2Zyo',
      roles: ['FYLER', 'ADMIN', 'APPROVER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'SUPER_ADMIN', 'HOP'],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: '"https://staging.fyle.tech"',
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: 'ou9KVQTZWIFk',
    },
    org_id: 'orNVthTo2Zyo',
    column_name: 'distance',
    field_name: 'Distance',
    seq: 1,
    type: 'NUMBER',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    placeholder: 'Enter Distance',
    default_value: null,
    options: [],
    org_category_ids: [16565, 52525, 58348, 58349, 115914, 115970, 117013, 123032, 197625],
    code: null,
    roles_editable: ['FYLER', 'APPROVER', 'TRAVEL_ADMIN', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'ADMIN'],
  },
  {
    id: 7,
    created_at: new Date('2018-01-31T23:50:27.221Z'),
    created_by: {
      user_id: 'SYSTEM',
      org_user_id: null,
      org_id: null,
      roles: [],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: null,
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: null,
    },
    updated_at: new Date('2023-01-13T11:45:00.655Z'),
    updated_by: {
      user_id: 'usEyHSLj6aHw',
      org_user_id: 'ou9KVQTZWIFk',
      org_id: 'orNVthTo2Zyo',
      roles: ['FYLER', 'ADMIN', 'APPROVER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'SUPER_ADMIN', 'HOP'],
      scopes: [],
      allowed_cidrs: [],
      cluster_domain: '"https://staging.fyle.tech"',
      proxy_org_user_id: null,
      tpa_id: null,
      tpa_name: null,
      name: 'ou9KVQTZWIFk',
    },
    org_id: 'orNVthTo2Zyo',
    column_name: 'distance',
    field_name: 'Distance 2',
    seq: 2,
    type: 'NUMBER',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    placeholder: 'Enter Distance',
    default_value: null,
    options: [],
    org_category_ids: [16565, 52525, 58348, 58349, 115914, 115970, 117013, 123032, 197625],
    code: null,
    roles_editable: ['FYLER', 'APPROVER', 'TRAVEL_ADMIN', 'VERIFIER', 'PAYMENT_PROCESSOR', 'FINANCE', 'ADMIN'],
  },
];

export const customExpensefields: ExpenseField[] = [
  {
    id: 200227,
    code: null,
    column_name: 'text_array_column5',
    created_at: new Date('2022-02-25T05:44:59.645468+00:00'),
    default_value: null,
    field_name: 'userlist',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [16557, 16558, 16559],
    org_id: 'orNVthTo2Zyo',
    placeholder: 'userlist_custom_field',
    seq: 1,
    type: 'USER_LIST',
    updated_at: new Date('2023-02-05T09:48:18.482566+00:00'),
    parent_field_id: null,
  },
  {
    id: 206198,
    code: null,
    column_name: 'timestamp_column4',
    created_at: new Date('2022-05-13T10:58:17.285012+00:00'),
    default_value: null,
    field_name: '2232323',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [16557, 16558, 16559],
    org_id: 'orNVthTo2Zyo',
    placeholder: 'adsf',
    seq: 1,
    type: 'DATE',
    updated_at: new Date('2023-02-05T09:48:18.482566+00:00'),
    parent_field_id: null,
  },
  {
    id: 206206,
    code: null,
    column_name: 'location_column3',
    created_at: new Date('2022-05-13T12:55:01.345649+00:00'),
    default_value: null,
    field_name: 'pub create hola 1',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [16557, 16558, 16559],
    org_id: 'orNVthTo2Zyo',
    placeholder: 'pub create hola 1',
    seq: 1,
    type: 'LOCATION',
    updated_at: new Date('2023-02-05T09:48:18.482566+00:00'),
    parent_field_id: null,
  },
  {
    id: 210281,
    code: null,
    column_name: 'text_array_column6',
    created_at: new Date('2022-08-25T09:17:38.301703+00:00'),
    default_value: null,
    field_name: 'test',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: ['asd', 'asdf', 'asdff'],
    org_category_ids: [16557, 16558, 16559],
    org_id: 'orNVthTo2Zyo',
    placeholder: '123test',
    seq: 1,
    type: 'MULTI_SELECT',
    updated_at: new Date('2023-02-05T09:48:18.482566+00:00'),
    parent_field_id: null,
  },
  {
    id: 210649,
    code: null,
    column_name: 'text_array_column7',
    created_at: new Date('2022-09-08T10:07:42.043024+00:00'),
    default_value: null,
    field_name: 'User List',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [16557, 16558, 16559],
    org_id: 'orNVthTo2Zyo',
    placeholder: 'User List',
    seq: 1,
    type: 'USER_LIST',
    updated_at: new Date('2023-02-05T09:48:18.482566+00:00'),
    parent_field_id: null,
  },
  {
    id: 211321,
    code: null,
    column_name: 'location_column7',
    created_at: new Date('2022-09-28T16:36:53.157938+00:00'),
    default_value: null,
    field_name: 'test 112',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [16557, 16558, 16559],
    org_id: 'orNVthTo2Zyo',
    placeholder: 'placeholder',
    seq: 1,
    type: 'LOCATION',
    updated_at: new Date('2023-02-05T09:48:18.482566+00:00'),
    parent_field_id: null,
  },
  {
    id: 211326,
    code: null,
    column_name: 'timestamp_column7',
    created_at: new Date('2022-09-28T17:33:32.098530+00:00'),
    default_value: null,
    field_name: 'select all 2',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [16557, 16558, 16559],
    org_id: 'orNVthTo2Zyo',
    placeholder: 'helo date',
    seq: 1,
    type: 'DATE',
    updated_at: new Date('2023-02-05T09:48:18.482566+00:00'),
    parent_field_id: null,
  },
  {
    id: 212819,
    code: null,
    column_name: 'text_array_column8',
    created_at: new Date('2022-10-17T08:56:35.776335+00:00'),
    default_value: null,
    field_name: 'category2',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: ['asdf', 'asdfa'],
    org_category_ids: [16557, 16558, 16559],
    org_id: 'orNVthTo2Zyo',
    placeholder: 'category2',
    seq: 1,
    type: 'MULTI_SELECT',
    updated_at: new Date('2023-02-05T09:48:18.482566+00:00'),
    parent_field_id: null,
  },
];

export const transformedResponse2 = [
  {
    id: 214657,
    code: null,
    column_name: 'project_id',
    created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
    default_value: null,
    field_name: 'Purpose',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [214309, 214310, 214311, 214312],
    org_id: 'orOTDe765hQp',
    placeholder: 'E.g. Client Meeting',
    seq: 1,
    type: 'TEXT',
    updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
    parent_field_id: 12345,
  },
  {
    id: 214658,
    code: null,
    column_name: 'txn_dt',
    created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
    default_value: null,
    field_name: 'Date of Spend',
    is_custom: false,
    is_enabled: true,
    is_mandatory: true,
    options: [],
    org_category_ids: [214309, 214310, 214311],
    org_id: 'orOTDe765hQp',
    placeholder: 'Select Date',
    seq: 1,
    type: 'DATE',
    updated_at: new Date('2023-02-02T13:44:00.708837+00:00'),
    parent_field_id: 112312,
  },
];

export const projectNameNullField = [
  {
    id: 214657,
    code: null,
    column_name: 'project_id',
    created_at: new Date('2022-11-10T15:14:53.132883+00:00'),
    default_value: null,
    field_name: null,
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [214309, 214310, 214311, 214312],
    org_id: 'orOTDe765hQp',
    placeholder: 'E.g. Client Meeting',
    seq: 1,
    type: 'TEXT',
    updated_at: new Date('2023-02-01T09:49:21.584869+00:00'),
    parent_field_id: 12345,
  },
];

export const dependentCustomFields: ExpenseField[] = [
  {
    id: 219199,
    code: null,
    column_name: 'Cost Code',
    created_at: new Date('2023-02-23T10:45:08.313777+00:00'),
    default_value: null,
    field_name: 'Cost Code',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [251104, 251105],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Enter Cost Code',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-02-23T10:45:08.313777+00:00'),
    parent_field_id: 219175,
  },
  {
    id: 219200,
    code: null,
    column_name: 'Cost Area',
    created_at: new Date('2023-02-23T10:45:53.853907+00:00'),
    default_value: null,
    field_name: 'Cost Area',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [251104, 251105],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Enter Cost Area',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-02-23T10:45:53.853907+00:00'),
    parent_field_id: 219199,
  },
  {
    id: 219527,
    code: null,
    column_name: 'Taj Mahaj Construction',
    created_at: new Date('2023-03-01T13:12:32.545615+00:00'),
    default_value: null,
    field_name: 'Taj Mahaj Construction',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: ['Materials'],
    org_category_ids: [251104, 251105],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Select Taj Mahaj Construction',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-03-01T13:12:32.545615+00:00'),
    parent_field_id: 219174,
  },
];

export const dependentCustomFields2: ExpenseField[] = [
  {
    id: 219527,
    code: null,
    column_name: 'Taj Mahaj Construction',
    created_at: new Date('2023-03-01T13:12:32.545615+00:00'),
    default_value: null,
    field_name: 'Taj Mahaj Construction',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: ['Materials'],
    org_category_ids: [251104, 251105],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Select Taj Mahaj Construction',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-03-01T13:12:32.545615+00:00'),
    parent_field_id: 219174,
  },
  {
    id: 219199,
    code: null,
    column_name: 'Cost Code',
    created_at: new Date('2023-02-23T10:45:08.313777+00:00'),
    default_value: null,
    field_name: 'Cost Code',
    is_custom: true,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [251104, 251105],
    org_id: 'orN6GkZNaD8b',
    placeholder: 'Enter Cost Code',
    seq: 1,
    type: 'DEPENDENT_SELECT',
    updated_at: new Date('2023-02-23T10:45:08.313777+00:00'),
    parent_field_id: 219175,
  },
];

export const mileageDependentFields: ExpenseField[] = [
  {
    id: 214657,
    code: null,
    column_name: 'purpose',
    created_at: new Date('2022-11-10T15:14:53.132Z'),
    default_value: null,
    field_name: 'Purpose',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [214309, 214310, 214311, 214312],
    org_id: 'orOTDe765hQp',
    placeholder: 'E.g. Client Meeting',
    seq: 1,
    type: 'TEXT',
    updated_at: new Date('2023-02-01T09:49:21.584Z'),
    parent_field_id: 12345,
  },
  {
    id: 214658,
    code: null,
    column_name: 'txn_dt',
    created_at: new Date('2022-11-10T15:14:53.132Z'),
    default_value: null,
    field_name: 'Date of Spend',
    is_custom: false,
    is_enabled: true,
    is_mandatory: true,
    options: [],
    org_category_ids: [214309, 214310, 214311],
    org_id: 'orOTDe765hQp',
    placeholder: 'Select Date',
    seq: 1,
    type: 'DATE',
    updated_at: new Date('2023-02-02T13:44:00.708Z'),
    parent_field_id: 112312,
  },
  {
    id: 214659,
    code: null,
    column_name: 'txn_dt',
    created_at: new Date('2022-11-10T15:14:53.132Z'),
    default_value: null,
    field_name: 'Date of Travel',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [214317],
    org_id: 'orOTDe765hQp',
    placeholder: 'Select Date',
    seq: 2,
    type: 'DATE',
    updated_at: new Date('2023-02-01T09:49:21.584Z'),
    parent_field_id: null,
  },
  {
    id: 214660,
    code: null,
    column_name: 'vendor_id',
    created_at: new Date('2022-11-10T15:14:53.132Z'),
    default_value: null,
    field_name: 'Merchant',
    is_custom: false,
    is_enabled: true,
    is_mandatory: false,
    options: [],
    org_category_ids: [214310, 214311, 214312, 214313],
    org_id: 'orOTDe765hQp',
    placeholder: 'E.g. Uber',
    seq: 1,
    type: 'SELECT',
    updated_at: new Date('2023-02-01T09:49:21.584Z'),
    parent_field_id: 834652,
  },
  {
    id: 214661,
    code: null,
    column_name: 'cost_center_id',
    created_at: new Date('2022-11-10T15:14:53.132Z'),
    default_value: null,
    field_name: 'Cost Center',
    is_custom: false,
    is_enabled: true,
    is_mandatory: true,
    options: [],
    org_category_ids: [214309, 214310, 214311, 214312],
    org_id: 'orOTDe765hQp',
    placeholder: 'Select Cost Center',
    seq: 1,
    type: 'SELECT',
    updated_at: new Date('2023-02-01T09:49:21.584Z'),
    parent_field_id: null,
  },
];
