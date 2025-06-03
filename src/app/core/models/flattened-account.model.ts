import { AccountType } from '../enums/account-type.enum';

export interface FlattenedAccount {
  acc_id: string;
  acc_created_at: string;
  acc_updated_at: string;
  acc_name: string;
  acc_type: string;
  acc_currency: string;
  acc_target_balance_amount: number;
  acc_current_balance_amount: number;
  acc_tentative_balance_amount: number;
  acc_category: string;
  ou_id: string;
  ou_org_id: string;
  us_email: string;
  us_full_name: string;
  org_domain: string;
  advance_purpose: string;
  advance_number: number;
  orig_currency: string;
  orig_amount: number;
  amount: number;
  advance_id: string;

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
    advanceNumber: string | number | null;
  };
}
