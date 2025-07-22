import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopupConfig } from './popup.model';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-popup',
  templateUrl: './fy-popup.component.html',
  styleUrls: ['./fy-popup.component.scss'],
  standalone: true,
  imports: [NgClass, MatButton, TranslocoPipe],
})
export class FyPopupComponent implements OnInit {
  @Input() config: PopupConfig;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
    if (this.config.showCancelButton === undefined) {
      this.config.showCancelButton = true;
    }
  }

  primaryCtaClicked() {
    if (this.config.primaryCta) {
      // noinspection JSIgnoredPromiseFromCall
      this.popoverController.dismiss({
        action: 'primary',
      });
    }
  }

  secondaryCtaClicked() {
    if (this.config.secondaryCta) {
      // noinspection JSIgnoredPromiseFromCall
      this.popoverController.dismiss({
        action: 'secondary',
      });
    }
  }

  cancel() {
    // noinspection JSIgnoredPromiseFromCall
    this.popoverController.dismiss({
      action: 'cancel',
    });
  }
}
