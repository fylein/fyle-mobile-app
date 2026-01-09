import { BudgetCreator } from './budget-creator.model';

export interface Budget {
  alert_threshold: number;
  amount_limit: number;
  category_ids: number[];
  cost_center_ids: string[];
  created_at: string;
  department_ids: string[];
  fiscal_year_start_month: number;
  id: string;
  is_enabled: boolean;
  name: string;
  observer_ids: string[];
  org_id: string;
  project_ids: string[];
  type: string;
  updated_at: string;
  amount_spent: number;
  amount_remaining: number;
  budget_start_date: string;
  budget_end_date: string;
  utilisation_percentage: number;
  budget_creator: BudgetCreator;
  budgetOn?: string;
  budget_type?: string;
  status: string;
}
