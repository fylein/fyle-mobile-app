import deepFreeze from 'deep-freeze-strict';

import { ApprovalPublic } from '../models/approval-public.model';
import { Approval } from '../models/approval.model';

export const advanceReqApprovals: Approval[] = deepFreeze([
  {
    id: 8314,
    created_at: null,
    updated_at: null,
    approver_id: 'ouX8dwsbLCLv',
    advance_request_id: 'areqa4CojbCAqd',
    state: 'APPROVAL_DONE',
    added_by: null,
    approver_email: 'ajain@fyle.in',
    disabled_by: null,
    approver_name: 'Abhishek Jain',
    approver_org_id: 'orNVthTo2Zyo',
    comment: null,
  },
]);

export const advanceReqApprovalsPublic: ApprovalPublic[] = deepFreeze([
  {
    state: 'APPROVAL_PENDING',
    approver_email: 'john.doe@example.com',
    approver_name: 'John Doe',
  },
]);
