import { User } from './v1/user.model';

export interface PlatformApproval {
  approver_user_id: string;
  approver_user: User;
  state: string;
}
