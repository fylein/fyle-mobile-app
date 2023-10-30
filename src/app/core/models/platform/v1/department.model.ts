import { User } from './user.model';

export interface Department {
  id: string;
  org_id: string;
  created_at: string;
  updated_at: string;
  is_enabled: boolean;
  name: string;
  code: string | null;
  description: string | null;
  sub_department: string | null;
  department_head_user_ids: string[] | null;
  department_head_users: User[] | null;
  doc_url: string | null;
  display_name: string;
}
