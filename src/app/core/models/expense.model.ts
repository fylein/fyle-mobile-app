import { CustomInput } from './custom-input.model';
import { Destination } from './destination.model';
import { MatchedCCCTransaction } from './matchedCCCTransaction.model';

export interface Expense {
  isCriticalPolicyViolated?: boolean;
  isPolicyViolated?: boolean;
  isDraft?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  showDt?: boolean;
  vendorDetails?: string;
  external_expense_id?: string;
  external_expense_source?: string;
  matched_by?: string;
  ou_band?: string;
  ou_business_unit: string;
  ou_department: string;
  ou_department_id: string;
  ou_employee_id: string;
  ou_id: string;
  ou_joining_dt: string;
  ou_level: string;
  ou_location: string;
  ou_mobile: string;
  ou_org_id: string;
  ou_org_name: string;
  ou_sub_department: string;
  ou_title: string;
  ou_user_id: string;
  rp_approved_at?: Date | string;
  rp_claim_number?: string;
  rp_purpose?: string;
  rp_reimbursed_at?: Date;
  source_account_id: string;
  source_account_type: string;
  transaction_approvals?: string[];
  tx_admin_amount?: number;
  tx_amount?: number;
  tx_billable: boolean;
  tx_boolean_column1?: boolean;
  tx_boolean_column10?: boolean;
  tx_boolean_column2?: boolean;
  tx_boolean_column3?: boolean;
  tx_boolean_column4?: boolean;
  tx_boolean_column5?: boolean;
  tx_boolean_column6?: boolean;
  tx_boolean_column7?: boolean;
  tx_boolean_column8?: boolean;
  tx_boolean_column9?: boolean;
  tx_bus_travel_class?: string;
  tx_category?: string;
  tx_corporate_credit_card_expense_group_id?: string;
  tx_cost_center_code?: string;
  tx_cost_center_id?: number;
  tx_cost_center_name?: string;
  tx_created_at: Date;
  tx_creator_id: string;
  tx_currency?: string;
  tx_custom_attributes?: Partial<CustomInput>[];
  tx_custom_properties?: Partial<CustomInput>[];
  tx_decimal_column1?: number;
  tx_decimal_column10?: number;
  tx_decimal_column2?: number;
  tx_decimal_column3?: number;
  tx_decimal_column4?: number;
  tx_decimal_column5?: number;
  tx_decimal_column6?: number;
  tx_decimal_column7?: number;
  tx_decimal_column8?: number;
  tx_decimal_column9?: number;
  tx_distance?: number;
  tx_distance_unit?: string;
  tx_expense_number: string;
  tx_external_id?: string;
  tx_extracted_data?: Partial<{
    amount: number;
    category: string;
    currency: string;
    date: Date;
    invoice_dt: Date;
    vendor: string;
  }>;
  tx_file_ids?: string[];
  tx_flight_journey_travel_class?: string;
  tx_flight_return_travel_class?: string;
  tx_from_dt?: Date;
  tx_fyle_category: string;
  tx_hotel_is_breakfast_provided?: boolean;
  tx_id: string;
  tx_invoice_number?: number;
  tx_is_duplicate_expense?: boolean;
  tx_location_column1?: Destination;
  tx_location_column10?: Destination;
  tx_location_column2?: Destination;
  tx_location_column3?: Destination;
  tx_location_column4?: Destination;
  tx_location_column5?: Destination;
  tx_location_column6?: Destination;
  tx_location_column7?: Destination;
  tx_location_column8?: Destination;
  tx_location_column9?: Destination;
  tx_locations: Destination[];
  tx_mandatory_fields_present: boolean;
  tx_manual_flag: boolean;
  tx_mileage_calculated_amount?: number;
  tx_mileage_calculated_distance?: number;
  tx_mileage_is_round_trip?: boolean;
  tx_mileage_rate?: number;
  tx_mileage_rate_id?: string;
  tx_mileage_vehicle_type?: string;
  tx_num_days?: number;
  tx_num_files: number;
  tx_org_category: string;
  tx_org_category_code?: string;
  tx_org_category_id: number;
  tx_org_user_id: string;
  tx_orig_amount?: number;
  tx_orig_currency?: string;
  tx_payment_id?: string;
  tx_per_diem_rate_id?: string;
  tx_policy_amount?: number;
  tx_policy_flag: boolean;
  tx_policy_state?: string;
  tx_project_code?: string;
  tx_project_id?: number;
  tx_project_name?: string;
  tx_purpose?: string;
  tx_receipt_required?: boolean;
  tx_report_id?: string;
  tx_reported_at?: string;
  tx_risk_state?: string;
  tx_skip_reimbursement: boolean;
  tx_source: string;
  tx_source_account_id: string;
  tx_split_group_id: string;
  tx_split_group_user_amount?: number;
  tx_state: string;
  tx_sub_category: string;
  tx_tax?: number;
  tx_tax_group_id?: string;
  tx_text_array_column1?: string[];
  tx_text_array_column10?: string[];
  tx_text_array_column2?: string[];
  tx_text_array_column3?: string[];
  tx_text_array_column4?: string[];
  tx_text_array_column5?: string[];
  tx_text_array_column6?: string[];
  tx_text_array_column7?: string[];
  tx_text_array_column8?: string[];
  tx_text_array_column9?: string[];
  tx_text_column1?: string;
  tx_text_column10?: string;
  tx_text_column11?: string;
  tx_text_column12?: string;
  tx_text_column13?: string;
  tx_text_column14?: string;
  tx_text_column15?: string;
  tx_text_column2?: string;
  tx_text_column3?: string;
  tx_text_column4?: string;
  tx_text_column5?: string;
  tx_text_column6?: string;
  tx_text_column7?: string;
  tx_text_column8?: string;
  tx_text_column9?: string;
  tx_timestamp_column1?: string;
  tx_timestamp_column10?: string;
  tx_timestamp_column2?: string;
  tx_timestamp_column3?: string;
  tx_timestamp_column4?: string;
  tx_timestamp_column5?: string;
  tx_timestamp_column6?: string;
  tx_timestamp_column7?: string;
  tx_timestamp_column8?: string;
  tx_timestamp_column9?: string;
  tx_to_dt?: Date;
  tx_train_travel_class?: string;
  tx_transcribed_data?: string;
  tx_transcription_state?: string;
  tx_txn_dt?: Date;
  tx_updated_at?: Date;
  tx_user_amount?: number;
  tx_user_can_delete: boolean;
  tx_user_reason_for_duplicate_expenses?: string;
  tx_user_review_needed?: boolean;
  tx_vendor?: string;
  tx_vendor_id?: number;
  tx_verification_state?: string;
  us_email: string;
  us_full_name: string;
  tx_categoryDisplayName?: string; // custom property added in the service
  tx_dataUrls?: { thumbnail: string }[];
  vendor?: string;
  violation?: boolean;
  tx_duplicates?: {
    transaction_id: string;
    reason: string;
    percent: number;
    fields: string[];
  }[];
  tx_tax_amount?: number;
  tg_name?: string;
  tg_percentage?: number;
  ou_rank?: number;
  tx_platform_vendor?: string;
  tx_platform_vendor_id?: string;
  is_test_call?: boolean;
  tx_taxi_travel_class?: string;
  tx_activity_policy_pending?: boolean;
  tx_activity_details?: string;
  tx_is_implicit_merge_blocked?: boolean;
  _search_document?: string;
  corporate_credit_card_account_number?: string;
  credit?: boolean;
  debit?: boolean;
  duplicates?: { fields: string[]; percent: number; reason: string; transaction_id: string }[];
  tx_is_split_expense?: boolean;
  custom_fields?: Record<string, string | boolean | number | Date | string[] | { display: string }>;
  tx_matched_corporate_card_transactions?: Partial<MatchedCCCTransaction>[];
}
