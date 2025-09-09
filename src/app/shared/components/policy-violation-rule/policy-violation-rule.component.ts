import { Component, OnInit, input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-policy-violation-rule',
    templateUrl: './policy-violation-rule.component.html',
    styleUrls: ['./policy-violation-rule.component.scss'],
    imports: [
        NgClass,
        NgIf,
        MatIcon,
    ],
})
export class PolicyViolationRuleComponent implements OnInit {
  readonly message = input<string>(undefined);

  readonly violationType = input<string>(undefined);

  constructor() {}

  ngOnInit() {}
}
