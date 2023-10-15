import { PlatformUser } from './platform-user.model';

export interface PlatformDepartment {
  id: string;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  is_enabled: boolean;
  name: string;
  code: string;
  description: string;
  sub_department: string;
  department_head_user_ids: string[];
  department_head_users: PlatformUser[];
  doc_url: string;
  display_name: string;
}
