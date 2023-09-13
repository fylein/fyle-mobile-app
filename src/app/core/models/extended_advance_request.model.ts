import { Approval } from './approval.model';

export interface ExtendedAdvanceRequest {
  _search_document?: string;
  advance_request_approvals?:
    | { [id: string]: Approval }
    | {
        [id: string]: {
          state: string;
        };
      };
  areq_advance_id: string;
  areq_advance_request_number: string;
  areq_amount: number;
  areq_approval_state?: string[];
  areq_approved_at: Date;
  areq_approvers_ids?: string[];
  areq_created_at: Date;
  areq_currency: string;
  areq_custom_field_values: string;
  areq_id: string;
  areq_is_pulled_back: boolean;
  areq_is_sent_back: boolean;
  areq_last_updated_by?: string;
  areq_updated_by?: string;
  areq_notes: string;
  areq_org_user_id: string;
  areq_policy_amount: number;
  areq_policy_flag: boolean;
  areq_policy_state: string;
  areq_project_id: string;
  advance_id?: string;
  us_name?: string;
  areq_purpose: string;
  areq_source: string;
  areq_state: string;
  areq_updated_at: Date;
  custom_properties?: {
    [id: string | number]: boolean | string | number | string[];
  };
  ou_business_unit: string;
  ou_department: string;
  ou_department_id: string;
  ou_employee_id: string;
  ou_id: string;
  ou_level: string;
  ou_level_id?: string;
  ou_location: string;
  ou_mobile: string;
  ou_org_id: string;
  ou_org_name: string;
  ou_sub_department: string;
  ou_title: string;
  project_code: string;
  project_name: string;
  policy_amount?: number;
  policy_flag?: boolean;
  policy_state?: string;
  us_email: string;
  new_state?: string;
  us_full_name: string;
  adv_created_at?: Date;
  type?: string;
  currency?: string;
  amount?: number;
  created_at?: Date;
  purpose?: string;
  state?: string;
}
