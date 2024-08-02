export interface ExportPayload {
  query_params: string;
  notify_emails: string[];
  config: {
    type: string;
    include_receipts: boolean;
  };
}
