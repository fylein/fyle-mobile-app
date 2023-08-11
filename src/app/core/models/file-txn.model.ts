import { FileObject } from './file-obj.model';
import { Transaction } from './v1/transaction.model';

export interface FileTransaction {
  txns: Transaction[];
  files?: FileObject[];
}

export interface Resource {
  id: string;
  name: string;
  content: string;
}
