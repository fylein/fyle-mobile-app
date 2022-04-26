import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-policy-violation-action',
  templateUrl: './policy-violation-action.component.html',
  styleUrls: ['./policy-violation-action.component.scss'],
})
export class PolicyViolationActionComponent implements OnInit {
  @Input() message: string;

  @Input() icon: string;

  constructor() {}

  ngOnInit() {}
}
