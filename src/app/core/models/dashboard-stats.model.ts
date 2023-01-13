export interface DashboardStats {
  count: number;
  sum: number;
}

export interface ReportDashboardStats {
  draft: DashboardStats;
  report: DashboardStats;
  approved: DashboardStats;
  paymentPending: DashboardStats;
}
