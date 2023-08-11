import { ExpensePolicy } from '../models/platform/platform-expense-policy.model';

export const expensePolicyData: ExpensePolicy = {
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
};

export const expensePolicyDataWoData: ExpensePolicy = {
  ...expensePolicyData,
  data: null,
};

export const splitExpPolicyData: ExpensePolicy = {
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
};
