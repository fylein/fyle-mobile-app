import { OrgUser } from './org-user.model';
import { User } from './user.model';
import { Approver } from './approver.model';
import { CommuteDetails } from './platform/v1/commute-details.model';
import { Delegatee } from './delegatee.model';
import { Department } from './department.model';
import { Locale } from './locale.model';

export interface ExtendedOrgUser {
  ou: OrgUser;
  us: User;
  ap1: Approver;
  ap2: Approver;
  ap3: Approver;
  department: Department;
  approver_users: User[];
  delegatees: Delegatee[];
  locale: Locale;
  commute_details: CommuteDetails;
  approver_user_ids: string[];
  commute_details_id: string;
  org: {
    currency: string;
  };
  mileage_settings: Record<string, unknown>;
  flattened_custom_field: Record<string, unknown>;
}
