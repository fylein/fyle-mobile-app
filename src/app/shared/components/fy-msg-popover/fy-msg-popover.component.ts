import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-fy-msg-popover',
  templateUrl: './fy-msg-popover.component.html',
  styleUrls: ['./fy-msg-popover.component.scss'],
  standalone: false,
})
export class FyMsgPopoverComponent {
  @Input() msg = '';

  constructor(private popoverController: PopoverController) {}

  dismiss(): void {
    this.popoverController.dismiss();
  }
}
