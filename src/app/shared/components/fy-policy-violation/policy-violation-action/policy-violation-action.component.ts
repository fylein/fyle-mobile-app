import { Component, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-policy-violation-action',
    templateUrl: './policy-violation-action.component.html',
    styleUrls: ['./policy-violation-action.component.scss'],
    imports: [NgClass],
})
export class PolicyViolationActionComponent implements OnInit {
  @Input() message: string;

  @Input() icon: string;

  @Input() actionsCount: number;

  constructor() {}

  ngOnInit() {}
}
