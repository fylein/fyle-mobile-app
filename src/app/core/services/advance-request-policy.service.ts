import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PolicyViolationCheck } from '../models/policy-violation-check.model';
import { AdvanceRequests } from '../models/advance-requests.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdvanceRequestPolicyService {
  ROOT_ENDPOINT: string;

  constructor(private httpClient: HttpClient) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  getPolicyRules(result: PolicyViolationCheck): string[] {
    return result.advance_request_policy_rule_desired_states
      .filter((desiredState) => desiredState.popup === true)
      .map((desiredState) => desiredState.description);
  }

  servicePost<T>(url: string, data: Partial<AdvanceRequests>): Observable<T> {
    return this.httpClient.post<T>(this.ROOT_ENDPOINT + '/policy/advance_requests' + url, data);
  }
}
