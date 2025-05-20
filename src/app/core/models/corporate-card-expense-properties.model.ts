import { Transaction } from './v1/transaction.model';

export interface CorporateCardExpenseProperties {
  Type: string;
  transaction: Transaction;
}
