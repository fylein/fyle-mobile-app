export interface FileObject {
  id: string;
  org_user_id: string;
  created_at: Date;
  name: string;
  s3url: string;
  transaction_id?: string;
  invoice_id?: any;
  advance_request_id?: any;
  transportation_booking_id?: any;
  purpose: string;
  password?: any;
  receipt_coordinates?: any;
  email_meta_data?: any;
  fyle_sub_url: string;
  url?: string;
  type?: string;
  thumbnail?: string;
}
