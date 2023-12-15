import { AllowedPaymentModes } from '../models/allowed-payment-modes.enum';
import {
  AccountingExportSettings,
  IncomingAccountObject,
  OrgSettings,
  OrgSettingsResponse,
} from '../models/org-settings.model';

export const orgSettingsGetData: OrgSettings = {
  org_id: 'orNVthTo2Zyo',
  mileage: {
    allowed: true,
    enabled: true,
    location_mandatory: true,
    unit: 'MILES',
    fiscal_year_start_date: '01-5',
    fiscal_year_end_date: '01-4',
    two_wheeler: 0.545,
    four_wheeler: 0.545,
    four_wheeler1: 0.7,
    four_wheeler3: 101,
    four_wheeler4: null,
    bicycle: 5,
    electric_car: null,
    two_wheeler_slabbed_rate: 0.4,
    four_wheeler_slabbed_rate: null,
    four_wheeler1_slabbed_rate: 32,
    four_wheeler3_slabbed_rate: null,
    four_wheeler4_slabbed_rate: null,
    bicycle_slabbed_rate: 10,
    electric_car_slabbed_rate: null,
    two_wheeler_distance_limit: 10,
    four_wheeler_distance_limit: null,
    four_wheeler1_distance_limit: 33,
    four_wheeler3_distance_limit: null,
    four_wheeler4_distance_limit: null,
    bicycle_distance_limit: 10,
    electric_car_distance_limit: null,
    enable_individual_mileage_rates: true,
  },
  mobile_app_view_report_beta_enabled: true,
  advances: {
    allowed: true,
    enabled: true,
  },
  projects: {
    allowed: true,
    enabled: true,
  },
  advanced_projects: {
    allowed: true,
    enabled: true,
    enable_individual_projects: true,
  },
  advance_requests: {
    allowed: true,
    enabled: true,
  },
  cost_centers: {
    allowed: true,
    enabled: true,
  },
  policies: {
    allowed: true,
    enabled: true,
    self_serve_enabled: true,
    duplicate_detection_enabled: true,
    trip_request_policy_enabled: true,
    policyApprovalWorkflow: true,
  },
  org_creation: {
    allowed: true,
    enabled: true,
  },
  org_expense_form_autofills: {
    allowed: true,
    enabled: true,
  },
  admin_allowed_ip_settings: {
    allowed: true,
    enabled: true,
    allowed_cidrs: [],
  },
  admin_email_settings: {
    allowed: true,
    enabled: true,
    unsubscribed_events: [],
  },
  receipt_settings: {
    enabled: true,
    allowed: true,
    enable_magnifier: null,
  },
  corporate_credit_card_settings: {
    allowed: true,
    enabled: true,
    bank_statement_upload_settings: {
      enabled: true,
      generic_statement_parser_enabled: true,
      bank_statement_parser_endpoint_settings: [
        {
          bank_name: 'AMerican Express - Excel statement - LT',
          file_type: '.xls',
          parser_url: '/laguna_tools_amex_ccc',
        },
        {
          bank_name: 'American Express - Excel Statement - SP',
          file_type: '.xls',
          parser_url: '/structure_properties_amex_ccc',
        },
        {
          bank_name: 'Bank of America',
          file_type: '.pdf',
          parser_url: '/pipeline_solutions_bofa_ccc',
        },
      ],
    },
    bank_data_aggregation_settings: {
      enabled: true,
      aggregator: null,
    },
    auto_match_allowed: true,
    enable_auto_match: true,
    allow_approved_plus_states: true,
  },
  bank_feed_request_settings: {
    allowed: true,
    enabled: true,
    bank_name: 'afd',
    card_provider: 'asdf',
    number_of_cards: 3,
    status: 'IN_PROGRESS',
    last_updated_at: null,
    secret_key: 'bank-feed-request6iR9g13ks9',
  },
  ach_settings: {
    enabled: true,
    allowed: true,
    provider: 'dwolla',
    expedite_source: true,
    expedite_destination: true,
    pipeline_amount_limit: null,
  },
  per_diem: {
    allowed: true,
    enabled: true,
    enable_individual_per_diem_rates: true,
  },
  access_delegation: {
    allowed: true,
    enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: 'Tax Amount',
    groups: [
      {
        name: 'sdds',
        percentage: 0.01,
      },
      {
        name: 'Services Standard Purchase',
        percentage: 0.2,
      },
      {
        name: 'GST',
        percentage: 0.05,
      },
      {
        name: 'Services Standard Purchase (20%)',
        percentage: 0.2,
      },
      {
        name: 'This is a very long tax group',
        percentage: 0.01,
      },
      {
        name: 'Tax group name',
        percentage: 0.02,
      },
    ],
  },
  integrations_settings: {
    allowed: true,
    enabled: true,
    integrations: [],
  },
  taxi_settings: {
    allowed: true,
    distance_mandatory: true,
  },
  expense_limit_settings: {
    policy_ids: ['tprIXMh8y1WXN', 'tpr1iLLz3JkLT', 'tprxZJGW71PvH'],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: true,
    enable_secondary_approvers: true,
    enable_sequential_approvers: true,
    allow_user_add_trip_request_approvers: null,
  },
  accounting: {
    enabled: true,
    type: null,
    settings: {
      enabled: true,
      export_name: null,
      export_type: null,
      entries_generator_info: null,
      entries_exporter_info: null,
      custom_fields: null,
      separate_org_user_advance_ledger: true,
      collapse_expenses: true,
    },
    integration_exports_enabled: true,
  },
  transaction_fields_settings: {
    allowed: true,
    enabled: true,
    transaction_mandatory_fields: {
      category: true,
      purpose: true,
      vendor: null,
      project: true,
      cost_center: null,
      flight_travel_class: null,
      train_travel_class: null,
      hotel_city: null,
      hotel_check_in: null,
      hotel_check_out: null,
    },
  },
  org_user_fields_settings: {
    allowed: true,
    enabled: true,
    org_user_mandatory_fields: {
      employee_id: true,
      title: true,
      level: null,
      business_unit: true,
      department: null,
      sub_department: null,
      mobile: null,
      location: null,
      bank_details: true,
      approver1: true,
      approver2: true,
      approver3: true,
      joining_dt: true,
    },
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: {
      activity: true,
    },
  },
  org_logo_settings: {
    allowed: true,
    enabled: true,
    file_id: 'fiZU3RFPLaFK',
  },
  org_branding_settings: {
    allowed: true,
    enabled: true,
  },
  verification: {
    allowed: true,
    mandatory: true,
    late_mode_enabled: true,
  },
  data_extractor_settings: {
    allowed: true,
    enabled: true,
    web_app_pdf: null,
  },
  advance_account_settings: {
    allowed: true,
    multiple_accounts: true,
  },
  settlements_excel_settings: {
    allowed: true,
    cost_center_wise_split: true,
  },
  bank_payment_file_settings: {
    allowed: true,
    enabled: true,
  },
  expense_settings: {
    allowed: true,
    split_expense_settings: {
      enabled: true,
    },
  },
  exchange_rate_settings: {
    allowed: true,
    enabled: true,
  },
  currencylayer_provider_settings: {
    allowed: true,
    enabled: true,
    id: 'CURRENCYLAYER',
    name: 'Currency Layer',
  },
  gmail_addon_settings: {
    allowed: true,
    enabled: true,
  },
  duplicate_detection_settings: {
    allowed: true,
    enabled: true,
  },
  duplicate_detection_v2_settings: {
    allowed: true,
    enabled: true,
  },
  custom_category_settings: {
    allowed: true,
    enabled: true,
  },
  bulk_fyle_settings: {
    allowed: true,
    enabled: true,
  },
  auto_reminder_settings: {
    allowed: true,
    enabled: true,
  },
  analytics_settings: {
    allowed: true,
    enabled: true,
  },
  advanced_rbac_settings: {
    allowed: true,
    enabled: true,
  },
  sso_integration_settings: {
    allowed: true,
    enabled: true,
    idp_name: null,
    meta_data_file_id: null,
  },
  advanced_access_delegation_settings: {
    allowed: true,
    enabled: true,
  },
  dynamic_form_settings: {
    allowed: true,
    enabled: true,
  },
  budget_settings: {
    allowed: true,
    enabled: true,
  },
  saved_filters_settings: {
    allowed: true,
    enabled: true,
  },
  org_currency_settings: {
    allowed: true,
    enabled: true,
  },
  recurrences_settings: {
    allowed: true,
    enabled: true,
  },
  mis_reporting_settings: {
    allowed: true,
    enabled: true,
  },
  risk_score_settings: {
    allowed: true,
    enabled: true,
  },
  workflow_settings: {
    allowed: true,
    enabled: true,
    report_workflow_settings: undefined,
  },
  org_personal_cards_settings: {
    allowed: true,
    enabled: true,
  },
  ccc_draft_expense_settings: {
    allowed: true,
    enabled: true,
  },
  expense_widget_settings: {
    allowed: true,
    enabled: true,
  },
  payment_mode_settings: {
    allowed: null,
    enabled: null,
    payment_modes_order: null,
  },
  company_expenses_beta_settings: {
    allowed: true,
    enabled: true,
  },
  visa_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  mastercard_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  card_assignment_settings: {
    allowed: true,
    enabled: true,
  },
  in_app_chat_settings: {
    allowed: true,
    enabled: true,
  },
  trip_request_fields_settings: undefined,
  bank_data_aggregation_settings: undefined,
  data_extraction_settings: undefined,
  transaction_field_configurations: [],
  transaction_reversal_settings: {
    allowed: true,
    enabled: true,
  },
  auto_match_settings: {
    allowed: true,
    enabled: true,
  },
  universal_statement_parser_settings: {
    allowed: true,
    enabled: true,
  },
  simplified_report_closure_settings: {
    allowed: false,
    enabled: false,
  },
  mobile_app_my_expenses_beta_enabled: false,
};

