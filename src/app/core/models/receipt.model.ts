import { OrgUser } from './org-user.model';

export interface ExtractedData {
  amount: number;
  currency: string;
  category: string;
  date: Date;
  vendor: string;
  invoice_dt: Date;
}

export interface Receipt {
  created_at: Date;
  extracted_data: ExtractedData;
  extraction_state: string;
  file_ids: string[];
  id: string;
  last_updated_by: OrgUser;
  number_of_files: number;
  org_user_id: string;
  source: string;
  transaction_id: string;
  transaction_linked_at: Date;
  transaction_linked_by: string;
  updated_at: Date;
}
