import { User } from '../user.model';
import { Delegatee } from './delegatee.model';
import { Department } from './v1/department.model';

export interface PlatformEmployee {
  id: string;
  user_id: string;
  user: User;
  code: string;
  department?: Department;
  department_id?: string;
  org_id: string;
  mobile?: string;
  is_mobile_verified: boolean;
  sms_opt_out_source: string | null;
  delegatees?: Delegatee[];
}
