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
