import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-policy-violation-message',
  templateUrl: './policy-violation-message.component.html',
  styleUrls: ['./policy-violation-message.component.scss'],
})
export class PolicyViolationMessageComponent implements OnInit {
  @Input() message: string;

  constructor() {}

  ngOnInit() {}
}
