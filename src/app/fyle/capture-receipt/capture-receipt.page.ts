import { Component, OnInit } from '@angular/core';
import {CameraPreviewOptions, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';
import { Plugins } from '@capacitor/core';
const {CameraPreview} = Plugins;
import '@capacitor-community/camera-preview';

@Component({
  selector: 'app-capture-receipt',
  templateUrl: './capture-receipt.page.html',
  styleUrls: ['./capture-receipt.page.scss'],
})
export class CaptureReceiptPage implements OnInit {
  isCameraShown: boolean;

  constructor() { }

  ngOnInit() {
  }

  setUpAndStartCamera() {
    if (this.isCameraShown === false) {
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        x: 0,
        y: 0,
        toBack: true,
        width: window.screen.width,
        height: window.screen.height,
        parent: 'cameraPreview'
      };

      CameraPreview.start(cameraPreviewOptions).then(res => {
        this.isCameraShown = true;
        //this.getFlashModes();
      });

    }
  }


  ionViewWillEnter() {
    this.isCameraShown = false
    this.setUpAndStartCamera();
  }




}
