export type ReportInfoPaymentMode = {
  [paymentMode: string]: {
    name: string;
    key: string;
    amount: number;
    count: number;
  };
};
