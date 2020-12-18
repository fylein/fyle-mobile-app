import { TrpTravellerDetail } from './trip_traveller_detail.model';
import { TrpTripCity } from './trp_trip_city';

export interface ExtendedTripRequest {
  approvals: {
    [id: string]: {
      email: string;
      name: string;
      state: string;
    }
  };
  approvers: string[];
  custom_properties: any;
  ou_approver1_id: string;
  ou_approver2_id?: any;
  ou_approver3_id?: any;
  ou_business_unit?: any;
  ou_department?: any;
  ou_department_id?: any;
  ou_employee_id?: any;
  ou_id: string;
  ou_level?: any;
  ou_level_id?: any;
  ou_location: string;
  ou_mobile: string;
  ou_org_id: string;
  ou_org_name: string;
  ou_status: string;
  ou_sub_department?: any;
  ou_title?: any;
  project_name?: any;
  trp_amount?: any;
  trp_approval_state?: any;
  trp_approved_at?: any;
  trp_created_at: Date;
  trp_currency?: any;
  trp_custom_field_values: any;
  trp_end_date: Date;
  trp_id: string;
  trp_is_booked?: any;
  trp_is_pulled_back: boolean;
  trp_is_requested_cancellation?: any;
  trp_is_sent_back: boolean;
  trp_is_to_close?: any;
  trp_notes?: any;
  trp_org_user_id: string;
  trp_policy_flag: boolean;
  trp_policy_state: string;
  trp_project_id?: any;
  trp_project_name?: any;
  trp_purpose: string;
  trp_request_number: string;
  trp_source: string;
  trp_start_date: Date;
  trp_state: string;
  trp_traveller_details: TrpTravellerDetail[];
  trp_trip_cities: TrpTripCity[];
  trp_trip_type: string;
  trp_updated_at: Date;
  trp_updated_by: string;
  trp_visa_request?: any;
  us_email: string;
  us_full_name: string;
  internalStateDisplayName?: string;
}
