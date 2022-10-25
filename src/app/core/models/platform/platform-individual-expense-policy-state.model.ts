export interface IndividualExpensePolicyState {
  add_approver_user_ids: string[];
  run_status: string;
  run_result: string[];
  expense_id?: string; // This key is absent in case of check policies call
  expense_policy_rule_id: string;
  // In check policies call, the object key is returned with different name than in expense_policies_states call
  expense_policy_rule?: {
    id: string;
    description: number;
    action_show_warning: boolean;
  };
  rule?: {
    id: string;
    description: number;
    action_show_warning: boolean;
  };
  amount: number;
  expenses_query_object_params: {
    limit_start_date: string;
    limit_end_date: string;
    params: {
      category_id: string;
      project_id: string;
      cost_center_id: string;
      currency: string;
      mileage_rate_id: string;
      employee_id: string;
    };
  };
}
