export interface AdvanceRequestsCustomFields {
  id: number;
  org_id: string;
  created_at: string;
  updated_at: string;
  type?: string;
  name: string;
  options: any;
  mandatory?: boolean;
  active: boolean;
  added_by: string;
  last_updated_by: string;
  placeholder?: any;
}
