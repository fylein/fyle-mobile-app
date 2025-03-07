export interface Employee {
  id: string;
  roles: string;
  is_enabled: boolean;
  has_accepted_invite: boolean;
  email: string;
  full_name: string;
  user_id: string;
  is_selected?: boolean; // used to show checkmarks while selecting employee
}
