import { AccountType } from '../enums/account-type.enum';

export interface AccountDetail {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  type: AccountType;
  currency: string;
  target_balance_amount: number;
  current_balance_amount: number;
  tentative_balance_amount: number;
  category: string;
  displayName?: string;
  isReimbursable?: boolean;
}
