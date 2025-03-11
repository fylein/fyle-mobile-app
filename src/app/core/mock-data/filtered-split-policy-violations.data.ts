import deepFreeze from 'deep-freeze-strict';

import { FilteredSplitPolicyViolations } from '../models/filtered-split-policy-violations.model';

export const filteredSplitPolicyViolationsData: FilteredSplitPolicyViolations = deepFreeze({
  rules: ['rule1', 'rule2', 'rule3'],
  action: {
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
  type: 'category',
  name: 'food',
  currency: 'USD',
  amount: 45,
  isCriticalPolicyViolation: false,
  isExpanded: false,
});

export const filteredSplitPolicyViolationsData2: FilteredSplitPolicyViolations = deepFreeze({
  action: {
    final_desired_state: {
      add_approver_user_ids: [],
      amount: 0,
      flag: true,
      is_receipt_mandatory: false,
      remove_employee_approver1: false,
      run_status: 'SUCCESS',
      run_summary: [
        'expense will be flagged for verification and approval',
        'expense could not be added to a report or submitted',
      ],
    },
    individual_desired_states: [
      {
        add_approver_user_ids: [],
        amount: 0,
        expense_policy_rule: {
          action_show_warning: true,
          description:
            'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit when expense amount in category 1 / chumma returns/1 / sd/1 / sub 123/aniruddha test / aniruddha sub/Food/Food / Travelling - Inland/Snacks/Stuff/te knklw/TEst Cateogory / 12 exceeds: INR 1000 and are fyled from  Paid by Employee payment mode(s). ',
          id: 'tprNEIc03yOXB',
        },
        expense_policy_rule_id: 'tprNEIc03yOXB',
        run_result: [
          'expense will be flagged for verification and approval',
          'expense could not be added to a report or submitted',
        ],
        run_status: 'VIOLATED_ACTION_SUCCESS',
      },
    ],
  },
  rules: [
    'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit when expense amount in category 1 / chumma returns/1 / sd/1 / sub 123/aniruddha test / aniruddha sub/Food/Food / Travelling - Inland/Snacks/Stuff/te knklw/TEst Cateogory / 12 exceeds: INR 1000 and are fyled from  Paid by Employee payment mode(s). ',
  ],
  type: 'category',
  name: '1 / chumma returns',
  currency: 'INR',
  inputFieldInfo: { Category: 'Travel', 'Cost Center': 'Finance', Project: 'Project A' },
  amount: 240000,
  isCriticalPolicyViolation: true,
});
