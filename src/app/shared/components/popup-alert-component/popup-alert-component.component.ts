import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
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

  @Input() etxns: [];

  numIssues: number = 0;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
    if (this.etxns) {
      this.numIssues = this.getNumIssues(this.etxns);
    }
  }

  ctaClickedEvent(action) {
    this.popoverController.dismiss({
      action,
    });
  }

  getNumIssues(etxns) {
    let count = 0;

    etxns.forEach((etxn) => {
      if (etxn.tx_policy_flag || etxn.tx_manual_flag) {
        count = count + 1;
      }
    });
    return count;
  }
}
