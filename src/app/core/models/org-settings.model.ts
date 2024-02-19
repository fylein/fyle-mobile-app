import { AllowedPaymentModes } from './allowed-payment-modes.enum';
import { MileageDetails } from './mileage.model';
import { TaxGroup } from './tax-group.model';
import { TransactionMandatoryFields } from './transaction-mandatory-fields.model';
import { User } from './user.model';
import { OrgUserMandatoryFields } from './org-user-mandatory-fields.model';

export enum EmailEvents {
  DELEGATOR_SUBSCRIPTION = 'DELEGATOR_SUBSCRIPTION',
  EOUS_FORWARD_EMAIL_TO_USER = 'EOUS_FORWARD_EMAIL_TO_USER',
  ERPTS_SUBMITTED = 'ERPTS_SUBMITTED',
  ESTATUSES_CREATED_TXN = 'ESTATUSES_CREATED_TXN',
  ESTATUSES_CREATED_RPT = 'ESTATUSES_CREATED_RPT',
  ETXNS_ADMIN_REMOVED = 'ETXNS_ADMIN_REMOVED',
  ETXNS_ADMIN_UPDATED = 'ETXNS_ADMIN_UPDATED',
  ERPTS_INQUIRY = 'ERPTS_INQUIRY',
  ERPTS_APPROVED = 'ERPTS_APPROVED',
  EREIMBURSEMENTS_COMPLETED = 'EREIMBURSEMENTS_COMPLETED',
  TRIP_REQUESTS_CREATED = 'TRIP_REQUESTS_CREATED',
  EADVANCE_REQUESTS_CREATED = 'EADVANCE_REQUESTS_CREATED',
  EADVANCE_REQUESTS_UPDATED = 'EADVANCE_REQUESTS_UPDATED',
  TRIP_REQUESTS_ADD_APPROVER = 'TRIP_REQUESTS_ADD_APPROVER',
  ESTATUSES_TRIP_REQUEST_COMMENTS = 'ESTATUSES_TRIP_REQUEST_COMMENTS',
  TRIP_REQUESTS_INQUIRY = 'TRIP_REQUESTS_INQUIRY',
  EADVANCE_REQUESTS_INQUIRY = 'EADVANCE_REQUESTS_INQUIRY',
  TRIP_REQUESTS_APPROVED = 'TRIP_REQUESTS_APPROVED',
  EADVANCE_REQUESTS_APPROVED = 'EADVANCE_REQUESTS_APPROVED',
  TRIP_REQUESTS_REJECTED = 'TRIP_REQUESTS_REJECTED',
  TRANSPORTATION_REQUESTS_BOOKED = 'TRANSPORTATION_REQUESTS_BOOKED',
  HOTEL_REQUESTS_BOOKED = 'HOTEL_REQUESTS_BOOKED',
  TRANSPORTATION_BOOKINGS_CANCELLED = 'TRANSPORTATION_BOOKINGS_CANCELLED',
  HOTEL_BOOKINGS_CANCELLED = 'HOTEL_BOOKINGS_CANCELLED',
  EADVANCES_CREATED = 'EADVANCES_CREATED',
  EADVANCE_REQUESTS_REJECTED = 'EADVANCE_REQUESTS_REJECTED',
}

export enum QuickBooksExpenseExportType {
  CHECK = 'CHECK',
  JOURNAL = 'JOURNAL',
}

export enum PaymentType {
  EXPENSE = 'EXPENSE',
  ADVANCE = 'ADVANCE',
  REFUND = 'REFUND',
  REIMBURSEMENT = 'REIMBURSEMENT',
  TRANSFER = 'TRANSFER',
}

export interface CommonOrgSettings {
  allowed?: boolean;
  enabled?: boolean;
}

export interface AdvanceRequestMandatoryFields {
  activity?: boolean;
}

export interface AdvanceRequestFieldsSettings extends CommonOrgSettings {
  advance_request_mandatory_fields?: AdvanceRequestMandatoryFields;
}

export interface AdvanceAccountSettings {
  allowed?: boolean;
  multiple_accounts?: boolean;
}

export interface OrgLogoSettings extends CommonOrgSettings {
  file_id?: string;
}

export interface AdminAllowedIpSettings extends CommonOrgSettings {
  allowed_cidrs?: string[];
}

export interface PerDiemSettings extends CommonOrgSettings {
  enable_individual_per_diem_rates?: boolean;
}

export interface ReceiptSettings extends CommonOrgSettings {
  enable_magnifier?: boolean;
}

