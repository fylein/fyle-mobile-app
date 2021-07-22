import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-gallery-upload-success-popup',
    templateUrl: './gallery-upload-success-popup.component.html',
    styleUrls: ['./gallery-upload-success-popup.component.scss'],
})
export class GalleryUploadSuccessPopupComponent implements OnInit {

  @Input() uploadedTitle;
  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  done() {
      // noinspection JSIgnoredPromiseFromCall
      this.popoverController.dismiss();
  }

}
