export interface PaymentModeSummary {
  [paymentMode: string]: {
    name: string;
    key: string;
    amount: number;
    count: number;
  };
}
