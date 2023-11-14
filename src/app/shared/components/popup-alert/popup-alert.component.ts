import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-popup-alert',
  templateUrl: './popup-alert.component.html',
  styleUrls: ['./popup-alert.component.scss'],
})
export class PopupAlertComponent {
  @Input() title: string;

  @Input() message: string;

  @Input() primaryCta: { text: string; action: string; type?: string };

  @Input() secondaryCta: { text: string; action: string; type?: string };

  @Input() flaggedExpensesCount = 0;

  constructor(private popoverController: PopoverController) {}

  ctaClickedEvent(action) {
    this.popoverController.dismiss({
      action,
    });
  }
}
