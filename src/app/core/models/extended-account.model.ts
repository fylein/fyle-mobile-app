import { AccountDetail } from './account-detail.model';
import { ExtendedAdvance } from './extended_advance.model';
import { OrgUser } from './org-user.model';
import { Org } from './org.model';
import { User } from './user.model';

export interface ExtendedAccount {
  acc: AccountDetail;
  ou: Pick<OrgUser, 'id' | 'org_id'>;
  org: Pick<Org, 'id' | 'domain'>;
  advance: {
    id: string;
    purpose: string;
    advance_number: string;
  };
  orig: {
    currency: string;
    amount: number;
  };
  us: Pick<User, 'email' | 'full_name'>;
  currency: string;
  amount: number;
}
