import { FormattedPolicyViolation } from '../models/formatted-policy-violation.model';

export const formattedPolicyViolation1: FormattedPolicyViolation = {
  rules: [
    'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit when expense amount in category 1 / chumma returns/1 / sd/1 / sub 123/aniruddha test / aniruddha sub/Food/Food / Travelling - Inland/Snacks/Stuff/te knklw/TEst Cateogory / 12 exceeds: INR 1000 and are fyled from  Paid by Employee payment mode(s). ',
  ],
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
  type: 'category',
  name: '1 / chumma returns',
  currency: 'INR',
  amount: 240000,
  isCriticalPolicyViolation: true,
  isExpanded: false,
};

export const formattedPolicyViolation2: FormattedPolicyViolation = {
  rules: [
    'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit when expense amount in category 1 / chumma returns/1 / sd/1 / sub 123/aniruddha test / aniruddha sub/Food/Food / Travelling - Inland/Snacks/Stuff/te knklw/TEst Cateogory / 12 exceeds: INR 1000 and are fyled from  Paid by Employee payment mode(s). ',
  ],
  action: {
    final_desired_state: {
      add_approver_user_ids: [],
      amount: 0,
      flag: true,
      is_receipt_mandatory: true,
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
      {
        add_approver_user_ids: [],
        amount: null,
        expense_policy_rule: {
          action_show_warning: true,
          description: 'Receipt needed for expenses above INR 123',
          id: 'tprZyt959EMyK',
        },
        expense_policy_rule_id: 'tprZyt959EMyK',
        run_result: ['expense will be flagged for verification and approval'],
        run_status: 'VIOLATED_ACTION_SUCCESS',
      },
    ],
  },
  type: 'category',
  name: '1 / sd',
  currency: 'INR',
  amount: 160000,
  isCriticalPolicyViolation: true,
  isExpanded: false,
};

export const formattedTxnViolations = {
  txc2KIogxUAy: formattedPolicyViolation1,
  txgfkvuYteta: formattedPolicyViolation2,
};

export const formattedTxnViolations2 = {
  txc2KIogxUAy: { ...formattedPolicyViolation1, isCriticalPolicyViolation: false },
  txgfkvuYteta: { ...formattedPolicyViolation2, isCriticalPolicyViolation: false },
};
