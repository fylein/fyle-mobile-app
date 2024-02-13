import { PolicyViolation } from '../models/policy-violation.model';
import { PolicyViolationTxn } from '../models/policy-violation-txn.model';
export const policyViolation1: PolicyViolation = {
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

export const splitPolicyExp2: PolicyViolation = {
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
  amount: 300,
  currency: 'USD',
  name: 'Food',
  type: 'category',
};

export const splitPolicyExp3: PolicyViolation = {
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
  amount: 200,
  currency: 'USD',
  name: 'Food / Travelling - Inland',
  type: 'category',
};

export const policyVoilationData2: PolicyViolationTxn = {
  txVHydZVrGYC: splitPolicyExp2,
  tx4QhcvNHpuh: splitPolicyExp3,
};

export const splitPolicyExp4: PolicyViolation = {
  data: {
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
  amount: 240000,
  currency: 'INR',
  name: '1 / chumma returns',
  type: 'category',
};

export const splitPolicyExp5: PolicyViolation = {
  data: {
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
  amount: 160000,
  currency: 'INR',
  name: '1 / sd',
  type: 'category',
};

export const policyViolationData3: PolicyViolationTxn = {
  txc2KIogxUAy: splitPolicyExp4,
  txgfkvuYteta: splitPolicyExp5,
};

export const policyViolationData4: PolicyViolationTxn = {
  txSEM4DtjyKR: splitPolicyExp4,
  txNyI8ot5CuJ: splitPolicyExp5,
};
