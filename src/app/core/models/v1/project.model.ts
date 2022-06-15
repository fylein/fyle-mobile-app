export interface Project {
  active: boolean;
  approver1_id?: string;
  approver2_id?: string;
  code: string;
  created_at: Date;
  description: string;
  id: number;
  name: string;
  org_category_ids?: number[];
  org_id: string;
  sub_project: string;
  updated_at: Date;
}
