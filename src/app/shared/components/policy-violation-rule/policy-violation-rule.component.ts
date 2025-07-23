import { Component, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-policy-violation-rule',
    templateUrl: './policy-violation-rule.component.html',
    styleUrls: ['./policy-violation-rule.component.scss'],
    imports: [NgClass],
})
export class PolicyViolationRuleComponent implements OnInit {
  @Input() message: string;

  @Input() violationType: string;

  constructor() {}

  ngOnInit() {}
}
