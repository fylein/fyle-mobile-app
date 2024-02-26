import { SplitExpensePolicy } from '../models/platform/v1/split-expense-policy.model';

export const splitPolicyExp1: SplitExpensePolicy = {
  data: [
    {
      individual_desired_states: [],
      final_desired_state: {
        add_approver_user_ids: [],
        amount: null,
        flag: false,
        is_receipt_mandatory: false,
        remove_employee_approver1: false,
        run_status: 'SUCCESS',
        run_summary: [],
      },
    },
  ],
};
