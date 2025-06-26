export interface GroupedReportStats {
  state: string;
  count: number;
  total_amount: number;
  reimbursable_amount: number;
  failed_amount: number | null;
  failed_count: number | null;
  processing_amount: number | null;
  processing_count: number | null;
}
