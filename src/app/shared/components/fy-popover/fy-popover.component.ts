import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-fy-popover',
  templateUrl: './fy-popover.component.html',
  styleUrls: ['./fy-popover.component.scss'],
})
export class FyPopoverComponent {
  @Input() title = '';

  @Input() formLabel = '';

  formValue = '';

  constructor(private popoverController: PopoverController) {}

  dismiss() {
    this.popoverController.dismiss();
  }

  submit() {
    this.popoverController.dismiss({ comment: this.formValue });
  }
}
