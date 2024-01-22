import { FinalExpensePolicyState } from './platform/platform-final-expense-policy-state.model';

export interface FilteredSplitPolicyViolations {
  rules: string[];
  action: FinalExpensePolicyState;
  type: string;
  name: string;
  currency: string;
  amount: number;
  isCriticalPolicyViolation: boolean;
}
