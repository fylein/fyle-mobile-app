import { ExtendedAdvance } from './extended_advance.model';
import { OrgUser } from './org-user.model';
import { Org } from './org.model';
import { User } from './user.model';

export interface AccountDetail {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  type: string;
  currency: string;
  target_balance_amout: number;
  current_balance_amount: number;
  tentative_balance_amount: number;
  category: string;
  displayName: string;
  isReimbursable: boolean;
}

export interface ExtendedAccount {
  acc: AccountDetail;
  ou: Pick<OrgUser, 'id' | 'org_id'>;
  org: Org;
  advance: Pick<ExtendedAdvance, 'adv_id' | 'adv_purpose' | 'adv_advance_number'>;
  orig: {
    currency: string;
    amount: number;
  };
  us: Pick<User, 'email' | 'full_name'>;
  currency: string;
  amount: number;
}

export interface AccountOption {
  label: string;
  value: ExtendedAccount;
}
