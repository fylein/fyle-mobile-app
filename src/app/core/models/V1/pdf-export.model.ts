export interface PdfExport {
  created_at: Date;
  file_id: string;
  id: string;
  org_user_id: string;
  per_user: boolean;
  report_ids: string[];
  sent_by: string;
  sent_to: string;
  status: string;
  updated_at: Date;
}