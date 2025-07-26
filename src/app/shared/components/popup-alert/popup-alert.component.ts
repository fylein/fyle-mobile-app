import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverCardsList } from 'src/app/core/models/popover-cards-list.model';
@Component({
  selector: 'app-popup-alert',
  templateUrl: './popup-alert.component.html',
  styleUrls: ['./popup-alert.component.scss'],
  standalone: false,
})
export class PopupAlertComponent {
  @Input() title: string;

  @Input() message: string;

  @Input() secondaryMsg: string;

  @Input() leftAlign = false;

  @Input() primaryCta: { text: string; action: string; type?: string };

  @Input() secondaryCta: { text: string; action: string; type?: string };

  @Input() flaggedExpensesCount = 0;

  @Input() cardsList: PopoverCardsList;

  constructor(private popoverController: PopoverController) {}

  ctaClickedEvent(action: string): void {
    this.popoverController.dismiss({
      action,
    });
  }
}
