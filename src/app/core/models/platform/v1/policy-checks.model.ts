import { Violation } from './violation.model';

export interface PolicyChecks {
  are_approvers_added: boolean;
  is_amount_limit_applied: boolean;
  is_flagged_ever: boolean;
  violations: Violation[];
}
