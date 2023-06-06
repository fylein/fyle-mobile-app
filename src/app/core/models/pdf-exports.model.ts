export interface PdfExport {
  id: string;
  sent_by: string;
  sent_to: string;
  created_at: Date;
  report_ids: string[];
  expense_ids: string[];
  file_id: string;
  per_user: boolean;
  org_user_id: string;
  status: string;
  updated_at: Date;
  include_receipts: boolean;
  column_mappings: string;
  batch_size: number;
}
