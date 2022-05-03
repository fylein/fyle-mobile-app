export interface SpenderPlatformExpense {
  id?: string;
  user_id?: string;
  user?: {
    id?: string;
    email?: string;
    full_name?: string;
  };
  org_id?: string;
  created_at?: Date;
  updated_at?: Date;
  spent_at?: Date;
  source?: string;
  merchant?: string;
  currency?: string;
  amount?: number;
  claim_amount?: number;
  policy_amount?: number;
  admin_amount?: number;
  foreign_currency?: string;
  foreign_amount?: number;
  purpose?: string;
  cost_center_id?: number;
  cost_center?: {
    id?: number;
    name?: string;
    code?: string;
  };
  category_id?: number;
  category?: {
    id?: number;
    name?: string;
    sub_category?: string;
    code?: number;
  };
  project_id?: number;
  project?: {
    id?: number;
    name?: string;
    sub_project?: string;
    code?: string;
  };
  source_account_id?: string;
  source_account?: {
    id?: string;
    type?: string;
  };
  tax_amount?: number;
  tax_group_id?: string;
  is_billable?: boolean;
  is_reimbursable?: boolean;
  distance?: number;
  distance_unit?: string;
  mileage_calculated_distance?: number;
  mileage_calculated_amount?: number;
  mileage_rate_id?: number;
  mileage_rate?: {
    id?: number;
    vehicle_type?: string;
    code?: string;
  };
  mileage_is_round_trip?: boolean;
  per_diem_rate_id?: number;
  per_diem_rate?: {
    id?: number;
    name?: string;
    code?: string;
  };
  num_days?: number;
  started_at?: Date;
  ended_at?: Date;
  travel_classes?: string[];
  hotel_is_breakfast_provided?: boolean;
  locations?: [
    {
      city?: string;
      state?: string;
      display_name?: string;
      country?: string;
      formatted_address?: string;
      latitude?: number;
      longitude?: number;
    }
  ];
  custom_fields?: [
    {
      name?: string;
      value?: string;
    }
  ];
  code?: string;
  state?: string;
  seq_num?: string;
  report_id?: string;
  added_to_report_at?: Date;
  report?: {
    id?: string;
    last_approved_at?: Date;
    last_submitted_at?: Date;
    seq_num?: string;
    title?: string;
    state?: string;
    settlement_id?: string;
    last_paid_at?: Date;
  };
  is_verified?: boolean;
  last_verified_at?: Date;
  is_receipt_mandatory?: boolean;
  is_exported?: boolean;
  last_exported_at?: Date;
  file_ids?: string[];
  files?: [
    {
      id?: string;
      name?: string;
      type?: string;
      content_type?: string;
    }
  ];
  approvals?: [
    {
      approver_user_id?: string;
      approver_user?: {
        id?: string;
        email?: string;
        full_name?: string;
      };
      state?: string;
    }
  ];
  employee_id?: string;
  employee?: {
    id?: string;
    user_id?: string;
    user?: {
      id?: string;
      email?: string;
      full_name?: string;
    };
    code?: string;
    org_id?: string;
    department_id?: string;
    department?: {
      id?: string;
      code?: string;
      name?: string;
      sub_department?: string;
    };
  };
  is_corporate_card_transaction_auto_matched?: boolean;
  matched_corporate_card_transaction_ids?: string[];
  matched_corporate_card_transactions?: [
    {
      id?: string;
      corporate_card_id?: string;
      corporate_card_number?: string;
    }
  ];
  last_settled_at?: Date;
  missing_mandatory_fields?: [
    {
      expense_field_ids?: number[];
      amount?: boolean;
      currency?: boolean;
    }
  ];
  activity_details: any;
}