export const orgSettingsPostData: OrgSettingsResponse = {
  org_id: 'orNVthTo2Zyo',
  project_settings: {
    allowed: true,
    enabled: true,
  },
  mobile_app_view_report_beta_enabled: true,
  advanced_project_settings: {
    allowed: true,
    enabled: true,
    enable_individual_projects: true,
  },
  org_cost_center_settings: {
    allowed: true,
    enabled: true,
  },
  exchange_rate_settings: {
    allowed: true,
    enabled: true,
  },
  currencylayer_provider_settings: {
    allowed: true,
    enabled: true,
  },
  trip_request_settings: {},
  advances_settings: {
    allowed: true,
    enabled: true,
    advance_requests_enabled: true,
  },
  org_mileage_settings: {
    allowed: true,
    enabled: true,
    mileage_location_enabled: true,
  },
  multi_org_settings: {
    allowed: true,
    enabled: true,
  },
  admin_allowed_ip_settings: {
    allowed: true,
    enabled: true,
    allowed_cidrs: [],
  },
  admin_email_settings: {
    allowed: true,
    enabled: true,
    unsubscribed_events: [],
  },
  org_access_delegation_settings: {
    allowed: true,
    enabled: true,
  },
  org_personal_cards_settings: {
    allowed: true,
    enabled: true,
  },
  per_diem_settings: {
    allowed: true,
    enabled: true,
    enable_individual_per_diem_rates: true,
  },
  mileage_details: {
    unit: 'MILES',
    fiscal_year_start_date: '01-5',
    fiscal_year_end_date: '01-4',
    two_wheeler: 0.545,
    four_wheeler: 0.545,
    four_wheeler1: 0.7,
    four_wheeler3: 101,
    four_wheeler4: null,
    bicycle: 5,
    electric_car: null,
    two_wheeler_slabbed_rate: 0.4,
    four_wheeler_slabbed_rate: null,
    four_wheeler1_slabbed_rate: 32,
    four_wheeler3_slabbed_rate: null,
    four_wheeler4_slabbed_rate: null,
    bicycle_slabbed_rate: 10,
    electric_car_slabbed_rate: null,
    two_wheeler_distance_limit: 10,
    four_wheeler_distance_limit: null,
    four_wheeler1_distance_limit: 33,
    four_wheeler3_distance_limit: null,
    four_wheeler4_distance_limit: null,
    bicycle_distance_limit: 10,
    electric_car_distance_limit: null,
    location_mandatory: true,
    enable_individual_mileage_rates: true,
  },
  policy_settings: {
    allowed: true,
    is_duplicate_detection_enabled: true,
    is_enabled: true,
    policy_approval_workflow: true,
    is_self_serve_enabled: true,
    is_trip_request_policy_enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: 'Tax Amount',
    groups: [
      {
        name: 'sdds',
        percentage: 0.01,
      },
      {
        name: 'Services Standard Purchase',
        percentage: 0.2,
      },
      {
        name: 'GST',
        percentage: 0.05,
      },
      {
        name: 'Services Standard Purchase (20%)',
        percentage: 0.2,
      },
      {
        name: 'This is a very long tax group',
        percentage: 0.01,
      },
      {
        name: 'Tax group name',
        percentage: 0.02,
      },
    ],
  },
  receipt_settings: {
    enabled: true,
    allowed: true,
    enable_magnifier: null,
  },
  corporate_credit_card_settings: {
    allowed: true,
    allow_approved_plus_states: true,
    enabled: true,
    auto_match_allowed: true,
    enable_auto_match: true,
    bank_data_aggregation_settings: {
      enabled: true,
      aggregator: null,
      auto_assign: null,
    },
    bank_statement_upload_settings: {
      enabled: true,
      generic_statement_parser_enabled: true,
      bank_statement_parser_endpoint_settings: [
        {
          bank_name: 'AMerican Express - Excel statement - LT',
          file_type: '.xls',
          parser_url: '/laguna_tools_amex_ccc',
        },
        {
          bank_name: 'American Express - Excel Statement - SP',
          file_type: '.xls',
          parser_url: '/structure_properties_amex_ccc',
        },
        {
          bank_name: 'Bank of America',
          file_type: '.pdf',
          parser_url: '/pipeline_solutions_bofa_ccc',
        },
      ],
    },
  },
  bank_feed_request_settings: {
    allowed: true,
    enabled: true,
    bank_name: 'afd',
    card_provider: 'asdf',
    number_of_cards: 3,
    status: 'IN_PROGRESS',
    last_updated_at: null,
    secret_key: 'bank-feed-request6iR9g13ks9',
  },
  ach_settings: {
    enabled: true,
    allowed: true,
    provider: 'dwolla',
    expedite_source: true,
    expedite_destination: true,
    pipeline_amount_limit: null,
  },
  taxi_settings: {
    allowed: true,
    distance_mandatory: true,
  },
  integrations_settings: {
    allowed: true,
    enabled: true,
    integrations: [],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: true,
    enable_secondary_approvers: true,
    enable_sequential_approvers: true,
    allow_user_add_trip_request_approvers: null,
  },
  accounting_export_settings: {
    allowed: true,
    accounting_settings: {
      enabled: true,
      export_name: null,
      export_type: null,
      entries_generator_info: null,
      entries_exporter_info: null,
      custom_fields: null,
      separate_org_user_advance_ledger: true,
      collapse_expenses: true,
    },
    integration_exports_enabled: true,
  },
  transaction_fields_settings: {
    allowed: true,
    enabled: true,
    transaction_mandatory_fields: {
      category: true,
      purpose: true,
      vendor: null,
      project: true,
      cost_center: null,
      flight_travel_class: null,
      train_travel_class: null,
      hotel_city: null,
      hotel_check_in: null,
      hotel_check_out: null,
    },
  },
  org_user_fields_settings: {
    allowed: true,
    enabled: true,
    org_user_mandatory_fields: {
      employee_id: true,
      title: true,
      level: null,
      business_unit: true,
      department: null,
      sub_department: null,
      mobile: null,
      location: null,
      bank_details: true,
      approver1: true,
      approver2: true,
      approver3: true,
      joining_dt: true,
    },
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: {
      activity: true,
    },
  },
  org_logo_settings: {
    allowed: true,
    enabled: true,
    file_id: 'fiZU3RFPLaFK',
  },
  org_branding_settings: {
    allowed: true,
    enabled: true,
  },
  advance_account_settings: {
    allowed: true,
    multiple_accounts: true,
  },
  verification_settings: {
    allowed: true,
    mandatory: true,
    late_mode_enabled: true,
  },
  bank_payment_file_settings: {
    allowed: true,
    enabled: true,
  },
  expense_settings: {
    allowed: true,
    split_expense_settings: {
      enabled: true,
    },
  },
  transaction_field_configurations: [],
  gmail_addon_settings: {
    allowed: true,
    enabled: true,
  },
  duplicate_detection_settings: {
    allowed: true,
    enabled: true,
  },
  duplicate_detection_v2_settings: {
    allowed: true,
    enabled: true,
  },
  custom_category_settings: {
    allowed: true,
    enabled: true,
  },
  org_bulk_fyle_settings: {
    allowed: true,
    enabled: true,
  },
  auto_reminder_settings: {
    allowed: true,
    enabled: true,
  },
  analytics_settings: {
    allowed: true,
    enabled: true,
  },
  advanced_rbac_settings: {
    allowed: true,
    enabled: true,
  },
  sso_integration_settings: {
    allowed: true,
    enabled: true,
    idp_name: null,
    meta_data_file_id: null,
  },
  advanced_access_delegation_settings: {
    allowed: true,
    enabled: true,
  },
  dynamic_form_settings: {
    allowed: true,
    enabled: true,
  },
  budget_settings: {
    allowed: true,
    enabled: true,
  },
  org_currency_settings: {
    allowed: true,
    enabled: true,
  },
  expense_limit_settings: {
    policy_ids: ['tprIXMh8y1WXN', 'tpr1iLLz3JkLT', 'tprxZJGW71PvH'],
  },
  recurrences_settings: {
    allowed: true,
    enabled: true,
  },
  workflow_settings: {
    allowed: true,
    enabled: true,
    report_workflow_settings: undefined,
  },
  card_assignment_settings: {
    allowed: true,
    enabled: true,
  },
  transaction_reversal_settings: {
    allowed: true,
    enabled: true,
  },
  auto_match_settings: {
    allowed: true,
    enabled: true,
  },
  universal_statement_parser_settings: {
    allowed: true,
    enabled: true,
  },
  org_in_app_chat_settings: {
    allowed: true,
    enabled: true,
  },
  ccc_draft_expense_settings: {
    allowed: true,
    enabled: true,
  },
  expense_widget_settings: {
    allowed: true,
    enabled: true,
  },
  org_expense_form_autofills: {
    allowed: true,
    enabled: true,
  },
  company_expenses_beta_settings: {
    allowed: true,
    enabled: true,
  },
  visa_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  mastercard_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  saved_filters_settings: {
    allowed: true,
    enabled: true,
  },
  mis_reporting_settings: {
    allowed: true,
    enabled: true,
  },
  risk_score_settings: {
    allowed: true,
    enabled: true,
  },
  payment_mode_settings: {
    allowed: null,
    enabled: null,
    payment_modes_order: null,
  },
  data_extractor_settings: {
    allowed: true,
    enabled: true,
    web_app_pdf: null,
  },
  settlements_excel_settings: {
    allowed: true,
    cost_center_wise_split: true,
  },
  simplified_report_closure_settings: {
    allowed: false,
    enabled: false,
  },
  mobile_app_my_expenses_beta_enabled: false,
};

