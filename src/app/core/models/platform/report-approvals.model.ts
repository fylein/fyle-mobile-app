import { User } from './v1/user.model';

export interface ReportApprovals {
  approver_user_id: string;
  approver_user: User;
  state: ApprovalState;
}

export enum ApprovalState {
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  APPROVAL_DONE = 'APPROVAL_DONE',
  APPROVAL_DISABLED = 'APPROVAL_DISABLED',
}
