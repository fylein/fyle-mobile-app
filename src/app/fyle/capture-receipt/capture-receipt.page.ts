import { Component, OnInit } from '@angular/core';
import {CameraPreviewOptions, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';
import { Plugins } from '@capacitor/core';
const {CameraPreview} = Plugins;
import '@capacitor-community/camera-preview';
import { ModalController } from '@ionic/angular';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';

@Component({
  selector: 'app-capture-receipt',
  templateUrl: './capture-receipt.page.html',
  styleUrls: ['./capture-receipt.page.scss'],
})
export class CaptureReceiptPage implements OnInit {
  isCameraShown: boolean;
  isBulkMode: boolean;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  async stopCamera() {
    if (this.isCameraShown === true) {
      await CameraPreview.stop();
      this.isCameraShown = false;
    }
  }

  setUpAndStartCamera() {
    if (!this.isCameraShown) {
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

  async onSingleCapture(base64PictureData) {
    const modal = await this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64Images: [base64PictureData],
        mode: "single"
      },
      // mode: 'ios',
      // presentingElement: await this.modalController.getTop(),
      // ...this.modalProperties.getModalDefaultProperties()
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      if (data.base64Images.length === 0) {
        this.setUpAndStartCamera();
      }
    }
  }

  async onCapture() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 50
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    this.stopCamera();
    const base64PictureData = 'data:image/jpeg;base64,' + result.value;
    //console.log(base64PictureData);
    if (!this.isBulkMode) { 
      this.onSingleCapture(base64PictureData);
    }

  }


  ionViewWillEnter() {
    this.isCameraShown = false;
    this.isBulkMode = false;
    this.setUpAndStartCamera();
  }




}