export interface TaxiSettings {
  allowed?: boolean;
  distance_mandatory?: boolean;
}

export interface SettlementsExcelSettings {
  allowed?: boolean;
  cost_center_wise_split?: boolean;
}

export interface IntegrationsSettings extends CommonOrgSettings {
  integrations?: number[];
}

export interface AchSettings extends CommonOrgSettings {
  provider?: string;
  expedite_source?: boolean;
  expedite_destination?: boolean;
  pipeline_amount_limit?: number;
}

export interface BankStatementParserEndpointSettings {
  bank_name?: string;
  file_type?: string;
  parser_url?: string;
}

export interface BankStatementUploadSettings {
  enabled?: boolean;
  generic_statement_parser_enabled?: boolean;
  bank_statement_parser_endpoint_settings?: BankStatementParserEndpointSettings[];
}

export interface BankDataAggregationSettings {
  enabled?: boolean;
  allowed?: boolean;
  aggregator?: string;
  auto_assign?: boolean;
  date_to_sync_from?: string;
}

export interface BankFeedRequestSettings extends CommonOrgSettings {
  bank_name?: string;
  card_provider?: string;
  number_of_cards?: number;
  status?: string;
  last_updated_at?: string;
  secret_key?: string;
}

export interface OrgBankDataAggregationSettings extends CommonOrgSettings {
  date_to_sync_from?: string;
}

export interface OrgUserFieldsSettings extends CommonOrgSettings {
  org_user_mandatory_fields?: OrgUserMandatoryFields;
}

export interface AutoFyleSettings extends CommonOrgSettings {
  background_enabled?: boolean;
}

export interface DefaultOrgUserSettings {
  auto_fyle_settings?: AutoFyleSettings;
}

export interface ApprovalSettings {
  allowed?: boolean;
  admin_approve_own_report?: boolean;
  enable_secondary_approvers?: boolean;
  enable_sequential_approvers?: boolean;
  allow_user_add_trip_request_approvers?: boolean;
}

export interface EnableAccessDelegation {
  enabled?: boolean;
}

export interface VerificationSettings {
  allowed?: boolean;
  mandatory?: boolean;
  late_mode_enabled?: boolean;
}

export interface AdminEmailSettings extends CommonOrgSettings {
  unsubscribed_events?: EmailEvents[];
}

export interface AdvancesSettings extends CommonOrgSettings {
  advance_requests_enabled?: boolean;
}

export interface OrgMileageSettings extends CommonOrgSettings {
  mileage_location_enabled?: boolean;
}

export interface AdvancedProjectSettings extends CommonOrgSettings {
  enable_individual_projects?: boolean;
}

export interface SSOIntegrationSettings extends CommonOrgSettings {
  idp_name?: string;
  meta_data_file_id?: string;
  email_regex?: string;
}

export interface AmpEmailSettings extends CommonOrgSettings {
  report_approval?: boolean;
  submit_expense_reports_beta?: boolean;
}

export interface ExpenseLimitSettings {
  policy_ids?: string[];
}

export interface WorkflowSettings {
  allowed?: boolean;
  enabled?: boolean;
  report_workflow_settings?: boolean;
}

export interface OrgFylerCccFlowSettings extends CommonOrgSettings {
  advanced_auto_match_enabled?: boolean;
}

export interface PolicySettings {
  allowed?: boolean;
  is_enabled?: boolean;
  is_self_serve_enabled?: boolean;
  is_trip_request_policy_enabled?: boolean;
  is_duplicate_detection_enabled?: boolean;
  policy_approval_workflow?: boolean;
}

export interface CCCSettings extends CommonOrgSettings {
  bank_statement_upload_settings?: BankStatementUploadSettings;
  bank_data_aggregation_settings?: BankDataAggregationSettings;
  auto_match_allowed?: boolean;
  enable_auto_match?: boolean;
  allow_approved_plus_states?: boolean;
}

export interface ActivityKey {
  key?: string;
  description?: string;
}

export interface ActivitySettings extends CommonOrgSettings {
  keys?: string;
}

export interface DataExtractionSettings extends CommonOrgSettings {
  web_app_pdf?: boolean;
}

export interface AmexFeedEnrollmentSettings extends CommonOrgSettings {
  virtual_card_settings_enabled: boolean;
}

export interface SplitExpenseSettings {
  enabled?: boolean;
}

export interface ExpenseSettings {
  allowed?: boolean;
  split_expense_settings?: SplitExpenseSettings;
}

