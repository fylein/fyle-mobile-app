import { ApprovalState } from '../approval-state.enum';
import { User } from './v1/user.model';

export interface ReportApprovals {
  approver_user_id: string;
  approver_user: User;
  state: ApprovalState;
}
