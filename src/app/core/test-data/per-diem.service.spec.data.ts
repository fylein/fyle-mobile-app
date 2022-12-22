import { AccountType } from '../enums/account-type.enum';

export const apiCountResponse = {
  count: 57,
  data: [
    {
      code: null,
      created_at: '2018-02-01T07:23:52.848283+00:00',
      currency: 'INR',
      description: null,
      id: 25,
      is_enabled: true,
      name: 'Inter City',
      org_id: 'orNVthTo2Zyo',
      rate: 320,
      updated_at: '2018-02-01T07:23:53.848283+00:00',
    },
  ],
  offset: 0,
};

export const apiPerDiemByID = {
  count: 1,
  data: [
    {
      code: null,
      created_at: '2018-10-25T09:40:40.729140+00:00',
      currency: 'INR',
      description: null,
      id: 538,
      is_enabled: false,
      name: 'Food 3',
      org_id: 'orrjqbDbeP9p',
      rate: 140,
      updated_at: '2022-08-11T09:50:26.804683+00:00',
    },
  ],
  offset: 0,
};

export const expectPerDiemByID = {
  active: false,
  created_at: new Date('2018-10-25T09:40:40.729Z'),
  currency: 'INR',
  id: 538,
  name: 'Food 3',
  org_id: 'orrjqbDbeP9p',
  rate: 140,
  updated_at: new Date('2022-08-11T09:50:26.804Z'),
};

export const apiPerDiemRates = {
  count: 2,
  data: [
    {
      code: null,
      created_at: '2018-02-01T07:23:52.848283+00:00',
      currency: 'INR',
      description: null,
      id: 25,
      is_enabled: true,
      name: 'Inter City',
      org_id: 'orNVthTo2Zyo',
      rate: 320,
      updated_at: '2018-02-01T07:23:53.848283+00:00',
    },
    {
      code: null,
      created_at: '2018-10-08T06:37:01.337001+00:00',
      currency: 'INR',
      description: null,
      id: 502,
      is_enabled: true,
      name: 'Fyle-Test2',
      org_id: 'orNVthTo2Zyo',
      rate: 65,
      updated_at: '2020-11-20T13:36:16.154989+00:00',
    },
  ],
  offset: 0,
};

export const expectedPerDiemRates = [
  {
    active: true,
    created_at: '2018-02-01T07:23:52.848Z',
    currency: 'INR',
    id: 25,
    name: 'Inter City',
    org_id: 'orNVthTo2Zyo',
    rate: 320,
    updated_at: '2018-02-01T07:23:53.848Z',
  },
  {
    active: true,
    created_at: '2018-10-08T06:37:01.337Z',
    currency: 'INR',
    id: 502,
    name: 'Fyle-Test2',
    org_id: 'orNVthTo2Zyo',
    rate: 65,
    updated_at: '2020-11-20T13:36:16.154Z',
  },
];

export const allPerDiemRatesParam = [
  {
    active: true,
    created_at: '2020-08-12T16:09:14.551376+00:00',
    currency: 'INR',
    id: 4212,
    name: 'BulkTest1',
    org_id: 'orrjqbDbeP9p',
    rate: 500,
    updated_at: '2022-09-20T11:48:37.454797+00:00',
    full_name: 'BulkTest1 (500 INR per day)',
    readableRate: '₹500.00 per day',
  },
  {
    active: true,
    created_at: '2020-08-12T16:09:14.551376+00:00',
    currency: 'USD',
    id: 4213,
    name: 'BulkTest2',
    org_id: 'orrjqbDbeP9p',
    rate: 50,
    updated_at: '2022-09-20T11:48:38.901050+00:00',
    full_name: 'BulkTest2 (50 USD per day)',
    readableRate: '$50.00 per day',
  },
  {
    active: true,
    created_at: '2020-08-19T11:39:05.428479+00:00',
    currency: 'AED',
    id: 4224,
    name: 'aaaa',
    org_id: 'orrjqbDbeP9p',
    rate: 12,
    updated_at: '2022-10-07T13:23:35.509419+00:00',
    full_name: 'aaaa (12 AED per day)',
    readableRate: 'AED 12.00 per day',
  },
];

