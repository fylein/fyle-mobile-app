import { ApprovalState } from './approval-state.enum';
import { User } from './v1/user.model';

export interface ReportApprovals {
  approver_user_id: string;
  approver_user: User;
  approver_type?: 'SYSTEM' | 'USER';
  state: ApprovalState;
  approver_order: number;
}
