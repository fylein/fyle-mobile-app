import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Expense } from 'src/app/core/models/expense.model';
@Component({
  selector: 'app-popup-alert',
  templateUrl: './popup-alert.component.html',
  styleUrls: ['./popup-alert.component.scss'],
})
export class PopupAlertComponent implements OnInit {
  @Input() title: string;

  @Input() message: string;

  @Input() primaryCta: { text: string; action: string; type?: string };

  @Input() secondaryCta: { text: string; action: string; type?: string };

  @Input() etxns: Expense[];

  numIssues = 0;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
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

  ctaClickedEvent(action) {
    this.popoverController.dismiss({
      action,
    });
  }
}
