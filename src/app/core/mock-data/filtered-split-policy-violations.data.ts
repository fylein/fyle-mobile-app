import { FilteredSplitPolicyViolations } from '../models/filtered-split-policy-violations.model';

export const filteredSplitPolicyViolationsData: FilteredSplitPolicyViolations = {
  rules: ['rule1', 'rule2', 'rule3'],
  action: {
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
  type: 'category',
  name: 'food',
  currency: 'USD',
  amount: 45,
  isCriticalPolicyViolation: false,
  isExpanded: false,
};
