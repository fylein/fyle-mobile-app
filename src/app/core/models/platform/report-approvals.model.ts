import { ApprovalState } from './approval-state.enum';
import { User } from './v1/user.model';

export interface ReportApprovals {
  // For approver_type: SYSTEM, backend sends approver_user: null and approver_user_id: null
  approver_user_id: string | null;
  approver_user: User | null;
  approver_type?: 'SYSTEM' | 'USER';
  state: ApprovalState;
  approver_order: number;
}
