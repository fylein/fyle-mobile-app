import { Transaction } from '../models/v1/transaction.model';
export interface UndoMerge {
  user_created_expense: Transaction;
  auto_created_expense: Transaction;
}
