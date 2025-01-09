import { ExpenseTransactionStatus } from '../../../enums/platform/v1/expense-transaction-status.enum';

export interface MatchedCorporateCardTransaction {
  id: string;
  corporate_card_id: string;
  corporate_card_number: string;
  masked_corporate_card_number: string;
  corporate_card_user_full_name: string;
  bank_name: string;
  amount: number;
  currency: string;
  spent_at: Date;
  posted_at: Date;
  description: string;
  foreign_currency: string;
  status: ExpenseTransactionStatus;
  foreign_amount: number;
  merchant: string;
  category: string;
  matched_by: string;
  corporate_card_nickname?: string;
}
