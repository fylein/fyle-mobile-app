import { ExpenseView } from './expense-view.enum';

export interface ViewReportInfoProperties {
  view: ExpenseView;
  action: string;
  segment: string;
}
