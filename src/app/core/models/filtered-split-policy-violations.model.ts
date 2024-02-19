import { FinalExpensePolicyState } from './platform/platform-final-expense-policy-state.model';
import { IndividualExpensePolicyState } from './platform/platform-individual-expense-policy-state.model';

export interface FilteredSplitPolicyViolations {
  rules: string[];
  action: {
    individual_desired_states: IndividualExpensePolicyState[];
    final_desired_state: FinalExpensePolicyState;
  };
  type: string;
  name: string;
  currency: string;
  amount: number;
  isCriticalPolicyViolation: boolean;
  isExpanded?: boolean;
}
