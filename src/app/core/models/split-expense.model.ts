export interface SplitExpense {
  amount: number;
  currency: string;
  percentage: number;
  txn_dt: Date;
  category?: {
    code?: string;
    created_at: Date;
    displayName: string;
    enabled: boolean;
    fyle_category: string;
    id: number;
    name: string;
    org_id: string;
    sub_category: string;
    updated_at: Date;
  };
  project?: {
    ap1_email?: string;
    ap1_full_name?: string;
    ap2_email?: string;
    ap2_full_name?: string;
    project_active?: boolean;
    project_approver1_id: string;
    project_approver2_id: string;
    project_code: string;
    project_created_at: Date;
    project_description: string;
    project_id: number;
    project_name: string;
    project_org_category_ids?: number[];
    project_org_id: string;
    project_updated_at: Date;
    projectv2_name?: string;
    sub_project_name?: string;
  };
}
