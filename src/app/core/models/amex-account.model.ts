import { AmexAccountEnrollmentPayload } from './amex-account-enrollment-payload.model';
import { AccountStatus } from './amex-account-status.enum';

export interface AmexAccount extends AmexAccountEnrollmentPayload {
  buyer_id: string;
  account_id: string;
  account_verified_at: Date;
  primary_account_number: string;
  account_error_code: string;
  account_error_message: string;
  account_failed_at: Date;
  account_status: AccountStatus;
  id: string;
  org_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
