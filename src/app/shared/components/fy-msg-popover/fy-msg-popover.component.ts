import { Component, inject, input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-fy-msg-popover',
  templateUrl: './fy-msg-popover.component.html',
  styleUrls: ['./fy-msg-popover.component.scss'],
  standalone: false,
})
export class FyMsgPopoverComponent {
  private popoverController = inject(PopoverController);

  readonly msg = input<string>('');

  dismiss(): void {
    this.popoverController.dismiss();
  }
}
