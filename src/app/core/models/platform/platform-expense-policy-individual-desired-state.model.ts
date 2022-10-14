export interface ExpensePolicyIndividualDesiredState {
  add_approver_user_ids: string[];
  run_status: string;
  run_result: string[];
  expense_id: string;
  expense_policy_rule_id: string;
  rule: {
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
