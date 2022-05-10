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

  getApprovalString(emails) {
    let additionalApprovalString = 'Expense will need additional approval from ';
    emails.forEach((email, index) => {
      additionalApprovalString += '<b>' + email + '</b>';
      if (index < emails.length - 1) {
        additionalApprovalString += ', ';
      }
    });
    return additionalApprovalString;
  }

  isExpenseFlagged(policyActionDescription: string): boolean {
    return policyActionDescription.toLowerCase().includes('expense will be flagged');
  }

  isPrimaryApproverSkipped(policyActionDescription: string): boolean {
    return policyActionDescription.toLowerCase().includes('primary approver will be skipped');
  }

  needAdditionalApproval(policyActionDescription: string): boolean {
    return policyActionDescription.toLowerCase().includes('expense will need approval from');
  }

  isExpenseCapped(policyActionDescription: string): boolean {
    return policyActionDescription.toLowerCase().includes('expense will be capped to');
  }
}
