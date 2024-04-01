import { CustomFields } from './custom-fields.model';
import { Project } from './v1/project.model';
import { User } from '../user.model';
import { PlatformEmployee } from './platform-employee.model';
import { Department } from './v1/department.model';

export interface AdvanceRequestPlatform {
  advance_id: string;
  amount: number;
  approvals: [];
  code: string;
  created_at: Date;
  currency: string;
  custom_fields: CustomFields;
  employee: PlatformEmployee;
  employee_id: string;
  id: string;
  is_exported: boolean;
  is_policy_flagged: boolean;
  last_approved_at: Date;
  notes: string;
  org_id: string;
  policy_amount: number;
  project: Project;
  project_id: string;
  purpose: string;
  seq_num: string;
  source: string;
  state: string;
  updated_at: Date;
  user: User;
  user_id: string;
  department: Department;
}
