import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Expense } from 'src/app/core/models/expense.model';
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

  numIssues: number = 0;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
    if (this.etxns) {
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