export const apiOrgUserSettings = {
  id: 'ous7cvGj3iOsi',
  created_at: new Date('2019-10-10T06:33:08.192Z'),
  updated_at: new Date('2022-12-07T10:37:57.155Z'),
  org_user_id: 'ouWmQvnfr9x0',
  auto_fyle_settings: {
    allowed: false,
    enabled: false,
    background_enabled: false,
  },
  mileage_settings: {
    mileage_rate_labels: [],
    annual_mileage_of_user_before_joining_fyle: null,
  },
  cost_center_ids: [11910, 11911, 11912, 11913, 11914, 11915, 1191],
  project_ids: [305678, 305679, 305672, 148287, 305674],
  cost_center_settings: {
    default_cost_center_id: 48,
    default_cost_center_name: 'Test1',
  },
  per_diem_rate_settings: {
    allowed_per_diem_ids: [4213, 4224],
  },
  access_delegation_settings: {
    allowed: false,
  },
  insta_fyle_settings: {
    allowed: true,
    enabled: true,
    static_camera_overlay_enabled: true,
    extract_fields: ['AMOUNT', 'CURRENCY', 'CATEGORY', 'TXN_DT'],
  },
  bulk_fyle_settings: {
    allowed: true,
    enabled: true,
  },
  gmail_fmr_settings: {
    allowed: false,
    enabled: false,
  },
  whatsapp_fyle_settings: {
    allowed: true,
    enabled: false,
  },
  sms_fyle_settings: {
    allowed: false,
    enabled: false,
  },
  one_click_action_settings: {
    enabled: false,
    allowed: true,
    module: null,
  },
  notification_settings: {
    email: {
      allowed: true,
      enabled: true,
      unsubscribed_events: [],
    },
    push: {
      allowed: false,
      enabled: false,
      unsubscribed_events: [
        'ERPTS_SUBMITTED',
        'EADVANCE_REQUESTS_CREATED',
        'EADVANCE_REQUESTS_UPDATED',
        'EADVANCE_REQUESTS_INQUIRY',
      ],
    },
    whatsapp: {
      allowed: false,
      enabled: false,
      unsubscribed_events: null,
    },
    notify_user: true,
    notify_delegatee: false,
  },
  currency_settings: {
    enabled: false,
    preferred_currency: 'INR',
  },
  preferences: {
    default_project_id: null,
    default_vehicle_type: 'two_wheeler',
    default_payment_mode: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
  },
  locale: {
    timezone: 'Asia/Kolkata',
    abbreviation: 'IST',
    offset: '05:30:00',
  },
  in_app_chat_settings: {
    allowed: false,
    enabled: false,
    restore_id: null,
  },
  hotjar_settings: {
    allowed: false,
    enabled: false,
  },
  fyler_ccc_flow_settings: {
    allowed: true,
    enabled: true,
    advanced_auto_match_enabled: true,
  },
  beta_auto_submit_workflow_settings: {
    allowed: true,
    enabled: true,
  },
  beta_report_workflow_settings: {
    allowed: false,
    enabled: false,
  },
  bank_data_aggregation_settings: {
    enabled: true,
    aggregator: 'YODLEE',
    auto_assign: true,
  },
  personal_cards_settings: {
    enabled: true,
    personal_cards_data_aggregator: 'PLAID',
  },
  expense_form_autofills: {
    allowed: false,
    enabled: true,
  },
  card_expense_creation_settings: {
    allowed: true,
    enabled: true,
  },
  data_extractor_settings: {
    allowed: true,
    enabled: true,
  },
  onboarding_settings: {
    enabled: true,
    skip_add_bank_account: true,
    skip_link_card: true,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    allowed_payment_modes: [AccountType.PERSONAL],
  },
};

