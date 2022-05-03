import { Injectable } from '@angular/core';
import { PolicyApiService } from './policy-api.service';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  constructor(private policyApiService: PolicyApiService) {}

  getCriticalPolicyRules(result) {
    const criticalPopupRules = [];

    result.transaction_policy_rule_desired_states.forEach((desiredState) => {
      if (typeof desiredState.policy_amount === 'number' && desiredState.policy_amount < 0.0001) {
        criticalPopupRules.push(desiredState.description);
      }
    });

    return criticalPopupRules;
  }

  getPolicyRules(result) {
    const popupRules = [];

    result.transaction_policy_rule_desired_states.forEach((desiredState) => {
      if (desiredState.popup) {
        popupRules.push(desiredState.description);
      }
    });

    return popupRules;
  }

  getPolicyViolationRules(txnId) {
    const params = {
      txn_id: txnId,
    };
    return this.policyApiService.get('/policy/violating_transactions', { params });
  }

  isExpenseFlagged(policyActionDescription): boolean {
    return policyActionDescription.toLowerCase().includes('expense will be flagged');
  }

  isPrimaryApproverSkipped(policyActionDescription): boolean {
    return policyActionDescription.toLowerCase().includes('primary approver will be skipped');
  }

  needAdditionalApproval(policyActionDescription): boolean {
    return policyActionDescription.toLowerCase().includes('expense will need additional approval from');
  }

  isExpenseCapped(policyActionDescription): boolean {
    return policyActionDescription.toLowerCase().includes('expense will be capped to');
  }
}
