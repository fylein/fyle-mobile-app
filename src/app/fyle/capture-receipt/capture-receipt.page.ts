import { Component, OnInit } from '@angular/core';
import {CameraPreviewOptions, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';
import { Plugins } from '@capacitor/core';
const {CameraPreview} = Plugins;
import '@capacitor-community/camera-preview';
import { ModalController, NavController } from '@ionic/angular';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-capture-receipt',
  templateUrl: './capture-receipt.page.html',
  styleUrls: ['./capture-receipt.page.scss'],
})
export class CaptureReceiptPage implements OnInit {
  isCameraShown: boolean;
  isBulkMode: boolean;
  modeChanged = false;
  captureCount = 0;
  base64Images: string[];
  lastImage: string;


  constructor(
    private modalController: ModalController,
    private trackingService: TrackingService,
    private router: Router,
    private navController: NavController
  ) { }

  ngOnInit() {
  }

  async stopCamera() {
    if (this.isCameraShown === true) {
      await CameraPreview.stop();
      this.isCameraShown = false;
    }
  }

  close() {
    this.stopCamera();
    this.navController.back();
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

  switchMode() {
    this.isBulkMode = !this.isBulkMode;
    this.modeChanged = true;
    setTimeout(() => {
      this.modeChanged = false;
    }, 1000);
    
    if (this.isBulkMode) {
      this.trackingService.switchedToInstafyleBulkMode({
        Asset: 'Mobile' 
      });
    } else {
      this.trackingService.switchedToInstafyleSingleMode({
        Asset: 'Mobile' 
      }); 
    }
  }

  async onSingleCapture() {
    const modal = await this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64Images: this.base64Images,
        mode: "single"
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      if (data.base64Images.length === 0) {
        this.base64Images = [];
        this.setUpAndStartCamera();
      }
    }
  }

  async review() {
    const modal = await this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64Images: this.base64Images,
        mode: "bulk"
      },
    });

    await modal.present();
  }

  onBulkCapture() {
    this.captureCount += 1;
    this.setUpAndStartCamera();
    // console.log()
  }

  async onCapture() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 85,
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    await this.stopCamera();
    const base64PictureData = 'data:image/jpeg;base64,' + result.value;
    this.lastImage = base64PictureData;
    this.base64Images.push(base64PictureData)
    //console.log(base64PictureData);
    if (!this.isBulkMode) { 
      this.onSingleCapture();
    } else {
      this.onBulkCapture();
    }

  }



  ionViewWillEnter() {
    this.isCameraShown = false;
    this.isBulkMode = false;
    this.base64Images = [];
    this.setUpAndStartCamera();
  }




}
