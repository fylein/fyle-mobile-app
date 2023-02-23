import { Approval } from './approval.model';

export interface ExtendedAdvanceRequest {
  _search_document?: string;
  advance_request_approvals:
    | { [id: string]: Approval }
    | {
        [id: string]: {
          state: string;
        };
      };
  areq_advance_id: string;
  areq_advance_request_number: string;
  areq_amount: number;
  areq_approval_state: any;
  areq_approved_at: Date;
  areq_approvers_ids: any;
  areq_created_at: Date;
  areq_currency: string;
  areq_custom_field_values: string;
  areq_id: string;
  areq_is_pulled_back: boolean;
  areq_is_sent_back: boolean;
  areq_last_updated_by: string;
  areq_notes: string;
  areq_org_user_id: string;
  areq_policy_amount: any;
  areq_policy_flag: boolean;
  areq_policy_state: any;
  areq_project_id: any;
  areq_purpose: string;
  areq_source: string;
  areq_state: string;
  areq_updated_at: Date;
  custom_properties: any;
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
  ou_sub_department: string;
  ou_title: string;
  project_code: any;
  project_name: any;
  us_email: string;
  us_full_name: string;
}
