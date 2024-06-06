export interface AdvanceWallet {
  id: string;
  org_id: string;
  user_id: string;
  currency: string;
  balance_amount: number;
  created_at: Date;
  updated_at: Date;
  type?: string;
  isReimbursable?: boolean;
}