export interface TaxSettings extends CommonOrgSettings {
  name?: string;
  groups?: TaxGroup[] | { label: string; value: TaxGroup }[];
}

export interface TransactionFieldsSettings extends CommonOrgSettings {
  transaction_mandatory_fields?: TransactionMandatoryFields;
}

export interface QuickBooksSettings {
  enabled?: boolean;
  expense_dt?: string;
  advance_dt?: string;
  expense_type?: QuickBooksExpenseExportType;
  advance_type?: QuickBooksExpenseExportType;
  collapse_expenses?: boolean;
  enable_departments?: boolean;
  enable_classes?: boolean;
  debit_ledger_calculation_key?: string;
  account_mappings?: Map<string, string>;
  separate_org_user_advance_ledger?: boolean;
}

export interface LineEntriesGeneratorInfo {
  transaction_to_line_entry_function_name?: string;
  advance_to_line_entry_function_name?: string;
  refund_to_line_entry_function_name?: string;
  reimbursement_to_line_entry_function_name?: string;
  balance_transfer_to_line_entry_function_name?: string;
}

export interface LineEntriesExporterInfo {
  file_export_function_name?: string;
  service_export_function_name?: string;
}

export interface AccountingSettings {
  enabled?: boolean;
  export_name?: string;
  export_type?: string;
  entries_generator_info?: LineEntriesGeneratorInfo;
  entries_exporter_info?: LineEntriesExporterInfo;
  custom_fields?: Map<string, Record<string, string | boolean | Date>>;
  separate_org_user_advance_ledger?: boolean;
  collapse_expenses?: boolean;
}

export interface TallySettings {
  enabled?: boolean;
  default_org_category_ledger_name?: string;
  default_org_user_personal_ledger_name?: string;
  separate_org_user_advance_ledger?: boolean;
  default_org_user_advance_ledger_name?: string;
  expense_dt?: string;
  advance_dt?: string;
  reimbursement_dt?: string;
  refund_dt?: string;
  cost_center?: string;
  cost_category?: string;
  collapse_expenses?: boolean;
  blocked_payment_types?: [] | Set<PaymentType>;
}

export interface AccountingExportSettings {
  allowed?: boolean;
  tally_settings?: TallySettings;
  quick_books_settings?: QuickBooksSettings;
  accounting_settings?: AccountingSettings;
  integration_exports_enabled?: boolean;
}

export interface IncomingAccountObject extends CommonOrgSettings {
  type?: string;
  settings?: QuickBooksSettings | AccountingSettings | TallySettings;
  integration_exports_enabled?: boolean;
}

export interface PaymentmodeSettings {
  allowed?: boolean;
  enabled?: boolean;
  payment_modes_order?: AllowedPaymentModes[];
}

export interface ExpenseSettings {
  allowed?: boolean;
  split_expense_settings?: {
    enabled?: boolean;
  };
}

export interface CurrencylayerProviderSettings extends CommonOrgSettings {
  id?: string;
  name?: string;
}

export interface OrgSettingsResponse {
  id?: string;
  created_at?: string;
  updated_at?: string;
  org_id?: string;

  enable_mileage?: boolean;
  enable_mileage_location?: boolean;
  enable_projects?: boolean;
  enable_cost_centers?: boolean;
  enable_advance_requests?: boolean;
  enable_advances?: boolean;
  enable_org_creation?: boolean;
  enable_auto_report?: boolean;

