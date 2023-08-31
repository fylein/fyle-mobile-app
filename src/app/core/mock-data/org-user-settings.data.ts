import { AccountType } from '../enums/account-type.enum';
import { OrgUserSettings } from '../models/org_user_settings.model';

export const orgUserSettingsData: OrgUserSettings = {
  id: 'ousS9MgDNQ6NB',
  created_at: new Date('2018-02-01T02:32:25.275Z'),
  updated_at: new Date('2023-01-23T09:47:32.266Z'),
  org_user_id: 'ouX8dwsbLCLv',
  auto_fyle_settings: {
    allowed: false,
    enabled: false,
    background_enabled: false,
  },
  mileage_settings: {
    mileage_rate_labels: ['new policy test', 'test 2'],
    annual_mileage_of_user_before_joining_fyle: {
      two_wheeler: null,
      four_wheeler: null,
      four_wheeler1: null,
      four_wheeler3: null,
      four_wheeler4: null,
      bicycle: null,
      electric_car: null,
    },
  },
  cost_center_ids: [13792, 13793, 13794, 14018, 13795, 13995, 9493, 9494, 13785, 13787, 13788, 13789, 13790, 13791],
  project_ids: [290054, 316444, 316446, 149230, 316442, 316443],
  cost_center_settings: {
    default_cost_center_id: 13792,
    default_cost_center_name: '002 cs',
  },
  per_diem_rate_settings: {
    allowed_per_diem_ids: [606, 621, 634, 639, 1642, 2618, 3932, 508, 5017, 5465, 5812, 5814, 5835, 510, 5777, 5419],
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
    enabled: true,
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
      unsubscribed_events: [
        'ESTATUSES_CREATED_TXN',
        'ETXNS_ADMIN_REMOVED',
        'ETXNS_ADMIN_UPDATED',
        'EREIMBURSEMENTS_COMPLETED',
        'EADVANCE_REQUESTS_CREATED',
        'EADVANCE_REQUESTS_UPDATED',
        'EADVANCE_REQUESTS_INQUIRY',
        'EADVANCE_REQUESTS_APPROVED',
        'EADVANCES_CREATED',
        'EADVANCE_REQUESTS_REJECTED',
      ],
    },
    push: {
      allowed: true,
      enabled: true,
      unsubscribed_events: ['ESTATUSES_CREATED_TXN', 'ESTATUSES_CREATED_RPT', 'EADVANCES_CREATED'],
    },
    whatsapp: {
      allowed: false,
      enabled: false,
    },
    notify_user: true,
    notify_delegatee: true,
  },
  currency_settings: {
    enabled: false,
    preferred_currency: 'GNF',
  },
  preferences: {
    default_project_id: 3943,
    default_vehicle_type: 'four_wheeler',
    default_payment_mode: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
  },
  locale: {
    timezone: 'America/North_Dakota/New_Salem',
    abbreviation: 'CDT',
    offset: '-05:00:00',
  },
  in_app_chat_settings: {
    allowed: true,
    enabled: true,
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
    allowed: true,
    enabled: true,
  },
  bank_data_aggregation_settings: {
    enabled: true,
    aggregator: 'YODLEE',
    auto_assign: true,
  },
  personal_cards_settings: {
    enabled: true,
    personal_cards_data_aggregator: 'YODLEE',
  },
  expense_form_autofills: {
    allowed: true,
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
    enabled: false,
    skip_add_bank_account: false,
    skip_link_card: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    allowed_payment_modes: [AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY],
  },
};

export const orgUserSettingsWoPaymentModes: OrgUserSettings = {
  ...orgUserSettingsData,
  payment_mode_settings: {
    allowed: false,
    enabled: false,
    allowed_payment_modes: [AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY],
  },
};

export const orgUserSettingsWoPayModesCompany: OrgUserSettings = {
  ...orgUserSettingsWoPaymentModes,
  preferences: {
    default_project_id: 3943,
    default_vehicle_type: 'four_wheeler',
    default_payment_mode: 'COMPANY_ACCOUNT',
  },
};

