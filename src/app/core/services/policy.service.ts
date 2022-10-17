import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { ExpensePolicyStates } from '../models/platform/platform-expense-policy-states.model';
import { IndividualExpensePolicyState } from '../models/platform/platform-individual-expense-policy-state.model';
import { PolicyViolation } from '../models/policy-violation.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

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

  getSpenderExpensePolicyViolations(expenseId: string): Observable<IndividualExpensePolicyState[]> {
    const params = {
      expense_id: `eq.${expenseId}`,
    };
    return this.spenderPlatformApiService
      .get<PlatformApiResponse<ExpensePolicyStates>>('/expense_policy_states', {
        params,
      })
      .pipe(map((policyStates) => (policyStates.count > 0 ? policyStates.data[0].individual_desired_states : [])));
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
