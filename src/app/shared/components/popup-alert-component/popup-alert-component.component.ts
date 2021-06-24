import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popup-alert-component',
  templateUrl: './popup-alert-component.component.html',
  styleUrls: ['./popup-alert-component.component.scss'],
})
export class PopupAlertComponentComponent implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  primaryCtaClicked() {
    this.popoverController.dismiss({
      action: 'primary'
    });
  }

  secondaryCtaClicked() {
    this.popoverController.dismiss({
      action: 'secondary'
    });
  }
  

}