  mileage_details?: MileageDetails;
  policy_settings?: PolicySettings;
  corporate_credit_card_settings?: CCCSettings;
  receipt_settings?: ReceiptSettings;
  bank_feed_request_settings?: BankFeedRequestSettings;
  card_expense_creation_settings?: CommonOrgSettings;
  ach_settings?: AchSettings;
  default_ou_settings?: DefaultOrgUserSettings;
  org_personal_cards_settings?: CommonOrgSettings;
  bank_data_aggregation_settings?: OrgBankDataAggregationSettings;
  per_diem_settings?: PerDiemSettings;
  advanced_per_diems_settings?: CommonOrgSettings;
  accounting_export_settings?: AccountingExportSettings;
  activity_settings?: ActivitySettings;
  tax_settings?: TaxSettings;
  taxi_settings?: TaxiSettings;
  approval_settings?: ApprovalSettings;
  enable_access_delegation?: EnableAccessDelegation;
  verification_settings?: VerificationSettings;
  transaction_fields_settings?: TransactionFieldsSettings;
  org_user_fields_settings?: OrgUserFieldsSettings;
  advance_request_fields_settings?: AdvanceRequestFieldsSettings;
  org_logo_settings?: OrgLogoSettings;
  org_branding_settings?: CommonOrgSettings;
  data_extractor_settings?: DataExtractorSettings;
  settlements_excel_settings?: SettlementsExcelSettings;
  advance_account_settings?: AdvanceAccountSettings;
  expense_settings?: ExpenseSettings;
  bank_payment_file_settings?: CommonOrgSettings;
  integrations_settings?: IntegrationsSettings;
  transaction_field_configurations?: [];
  exchange_rate_settings?: CommonOrgSettings;
  currencylayer_provider_settings?: CurrencylayerProviderSettings;
  gmail_addon_settings?: CommonOrgSettings;
  admin_allowed_ip_settings?: AdminAllowedIpSettings;
  fmr_settings?: CommonOrgSettings;
  advanced_rbac_settings?: CommonOrgSettings;
  advances_settings?: AdvancesSettings;
  admin_email_settings?: AdminEmailSettings;
  analytics_settings?: CommonOrgSettings;
  advanced_analytics_settings?: CommonOrgSettings;
  budget_settings?: CommonOrgSettings;
  custom_category_settings?: CommonOrgSettings;
  duplicate_detection_settings?: CommonOrgSettings;
  duplicate_detection_v2_settings?: CommonOrgSettings;
  dynamic_form_settings?: CommonOrgSettings;
  hrms_integration_settings?: CommonOrgSettings;
  multi_org_settings?: CommonOrgSettings;
  org_access_delegation_settings?: CommonOrgSettings;
  advanced_access_delegation_settings?: CommonOrgSettings;
  org_bulk_fyle_settings?: CommonOrgSettings;
  org_cost_center_settings?: CommonOrgSettings;
  advanced_cost_center_settings?: CommonOrgSettings;
  org_mileage_settings?: OrgMileageSettings;
  project_settings?: CommonOrgSettings;
  advanced_project_settings?: AdvancedProjectSettings;
  auto_reminder_settings?: CommonOrgSettings;
  google_sso_settings?: CommonOrgSettings;
  sso_integration_settings?: SSOIntegrationSettings;
  amp_email_settings?: AmpEmailSettings;
  expense_limit_settings?: ExpenseLimitSettings;
  saved_filters_settings?: CommonOrgSettings;
  org_currency_settings?: CommonOrgSettings;
  recurrences_settings?: CommonOrgSettings;
  mis_reporting_settings?: CommonOrgSettings;
  risk_score_settings?: CommonOrgSettings;
  workflow_settings?: WorkflowSettings;
  org_in_app_chat_settings?: CommonOrgSettings;
  org_fyler_ccc_flow_settings?: OrgFylerCccFlowSettings;
  org_hotjar_settings?: CommonOrgSettings;
  ccc_draft_expense_settings?: CommonOrgSettings;
  expense_widget_settings?: CommonOrgSettings;
  org_expense_form_autofills?: CommonOrgSettings;
  payment_mode_settings?: PaymentmodeSettings;
  last_updated_by?: User;
  activity?: ActivitySettings;
  auto_match_settings?: CommonOrgSettings;
  universal_statement_parser_settings?: CommonOrgSettings;
  trip_request_fields_settings?: CommonOrgSettings;
  data_extraction_settings?: DataExtractionSettings;
  card_assignment_settings?: CommonOrgSettings;
  transaction_reversal_settings?: CommonOrgSettings;
  visa_enrollment_settings?: CommonOrgSettings;
  mastercard_enrollment_settings?: CommonOrgSettings;
  company_expenses_beta_settings?: CommonOrgSettings;
  trip_request_settings?: CommonOrgSettings;
  xe_provider_settings?: XeProviderSettings;
  simplified_report_closure_settings?: CommonOrgSettings;
  mobile_app_my_expenses_beta_enabled?: boolean;
  amex_feed_enrollment_settings: AmexFeedEnrollmentSettings;
}

export interface UiPolicySettings {
  allowed?: boolean;
  enabled?: boolean;
  self_serve_enabled?: boolean;
  duplicate_detection_enabled?: boolean;
  trip_request_policy_enabled?: boolean;
  policyApprovalWorkflow?: boolean;
}

export interface DataExtractorSettings extends CommonOrgSettings {
  web_app_pdf?: string;
}

export interface FixerProviderSettings extends CommonOrgSettings {
  id?: string;
  name?: string;
}

