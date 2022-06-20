export interface TransactionDesiredState {
  transaction_id: string;
  flag: boolean;
  receipt_required: boolean;
  policy_approver_ids: [];
  policy_amount: number;
  currency: string;
  disable_system_approvers: boolean;
  action_description: string;
  policy_rule_descriptions: string[];
  failure_reason: string;
  policy_run_status: string;
}
