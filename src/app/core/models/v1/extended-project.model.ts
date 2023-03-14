export interface ProjectV1 {
  id: number;
  created_at: Date | string; // API returns a string, but we convert it to a Date
  updated_at: Date | string; // API returns a string, but we convert it to a Date
  name: string;
  sub_project?: string;
  code: string;
  org_id: string;
  description: string;
  active: boolean;
  approver1_id?: number;
  approver2_id?: number;
  org_category_ids: number[];
}
