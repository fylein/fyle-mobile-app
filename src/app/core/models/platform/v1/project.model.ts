import { User } from './user.model';

export interface Project {
  id: number;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  sub_project: string;
  code: string;
  display_name: string;
  description: string;
  is_enabled: boolean;
  restricted_spender_user_ids: string[];
  approver_user_ids: string[];
  approver_users: User[];
  category_ids: number[];
}
