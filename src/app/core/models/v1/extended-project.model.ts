export interface ExtendedProjectV1 {
  id: number;
  created_at: Date;
  updated_at: Date;
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
