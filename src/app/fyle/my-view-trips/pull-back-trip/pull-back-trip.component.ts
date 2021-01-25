import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pull-back-trip',
  templateUrl: './pull-back-trip.component.html',
  styleUrls: ['./pull-back-trip.component.scss'],
})
export class PullBackTripComponent implements OnInit {
  reason = '';

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() { }

  async cancel() {
    await this.popoverController.dismiss();
  }

  pullBackTrip() {
    if (this.reason.trim().length === 0) {
      return;
    }
    this.popoverController.dismiss({
      reason: this.reason
    });
  }
}
