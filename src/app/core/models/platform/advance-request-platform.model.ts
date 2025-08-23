import { Project } from './v1/project.model';
import { User } from '../user.model';
import { PlatformEmployee } from './platform-employee.model';
import { PlatformApproval } from './platform-approval.model';
import { PlatformAdvance } from './v1/platform-advance.model';
import { CustomField } from '../custom_field.model';
import { Comment } from './v1/comment.model';

export interface AdvanceRequestPlatform {
  advance: PlatformAdvance;
  advance_id: string;
  amount: number;
  code: string;
  comments: Comment[];
  created_at: Date;
  currency: string;
  approvals: PlatformApproval[];
  custom_fields: CustomField[];
  employee: PlatformEmployee;
  employee_id: string;
  id: string;
  is_exported: boolean;
  last_approved_at: Date;
  notes: string;
  org_id: string;
  policy_amount: number;
  project?: Project;
  project_id?: string;
  purpose: string;
  seq_num: string;
  source: string;
  state: string;
  updated_at: Date;
  user: User;
  user_id: string;
}

export interface AdvanceRequestPlatformResponse {
  file_ids: string[];
}
