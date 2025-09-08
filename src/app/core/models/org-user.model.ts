import { CustomField } from './custom_field.model';

export interface OrgUser {
  id: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  org_id: string;
  user_id?: string;
  employee_id?: number | string;
  location: string;
  level?: number | string;
  level_id?: string;
  band?: string;
  business_unit?: string;
  department_id?: string;
  department?: string;
  sub_department?: string;
  roles?: string[];
  approver1_id?: string;
  approver2_id?: string;
  approver3_id?: string;
  title?: string;
  status: string;
  branch_ifsc?: string;
  branch_account?: string;
  mobile: string;
  mobile_verified?: boolean | string;
  mobile_verified_at?: Date;
  is_primary?: boolean;
  owner?: boolean;
  joining_dt?: Date | string;
  special_email?: string;
  custom_field_values?: CustomField[];
  org_name?: string;
  settings_id?: string;
  cost_center_ids?: number[];
  mobile_verification_attempts_left?: number | string;
}
