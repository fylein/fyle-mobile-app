import { PolicyViolationCheck } from '../models/policy-violation-check.model';

export const checkPolicyData: PolicyViolationCheck = {
  advance_request_desired_state: {
    action_description: null,
    policy_rule_descriptions: [],
    policy_approver_ids: [],
    flag: false,
    currency: null,
    advance_request_id: 'areq4YujEm52Ub',
  },
  advance_request_policy_rule_desired_states: [],
};

export const checkPolicyWithRulesData: PolicyViolationCheck = {
  advance_request_desired_state: {
    action_description: null,
    policy_rule_descriptions: [],
    policy_approver_ids: [],
    flag: false,
    currency: null,
    advance_request_id: 'areq4YujEm52Ub',
  },
  advance_request_policy_rule_desired_states: [
    { description: 'Policy rule 1', popup: true },
    { description: 'Policy rule 2', popup: false },
    { description: 'Policy rule 3', popup: true },
  ],
};
