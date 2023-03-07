export interface PolicyViolationCheck {
  advance_request_desired_state: {
    action_description: string;
    policy_rule_descriptions: string[];
    policy_approver_ids: string[];
    flag: boolean;
    currency: string;
    advance_request_id: string;
  };
  advance_request_policy_rule_desired_states?: {
    description?: string;
    popup?: boolean;
  }[];
}
