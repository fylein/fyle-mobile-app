import { ExpenseView } from './expense-view.enum';

export interface ExpenseClickProperties {
  view: ExpenseView;
  category: string;
}
