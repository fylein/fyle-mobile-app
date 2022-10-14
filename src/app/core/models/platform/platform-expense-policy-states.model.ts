import { ExpensePolicyFinalDesiredState } from './platform-expense-policy-final-desired-state.model';
import { ExpensePolicyIndividualDesiredState } from './platform-expense-policy-individual-desired-state.model';

export interface ExpensePolicyStates {
  expense_id: string;
  individual_desired_states: ExpensePolicyIndividualDesiredState[];
  final_desired_state: ExpensePolicyFinalDesiredState;
}
