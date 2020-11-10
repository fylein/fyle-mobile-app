import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { ActivatedRoute } from '@angular/router';

const { CameraPreview } = Plugins;
import '@capacitor-community/camera-preview';

@Component({
  selector: 'app-camera-overlay',
  templateUrl: './camera-overlay.page.html',
  styleUrls: ['./camera-overlay.page.scss'],
})
export class CameraOverlayPage implements OnInit {
  isCameraShown = true;
  recentImage: string;
  isBulkMode = false;
  isCameraOpenedInOneClick = false;
  lastImage: string;
  captureCount = 0;

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  setUpAndStartCamera() {
    this.isCameraShown = true;
    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height - 120,
      parent: 'cameraPreview'
    };

    CameraPreview.start(cameraPreviewOptions);
  }

  switchMode() {
    this.isBulkMode = !this.isBulkMode;
  }

  addExpenseToQueue(source, galleryImgUrl) {

  }

  closePreview() {
    this.recentImage = '';
    this.setUpAndStartCamera();
  }

  save() {
    this.captureCount++;
    if (this.isBulkMode) {
      // Bulk mode
      this.lastImage = this.recentImage;
      this.closePreview();
      
    } else {
      // Single mode
      if (this.isCameraOpenedInOneClick) {
        // todo
      } else {
        console.log(this.recentImage);
        // todo redirect to add_Edit_exp page
      }
    }
  }

  async onCapture() {
    this.isCameraShown = false;
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 100 // Reduce this to 50 later
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    const base64PictureData = 'data:image/jpeg;base64,' + result.value;
    this.recentImage = base64PictureData;
    await CameraPreview.stop();
  }

  ngOnInit() {
    console.log('Staring camera overlay');
    console.log(window.screen.height);
    this.setUpAndStartCamera();
    this.isCameraOpenedInOneClick = this.activatedRoute.snapshot.params.isOneClick;
  }


}
