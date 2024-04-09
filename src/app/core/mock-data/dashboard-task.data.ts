import { DashboardTask } from '../models/dashboard-task.model';
import { TaskIcon } from '../models/task-icon.enum';

export const dashboardTasksData: DashboardTask[] = [
  {
    icon: TaskIcon.WARNING,
    header: '77 Potential Duplicates',
    subheader: 'We detected 77 expenses which may be duplicates',
    count: 36,
    ctas: [{ content: 'Review', event: 6 }],
    hideAmount: true,
  },
  {
    icon: TaskIcon.REPORT,
    header: 'Reports sent back!',
    subheader: '5 reports worth ₹657.50K  were sent back by your approver',
    amount: '657.50K',
    count: 5,
    ctas: [{ content: 'View Reports', event: 2 }],
  },
  {
    icon: TaskIcon.REPORT,
    header: 'Expenses are ready to report',
    subheader: '5 expenses  worth ₹37.04K  can be added to a report',
    amount: '37.04K',
    count: 5,
    ctas: [{ content: 'Add to Report', event: 1 }],
  },
  {
    icon: TaskIcon.REPORT,
    header: 'Reports to be approved',
    subheader: '11 reports worth ₹13.78M  require your approval',
    amount: '13.78M',
    count: 11,
    ctas: [{ content: 'Show Reports', event: 5 }],
  },
];
