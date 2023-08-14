import { User } from '../user.model';
export interface ReportApprovals {
  approver_user_id: string;
  approver_user: Pick<User, 'id' | 'full_name' | 'email'>;
  state: string;
}
