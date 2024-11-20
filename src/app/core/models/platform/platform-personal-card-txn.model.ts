import { PlatformPersonalCardMatchedExpense } from './platform-personal-card-matched-expense.model';

export interface PlatformPersonalCardTxn {
  id: string;
  org_id: string;
  user_id: string;
  personal_card_id: string;
  amount: number;
  currency: string;
  foreign_amount: number | null;
  foreign_currency: string | null;
  spent_at: string;
  category: string;
  merchant: string;
  state: string;
  description: string;
  external_transaction_id: string;
  matched_expense_ids: string[];
  matched_expenses: PlatformPersonalCardMatchedExpense[];
  created_at: string;
  updated_at: string;
}
