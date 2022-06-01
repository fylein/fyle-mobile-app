export interface AccountDetail {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  type: string;
  currency: string;
  target_balance_amout: number;
  current_balance_amount: number;
  tentative_balance_amount: number;
  category: string;
  displayName?: string;
  isReimbursable?: boolean;
}
