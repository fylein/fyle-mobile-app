export interface TransactionStatus {
  id: string;
  created_at: Date;
  org_user_id: string;
  comment: string;
  diff: { [key: string]: [value: Object] };
  state: string;
  transaction_id: string;
  report_id: string;
  advance_request_id: string;
  trip_request_id: string;
}
