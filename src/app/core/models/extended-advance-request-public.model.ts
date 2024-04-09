import { AdvanceRequestState } from './advance-request-state.model';
import { CustomField } from './custom_field.model';
import { PlatformApproval } from './platform/platform-approval.model';

export interface ExtendedAdvanceRequestPublic {
  areq_advance_id: string;
  areq_advance_request_number: string;
  areq_amount: number;
  areq_approved_at: Date;
  areq_created_at: Date;
  areq_currency: string;
  areq_id: string;
  areq_is_pulled_back: boolean;
  areq_notes: string;
  areq_org_user_id: string;
  areq_project_id: string;
  advance_id?: string;
  us_name?: string;
  areq_purpose: string;
  areq_source: string;
  areq_state: string;
  areq_updated_at: Date;
  ou_department_id: string;
  ou_employee_id: string;
  ou_id: string;
  ou_org_id: string;
  ou_department: string;
  ou_sub_department: string;
  us_email: string;
  us_full_name: string;
  areq_custom_field_values: CustomField[];
  areq_is_sent_back: boolean;
  created_at?: Date;
  project_name?: string;
}
