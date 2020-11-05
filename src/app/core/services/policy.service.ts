import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor() { }

  getCriticalPolicyRules(result) {
    const criticalPopupRules = [];

    result.transaction_policy_rule_desired_states.forEach((desiredState) => {
      if (typeof(desiredState.policy_amount) === 'number' && desiredState.policy_amount < 0.0001) {
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
}
