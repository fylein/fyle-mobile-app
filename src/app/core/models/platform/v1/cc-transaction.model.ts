import { AssignorUser } from './assignor-user.model';
import { CorporateCard } from './corporate-card.model';
import { CCMatchedExpense } from './cc-matched-expense.model';
import { CCTransactionMetadata } from './cc-transaction-metadata';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';

export interface corporateCardTransaction {
  id: string;
  org_id: string;
  user_id: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
  amount: number;
  currency: string;
  spent_at: string;
  post_date: string;
  description: string;
  statement_id: string;
  can_delete: boolean;
  foreign_currency: string;
  foreign_amount: number;
  code: string;
  merchant: string;
  mcc: string;
  category: string;
  corporate_card_id: string;
  corporate_card: CorporateCard;
  assignor_user_id: string;
  assignor_user: AssignorUser;
  is_assigned: boolean;
  last_assigned_at: Date;
  is_marked_personal: boolean;
  last_marked_personal_at: Date;
  is_dismissed: boolean;
  is_exported: boolean;
  last_dismissed_at: Date;
  is_auto_matched: boolean;
  auto_suggested_expense_ids: string[];
  last_auto_matched_at: Date;
  matched_expense_ids: string[];
  matched_expenses: CCMatchedExpense[];
  last_user_matched_at: Date;
  metadata?: CCTransactionMetadata;
  transaction_status?: ExpenseTransactionStatus;
}
