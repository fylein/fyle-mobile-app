import { GeneratedFormProperties } from './generated-form-properties.model';

export interface MergeExpensesPayload {
  source_expense_ids: string[];
  target_expense_id: string;
  target_expense_fields: Partial<GeneratedFormProperties>;
}
