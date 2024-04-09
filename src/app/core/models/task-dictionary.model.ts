import { DashboardTask } from './dashboard-task.model';

export interface TaskDictionary {
  sentBackReports: DashboardTask[];
  draftExpenses: DashboardTask[];
  unsubmittedReports: DashboardTask[];
  unreportedExpenses: DashboardTask[];
  teamReports: DashboardTask[];
  sentBackAdvances: DashboardTask[];
  potentialDuplicates: DashboardTask[];
}
