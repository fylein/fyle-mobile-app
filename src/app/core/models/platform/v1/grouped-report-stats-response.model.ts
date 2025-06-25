export interface GroupedReportStatsResponse {
  state: string;
  count: number;
  total_amount: number;
  reimbursable_amount: number;
  // These fields are only non-null for PAYMENT_PROCESSING state
  failed_amount: number | null;
  failed_count: number | null;
  processing_amount: number | null;
  processing_count: number | null;
}
