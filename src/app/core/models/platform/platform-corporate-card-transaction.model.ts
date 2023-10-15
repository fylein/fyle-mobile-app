import { PlatformCategory } from './platform-category.model';
import { PlatformCorporateCard } from './platform-corporate-card.model';
import { PlatformExpense } from './platform-expense.model';
import { PlatformUser } from './platform-user.model';

export interface PlatformCorporateCardTransaction {
  amount: number;
  assignor_user: PlatformUser;
  assignor_user_id: string;
  auto_suggested_expense_ids: string[];
  can_delete: boolean;
  category: Pick<PlatformCategory, 'code' | 'id' | 'display_name' | 'name' | 'sub_category' | 'system_category'>;
  code: string;
  corporate_card:
    | Pick<PlatformCorporateCard, 'bank_name' | 'card_number' | 'id'>
    | {
        masked_number: string;
        user_email: string;
        user_full_name: string;
      };
  corporate_card_id: string;
  created_at: Date;
  currency: string;
  description: string;
  foreign_amount: number;
  foreign_currency: string;
  id: string;
  is_assigned: boolean;
  is_auto_matched: boolean;
  is_dismissed: boolean;
  is_exported: boolean;
  is_marked_personal: boolean;
  last_assigned_at: Date;
  last_auto_matched_at: Date;
  last_dismissed_at: Date;
  last_marked_personal_at: Date;
  last_user_matched_at: Date;
  matched_expense_ids: string[];
  matched_expenses:
    | Pick<
        PlatformExpense,
        | 'amount'
        | 'currency'
        | 'foreign_amount'
        | 'foreign_currency'
        | 'id'
        | 'merchant'
        | 'purpose'
        | 'seq_num'
        | 'spent_at'
        | 'state'
      >
    | {
        no_of_files: number;
        category_display_name: string;
      }[];
  mcc: string;
  merchant: string;
  metadata: {};
  org_id: string;
  post_date: Date;
  settlement_id: string;
  spent_at: Date;
  statement_id: string;
  updated_at: Date;
  user: PlatformUser;
  user_id: string;
}
