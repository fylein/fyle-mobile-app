import { Component, inject } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverCardsList } from 'src/app/core/models/popover-cards-list.model';
@Component({
  selector: 'app-popup-alert',
  templateUrl: './popup-alert.component.html',
  styleUrls: ['./popup-alert.component.scss'],
  standalone: false,
})
export class PopupAlertComponent {
  private popoverController = inject(PopoverController);

  title: string;

  message: string;

  secondaryMsg: string;

  leftAlign = false;

  primaryCta: { text: string; action: string; type?: string };

  secondaryCta: { text: string; action: string; type?: string };

  flaggedExpensesCount = 0;

  cardsList: PopoverCardsList;

  ctaClickedEvent(action: string): void {
    this.popoverController.dismiss({
      action,
    });
  }
}
