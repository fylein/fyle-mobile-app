import { PlatformPersonalCardMatchedExpense } from './platform-personal-card-matched-expense.model';
import { PlatformPersonalCardTxnState } from './platform-personal-card-txn-state.enum';

export interface PlatformPersonalCardTxn {
  id: string;
  org_id: string;
  user_id: string;
  personal_card_id: string;
  amount: number;
  currency: string;
  foreign_amount: string | null;
  foreign_currency: string | null;
  spent_at: Date;
  category: string;
  merchant: string;
  state: PlatformPersonalCardTxnState;
  description: string;
  external_transaction_id: string;
  matched_expense_ids: string[];
  matched_expenses: PlatformPersonalCardMatchedExpense[];
  created_at: Date;
  updated_at: Date;
  transactionType?: 'credit' | 'debit';
}
