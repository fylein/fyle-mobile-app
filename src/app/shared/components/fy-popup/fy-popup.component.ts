import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { forkJoin, noop } from 'rxjs';
import { PopupConfig } from './popup.model';

@Component({
  selector: 'app-fy-popup',
  templateUrl: './fy-popup.component.html',
  styleUrls: ['./fy-popup.component.scss'],
})
export class FyPopupComponent implements OnInit {
  @Input('') config: PopupConfig;

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    console.log(this.config);
    if (!this.config.showCancelButton) {
      this.config.showCancelButton = true;
    }
  }

  primaryCtaClicked() {
    if (this.config.primaryCta) {
      this.popoverController.dismiss({
        action: 'primary'
      });
    }
  }

  secondaryCtaClicked() {
    if (this.config.secondaryCta) {
      this.popoverController.dismiss({
        action: 'secondary'
      });
    }
  }

  cancel() {
    this.popoverController.dismiss({
      action: 'cancel'
    });
  }
}
