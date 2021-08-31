import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fy-policy-violation-info',
  templateUrl: './fy-policy-violation-info.component.html',
  styleUrls: ['./fy-policy-violation-info.component.scss'],
})
export class FyPolicyViolationInfoComponent implements OnInit {
  @Input() estatuses;

  @Input() criticalPolicyViolated;

  @Input() duplicates;

  policyViolations;

  showPolicyInfo: boolean;

  constructor() { }

  ngOnInit() {
    this.policyViolations = [];
    this.policyViolations = this.estatuses.filter((estatus) => estatus.st_org_user_id === 'POLICY');
    this.showPolicyInfo = this.policyViolations?.length > 0 || this.criticalPolicyViolated || this.duplicates?.length > 0;
  }
}
