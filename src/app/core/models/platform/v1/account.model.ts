export interface Account {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  type: AccountType;
  currency: string;
  current_balance_amount: number;
  tentative_balance_amount: number;
  org_id: string;
  category_id: number;
}

export enum AccountType {
  COMPANY_EXPENSE_ACCOUNT = 'COMPANY_EXPENSE_ACCOUNT',
  COMPANY_CATEGORY_ACCOUNT = 'COMPANY_CATEGORY_ACCOUNT',
  COMPANY_ADVANCE_ACCOUNT = 'COMPANY_ADVANCE_ACCOUNT',
  COMPANY_CORPORATE_CREDIT_CARD_ACCOUNT = 'COMPANY_CORPORATE_CREDIT_CARD_ACCOUNT',
  PERSONAL_ADVANCE_ACCOUNT = 'PERSONAL_ADVANCE_ACCOUNT',
  PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT = 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
  PERSONAL_CASH_ACCOUNT = 'PERSONAL_CASH_ACCOUNT',
}
