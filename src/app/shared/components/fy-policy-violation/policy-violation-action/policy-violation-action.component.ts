import { Component, Input, OnInit, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-policy-violation-action',
  templateUrl: './policy-violation-action.component.html',
  styleUrls: ['./policy-violation-action.component.scss'],
  imports: [NgClass],
})
export class PolicyViolationActionComponent implements OnInit {
  readonly message = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() icon: string;

  readonly actionsCount = input<number>(undefined);

  constructor() {}

  ngOnInit() {}
}
