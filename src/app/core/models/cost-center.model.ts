export interface CostCenter {
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  code: string;
  active: boolean;
  org_id: string;
  description: string;
}
