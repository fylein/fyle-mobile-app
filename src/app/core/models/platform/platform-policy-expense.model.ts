export interface PlatformPolicyExpense {
  id: string;
  spent_at: Date;
  merchant?: string;
  foreign_currency?: string;
  foreign_amount?: number;
  claim_amount: number;
  purpose?: string;
  cost_center_id?: number;
  category_id?: number;
  project_id?: number;
  source_account_id?: string;
  tax_amount?: number;
  tax_group_id?: string;
  is_billable?: boolean;
  is_reimbursable?: boolean;
  distance?: number;
  distance_unit?: string;
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
  started_at?: Date;
  ended_at?: Date;
  per_diem_rate_id?: number;
  per_diem_num_days?: number;
  num_files?: number;
  is_matching_ccc?: boolean;
  mileage_rate_id?: number;
  mileage_calculated_distance?: number;
  mileage_calculated_amount?: number;
  travel_classes?: string[];
}
