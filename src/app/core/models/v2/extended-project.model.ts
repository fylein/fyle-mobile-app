export interface ExtendedProject {
  ap1_email: string;
  ap1_full_name: string;
  ap2_email: string;
  ap2_full_name: string;
  project_active: boolean;
  project_approver1_id: string;
  project_approver2_id: string;
  project_code: string;
  project_created_at: Date;
  project_description: string;
  project_id: number;
  project_name: string;
  project_org_category_ids: number[];
  project_org_id: string;
  project_updated_at: Date;
  projectv2_name: string;
  sub_project_name: string;
}
