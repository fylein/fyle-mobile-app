import { FilteredSplitPolicyViolations } from '../models/filtered-split-policy-violations.model';

export const filteredSplitPolicyViolationsData: FilteredSplitPolicyViolations = {
  rules: ['rule1', 'rule2', 'rule3'],
  action: {
    add_approver_user_ids: [],
    amount: null,
    flag: false,
    is_receipt_mandatory: false,
    remove_employee_approver1: false,
    run_status: 'SUCCESS',
    run_summary: [],
  },
  type: 'category',
  name: 'food',
  currency: 'USD',
  amount: 45,
  isCriticalPolicyViolation: false,
  isExpanded: false,
};

export const filteredSplitPolicyViolationsData2: FilteredSplitPolicyViolations = {
  action: {
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
  rules: [
    'The expense will be flagged, employee will be alerted, expense will be made unreportable and expense amount will be capped to the amount limit when expense amount in category 1 / chumma returns/1 / sd/1 / sub 123/aniruddha test / aniruddha sub/Food/Food / Travelling - Inland/Snacks/Stuff/te knklw/TEst Cateogory / 12 exceeds: INR 1000 and are fyled from  Paid by Employee payment mode(s). ',
  ],
  type: 'category',
  name: '1 / chumma returns',
  currency: 'INR',
  amount: 240000,
  isCriticalPolicyViolation: true,
};
