import deepFreeze from 'deep-freeze-strict';

import { ExpensePolicy } from '../models/platform/platform-expense-policy.model';

export const expensePolicyData: ExpensePolicy = deepFreeze({
  data: {
    final_desired_state: {
      add_approver_user_ids: [],
      amount: null,
      flag: false,
      is_receipt_mandatory: false,
      remove_employee_approver1: false,
      run_status: 'SUCCESS',
      run_summary: [],
    },
    individual_desired_states: [],
  },
});

export const expensePolicyDataWoData: ExpensePolicy = deepFreeze({
  data: null,
});

export const splitExpPolicyData: ExpensePolicy = deepFreeze({
  data: {
    final_desired_state: {
      add_approver_user_ids: [],
      amount: null,
      flag: false,
      is_receipt_mandatory: false,
      remove_employee_approver1: false,
      run_status: 'SUCCESS',
      run_summary: [],
    },
    individual_desired_states: [],
  },
});
