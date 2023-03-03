import { Transaction } from './v1/transaction.model';

export interface FileTransaction {
  txns: Transaction[];
  files: File[];
}

export interface File {
  id: string;
  name: string;
  content: string;
}
