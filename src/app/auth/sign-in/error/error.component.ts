import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {

  @Input() header = 'Account dosent Exist';

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  async tryAgainClicked() {
    await this.popoverController.dismiss();
  }

}
