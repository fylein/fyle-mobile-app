import { Transaction } from './v1/transaction.model';

export interface FileTransaction {
  txns: Transaction[];
  files?: Resource[];
}

export interface Resource {
  id: string;
  name: string;
  content: string;
}
