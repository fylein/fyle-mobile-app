export interface FileObject {
  id?: string;
  org_user_id?: string;
  created_at?: Date;
  name?: string;
  s3url?: string;
  transaction_id?: string;
  invoice_id?: string;
  advance_request_id?: string;
  purpose?: string;
  content?: string;
  password?: string;
  receipt_coordinates?: { x: number; y: number; width: number; height: number };
  email_meta_data?: string;
  fyle_sub_url?: string;
  url?: string;
  type?: string;
  thumbnail?: string;
  file_download_url?: string;
  file_type?: string;
}
