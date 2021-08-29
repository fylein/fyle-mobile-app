import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-flag-unflag-confirmation',
  templateUrl: './flag-unflag-confirmation.component.html',
  styleUrls: ['./flag-unflag-confirmation.component.scss']
})
export class FlagUnflagConfirmationComponent implements OnInit {
  @Input() title;

  message = '';

  constructor(private popoverController: PopoverController) {}

  closeConfirmationPopup() {
    this.popoverController.dismiss();
  }

  flagUnflag() {
    if (this.message.trim().length < 0) {
      return;
    }
    this.popoverController.dismiss({ message: this.message });
  }

  ngOnInit() {}
}