export const outgoingTallyAccountObj: AccountingExportSettings = {
  allowed: undefined,
  tally_settings: {
    enabled: true,
    default_org_category_ledger_name: null,
    default_org_user_personal_ledger_name: null,
    separate_org_user_advance_ledger: true,
    default_org_user_advance_ledger_name: null,
    expense_dt: null,
    advance_dt: null,
    reimbursement_dt: null,
    refund_dt: null,
    cost_center: null,
    cost_category: null,
    collapse_expenses: true,
    blocked_payment_types: [],
  },
  integration_exports_enabled: true,
};

export const incomingTallyAccoutingObj: IncomingAccountObject = {
  enabled: true,
  type: 'TALLY',
  settings: {
    enabled: true,
    default_org_category_ledger_name: null,
    default_org_user_personal_ledger_name: null,
    separate_org_user_advance_ledger: true,
    default_org_user_advance_ledger_name: null,
    expense_dt: null,
    advance_dt: null,
    reimbursement_dt: null,
    refund_dt: null,
    cost_center: null,
    cost_category: null,
    collapse_expenses: true,
    blocked_payment_types: [],
  },
  integration_exports_enabled: true,
};

export const outgoingQuickbooksAccountObj: AccountingExportSettings = {
  allowed: undefined,
  quick_books_settings: {
    enabled: true,
    expense_dt: null,
    advance_dt: null,
    expense_type: null,
    advance_type: null,
    collapse_expenses: true,
    enable_departments: true,
    enable_classes: true,
    debit_ledger_calculation_key: null,
    account_mappings: null,
    separate_org_user_advance_ledger: true,
  },
  integration_exports_enabled: true,
};

