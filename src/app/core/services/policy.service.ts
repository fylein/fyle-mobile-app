import { Injectable } from '@angular/core';
import { PolicyApiService } from './policy-api.service';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor(
    private policyApiService: PolicyApiService
  ) { }

  getPolicyRuleViolationsAndQueryParams(txnId) {
    const params = {
      txn_id: txnId
    };
    return this.policyApiService.get('/policy/violating_transactions', {params});
  };
}