export const orgUserSettingsData2: OrgUserSettings = {
  id: 'ousS9MgDNQ6NB',
  created_at: new Date('2018-02-01T02:32:25.275Z'),
  updated_at: new Date('2023-02-03T14:01:22.940Z'),
  org_user_id: 'ouX8dwsbLCLv',
  auto_fyle_settings: {
    allowed: false,
    enabled: false,
    background_enabled: false,
  },
  mileage_settings: {
    mileage_rate_labels: ['new policy test', 'test 2'],
    annual_mileage_of_user_before_joining_fyle: {
      two_wheeler: null,
      four_wheeler: null,
      four_wheeler1: null,
      four_wheeler3: null,
      four_wheeler4: null,
      bicycle: null,
      electric_car: null,
    },
  },
  cost_center_ids: [13792, 13793, 13794, 14018, 13795, 13995, 9493, 9494, 13785, 13787, 13788, 13789, 13790, 13791],
  project_ids: [290054, 316444, 316446, 149230, 316442, 316443],
  cost_center_settings: {
    default_cost_center_id: 13792,
    default_cost_center_name: '002 cs',
  },
  per_diem_rate_settings: {
    allowed_per_diem_ids: [606, 621, 634, 639, 1642, 2618, 3932, 508, 5017, 5465, 5812, 5814, 5835, 510, 5777, 5419],
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
    enabled: true,
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
      unsubscribed_events: [
        'ESTATUSES_CREATED_TXN',
        'ETXNS_ADMIN_REMOVED',
        'ETXNS_ADMIN_UPDATED',
        'EREIMBURSEMENTS_COMPLETED',
        'EADVANCE_REQUESTS_CREATED',
        'EADVANCE_REQUESTS_UPDATED',
        'EADVANCE_REQUESTS_INQUIRY',
        'EADVANCE_REQUESTS_APPROVED',
        'EADVANCES_CREATED',
        'EADVANCE_REQUESTS_REJECTED',
      ],
    },
    push: {
      allowed: true,
      enabled: true,
      unsubscribed_events: ['ESTATUSES_CREATED_TXN', 'ESTATUSES_CREATED_RPT', 'EADVANCES_CREATED'],
    },
    whatsapp: {
      allowed: false,
      enabled: false,
    },
    notify_user: true,
    notify_delegatee: true,
  },
  currency_settings: {
    enabled: false,
    preferred_currency: 'GNF',
  },
  preferences: {
    default_project_id: 3943,
    default_vehicle_type: 'four_wheeler',
    default_payment_mode: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
  },
  locale: {
    timezone: 'America/North_Dakota/New_Salem',
    abbreviation: 'CDT',
    offset: '-05:00:00',
  },
  in_app_chat_settings: {
    allowed: true,
    enabled: true,
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
    allowed: true,
    enabled: true,
  },
  bank_data_aggregation_settings: {
    enabled: true,
    aggregator: 'YODLEE',
    auto_assign: true,
  },
  personal_cards_settings: {
    enabled: true,
    personal_cards_data_aggregator: 'YODLEE',
  },
  expense_form_autofills: {
    allowed: true,
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
    enabled: false,
    skip_add_bank_account: false,
    skip_link_card: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    allowed_payment_modes: [AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY],
  },
};

export const orgUserSettingsData3: OrgUserSettings = {
  id: 'ousS9MgDNQ6NB',
  created_at: new Date('2018-02-01T02:32:25.275Z'),
  updated_at: new Date('2023-02-08T10:04:47.852Z'),
  org_user_id: 'ouX8dwsbLCLv',
  auto_fyle_settings: {
    allowed: false,
    enabled: false,
    background_enabled: false,
  },
  mileage_settings: {
    mileage_rate_labels: ['new policy test', 'test 2'],
    annual_mileage_of_user_before_joining_fyle: {
      two_wheeler: null,
      four_wheeler: null,
      four_wheeler1: null,
      four_wheeler3: null,
      four_wheeler4: null,
      bicycle: null,
      electric_car: null,
    },
  },
  cost_center_ids: [13792, 13793, 13794, 14018, 13795, 13995, 9493, 9494, 13785, 13787, 13788, 13789, 13790, 13791],
  project_ids: [290054, 316444, 316446, 149230, 316442, 316443],
  cost_center_settings: {
    default_cost_center_id: 13792,
    default_cost_center_name: '002 cs',
  },
  per_diem_rate_settings: {
    allowed_per_diem_ids: [606, 621, 634, 639, 1642, 2618, 3932, 508, 5017, 5465, 5812, 5814, 5835, 510, 5777, 5419],
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
    enabled: true,
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
      unsubscribed_events: [
        'ESTATUSES_CREATED_TXN',
        'ETXNS_ADMIN_REMOVED',
        'ETXNS_ADMIN_UPDATED',
        'EREIMBURSEMENTS_COMPLETED',
        'EADVANCE_REQUESTS_CREATED',
        'EADVANCE_REQUESTS_UPDATED',
        'EADVANCE_REQUESTS_INQUIRY',
        'EADVANCE_REQUESTS_APPROVED',
        'EADVANCES_CREATED',
        'EADVANCE_REQUESTS_REJECTED',
      ],
    },
    push: {
      allowed: true,
      enabled: true,
      unsubscribed_events: ['ESTATUSES_CREATED_TXN', 'ESTATUSES_CREATED_RPT', 'EADVANCES_CREATED'],
    },
    whatsapp: {
      allowed: false,
      enabled: false,
    },
    notify_user: true,
    notify_delegatee: true,
  },
  currency_settings: {
    enabled: false,
    preferred_currency: 'GNF',
  },
  preferences: {
    default_project_id: 3943,
    default_vehicle_type: 'four_wheeler',
    default_payment_mode: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
  },
  locale: {
    timezone: 'America/North_Dakota/New_Salem',
    abbreviation: 'CDT',
    offset: '-05:00:00',
  },
  in_app_chat_settings: {
    allowed: true,
    enabled: true,
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
    allowed: true,
    enabled: true,
  },
  bank_data_aggregation_settings: {
    enabled: true,
    aggregator: 'YODLEE',
    auto_assign: true,
  },
  personal_cards_settings: {
    enabled: true,
    personal_cards_data_aggregator: 'YODLEE',
  },
  expense_form_autofills: {
    allowed: true,
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
    enabled: false,
    skip_add_bank_account: false,
    skip_link_card: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    allowed_payment_modes: [AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY],
  },
};

