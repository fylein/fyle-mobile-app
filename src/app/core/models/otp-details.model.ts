export interface OtpDetails {
  account_sid: number;
  amount: number;
  attempts_left: number;
  channel: string;
  date_created: string;
  date_updated: string;
  lookup: string;
  payee: string;
  service_sid: string;
  sid: string;
  status: string;
  to: {
    endpoint: string;
  };
  url: string;
  valid: boolean;
}
