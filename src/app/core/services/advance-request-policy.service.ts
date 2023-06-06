import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PolicyViolationCheck } from '../models/policy-violation-check.model';

@Injectable({
  providedIn: 'root',
})
export class AdvanceRequestPolicyService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  getPolicyRules(result: PolicyViolationCheck) {
    return result.advance_request_policy_rule_desired_states
      .filter((desiredState) => desiredState.popup === true)
      .map((desiredState) => desiredState.description);
  }

  servicePost(url, data, config) {
    return this.httpClient.post(this.ROOT_ENDPOINT + '/policy/advance_requests' + url, data);
  }
}
