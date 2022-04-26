import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fy-critical-policy-violation-message',
  templateUrl: './fy-critical-policy-violation-message.component.html',
  styleUrls: ['./fy-critical-policy-violation-message.component.scss'],
})
export class FyCriticalPolicyViolationMessageComponent implements OnInit {
  @Input() message: string;

  constructor() {}

  ngOnInit() {}
}
