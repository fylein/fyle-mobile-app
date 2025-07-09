import { Expense } from './v1/expense.model';

export interface UnlinkCardTransactionResponse {
  data: {
    user_created_expense: Expense;
    auto_created_expense: Expense;
  };
}
