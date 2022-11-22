export interface TransactionPolicyRuleDesiredState {
  transaction_id: string;
  transaction_policy_rule_id: string;
  description: string;
  flag: boolean;
  disable_system_approvers: boolean;
  policy_amount: number;
  currency: string;
  policy_approver_ids: [];
  popup: boolean;
  receipt_required: boolean;
  missing_approvers: [];
}
