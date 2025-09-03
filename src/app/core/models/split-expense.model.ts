import { ProjectV2 } from './v2/project-v2.model';

export interface SplitExpense {
  amount: number;
  currency: string;
  percentage: number;
  spent_at: string;
  category?: {
    code?: string;
    created_at: string;
    displayName: string;
    enabled: boolean;
    fyle_category: string;
    id: number;
    name: string;
    org_id: string;
    sub_category: string;
    updated_at: string;
  };
  project?: ProjectV2;
  cost_center?: {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    code: string;
    active: boolean;
    org_id: string;
    description: string;
  };
}
