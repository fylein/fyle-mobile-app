import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Expense } from 'src/app/core/models/expense.model';
import { isNumber } from 'lodash';
@Component({
  selector: 'app-popup-alert-component',
  templateUrl: './popup-alert-component.component.html',
  styleUrls: ['./popup-alert-component.component.scss'],
})
export class PopupAlertComponentComponent implements OnInit {
  @Input() title: string;

  @Input() message: string;

  @Input() primaryCta: { text: string; action: string; type?: string };

  @Input() secondaryCta: { text: string; action: string; type?: string };

  @Input() etxns: Expense[];

  @Input() showCriticalViolated: boolean;

  numIssues = 0;

  numCriticalPolicies = 0;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
    if (this.showCriticalViolated) {
      this.numCriticalPolicies = this.getCriticalPolicyViolations(this.etxns);
    }

    if (this.etxns && this.etxns.length > 0) {
      this.numIssues = this.etxns.reduce((acc, etxn) => {
        if (etxn.tx_policy_flag || etxn.tx_manual_flag) {
          return acc + 1;
        } else {
          return acc;
        }
      }, 0);
    }
  }

  getCriticalPolicyViolations(etxns) {
    let count = 0;
    etxns.forEach((etxn) => {
      if (etxn.tx_policy_flag && isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001) {
        count = count + 1;
      }
    });
    return count;
  }

  ctaClickedEvent(action) {
    this.popoverController.dismiss({
      action,
    });
  }
}
