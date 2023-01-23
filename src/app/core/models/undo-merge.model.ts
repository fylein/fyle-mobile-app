import { Transaction } from '../models/v1/transaction.model';
export interface UndoMerge {
  user_created_expense: Partial<Transaction>;
  auto_created_expense: Partial<Transaction>;
}
