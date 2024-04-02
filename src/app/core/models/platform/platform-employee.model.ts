import { User } from '../user.model';
import { Department } from './v1/department.model';

export interface PlatformEmployee {
  id: string;
  user_id: string;
  user: User;
  code: string;
  department: Department;
  department_id: string;
  org_id: string;
}
