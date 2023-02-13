export interface AdvanceRequestsCustomFields {
  id: number;
  org_id: string;
  created_at?: Date;
  updated_at?: Date;
  type?: string;
  name: string;
  options?: string[];
  mandatory?: boolean;
  active: boolean;
  added_by: string;
  last_updated_by?: string;
  placeholder?: string;
}
