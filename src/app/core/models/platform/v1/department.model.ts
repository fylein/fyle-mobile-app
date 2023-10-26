import { User } from './user.model';

export interface Department {
  id: string;
  org_id: string;
  created_at: string;
  updated_at: string;
  is_enabled: boolean;
  name: string;
  code: string;
  description: string;
  sub_department: string;
  department_head_user_ids: string[];
  department_head_users: User[];
  doc_url: string;
  display_name: string;
}
