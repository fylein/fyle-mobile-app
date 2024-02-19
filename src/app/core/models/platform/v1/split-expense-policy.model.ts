import { FinalExpensePolicyState } from '../platform-final-expense-policy-state.model';
import { IndividualExpensePolicyState } from '../platform-individual-expense-policy-state.model';

export interface SplitExpensePolicy {
  data: {
    individual_desired_states: IndividualExpensePolicyState[];
    final_desired_state: FinalExpensePolicyState;
  }[];
}
