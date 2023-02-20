export interface TxnDetail {
  amount: number;
  category?: string;
  currency: string;
  expense_number: string;
  category_display_name?: string;
  sub_category?: string;
  id: string;
  num_files: number;
  purpose?: string;
  state: string;
  txn_dt: Date;
  user_can_delete?: boolean;
  vendor_id?: number;
  vendor_name?: string;
}
