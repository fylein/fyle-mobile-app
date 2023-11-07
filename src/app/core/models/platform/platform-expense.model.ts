import { PlatformCategory } from './platform-category.model';
import { PlatformCostCenter } from './platform-cost-center.model';

export interface PlatformExpense {
  accounting_export_summary: {
    state: string;
    error_type?: string | null;
    url: string;
    tpa_id: string;
  };
  activity_details?: {
    unique_meetings: number;
    total_meetings: number;
  };
  added_to_report_at: string;
  admin_amount?: number;
  amount: number;
  approvals: {
    approver_user_id: string;
    approver_user: {
      id: string;
      email: string;
      full_name: string;
    };
  }[];
  approver_comments: string[];
  category: Partial<PlatformCategory>;
  category_id: number;
  claim_amount: number;
  code: string;
  cost_center: Partial<PlatformCostCenter>;
  cost_center_id: number;
  created_at: string;
  creator_user_id: string;
  currency: string;
  custom_fields: {
    name: string;
    value: string | string[] | number | boolean | Record<string, string>;
  }[];
  custom_fields_flattened: Record<
    string,
    string | string[] | boolean | number | Record<string, string | number | boolean>
  >;
  distance: number;
  distance_unit: string;
  employee: Record<string, string | Record<string, string | boolean | number> | Array<Record<string, string>>>;
  employee_id: string;
  ended_at: string;
  expense_rule_data: Record<
    string,
    | string
    | boolean
    | number
    | Array<Record<string, string | boolean | number | string[] | Record<string, string | number | string[] | boolean>>>
  >;
  expense_rule_id: string;
  extracted_data: Record<string, string | number | Date>;
  file_ids: string[];
  files: Array<Record<string, string>>;
  foreign_amount: number;
  foreign_currency: string;
  hotel_is_breakfast_provided: string;
  id: string;
  is_billable: boolean;
  is_corporate_card_transaction_auto_matched: boolean;
  is_exported: boolean;
  is_manually_flagged: boolean;
  is_physical_bill_submitted: boolean;
  is_policy_flagged: boolean;
  is_receipt_mandatory: boolean;
  is_reimbursable: true;
  is_split: boolean;
  is_verified: boolean;
  is_weekend_spend: boolean;
  last_exported_at: string;
  last_settled_at: string;
  last_verified_at: string;
  locations: Array<Record<string, string | number>>;
  matched_corporate_card_transaction_ids: string[];
  matched_corporate_card_transactions: Array<Record<string, string | number>>;
  merchant: string;
  mileage_calculated_amount: number;
  mileage_calculated_distance: 0;
  mileage_is_round_trip: boolean;
  mileage_rate: Record<string, string | number>;
  mileage_rate_id: number;
  missing_mandatory_fields: {
    amount: boolean;
    currency: boolean;
    expense_field_ids: number[];
  };
  org_id: string;
  per_diem_num_days: number;
  per_diem_rate: Record<string, string | number>;
  per_diem_rate_id: number;
  physical_bill_submitted_at: string;
  policy_amount: number;
  policy_checks: {
    are_approvers_added: boolean;
    is_amount_limit_applied: boolean;
    is_flagged_ever: boolean;
    violations: Array<Record<string, string>>;
  };
  project: Record<string, string | number>;
  project_id: number;
  purpose: string;
  report: Record<string, string | boolean | number | string[] | Array<Record<string, string | Record<string, string>>>>;
  report_id: string;
  report_last_approved_at: string;
  report_last_paid_at: string;
  report_settlement_id: string;
  seq_num: string;
  source: string;
  source_account: {
    id: string;
    type: string;
  };
  source_account_id: string;
  spent_at: string;
  split_group_amount: number;
  split_group_id: string;
  started_at: string;
  state: string;
  state_display_name: string;
  tax_amount: number;
  tax_group: {
    name: string;
    percentage: number;
  };
  tax_group_id: string;
  travel_classes: string[];
  updated_at: string;
  user: {
    email: string;
    full_name: string;
    id: string;
  };
  user_id: string;
  verifier_comments: string[];
}
