export interface ReportActions {
  id: string;
  can_resubmit: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_edit: boolean;
  can_submit: boolean;
  can_add_approver: boolean;
  can_verify: boolean;
  can_admin_approve: boolean;
  can_payment_pending: boolean;
  can_undo_payment_pending: boolean;
  can_inquire: boolean;
}
