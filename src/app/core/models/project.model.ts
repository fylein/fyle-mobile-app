export interface Project {
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  sub_project?: string;
  code?: string;
  org_id: string;
  description?: string;
  active: boolean;
  approver1_id?: string;
  approver2_id?: string;
  org_category_ids?: number[];
}
