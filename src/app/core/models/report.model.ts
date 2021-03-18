export interface ExtendedReport {
  approved_by: string[];
  ou_business_unit: string;
  ou_department: string;
  ou_department_id: string;
  ou_employee_id: string;
  ou_id: string;
  ou_level: string;
  ou_level_id: string;
  ou_location: string;
  ou_mobile: string;
  ou_org_id: string;
  ou_org_name: string;
  ou_status: string;
  ou_sub_department: string;
  ou_title: string;
  report_approvals: { [id: string]: { rank: number; state: string } }
  rp_amount: number;
  rp_approval_state: string;
  rp_approved_at: Date;
  rp_claim_number: string;
  rp_created_at: Date;
  rp_currency: string;
  rp_exported: boolean;
  rp_from_dt: Date;
  rp_id: string;
  rp_locations: string[];
  rp_manual_flag: boolean;
  rp_num_transactions: number;
  rp_org_user_id: string;
  rp_physical_bill: boolean;
  rp_physical_bill_at: Date;
  rp_policy_flag: boolean;
  rp_purpose: string;
  rp_reimbursed_at: Date;
  rp_risk_state: string;
  rp_risk_state_expense_count: {high_risk: number; moderate_risk: number; no_risk: number};
  rp_settlement_id: string;
  rp_source: string;
  rp_state: string; 
  rp_submitted_at: Date;
  rp_tax: number;
  rp_to_dt: Date;
  rp_trip_request_id: string;
  rp_type: string;
  rp_verification_state: string;
  rp_verified: boolean;
  sequential_approval_turn: boolean;
  us_email: string;
  us_full_name: string;
  _search_document: string;
}
export interface ExtendedReportStats {
  state?: string;
  title?: string;
  warning?: boolean;
  total_amount: number;
  total_count: number;
}
export interface ReportParams {
  state: string[];
}

export interface Report {
  amount?: number;
  approved_at?: Date;
  claim_number?: string;
  created_at?: Date;
  creator_id?: string;
  currency?: string;
  exported?: boolean;
  from_dt?: Date;
  id?: string;
  last_updated_by?: any; // in DB the stored values are diffrent, and we are not using this value in any place in mobile app.
  location1?: string;
  location2?: string;
  location3?: string;
  location4?: string;
  location5?: string;
  manual_flag?: boolean;
  num_transactions?: number;
  org_user_id?: string;
  physical_bill?: boolean;
  physical_bill_at?: Date;
  policy_flag?: boolean;
  purpose?: string;
  reimbursed_at?: Date;
  reimbursement_id?: string;
  settlement_id?: string;
  source?: string;
  state?: string;
  status_id?: string;
  submitted_at?: Date;
  tally_export_id?: string;
  tax?: number;
  to_dt?: Date;
  trip_request_id?: string;
  type?: string;
  updated_at?: Date;
  verification_state?: string;
}