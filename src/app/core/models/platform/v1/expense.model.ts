import { ExpenseState } from '../../expense-state.enum';
import { Location } from '../../location.model';
import { NameValuePair } from '../../name-value-pair.model';
import { ParsedResponse } from '../../parsed_response.model';
import { MissingMandatoryFields } from './missing-mandatory-fields.model';
import { PlatformCategory } from '../platform-category.model';
import { PlatformCostCenter } from '../platform-cost-center.model';
import { File } from './file.model';
import { MileageUnitEnum, PlatformMileageRates } from '../platform-mileage-rates.model';
import { Project } from './project.model';
import { PlatformTaxGroup } from '../platform-tax-group.model';
import { User } from './user.model';
import { ReportApprovals } from '../report-approvals.model';
import { PlatformPerDiemRates } from '../platform-per-diem-rates.model';
import { Level } from './level.model';
import { Department } from './department.model';
import { Account } from './account.model';
import { ReportState } from '../platform-report.model';

export interface Expense {
  // `activity_details` is not added on purpose
  added_to_report_at: string;
  admin_amount: number;
  approvals: ReportApprovals[];
  amount: number;
  approver_comments: string[];
  category: Pick<PlatformCategory, 'code' | 'id' | 'display_name' | 'name' | 'sub_category' | 'system_category'>;
  category_id: number;
  claim_amount: number;
  code: string;
  cost_center_id: number;
  cost_center: Pick<PlatformCostCenter, 'id' | 'name' | 'code'>;
  created_at: string;
  creator_user_id: string;
  currency: string;
  custom_fields: NameValuePair[];
  custom_fields_flattened: Record<string, unknown>;
  distance: number;
  distance_unit: MileageUnitEnum;
  employee: Employee;
  employee_id: string;
  ended_at: string;
  expense_rule_data: ExpenseRuleData;
  expense_rule_id: string;
  extracted_data: ParsedResponse;
  file_ids: string[];
  files: Pick<File, 'id' | 'name' | 'content_type' | 'type'>[];
  foreign_amount: number;
  foreign_currency: string;
  hotel_is_breakfast_provided: boolean;
  id: string;
  is_billable: boolean;
  is_corporate_card_transaction_auto_matched: boolean;
  is_manually_flagged: boolean;
  is_physical_bill_submitted: boolean;
  is_policy_flagged: boolean;
  is_receipt_mandatory: boolean;
  is_reimbursable: boolean;
  is_split: boolean;
  is_verified: boolean;
  is_weekend_spend: boolean;
  last_settled_at: string;
  last_verified_at: string;
  locations: Location[];
  matched_corporate_card_transaction_ids: string[];
  matched_corporate_card_transactions: MatchedCorporateCardTransaction[];
  merchant: string;
  mileage_calculated_amount: number;
  mileage_calculated_distance: number;
  mileage_is_round_trip: boolean;
  mileage_rate: Pick<PlatformMileageRates, 'id' | 'code' | 'vehicle_type'>;
  mileage_rate_id: number;
  missing_mandatory_fields: MissingMandatoryFields;
  org_id: string;
  per_diem_num_days: number;
  per_diem_rate: Pick<PlatformPerDiemRates, 'id' | 'code' | 'name'>;
  per_diem_rate_id: number;
  physical_bill_submitted_at: string;
  policy_checks: PolicyChecks;
  policy_amount: number;
  project_id: number;
  project: Pick<Project, 'id' | 'name' | 'sub_project' | 'code' | 'display_name'>;
  purpose: string;
  report: Report;
  report_id: string;
  report_settlement_id: string;
  seq_num: string;
  source: string;
  source_account: Pick<Account, 'id' | 'type'>;
  source_account_id: string;
  spent_at: string;
  split_group_amount: number;
  split_group_id: string;
  started_at: string;
  state: ExpenseState;
  state_display_name: string;
  tax_amount: number;
  tax_group: Pick<PlatformTaxGroup, 'name' | 'percentage'>;
  tax_group_id: string;
  travel_classes: string[];
  updated_at: string;
  user: User;
  user_id: string;
  verifier_comments: string[];
  report_last_paid_at: string;
  report_last_approved_at: string;
}

export interface Employee {
  business_unit: string;
  code: string;
  custom_fields: NameValuePair[];
  department: Pick<Department, 'id' | 'code' | 'display_name' | 'sub_department' | 'name'>;
  department_id: string;
  flattened_custom_field: Record<string, unknown>;
  has_accepted_invite: boolean;
  id: string;
  is_enabled: boolean;
  level: Pick<Level, 'id' | 'name' | 'band'>;
  location: string;
  org_id: string;
  org_name: string;
  title: string;
  user: User;
  user_id: string;
}

export interface MatchedCorporateCardTransaction {
  id: string;
  corporate_card_id: string;
  corporate_card_number: string;
  masked_corporate_card_number: string;
  bank_name: string;
  cardholder_name: string;
  amount: number;
  currency: string;
  spent_at: string;
  posted_at: string;
  description: string;
  foreign_currency: string;
  status: string;
  foreign_amount: number;
  merchant: string;
  category: string;
  matched_by: string;
}

export interface PolicyChecks {
  are_approvers_added: boolean;
  is_amount_limit_applied: boolean;
  is_flagged_ever: boolean;
  violations: Violation[];
}

export interface Violation {
  policy_rule_description: string;
  policy_rule_id: string;
}

export interface Report {
  amount: number;
  approvals: ReportApprovals[];
  id: string;
  last_approved_at: string;
  last_paid_at: string;
  last_submitted_at: string;
  seq_num: string;
  state: ReportState;
  settlement_id: string;
  last_verified_at: string;
  reimbursement_id: string;
  reimbursement_seq_num: string;
  title: string;
}

export interface ExpenseRuleData {
  merchant: string;
  is_billable: boolean;
  purpose: string;
  category_id: number;
  project_id: number;
  cost_center_id: number;
  custom_fields: NameValuePair[];
}
