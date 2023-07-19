import { AllowedPaymentModes } from '../models/allowed-payment-modes.enum';
import { OrgSettings } from '../models/org-settings.model';
import { orgSettingsData } from '../test-data/accounts.service.spec.data';

export const orgSettingsRes: OrgSettings = {
  org_id: 'orrjqbDbeP9p',
  mileage: {
    allowed: true,
    enabled: true,
    location_mandatory: true,
    unit: 'MILES',
    fiscal_year_start_date: '01-3',
    fiscal_year_end_date: '01-2',
    two_wheeler: null,
    four_wheeler: null,
    four_wheeler1: 10,
    four_wheeler3: null,
    four_wheeler4: null,
    bicycle: 10,
    electric_car: 122,
    two_wheeler_slabbed_rate: null,
    four_wheeler_slabbed_rate: null,
    four_wheeler1_slabbed_rate: 50,
    four_wheeler3_slabbed_rate: null,
    four_wheeler4_slabbed_rate: null,
    bicycle_slabbed_rate: null,
    electric_car_slabbed_rate: 4,
    two_wheeler_distance_limit: null,
    four_wheeler_distance_limit: null,
    four_wheeler1_distance_limit: 10,
    four_wheeler3_distance_limit: null,
    four_wheeler4_distance_limit: null,
    bicycle_distance_limit: null,
    electric_car_distance_limit: 6,
    enable_individual_mileage_rates: true,
  },
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
    advance_request_policy_enabled: true,
    duplicate_detection_enabled: true,
    policyApprovalWorkflow: true,
  },
  org_creation: {
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
      bank_statement_parser_endpoint_settings: [
        {
          bank_name: 'SAMPLE BANK',
          file_type: '.csv',
          parser_url: '/sample_ccc_statement',
        },
      ],
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
    bank_name: null,
    card_provider: null,
    number_of_cards: null,
    status: 'SUCCESS',
    last_updated_at: '2021-11-19T00:00:00.000Z',
    secret_key: 'bank-feed-requestlOrFEgfbzG',
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
    enable_individual_per_diem_rates: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    payment_modes_order: [AllowedPaymentModes.PERSONAL_ACCOUNT],
  },
  access_delegation: {
    allowed: true,
    enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: 'My spl tax',
    groups: [
      {
        name: 'test_123',
        percentage: 0.07023,
      },
      {
        name: 'QSt',
        percentage: 0.0997501,
      },
      {
        name: 'Pradeep Bhaiyas Taxaaa',
        percentage: 0.1,
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
    policy_ids: [
      'tprCMB6y22gs6',
      'tprXxIQJtGb1g',
      'tprD0by1jg9N4',
      'tprpsIHl7xyeT',
      'tpr5boLBy7uAq',
      'tprRDoXFSLBQj',
      'tpr9Kzm8eIcSy',
      'tpr0H01RDdWZw',
      'tprwBPalwOQjz',
      'tprYdcKzW7vvd',
    ],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: false,
    enable_secondary_approvers: false,
    enable_sequential_approvers: false,
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
      category: false,
      purpose: null,
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
      employee_id: false,
      title: false,
      level: false,
      business_unit: null,
      department: false,
      sub_department: false,
      mobile: null,
      location: false,
      bank_details: false,
      approver1: null,
      approver2: null,
      approver3: null,
      joining_dt: false,
    },
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: {
      activity: false,
    },
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
    mandatory: false,
    late_mode_enabled: false,
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
    enabled: false,
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
    enabled: false,
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

export const orgSettingsParams2: OrgSettings = {
  org_id: 'orrjqbDbeP9p',
  mileage: {
    allowed: true,
    enabled: true,
    location_mandatory: true,
    unit: 'MILES',
    fiscal_year_start_date: '01-3',
    fiscal_year_end_date: '01-2',
    two_wheeler: null,
    four_wheeler: null,
    four_wheeler1: 10,
    four_wheeler3: null,
    four_wheeler4: null,
    bicycle: 10,
    electric_car: 122,
    two_wheeler_slabbed_rate: null,
    four_wheeler_slabbed_rate: null,
    four_wheeler1_slabbed_rate: 50,
    four_wheeler3_slabbed_rate: null,
    four_wheeler4_slabbed_rate: null,
    bicycle_slabbed_rate: null,
    electric_car_slabbed_rate: 4,
    two_wheeler_distance_limit: null,
    four_wheeler_distance_limit: null,
    four_wheeler1_distance_limit: 10,
    four_wheeler3_distance_limit: null,
    four_wheeler4_distance_limit: null,
    bicycle_distance_limit: null,
    electric_car_distance_limit: 6,
    enable_individual_mileage_rates: true,
  },
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
    allowed: false,
    enabled: false,
  },
  cost_centers: {
    allowed: true,
    enabled: true,
  },
  policies: {
    allowed: true,
    enabled: true,
    self_serve_enabled: true,
    advance_request_policy_enabled: true,
    duplicate_detection_enabled: true,
    policyApprovalWorkflow: true,
  },
  org_creation: {
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
      bank_statement_parser_endpoint_settings: [
        {
          bank_name: 'SAMPLE BANK',
          file_type: '.csv',
          parser_url: '/sample_ccc_statement',
        },
      ],
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
    bank_name: null,
    card_provider: null,
    number_of_cards: null,
    status: 'SUCCESS',
    last_updated_at: '2021-11-19T00:00:00.000Z',
    secret_key: 'bank-feed-requestlOrFEgfbzG',
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
    enable_individual_per_diem_rates: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    payment_modes_order: [AllowedPaymentModes.PERSONAL_ACCOUNT],
  },
  access_delegation: {
    allowed: true,
    enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: 'My spl tax',
    groups: [
      {
        name: 'test_123',
        percentage: 0.07023,
      },
      {
        name: 'QSt',
        percentage: 0.0997501,
      },
      {
        name: 'Pradeep Bhaiyas Taxaaa',
        percentage: 0.1,
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
    policy_ids: [
      'tprCMB6y22gs6',
      'tprXxIQJtGb1g',
      'tprD0by1jg9N4',
      'tprpsIHl7xyeT',
      'tpr5boLBy7uAq',
      'tprRDoXFSLBQj',
      'tpr9Kzm8eIcSy',
      'tpr0H01RDdWZw',
      'tprwBPalwOQjz',
      'tprYdcKzW7vvd',
    ],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: false,
    enable_secondary_approvers: false,
    enable_sequential_approvers: false,
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
      category: false,
      purpose: null,
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
      employee_id: false,
      title: false,
      level: false,
      business_unit: null,
      department: false,
      sub_department: false,
      mobile: null,
      location: false,
      bank_details: false,
      approver1: null,
      approver2: null,
      approver3: null,
      joining_dt: false,
    },
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: {
      activity: false,
    },
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
    mandatory: false,
    late_mode_enabled: false,
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
    enabled: false,
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
    enabled: false,
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

export const orgSettingsParamWoCCC: OrgSettings = {
  org_id: 'orrjqbDbeP9p',
  mileage: {
    allowed: true,
    enabled: true,
    location_mandatory: true,
    unit: 'MILES',
    fiscal_year_start_date: '01-3',
    fiscal_year_end_date: '01-2',
    two_wheeler: null,
    four_wheeler: null,
    four_wheeler1: 10,
    four_wheeler3: null,
    four_wheeler4: null,
    bicycle: 10,
    electric_car: 122,
    two_wheeler_slabbed_rate: null,
    four_wheeler_slabbed_rate: null,
    four_wheeler1_slabbed_rate: 50,
    four_wheeler3_slabbed_rate: null,
    four_wheeler4_slabbed_rate: null,
    bicycle_slabbed_rate: null,
    electric_car_slabbed_rate: 4,
    two_wheeler_distance_limit: null,
    four_wheeler_distance_limit: null,
    four_wheeler1_distance_limit: 10,
    four_wheeler3_distance_limit: null,
    four_wheeler4_distance_limit: null,
    bicycle_distance_limit: null,
    electric_car_distance_limit: 6,
    enable_individual_mileage_rates: true,
  },
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
    advance_request_policy_enabled: true,
    duplicate_detection_enabled: true,
    policyApprovalWorkflow: true,
  },
  org_creation: {
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
  org_personal_cards_settings: {
    allowed: true,
    enabled: false,
  },
  receipt_settings: {
    enabled: false,
    allowed: true,
    enable_magnifier: true,
  },
  bank_data_aggregation_settings: {
    allowed: true,
    enabled: true,
    date_to_sync_from: null,
  },
  bank_feed_request_settings: {
    allowed: true,
    enabled: true,
    bank_name: null,
    card_provider: null,
    number_of_cards: null,
    status: 'SUCCESS',
    last_updated_at: '2021-11-19T00:00:00.000Z',
    secret_key: 'bank-feed-requestlOrFEgfbzG',
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
    enable_individual_per_diem_rates: false,
  },
  payment_mode_settings: {
    allowed: true,
    enabled: true,
    payment_modes_order: [AllowedPaymentModes.PERSONAL_ACCOUNT],
  },
  access_delegation: {
    allowed: true,
    enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: 'My spl tax',
    groups: [
      {
        name: 'test_123',
        percentage: 0.07023,
      },
      {
        name: 'QSt',
        percentage: 0.0997501,
      },
      {
        name: 'Pradeep Bhaiyas Taxaaa',
        percentage: 0.1,
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
    policy_ids: [
      'tprCMB6y22gs6',
      'tprXxIQJtGb1g',
      'tprD0by1jg9N4',
      'tprpsIHl7xyeT',
      'tpr5boLBy7uAq',
      'tprRDoXFSLBQj',
      'tpr9Kzm8eIcSy',
      'tpr0H01RDdWZw',
      'tprwBPalwOQjz',
      'tprYdcKzW7vvd',
    ],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: false,
    enable_secondary_approvers: false,
    enable_sequential_approvers: false,
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
      category: false,
      purpose: null,
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
      employee_id: false,
      title: false,
      level: false,
      business_unit: null,
      department: false,
      sub_department: false,
      mobile: null,
      location: false,
      bank_details: false,
      approver1: null,
      approver2: null,
      approver3: null,
      joining_dt: false,
    },
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: {
      activity: false,
    },
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
    mandatory: false,
    late_mode_enabled: false,
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
    enabled: false,
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
    enabled: false,
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

export const orgSettingsCCCDisabled: OrgSettings = {
  ...orgSettingsData,
  corporate_credit_card_settings: {
    ...orgSettingsData.corporate_credit_card_settings,
    allowed: false,
    enabled: false,
  },
};
export const orgSettingsParamsWithSimplifiedReport: OrgSettings = {
  ...orgSettingsRes,
  simplified_report_closure_settings: {
    allowed: true,
    enabled: true,
  },
};

export const taxSettingsData = {
  allowed: true,
  enabled: true,
  name: null,
  groups: [
    {
      label: 'GST',
      value: {
        name: 'GST',
        percentage: 0.23,
      },
    },
    {
      label: 'GST-free capital @0%',
      value: {
        name: 'GST-free capital @0%',
        percentage: 0,
      },
    },
    {
      label: 'GST-free non-capital @0%',
      value: {
        name: 'GST-free non-capital @0%',
        percentage: 0,
      },
    },
  ],
};
