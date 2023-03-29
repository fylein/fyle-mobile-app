import { IndividualExpensePolicyState } from '../models/platform/platform-individual-expense-policy-state.model';

export const individualExpPolicyStateData1: IndividualExpensePolicyState = {
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
};

export const individualExpPolicyStateData2: IndividualExpensePolicyState[] = [
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
];
