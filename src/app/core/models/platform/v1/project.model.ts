import { User } from './user.model';

export interface Project {
  id: number;
  org_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  sub_project: string | null;
  code: string | null;
  display_name: string;
  description: string | null;
  is_enabled: boolean;
  restricted_spender_user_ids: string[];
  approver_user_ids: string[];
  approver_users: User[];
  category_ids: number[] | null;
}
