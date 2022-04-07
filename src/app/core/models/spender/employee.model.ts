export interface Employee {
  ou_id: string;
  ou_org_id: string;
  ou_roles: string;
  ou_status: string;
  us_email: string;
  us_full_name: string;
  us_id: string;
  is_selected?: boolean; // used to show checkmarks while selecting employee
}
