import { ExpenseState } from '../expense-state.enum';
import { Location } from '../location.model';
import { MileageUnitEnum } from '../mileage-unit.enum';
import { NameValuePair } from '../name-value-pair.model';
import { ParsedResponse } from '../parsed_response.model';
import { PlatformCorporateCardTransaction } from './platform-corporate-card-transaction.model';
import { ExpenseRuleData } from './expense-rule-data.model';
import { MissingMandatoryFields } from './missing-mandatory-fields.model';
import { PlatformCategory } from './platform-category.model';
import { PlatformCostCenter } from './platform-cost-center.model';
import { PlatformEmployee } from './platform-employee.model';
import { PlatformFile } from './platform-file.model';
import { PlatformMileageRates } from './platform-mileage-rates.model';
import { PlatformProject } from './platform-project.model';
import { PlatformReport } from './platform-report.model';
import { PlatformTaxGroup } from './platform-tax-group.model';
import { PlatformUser } from './platform-user.model';
import { PolicyChecks } from './policy-checks.model';
import { ReportApprovals } from './report-approvals.model';
import { AccountType } from '../../enums/account-type.enum';
import { PlatformPerDiemRates } from './platform-per-diem-rates.model';

export interface PlatformExpense {
  // `activity_details` is not added on purpose
  added_to_report_at: Date;
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
  created_at: Date;
  creator_user_id: string;
  currency: string;
  custom_fields: NameValuePair[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  custom_fields_flattened: Record<string, any>;
  distance: number;
  distance_unit: MileageUnitEnum;
  employee: Pick<
    PlatformEmployee,
    | 'business_unit'
    | 'code'
    | 'custom_fields'
    | 'flattened_custom_field'
    | 'department'
    | 'department_id'
    | 'id'
    | 'level'
    | 'level_id'
    | 'location'
    | 'org_id'
    | 'org_name'
    | 'has_accepted_invite'
    | 'is_enabled'
    | 'title'
    | 'user'
    | 'user_id'
  >;
  employee_id: string;
  ended_at: Date;
  expense_rule_data: ExpenseRuleData;
  expense_rule_id: string;
  extracted_data: ParsedResponse;
  file_ids: string[];
  files: Pick<PlatformFile, 'id' | 'name' | 'content_type' | 'type'>[];
  foreign_amount: number;
  foreign_currency: string;
  hotel_is_breakfast_provided: boolean;
  id: string;
  is_billable: boolean;
  is_corporate_card_transaction_auto_matched: boolean;
  is_exported: boolean;
  is_manually_flagged: boolean;
  is_physical_bill_submitted: boolean;
  is_policy_flagged: boolean;
  is_receipt_mandatory: boolean;
  is_reimbursable: boolean;
  is_split: boolean;
  is_verified: boolean;
  is_weekend_spend: boolean;
  last_exported_at: Date;
  last_settled_at: Date;
  last_verified_at: Date;
  locations: Location[];
  matched_corporate_card_transaction_ids: string[];
  matched_corporate_card_transactions:
    | Pick<
        PlatformCorporateCardTransaction,
        | 'amount'
        | 'category'
        | 'corporate_card_id'
        | 'spent_at'
        | 'currency'
        | 'description'
        | 'foreign_amount'
        | 'foreign_currency'
        | 'id'
        | 'merchant'
      >
    | {
        bank_name: string;
        cardholder_name: string;
        corporate_card_number: string;
        masked_corporate_card_number: string;
        matched_by: PlatformUser;
        posted_at: Date;
      };
  merchant: string;
  mileage_calculated_amount: number;
  mileage_calculated_distance: number;
  mileage_is_round_trip: boolean;
  mileage_rate: Pick<PlatformMileageRates, 'id' | 'code' | 'vehicle_type'>;
  mileage_rate_id: string;
  missing_mandatory_fields: MissingMandatoryFields;
  org_id: string;
  per_diem_num_days: number;
  per_diem_rate: Pick<PlatformPerDiemRates, 'id' | 'code' | 'name'>;
  per_diem_rate_id: string;
  physical_bill_submitted_at: Date;
  policy_checks: PolicyChecks;
  policy_amount: number;
  project_id: number;
  project: Pick<PlatformProject, 'id' | 'name' | 'sub_project' | 'code' | 'display_name'>;
  purpose: string;
  report:
    | Pick<
        PlatformReport,
        | 'amount'
        | 'approvals'
        | 'id'
        | 'last_approved_at'
        | 'last_paid_at'
        | 'last_submitted_at'
        | 'seq_num'
        | 'state'
        | 'settlement_id'
      > & {
        last_verified_at: Date;
        reimbursement_id: number;
        settlement_locked_at: Date;
        reimbursement_seq_num: string;
        title: string;
      };
  report_id: string;
  seq_num: string;
  source: string;
  source_account: {
    id: string;
    type: AccountType;
  };
  source_account_id: string;
  spent_at: Date;
  split_group_amount: number;
  split_group_id: string;
  started_at: Date;
  state: ExpenseState;
  state_display_name: string;
  tax_amount: number;
  tax_group: Pick<PlatformTaxGroup, 'name' | 'percentage'>;
  tax_group_id: string;
  travel_classes: string[];
  updated_at: Date;
  user: PlatformUser;
  user_id: string;
  verifier_comments: string[];
}
