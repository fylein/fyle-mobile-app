import { Component, Input, inject, input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { PopoverCardsList } from 'src/app/core/models/popover-cards-list.model';
import { NgClass } from '@angular/common';
import { FyAlertInfoComponent } from '../fy-alert-info/fy-alert-info.component';
import { TranslocoPipe } from '@jsverse/transloco';
@Component({
    selector: 'app-popup-alert',
    templateUrl: './popup-alert.component.html',
    styleUrls: ['./popup-alert.component.scss'],
    imports: [
        IonicModule,
        NgClass,
        FyAlertInfoComponent,
        TranslocoPipe,
    ],
})
export class PopupAlertComponent {
  private popoverController = inject(PopoverController);

  readonly title = input<string>(undefined);

  readonly message = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() secondaryMsg: string;

  readonly leftAlign = input(false);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() primaryCta: { text: string; action: string; type?: string };

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() secondaryCta: { text: string; action: string; type?: string };

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() flaggedExpensesCount = 0;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() cardsList: PopoverCardsList;

  ctaClickedEvent(action: string): void {
    this.popoverController.dismiss({
      action,
    });
  }
}
