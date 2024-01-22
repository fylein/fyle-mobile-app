import { FinalExpensePolicyState } from './platform/platform-final-expense-policy-state.model';
import { IndividualExpensePolicyState } from './platform/platform-individual-expense-policy-state.model';

export interface PolicyViolation {
  data?: {
    individual_desired_states: IndividualExpensePolicyState[];
    final_desired_state: FinalExpensePolicyState;
  };
  amount?: number;
  currency?: string;
  name?: string;
  type?: string;
  isExpanded?: boolean;
}
