import { Component, OnInit, input } from '@angular/core';

@Component({
  selector: 'app-policy-violation-rule',
  templateUrl: './policy-violation-rule.component.html',
  styleUrls: ['./policy-violation-rule.component.scss'],
  standalone: false,
})
export class PolicyViolationRuleComponent implements OnInit {
  readonly message = input<string>(undefined);

  readonly violationType = input<string>(undefined);

  constructor() {}

  ngOnInit() {}
}
