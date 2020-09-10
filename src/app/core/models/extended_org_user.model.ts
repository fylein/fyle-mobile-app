import { OrgUser } from './org_user.model';
import { User } from './user.model';
import { Approver } from './approver.model';
import { BankBranch } from './bank_branch.model';
import { Dwolla } from './dwolla.model';

export interface ExtendedOrgUser {
    ou: OrgUser;
    us: User;
    ap1: Approver;
    ap2: Approver;
    ap3: Approver;
    bb: BankBranch;
    dwolla: Dwolla;
}
