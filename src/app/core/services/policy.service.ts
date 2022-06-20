import { Injectable } from '@angular/core';
import { PolicyViolation } from '../models/policy-violation.model';
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

  checkIfViolationsExist(violations: { [id: string]: PolicyViolation }): boolean {
    return Object.keys(violations).some((transactionID) => this.getPolicyRules(violations[transactionID]).length > 0);
  }

  getApprovalString(emails: string[]): string {
    let approverEmailsRequiredMsg = 'Expense will need additional approval from ';
    approverEmailsRequiredMsg += emails.map((email) => '<b>' + email + '</b>').join(', ');

    return approverEmailsRequiredMsg;
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
