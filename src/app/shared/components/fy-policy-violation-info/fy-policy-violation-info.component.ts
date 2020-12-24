import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-fy-policy-violation-info',
  templateUrl: './fy-policy-violation-info.component.html',
  styleUrls: ['./fy-policy-violation-info.component.scss'],
})
export class FyPolicyViolationInfoComponent implements OnInit {

  @Input() estatuses;

  policyViolations;

  constructor() { }

  ngOnInit() {
    this.policyViolations = [];
    this.policyViolations = this.estatuses.filter((estatus) => {
      return estatus.st_org_user_id === 'POLICY';
    });
  }
}
