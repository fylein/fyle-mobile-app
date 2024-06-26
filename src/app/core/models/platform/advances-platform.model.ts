import { CustomFields } from './custom-fields.model';
import { Project } from './v1/project.model';
import { PlatformEmployee } from './platform-employee.model';
import { User } from './v1/user.model';

export interface AdvancesPlatform {
  id: string;
  user_id: string;
  user: User;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  currency: string;
  amount: number;
  foreign_currency: string;
  foreign_amount: number;
  payment_mode: string;
  advance_request_id: string;
  advance_account_id: string;
  advance_wallet_id: string;
  seq_num: string;
  purpose: string;
  source: string;
  project_id: string;
  project: Project;
  code: string;
  issued_at: Date;
  card_number: string;
  is_exported: boolean;
  last_exported_at: Date;
  custom_fields: CustomFields[];
  employee_id: string;
  employee: PlatformEmployee;
  creator_user: User;
  advance_request?: {
    id: string;
    last_approved_at: Date;
  };
}
