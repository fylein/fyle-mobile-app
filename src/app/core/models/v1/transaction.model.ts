export interface Transaction {
  activity_details: string;
  activity_policy_pending: boolean;
  admin_amount: number;
  amount: number;
  billable: boolean;
  bus_travel_class: string;
  category: string;
  cost_center_id: number;
  created_at: Date;
  creator_id: string;
  currency: string;
  custom_properties: [];
  distance: number;
  distance_unit: string;
  exchange_rate: number;
  exchange_rate_diff_percentage: number;
  expense_number: string;
  external_id: string;
  extracted_data: Object;
  flight_journey_travel_class: string;
  flight_return_travel_class: string;
  from_dt: Date;
  fyle_category: string;
  hotel_is_breakfast_provided: boolean;
  id: string;
  invoice_number: number;
  locations: [];
  mandatory_fields_present: boolean;
  manual_flag: boolean;
  mileage_calculated_amount: number;
  mileage_calculated_distance: number;
  mileage_is_round_trip: boolean;
  mileage_rate: number;
  mileage_vehicle_type: string;
  num_days: number;
  num_files: number;
  org_category_id: number;
  org_user_id: string;
  orig_amount: number;
  orig_currency: string;
  payment_id: string;
  per_diem_rate_id: string;
  physical_bill: boolean;
  physical_bill_at: Date;
  platform_vendor: string;
  platform_vendor_id: string;
  policy_amount: number;
  policy_flag: boolean;
  policy_state: string;
  project_id: string;
  proposed_exchange_rate: number;
  purpose: string;
  report_id: string;
  reported_at: Date;
  skip_reimbursement: boolean;
  source: string;
  source_account_id: string;
  split_group_id: string;
  split_group_user_amount: number;
  state: string;
  status_id: string;
  tax: string;
  tax_amount: number;
  tax_group_id: string;
  taxi_travel_class: string;
  to_dt: Date;
  train_travel_class: string;
  txn_dt: Date;
  updated_at: Date;
  user_amount: number;
  user_reason_for_duplicate_expenses: string;
  vendor: string;
  vendor_id: number;
}
