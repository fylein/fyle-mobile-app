import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-action-confirmation-popover',
  templateUrl: './action-confirmation-popover.component.html',
  styleUrls: ['./action-confirmation-popover.component.scss'],
})
export class ActionConfirmationPopoverComponent implements OnInit {
  @Input() type;

  message = '';

  constructor(private popoverController: PopoverController) {}

  action() {
    if (this.type === 'SEND_BACK' && this.message.replace(/\s/g, '').length > 0) {
      this.popoverController.dismiss({ message: this.message });
    }

    if (this.type === 'REJECT' && this.message.replace(/\s/g, '').length > 0) {
      this.popoverController.dismiss({ message: this.message });
    }
  }

  close() {
    this.popoverController.dismiss();
  }

  ngOnInit() {}
}
