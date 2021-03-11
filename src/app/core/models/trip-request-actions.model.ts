export interface TripRequestActions {
  id: string;
  can_save: boolean;
  can_submit: boolean;
  can_reject: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_edit: boolean;
  can_inquire: boolean;
  can_pull_back: boolean;
  can_request_cancel: boolean;
  can_close_trip: boolean;
  can_add_approver: boolean;
  can_disable_approval: boolean;
}
