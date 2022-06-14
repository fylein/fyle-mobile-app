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

  checkIfViolationsExist(violations: Object): boolean {
    let doViolationsExist = false;

    for (const key in violations) {
      if (violations.hasOwnProperty(key)) {
        // check for popup field for all polices
        const rules = this.getPolicyRules(violations[key]);

        if (rules?.length > 0) {
          doViolationsExist = true;

          break;
        }
      }
    }

    return doViolationsExist;
  }

  getApprovalString(emails: string[]): string {
    let additionalApprovalString = 'Expense will need additional approval from ';
    additionalApprovalString += emails.map((email) => '<b>' + email + '</b>').join(', ');

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