export const orgUserSettingsDataWoCCIDs: OrgUserSettings = {
  id: 'ousS9MgDNQ6NB',
  created_at: new Date('2018-02-01T02:32:25.275Z'),
  updated_at: new Date('2023-01-23T09:47:32.266Z'),
  org_user_id: 'ouX8dwsbLCLv',
  auto_fyle_settings: {
    allowed: false,
    enabled: false,
    background_enabled: false,
  },
  mileage_settings: {
    mileage_rate_labels: ['new policy test', 'test 2'],
    annual_mileage_of_user_before_joining_fyle: {
      two_wheeler: null,
      four_wheeler: null,
      four_wheeler1: null,
      four_wheeler3: null,
      four_wheeler4: null,
      bicycle: null,
      electric_car: null,
    },
  },
  cost_center_ids: [],
  project_ids: [290054, 316444, 316446, 149230, 316442, 316443],
  cost_center_settings: {
    default_cost_center_id: 13792,
    default_cost_center_name: '002 cs',
  },
  per_diem_rate_settings: {
    allowed_per_diem_ids: [606, 621, 634, 639, 1642, 2618, 3932, 508, 5017, 5465, 5812, 5814, 5835, 510, 5777, 5419],
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
    enabled: true,
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
      unsubscribed_events: [
        'ESTATUSES_CREATED_TXN',
        'ETXNS_ADMIN_REMOVED',
        'ETXNS_ADMIN_UPDATED',
        'EREIMBURSEMENTS_COMPLETED',
        'EADVANCE_REQUESTS_CREATED',
        'EADVANCE_REQUESTS_UPDATED',
        'EADVANCE_REQUESTS_INQUIRY',
        'EADVANCE_REQUESTS_APPROVED',
        'EADVANCES_CREATED',
        'EADVANCE_REQUESTS_REJECTED',
      ],
    },
    push: {
      allowed: true,
      enabled: true,
      unsubscribed_events: ['ESTATUSES_CREATED_TXN', 'ESTATUSES_CREATED_RPT', 'EADVANCES_CREATED'],
    },
    whatsapp: {
      allowed: false,
      enabled: false,
    },
    notify_user: true,
    notify_delegatee: true,
  },
  currency_settings: {
    enabled: false,
    preferred_currency: 'GNF',
  },
  preferences: {
    default_project_id: 3943,
    default_vehicle_type: 'four_wheeler',
    default_payment_mode: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
  },
  locale: {
    timezone: 'America/North_Dakota/New_Salem',
    abbreviation: 'CDT',
    offset: '-05:00:00',
  },
  in_app_chat_settings: {
    allowed: true,
    enabled: true,
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
    allowed: true,
    enabled: true,
  },
  bank_data_aggregation_settings: {
    enabled: true,
    aggregator: 'YODLEE',
    auto_assign: true,
  },
  personal_cards_settings: {
    enabled: true,
    personal_cards_data_aggregator: 'YODLEE',
  },
  expense_form_autofills: {
    allowed: true,
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
    enabled: false,
    skip_add_bank_account: false,
    skip_link_card: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    allowed_payment_modes: [AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY],
  },
};

export const orgUserSettingsWithCurrency: OrgUserSettings = {
  ...orgUserSettingsData,
  currency_settings: {
    enabled: true,
    preferred_currency: 'USD',
  },
};

export const orgUserSettingsWoDefaultProject: OrgUserSettings = {
  ...orgUserSettingsData,
  preferences: {
    ...orgUserSettingsData.preferences,
    default_project_id: null,
  },
};

export const orgUserSettingsWoProjects: OrgUserSettings = {
  ...orgUserSettingsData,
  project_ids: null,
};
