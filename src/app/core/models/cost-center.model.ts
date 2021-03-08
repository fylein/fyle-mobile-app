export interface CostCenter {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  code?: string;
  active?: boolean;
  org_id: string;
  description?: string;  
}