export const incomingQuickbooksAccoutingObj: IncomingAccountObject = {
  enabled: true,
  type: 'QUICKBOOKS',
  settings: {
    enabled: true,
    expense_dt: null,
    advance_dt: null,
    expense_type: null,
    advance_type: null,
    collapse_expenses: true,
    enable_departments: true,
    enable_classes: true,
    debit_ledger_calculation_key: null,
    account_mappings: null,
    separate_org_user_advance_ledger: true,
  },
  integration_exports_enabled: true,
};

export const outgoingAccountSettingsObj: AccountingExportSettings = {
  allowed: undefined,
  accounting_settings: {
    enabled: true,
    export_name: null,
    export_type: null,
    entries_generator_info: null,
    entries_exporter_info: null,
    custom_fields: null,
    separate_org_user_advance_ledger: true,
    collapse_expenses: true,
  },
  integration_exports_enabled: true,
};

export const incomingAccountSettingsObj: IncomingAccountObject = {
  enabled: true,
  type: null,
  settings: {
    enabled: true,
    export_name: null,
    export_type: null,
    entries_generator_info: null,
    entries_exporter_info: null,
    custom_fields: null,
    separate_org_user_advance_ledger: true,
    collapse_expenses: true,
  },
  integration_exports_enabled: true,
};

