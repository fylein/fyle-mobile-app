import { Component, Input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-fy-msg-popover',
  templateUrl: './fy-msg-popover.component.html',
  styleUrls: ['./fy-msg-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, MatIcon],
})
export class FyMsgPopoverComponent {
  @Input() msg = '';

  constructor(private popoverController: PopoverController) {}

  dismiss(): void {
    this.popoverController.dismiss();
  }
}
