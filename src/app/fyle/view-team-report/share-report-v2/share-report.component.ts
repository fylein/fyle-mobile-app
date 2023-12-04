import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-share-report',
  templateUrl: './share-report.component.html',
  styleUrls: ['./share-report.component.scss'],
})
export class ShareReportV2Component implements OnInit {
  email = '';

  constructor(private popoverController: PopoverController) {}

  async cancel() {
    await this.popoverController.dismiss();
  }

  shareReport(emailInput) {
    if (emailInput.valid) {
      this.popoverController.dismiss({
        email: this.email,
      });
    } else {
      emailInput.control.markAllAsTouched();
    }
  }

  ngOnInit() {}
}
