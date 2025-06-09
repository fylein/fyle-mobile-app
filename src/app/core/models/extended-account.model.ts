import { AccountDetail } from './account-detail.model';
import { Org } from './org.model';

export interface ExtendedAccount {
  acc: AccountDetail;
  org: Pick<Org, 'id' | 'domain'>;
  advance: {
    id: string | null;
    purpose: string | null;
    // eslint-disable-next-line id-blacklist
    number: string | number | null;
  };
  orig: {
    currency: string;
    amount: number;
  };
  currency: string;
  amount: number;
  id: string;
  type: string;
  isReimbursable: boolean;
  org_id: string;
  user_id: string;
  balance_amount: number;
  created_at: string;
  updated_at: string;
}
