import { PlatformExpenseFieldsData } from '../../models/platform/platform-expense-fields-data.model';

export interface PlatformExpenseFields {
  count: number;
  offset: number;
  data: PlatformExpenseFieldsData[];
}
