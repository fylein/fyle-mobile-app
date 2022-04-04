import { TaskCta } from './task-cta.model';
import { TaskIcon } from './task-icon.enum';

// Task is a keyword, so renamed to dashboard task
export interface DashboardTask {
  icon: TaskIcon;
  header: string;
  subheader: string;
  amount?: string;
  count: number;
  ctas: TaskCta[];
  data?: any;
  hideAmount?: boolean;
}