export const incomingAccountingObj: IncomingAccountObject = {
  enabled: false,
  type: null,
  settings: null,
  integration_exports_enabled: undefined,
};

export const incomingTallyAccountingObjWithoutSettings: IncomingAccountObject = {
  enabled: false,
  type: 'TALLY',
  settings: null,
  integration_exports_enabled: false,
};

export const incomingQuickbooksAccountingObjWithoutSettings: IncomingAccountObject = {
  enabled: false,
  type: 'QUICKBOOKS',
  settings: null,
  integration_exports_enabled: false,
};

export const outgoingAccountingTallyObjWithoutSettings: AccountingExportSettings = {
  allowed: undefined,
  integration_exports_enabled: false,
  tally_settings: {},
};

export const outgoingAccountingQuickbooksObjWithoutSettings: AccountingExportSettings = {
  allowed: undefined,
  integration_exports_enabled: false,
  quick_books_settings: {},
};

export const orgSettingsData: OrgSettings = {
  org_id: 'orNVthTo2Zyo',
  mileage: {
    allowed: true,
    enabled: true,
    location_mandatory: false,
    unit: 'KM',
    fiscal_year_start_date: '05-2',
    fiscal_year_end_date: '05-1',
    two_wheeler: 221,
    four_wheeler: 11,
    four_wheeler1: 89,
    four_wheeler3: 12,
    four_wheeler4: 14,
    bicycle: null,
    electric_car: 15.001,
    two_wheeler_slabbed_rate: 0.92,
    four_wheeler_slabbed_rate: 1000,
    four_wheeler1_slabbed_rate: 12,
    four_wheeler3_slabbed_rate: 11,
    four_wheeler4_slabbed_rate: 122,
    bicycle_slabbed_rate: null,
    electric_car_slabbed_rate: null,
    two_wheeler_distance_limit: 10,
    four_wheeler_distance_limit: 2000,
    four_wheeler1_distance_limit: 12212,
    four_wheeler3_distance_limit: 111111,
    four_wheeler4_distance_limit: 22,
    bicycle_distance_limit: null,
    electric_car_distance_limit: null,
    enable_individual_mileage_rates: false,
  },
  advances: {
    allowed: true,
    enabled: false,
  },
  projects: {
    allowed: true,
    enabled: true,
  },
  advanced_projects: {
    allowed: true,
    enabled: true,
    enable_individual_projects: false,
  },
  advance_requests: {
    allowed: true,
    enabled: true,
  },
  cost_centers: {
    allowed: true,
    enabled: true,
  },
  policies: {
    allowed: true,
    enabled: true,
    self_serve_enabled: true,
    duplicate_detection_enabled: true,
    policyApprovalWorkflow: true,
  },
  org_creation: {
    allowed: true,
    enabled: true,
  },
  admin_allowed_ip_settings: {
    allowed: true,
    enabled: false,
    allowed_cidrs: [],
  },
  admin_email_settings: {
    allowed: true,
    enabled: true,
    unsubscribed_events: [],
  },
  org_personal_cards_settings: {
    allowed: true,
    enabled: false,
  },
  receipt_settings: {
    enabled: false,
    allowed: true,
    enable_magnifier: true,
  },
  corporate_credit_card_settings: {
    allowed: true,
    allow_approved_plus_states: true,
    enabled: true,
    auto_match_allowed: true,
    enable_auto_match: true,
    bank_data_aggregation_settings: {
      enabled: false,
      aggregator: null,
    },
    bank_statement_upload_settings: {
      enabled: true,
      generic_statement_parser_enabled: true,
      bank_statement_parser_endpoint_settings: [],
    },
  },
  bank_data_aggregation_settings: {
    allowed: true,
    enabled: true,
    date_to_sync_from: null,
  },
  bank_feed_request_settings: {
    allowed: true,
    enabled: true,
    bank_name: 'asdf',
    card_provider: 'asdfasdf',
    number_of_cards: 32,
    status: 'SUCCESS',
    last_updated_at: '2022-04-04T00:00:00.000Z',
    secret_key: 'bank-feed-request22XwcjgnSH',
  },
  ach_settings: {
    enabled: true,
    allowed: true,
    provider: 'dwolla',
    expedite_source: false,
    expedite_destination: false,
    pipeline_amount_limit: null,
  },
  per_diem: {
    allowed: true,
    enabled: true,
    enable_individual_per_diem_rates: true,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    payment_modes_order: [
      AllowedPaymentModes.PERSONAL_ACCOUNT,
      AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
      AllowedPaymentModes.COMPANY_ACCOUNT,
    ],
  },
  access_delegation: {
    allowed: true,
    enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: 'Tax Amount',
    groups: [
      {
        name: 'sdds',
        percentage: 0.01,
      },
      {
        name: 'Services Standard Purchase',
        percentage: 0.2,
      },
      {
        name: 'GST',
        percentage: 0.05,
      },
      {
        name: 'Services Standard Purchase (20%)',
        percentage: 0.2,
      },
      {
        name: 'This is a very long tax group',
        percentage: 0.01,
      },
      {
        name: 'thisisagainalongtaxgroupnamethisisagainalongtaxgroupnamethisisagainalongtaxgroupname',
        percentage: 0.02,
      },
    ],
  },
  integrations_settings: {
    allowed: false,
    enabled: false,
    integrations: [],
  },
  taxi_settings: {
    allowed: true,
    distance_mandatory: false,
  },
  expense_limit_settings: {
    policy_ids: ['tpr0QmbaymHDz', 'tprG2mAS2ec16'],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: true,
    enable_secondary_approvers: true,
    enable_sequential_approvers: true,
  },
  accounting: {
    enabled: false,
    type: null,
    settings: null,
    integration_exports_enabled: false,
  },
  transaction_fields_settings: {
    allowed: true,
    enabled: true,
    transaction_mandatory_fields: {
      category: true,
      purpose: null,
      vendor: null,
      project: false,
      cost_center: null,
      flight_travel_class: null,
      train_travel_class: null,
      hotel_city: null,
      hotel_check_in: null,
      hotel_check_out: null,
    },
  },
  org_user_fields_settings: {
    allowed: true,
    enabled: true,
    org_user_mandatory_fields: {
      employee_id: false,
      title: false,
      level: null,
      business_unit: false,
      department: null,
      sub_department: null,
      mobile: null,
      location: null,
      bank_details: true,
      approver1: false,
      approver2: false,
      approver3: false,
      joining_dt: true,
    },
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: null,
  },
  org_logo_settings: {
    allowed: true,
    enabled: true,
    file_id: null,
  },
  org_branding_settings: {
    allowed: true,
    enabled: true,
  },
  verification: {
    allowed: true,
    mandatory: true,
    late_mode_enabled: true,
  },
  data_extractor_settings: {
    allowed: true,
    enabled: true,
  },
  advance_account_settings: {
    allowed: true,
    multiple_accounts: true,
  },
  settlements_excel_settings: {
    allowed: true,
    cost_center_wise_split: false,
  },
  bank_payment_file_settings: {
    allowed: true,
    enabled: false,
  },
  expense_settings: {
    allowed: true,
    split_expense_settings: {
      enabled: true,
    },
  },
  exchange_rate_settings: {
    allowed: true,
    enabled: true,
  },
  currencylayer_provider_settings: {
    allowed: true,
    enabled: true,
    id: 'CURRENCYLAYER',
    name: 'Currency Layer',
  },
  transaction_field_configurations: [],
  gmail_addon_settings: {
    allowed: false,
    enabled: false,
  },
  duplicate_detection_settings: {
    allowed: true,
    enabled: true,
  },
  custom_category_settings: {
    allowed: true,
    enabled: true,
  },
  bulk_fyle_settings: {
    allowed: true,
    enabled: true,
  },
  auto_reminder_settings: {
    allowed: true,
    enabled: true,
  },
  analytics_settings: {
    allowed: true,
    enabled: true,
  },
  advanced_rbac_settings: {
    allowed: true,
    enabled: true,
  },
  sso_integration_settings: {
    allowed: false,
    enabled: false,
    idp_name: null,
    meta_data_file_id: null,
  },
  advanced_access_delegation_settings: {
    allowed: true,
    enabled: true,
  },
  dynamic_form_settings: {
    allowed: true,
    enabled: true,
  },
  budget_settings: {
    allowed: true,
    enabled: true,
  },
  saved_filters_settings: {
    allowed: true,
    enabled: true,
  },
  org_currency_settings: {
    allowed: true,
    enabled: true,
  },
  recurrences_settings: {
    allowed: true,
    enabled: true,
  },
  mis_reporting_settings: {
    allowed: true,
    enabled: true,
  },
  risk_score_settings: {
    allowed: false,
    enabled: false,
  },
  workflow_settings: {
    allowed: true,
    enabled: true,
    report_workflow_settings: true,
  },
  card_assignment_settings: {
    allowed: true,
    enabled: true,
  },
  transaction_reversal_settings: {
    allowed: false,
    enabled: false,
  },
  auto_match_settings: {
    allowed: true,
    enabled: true,
  },
  universal_statement_parser_settings: {
    allowed: true,
    enabled: true,
  },
  in_app_chat_settings: {
    allowed: true,
    enabled: true,
  },
  ccc_draft_expense_settings: {
    allowed: true,
    enabled: true,
  },
  expense_widget_settings: {
    allowed: true,
    enabled: true,
  },
  org_expense_form_autofills: {
    allowed: true,
    enabled: true,
  },
  visa_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  mastercard_enrollment_settings: {
    allowed: true,
    enabled: true,
  },
  company_expenses_beta_settings: {
    allowed: true,
    enabled: true,
  },
};
