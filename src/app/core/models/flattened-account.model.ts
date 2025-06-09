import { AccountType } from '../enums/account-type.enum';

export interface FlattenedAccount {
  // New platform API fields
  id: string;
  created_at: string;
  updated_at: string;
  currency: string;
  current_balance_amount: number;
  tentative_balance_amount: number;
  type: AccountType;
  org_id: string;
  user_id: string;
  category_id: string | null;
  displayName?: string;
  isReimbursable?: boolean;
  advance?: {
    id: string | null;
    purpose: string | null;
    // eslint-disable-next-line id-blacklist
    number: string | number | null;
  };
}
