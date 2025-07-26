import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-policy-violation-rule',
  templateUrl: './policy-violation-rule.component.html',
  styleUrls: ['./policy-violation-rule.component.scss'],
  standalone: false,
})
export class PolicyViolationRuleComponent implements OnInit {
  @Input() message: string;

  @Input() violationType: string;

  constructor() {}

  ngOnInit() {}
}
