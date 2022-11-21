import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { ExpensePolicy } from '../models/platform/platform-expense-policy.model';
import { ExpensePolicyStates } from '../models/platform/platform-expense-policy-states.model';
import { IndividualExpensePolicyState } from '../models/platform/platform-individual-expense-policy-state.model';
import { PlatformPolicyExpense } from '../models/platform/platform-policy-expense.model';
import { PolicyViolation } from '../models/policy-violation.model';
import { PublicPolicyExpense } from '../models/public-policy-expense.model';
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

  transformTo(transaction: PublicPolicyExpense): PlatformPolicyExpense {
    const platformPolicyExpense: PlatformPolicyExpense = {
      id: transaction?.id,
      spent_at: transaction?.txn_dt,
      merchant: transaction?.vendor,
      foreign_currency: transaction?.orig_currency,
      foreign_amount: transaction?.orig_amount,
      claim_amount: [null, undefined].includes(transaction?.amount) ? 0 : transaction?.amount, // Hack alert: This is done because instafyle may not have amount.
      purpose: transaction?.purpose,
      cost_center_id: transaction?.cost_center_id,
      category_id: transaction?.org_category_id,
      project_id: transaction?.project_id,
      source_account_id: transaction?.source_account_id,
      tax_amount: transaction?.tax_amount,
      tax_group_id: transaction?.tax_group_id,
      is_billable: transaction?.billable,
      is_reimbursable: transaction?.skip_reimbursement === null ? null : !transaction?.skip_reimbursement,
      distance: transaction?.distance,
      distance_unit: transaction?.distance_unit,
      locations: transaction?.locations,
      custom_fields: transaction?.custom_properties,
      started_at: transaction?.from_dt,
      ended_at: transaction?.to_dt,
      per_diem_rate_id: transaction?.per_diem_rate_id,
      per_diem_num_days: transaction?.num_days,
      num_files: transaction?.num_files,
      is_matching_ccc: transaction?.is_matching_ccc_expense,
      mileage_rate_id: transaction?.mileage_rate_id,
      mileage_calculated_distance: transaction?.mileage_calculated_distance,
      mileage_calculated_amount: transaction?.mileage_calculated_amount,
    };

    if (
      transaction?.fyle_category?.toLowerCase() === 'flight' ||
      transaction?.fyle_category?.toLowerCase() === 'airlines'
    ) {
      platformPolicyExpense.travel_classes = [
        transaction?.flight_journey_travel_class,
        transaction?.flight_return_travel_class,
      ];
    } else if (transaction?.fyle_category?.toLowerCase() === 'bus') {
      platformPolicyExpense.travel_classes = [transaction?.bus_travel_class];
    } else if (transaction?.fyle_category?.toLowerCase() === 'train') {
      platformPolicyExpense.travel_classes = [transaction?.train_travel_class];
    }

    return platformPolicyExpense;
  }

  getCriticalPolicyRules(expensePolicy: ExpensePolicy): string[] {
    const criticalPopupRules = [];

    if (expensePolicy.data.final_desired_state.run_status === 'SUCCESS') {
      expensePolicy.data.individual_desired_states.forEach((desiredState) => {
        if (
          desiredState.run_status === 'VIOLATED_ACTION_SUCCESS' &&
          typeof desiredState.amount === 'number' &&
          desiredState.amount < 0.0001
        ) {
          criticalPopupRules.push(desiredState.expense_policy_rule.description);
        }
      });
    }

    return criticalPopupRules;
  }

  getPolicyRules(expensePolicy: ExpensePolicy): string[] {
    const popupRules = [];

    if (expensePolicy.data.final_desired_state.run_status === 'SUCCESS') {
      expensePolicy.data.individual_desired_states.forEach((desiredState) => {
        if (
          desiredState.run_status === 'VIOLATED_ACTION_SUCCESS' &&
          desiredState.expense_policy_rule.action_show_warning
        ) {
          popupRules.push(desiredState.expense_policy_rule.description);
        }
      });
    }

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
