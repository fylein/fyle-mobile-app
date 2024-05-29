import deepFreeze from 'deep-freeze-strict';

import { ReportPermissions } from '../models/report-permissions.model';

export const apiReportPermissions: ReportPermissions = deepFreeze({
  can_resubmit: false,
  can_approve: false,
  can_delete: true,
  can_edit: true,
  can_export: true,
  can_submit: false,
  can_add_approver: true,
  can_remove_approver: true,
  can_verify: true,
  can_admin_approve: true,
  can_admin_or_approver_edit: false,
  can_move_to_payment_pending: false,
  can_send_back: true,
});
