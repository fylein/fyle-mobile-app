import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-draft-advance-summary',
  templateUrl: './draft-advance-summary.component.html',
  styleUrls: ['./draft-advance-summary.component.scss'],
})
export class DraftAdvanceSummaryComponent implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  createAdvanceRequest() {
    this.popoverController.dismiss({
      saveAdvanceRequest: true
    });
  }

  close() {
    this.popoverController.dismiss();
  }

}
