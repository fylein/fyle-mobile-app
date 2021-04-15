export interface TxnDetail {
  amount: number;
  category?: any;
  currency: string;
  expense_number: string;
  id: string;
  num_files: number;
  purpose?: any;
  state: string;
  txn_dt: Date;
  user_can_delete?: any;
  vendor_id?: any;
  vendor_name?: any;
}
