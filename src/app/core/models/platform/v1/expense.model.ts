import { ExpenseState } from '../../expense-state.enum';
import { Location } from '../../location.model';
import { NameValuePair } from '../../name-value-pair.model';
import { ParsedResponse } from '../../parsed_response.model';
import { MissingMandatoryFields } from './missing-mandatory-fields.model';
import { PlatformCategory } from '../platform-category.model';
import { PlatformCostCenter } from '../platform-cost-center.model';
import { File } from './file.model';
import { PlatformMileageRates } from '../platform-mileage-rates.model';
import { Project } from './project.model';
import { PlatformTaxGroup } from '../platform-tax-group.model';
import { User } from './user.model';
import { ReportApprovals } from '../report-approvals.model';
import { AccountType } from '../../../enums/account-type.enum';
import { PlatformPerDiemRates } from '../platform-per-diem-rates.model';
import { ReportState } from '../../report-state.enum';
import { Department } from './department.model';
import { Level } from './level.model';

export interface Expense {
  // `activity_details` is not added on purpose
  added_to_report_at: string | null;
  admin_amount: number | null;
  approvals: ReportApprovals[];
  amount: number | null;
  approver_comments: string[];
  category: Pick<PlatformCategory, 'code' | 'id' | 'display_name' | 'name' | 'sub_category' | 'system_category'> | null;
  category_id: number | null;
  claim_amount: number | null;
  code: string | null;
  cost_center_id: number | null;
  cost_center: Pick<PlatformCostCenter, 'id' | 'name' | 'code'> | null;
  created_at: string;
  creator_user_id: string;
  currency: string;
  custom_fields: NameValuePair[];
  custom_fields_flattened: Record<string, unknown>;
  distance: number | null;
  distance_unit: MileageUnitEnum | null;
  employee: Employee;
  employee_id: string | null;
  ended_at: string | null;
  expense_rule_data: ExpenseRuleData | null;
  expense_rule_id: string | null;
  extracted_data: ParsedResponse | null;
  file_ids: string[];
  files: Pick<File, 'id' | 'name' | 'content_type' | 'type'>[];
  foreign_amount: number | null;
  foreign_currency: string | null;
  hotel_is_breakfast_provided: boolean | null;
  id: string;
  is_billable: boolean | null;
  is_corporate_card_transaction_auto_matched: boolean;
  is_exported: boolean | null;
  is_manually_flagged: boolean | null;
  is_physical_bill_submitted: boolean | null;
  is_policy_flagged: boolean | null;
  is_receipt_mandatory: boolean | null;
  is_reimbursable: boolean;
  is_split: boolean | null;
  is_verified: boolean | null;
  is_weekend_spend: boolean | null;
  last_exported_at: string | null;
  last_settled_at: string | null;
  last_verified_at: string | null;
  locations: Location[];
  matched_corporate_card_transaction_ids: string[];
  matched_corporate_card_transactions: MatchedCorporateCardTransaction[];
  merchant: string | null;
  mileage_calculated_amount: number | null;
  mileage_calculated_distance: number | null;
  mileage_is_round_trip: boolean | null;
  mileage_rate: Pick<PlatformMileageRates, 'id' | 'code' | 'vehicle_type'> | null;
  mileage_rate_id: number | null;
  missing_mandatory_fields: MissingMandatoryFields;
  org_id: string;
  per_diem_num_days: number | null;
  per_diem_rate: Pick<PlatformPerDiemRates, 'id' | 'code' | 'name'> | null;
  per_diem_rate_id: number | null;
  physical_bill_submitted_at: string | null;
  policy_checks: PolicyChecks;
  policy_amount: number | null;
  project_id: number | null;
  project: Pick<Project, 'id' | 'name' | 'sub_project' | 'code' | 'display_name'> | null;
  purpose: string | null;
  report: Report | null;
  report_id: string | null;
  report_settlement_id: string;
  seq_num: string;
  source: string;
  source_account: SourceAccount | null;
  source_account_id: string | null;
  spent_at: string | null;
  split_group_amount: number | null;
  split_group_id: string | null;
  started_at: string | null;
  state: ExpenseState;
  state_display_name: string;
  tax_amount: number | null;
  tax_group: Pick<PlatformTaxGroup, 'name' | 'percentage'> | null;
  tax_group_id: string | null;
  travel_classes: string[];
  updated_at: string;
  user: User;
  user_id: string;
  verifier_comments: string[];
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
  cardholder_name: string | null;
  amount: number;
  currency: string;
  spent_at: string | null;
  posted_at: string | null;
  description: string | null;
  foreign_currency: string | null;
  status: string | null;
  foreign_amount: number | null;
  merchant: string | null;
  category: string | null;
  matched_by: string | null;
}

export interface PolicyChecks {
  are_approvers_added: boolean;
  is_amount_limit_applied: boolean;
  is_flagged_ever: boolean;
  violations: Violation[] | null;
}

export interface Violation {
  policy_rule_description: string;
  policy_rule_id: string;
}

export interface Report {
  amount: number;
  approvals: ReportApprovals[] | null;
  id: string;
  last_approved_at: string;
  last_paid_at: string;
  last_submitted_at: string;
  seq_num: string | null;
  state: ReportState | null;
  settlement_id: string;
  last_verified_at: string;
  reimbursement_id: string;
  reimbursement_seq_num: string | null;
  title: string | null;
}

export interface ExpenseRuleData {
  merchant: string | null;
  is_billable: boolean | null;
  purpose: string | null;
  category_id: number | null;
  project_id: number | null;
  cost_center_id: number | null;
  custom_fields: NameValuePair[] | null;
}

export interface SourceAccount {
  id: string;
  type: AccountType;
}

export enum MileageUnitEnum {
  KM = 'KM',
  MILES = 'MILES',
}