export interface OpenExchangeRatesProviderSettings extends CommonOrgSettings {
  id?: string;
  name?: string;
}

export interface OandaProviderSettings extends CommonOrgSettings {
  id?: string;
  name?: string;
}

export interface XeProviderSettings extends CommonOrgSettings {
  id?: string;
  name?: string;
}

export interface OrgSettings {
  org_id?: string;
  mileage?: MileageDetails;
  advances?: CommonOrgSettings;
  projects?: CommonOrgSettings;
  advanced_projects?: AdvancedProjectSettings;
  advance_requests?: CommonOrgSettings;
  cost_centers?: CommonOrgSettings;
  policies?: UiPolicySettings;
  org_creation?: CommonOrgSettings;
  admin_allowed_ip_settings?: AdminAllowedIpSettings;
  org_personal_cards_settings?: CommonOrgSettings;
  receipt_settings?: ReceiptSettings;
  corporate_credit_card_settings?: CCCSettings;
  bank_feed_request_settings?: BankFeedRequestSettings;
  ach_settings?: AchSettings;
  per_diem?: PerDiemSettings;
  access_delegation?: CommonOrgSettings;
  activity?: ActivitySettings;
  tax_settings?: TaxSettings;
  integrations_settings?: IntegrationsSettings;
  taxi_settings?: TaxiSettings;
  expense_limit_settings?: ExpenseLimitSettings;
  approval_settings?: ApprovalSettings;
  accounting?: IncomingAccountObject;
  transaction_fields_settings?: TransactionFieldsSettings;
  org_user_fields_settings?: OrgUserFieldsSettings;
  advance_request_fields_settings?: AdvanceRequestFieldsSettings;
  org_logo_settings?: OrgLogoSettings;
  org_branding_settings?: CommonOrgSettings;
  verification?: VerificationSettings;
  advance_account_settings?: AdvanceAccountSettings;
  settlements_excel_settings?: SettlementsExcelSettings;
  gmail_addon_settings?: CommonOrgSettings;
  duplicate_detection_settings?: CommonOrgSettings;
  duplicate_detection_v2_settings?: CommonOrgSettings;
  custom_category_settings?: CommonOrgSettings;
  bulk_fyle_settings?: CommonOrgSettings;
  auto_reminder_settings?: CommonOrgSettings;
  analytics_settings?: CommonOrgSettings;
  advanced_rbac_settings?: CommonOrgSettings;
  sso_integration_settings?: SSOIntegrationSettings;
  advanced_access_delegation_settings?: CommonOrgSettings;
  dynamic_form_settings?: CommonOrgSettings;
  budget_settings?: CommonOrgSettings;
  saved_filters_settings?: CommonOrgSettings;
  org_currency_settings?: CommonOrgSettings;
  recurrences_settings?: CommonOrgSettings;
  mis_reporting_settings?: CommonOrgSettings;
  risk_score_settings?: CommonOrgSettings;
  workflow_settings?: WorkflowSettings;
  ccc_draft_expense_settings?: CommonOrgSettings;
  expense_widget_settings?: CommonOrgSettings;
  org_expense_form_autofills?: CommonOrgSettings;
  payment_mode_settings?: PaymentmodeSettings;
  advanced_project_settings?: AdvancedProjectSettings;
  expense_settings?: ExpenseSettings;
  admin_email_settings?: AdminEmailSettings;
  data_extractor_settings?: DataExtractorSettings;
  bank_payment_file_settings?: CommonOrgSettings;
  exchange_rate_settings?: CommonOrgSettings;
  currencylayer_provider_settings?: CurrencylayerProviderSettings;
  bank_data_aggregation_settings?: BankDataAggregationSettings;
  trip_request_fields_settings?: CommonOrgSettings;
  data_extraction_settings?: DataExtractionSettings;
  transaction_field_configurations?: [];
  card_assignment_settings?: CommonOrgSettings;
  transaction_reversal_settings?: CommonOrgSettings;
  auto_match_settings?: CommonOrgSettings;
  universal_statement_parser_settings?: CommonOrgSettings;
  in_app_chat_settings?: CommonOrgSettings;
  visa_enrollment_settings?: CommonOrgSettings;
  mastercard_enrollment_settings?: CommonOrgSettings;
  company_expenses_beta_settings?: CommonOrgSettings;
  simplified_report_closure_settings?: CommonOrgSettings;
  mobile_app_my_expenses_beta_enabled?: boolean;
  amex_feed_enrollment_settings: AmexFeedEnrollmentSettings;
}
