export interface File {
  advance_request_id?: string;
  created_at: Date;
  email_meta_data?: string;
  fyle_sub_url: string;
  id: string;
  invoice_id: string;
  name: string;
  org_user_id: string;
  password: string;
  purpose: string;
  receipt_coordinates: string;
  s3url: string;
  transaction_id?: string;
  file_download_url?: string;
  file_type?: string;
  url?: string;
  type?: string;
  thumbnail?: string;
}
