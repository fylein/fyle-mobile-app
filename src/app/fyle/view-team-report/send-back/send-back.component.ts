import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-send-back',
  templateUrl: './send-back.component.html',
  styleUrls: ['./send-back.component.scss'],
})
export class SendBackComponent implements OnInit {
  sendBackReason = '';

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  cancel() {
    this.popoverController.dismiss();
  }

  sendBack() {
    const status = {
      comment: this.sendBackReason,
    };
    const statusPayload = {
      status,
      notify: false,
    };
    this.popoverController.dismiss({ statusPayload });
  }
}
