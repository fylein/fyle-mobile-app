import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-pull-back-advance-request',
    templateUrl: './pull-back-advance-request.component.html',
    styleUrls: ['./pull-back-advance-request.component.scss'],
})
export class PullBackAdvanceRequestComponent implements OnInit {
  reason = '';

  constructor(
    private popoverController: PopoverController
  ) { }

  async cancel() {
      await this.popoverController.dismiss();
  }

  pullBackAdvanceRequest() {
      this.popoverController.dismiss({
          reason: this.reason
      });
  }

  ngOnInit() {}

}
