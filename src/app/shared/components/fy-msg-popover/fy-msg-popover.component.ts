import { Component, inject, input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-fy-msg-popover',
  templateUrl: './fy-msg-popover.component.html',
  styleUrls: ['./fy-msg-popover.component.scss'],
  imports: [IonicModule, MatIcon],
})
export class FyMsgPopoverComponent {
  private popoverController = inject(PopoverController);

  readonly msg = input<string>('');

  dismiss(): void {
    this.popoverController.dismiss();
  }
}
