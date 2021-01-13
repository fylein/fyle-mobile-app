import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-fyle-mode',
  templateUrl: './fyle-mode.component.html',
  styleUrls: ['./fyle-mode.component.scss'],
})
export class FyleModeComponent implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  decideCameraType(mode) {
    this.popoverController.dismiss({
      mode
    });
  }

}
