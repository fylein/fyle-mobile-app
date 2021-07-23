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
  showError = false;

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() { }

  async cancel() {
    await this.popoverController.dismiss();
  }

  pullBackTrip() {
    this.showError = false;
    if (this.reason.trim().length === 0) {
      this.showError = true;
      return;
    }
    this.popoverController.dismiss({
      reason: this.reason
    });
  }
}
