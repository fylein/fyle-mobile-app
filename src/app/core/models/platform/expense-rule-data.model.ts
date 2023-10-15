import { NameValuePair } from '../name-value-pair.model';

export interface ExpenseRuleData {
  merchant: string;
  is_billable: boolean;
  purpose: string;
  category_id: number;
  project_id: number;
  cost_center_id: number;
  custom_fields: NameValuePair[];
}
