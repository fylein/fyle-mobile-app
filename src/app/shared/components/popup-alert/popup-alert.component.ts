import { Component, Input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { PopoverCardsList } from 'src/app/core/models/popover-cards-list.model';
import { NgClass } from '@angular/common';
import { FyAlertInfoComponent } from '../fy-alert-info/fy-alert-info.component';
import { TranslocoPipe } from '@jsverse/transloco';
@Component({
  selector: 'app-popup-alert',
  templateUrl: './popup-alert.component.html',
  styleUrls: ['./popup-alert.component.scss'],
  standalone: true,
  imports: [IonicModule, NgClass, FyAlertInfoComponent, TranslocoPipe],
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
