export interface MergeExpensesPayload {
  source_txn_ids: string[];
  target_txn_id: string;
  target_txn_fields: {
    [key: string]: any;
  };
}
