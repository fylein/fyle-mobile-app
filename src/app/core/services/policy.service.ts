import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { CheckExpensePolicies } from '../models/platform/platform-check-expense-policy.model';
import { ExpensePolicyStates } from '../models/platform/platform-expense-policy-states.model';
import { IndividualExpensePolicyState } from '../models/platform/platform-individual-expense-policy-state.model';
import { PolicyViolation } from '../models/policy-violation.model';
import { ApproverPlatformApiService } from './approver-platform-api.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  constructor(
    private spenderPlatformApiService: SpenderPlatformApiService,
    private approverPlatformApiService: ApproverPlatformApiService
  ) {}

  getCriticalPolicyRules(result: CheckExpensePolicies): string[] {
    const criticalPopupRules = [];

    result.data.individual_desired_states.forEach((desiredState) => {
      if (typeof desiredState.amount === 'number' && desiredState.amount < 0.0001) {
        criticalPopupRules.push(desiredState.expense_policy_rule.description);
      }
    });

    return criticalPopupRules;
  }

  getPolicyRules(result: CheckExpensePolicies): string[] {
    const popupRules = [];

    result.data.individual_desired_states.forEach((desiredState) => {
      if (desiredState.expense_policy_rule.action_show_warning) {
        popupRules.push(desiredState.expense_policy_rule.description);
      }
    });

    return popupRules;
  }

  getApproverExpensePolicyViolations(expenseId: string): Observable<IndividualExpensePolicyState[]> {
    const params = {
      expense_id: `eq.${expenseId}`,
    };
    return this.approverPlatformApiService
      .get<PlatformApiResponse<ExpensePolicyStates>>('/expense_policy_states', {
        params,
      })
      .pipe(map((policyStates) => (policyStates.count > 0 ? policyStates.data[0].individual_desired_states : [])));
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
