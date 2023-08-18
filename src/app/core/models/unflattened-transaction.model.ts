import { FileObject } from './file-obj.model';
import { OrgUser } from './org-user.model';
import { UnflattenedReport } from './report-unflattened.model';
import { User } from './user.model';
import { Transaction } from './v1/transaction.model';

export interface UnflattenedTransaction {
  ou: Partial<OrgUser>;
  tx: Partial<Transaction>;
  us: User;
  source: {
    account_type: string;
    account_id: string;
  };
  tg: {
    name: string;
    percentage: number;
  };
  rp: Partial<UnflattenedReport['rp']>;
  external: {
    expense_id: string;
  };
  is: {
    test_call: boolean;
  };
  dataUrls?: Partial<FileObject[]> | { url: string; type: string }[];
}