export const apiOrgUserSettingsWithoutPerDiem = {
  id: 'ous7cvGj3iOsi',
  created_at: new Date('2019-10-10T06:33:08.192Z'),
  updated_at: new Date('2022-12-07T10:37:57.155Z'),
  org_user_id: 'ouWmQvnfr9x0',
  auto_fyle_settings: {
    allowed: false,
    enabled: false,
    background_enabled: false,
  },
  mileage_settings: {
    mileage_rate_labels: [],
    annual_mileage_of_user_before_joining_fyle: null,
  },
  cost_center_ids: [11910, 11911, 11912, 11913, 11914, 11915, 1191],
  project_ids: [305678, 305679, 305672, 148287, 305674],
  cost_center_settings: {
    default_cost_center_id: 48,
    default_cost_center_name: 'Test1',
  },
  per_diem_rate_settings: null,
  access_delegation_settings: {
    allowed: false,
  },
  insta_fyle_settings: {
    allowed: true,
    enabled: true,
    static_camera_overlay_enabled: true,
    extract_fields: ['AMOUNT', 'CURRENCY', 'CATEGORY', 'TXN_DT'],
  },
  bulk_fyle_settings: {
    allowed: true,
    enabled: true,
  },
  gmail_fmr_settings: {
    allowed: false,
    enabled: false,
  },
  whatsapp_fyle_settings: {
    allowed: true,
    enabled: false,
  },
  sms_fyle_settings: {
    allowed: false,
    enabled: false,
  },
  one_click_action_settings: {
    enabled: false,
    allowed: true,
    module: null,
  },
  notification_settings: {
    email: {
      allowed: true,
      enabled: true,
      unsubscribed_events: [],
    },
    push: {
      allowed: false,
      enabled: false,
      unsubscribed_events: [
        'ERPTS_SUBMITTED',
        'EADVANCE_REQUESTS_CREATED',
        'EADVANCE_REQUESTS_UPDATED',
        'EADVANCE_REQUESTS_INQUIRY',
      ],
    },
    whatsapp: {
      allowed: false,
      enabled: false,
      unsubscribed_events: null,
    },
    notify_user: true,
    notify_delegatee: false,
  },
  currency_settings: {
    enabled: false,
    preferred_currency: 'INR',
  },
  preferences: {
    default_project_id: null,
    default_vehicle_type: 'two_wheeler',
    default_payment_mode: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
  },
  locale: {
    timezone: 'Asia/Kolkata',
    abbreviation: 'IST',
    offset: '05:30:00',
  },
  in_app_chat_settings: {
    allowed: false,
    enabled: false,
    restore_id: null,
  },
  hotjar_settings: {
    allowed: false,
    enabled: false,
  },
  fyler_ccc_flow_settings: {
    allowed: true,
    enabled: true,
    advanced_auto_match_enabled: true,
  },
  beta_auto_submit_workflow_settings: {
    allowed: true,
    enabled: true,
  },
  beta_report_workflow_settings: {
    allowed: false,
    enabled: false,
  },
  bank_data_aggregation_settings: {
    enabled: true,
    aggregator: 'YODLEE',
    auto_assign: true,
  },
  personal_cards_settings: {
    enabled: true,
    personal_cards_data_aggregator: 'PLAID',
  },
  expense_form_autofills: {
    allowed: false,
    enabled: true,
  },
  card_expense_creation_settings: {
    allowed: true,
    enabled: true,
  },
  data_extractor_settings: {
    allowed: true,
    enabled: true,
  },
  onboarding_settings: {
    enabled: true,
    skip_add_bank_account: true,
    skip_link_card: true,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    allowed_payment_modes: [AccountType.PERSONAL],
  },
};

export const allowedPerDiem = [
  {
    active: true,
    created_at: '2020-08-12T16:09:14.551Z',
    currency: 'USD',
    id: 4213,
    name: 'BulkTest2',
    org_id: 'orrjqbDbeP9p',
    rate: 50,
    updated_at: '2022-09-20T11:48:38.901Z',
    full_name: 'BulkTest2 (50 USD per day)',
    readableRate: '$50.00 per day',
  },
  {
    active: true,
    created_at: '2020-08-19T11:39:05.428Z',
    currency: 'AED',
    id: 4224,
    name: 'aaaa',
    org_id: 'orrjqbDbeP9p',
    rate: 12,
    updated_at: '2022-10-07T13:23:35.509Z',
    full_name: 'aaaa (12 AED per day)',
    readableRate: 'AED 12.00 per day',
  },
];
