import { TransactionDesiredState } from './transaction-desired-state.model';
import { TransactionPolicyRuleDesiredState } from './transaction-policy-rule-desired-state.model';
import { TransactionQueryParams } from './transaction-query-params.model';

export interface PolicyViolation {
  transaction_policy_rule_desired_states: TransactionPolicyRuleDesiredState[];
  transaction_desired_state: TransactionDesiredState;
  transaction_query_params: TransactionQueryParams[];
  amount: number;
  currency: string;
  name: string;
  type: string;
}
