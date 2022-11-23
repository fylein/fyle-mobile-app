import { OrgUser } from './org-user.model';
import { User } from './user.model';
import { Transaction } from './v1/transaction.model';

export interface UnflattenedTransaction {
  ou: OrgUser;
  tx: Transaction;
  us: User;
  source: {
    account_type: string;
    account_id: string;
  };
}
