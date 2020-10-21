import { Component, OnInit, Input } from '@angular/core';
import { MyViewExpensePage } from '../my-view-expense.page';

@Component({
  selector: 'app-policy-violation-info-block',
  templateUrl: './policy-violation-info-block.component.html',
  styleUrls: ['./policy-violation-info-block.component.scss'],
})
export class PolicyViolationInfoBlockComponent implements OnInit {

  @Input() policyData: string;

  constructor() { }

  ngOnInit() {
    
  }

}
