export interface ReportPermissions {
  can_resubmit: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_edit: boolean;
  can_submit: boolean;
  can_add_approver: boolean;
  can_verify: boolean;
  can_admin_approve: boolean;
  can_move_to_payment_pending: boolean;
  can_undo_payment_pending: boolean;
  can_inquire: boolean;
  can_admin_or_approver_edit: boolean;
}
