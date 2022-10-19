import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Capacitor } from '@capacitor/core';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-camera-preview',
  templateUrl: './camera-preview.component.html',
  styleUrls: ['./camera-preview.component.scss'],
})
export class CameraPreviewComponent implements OnInit, OnChanges {
  @Input() isBulkMode = false;

  @Input() isOffline = false;

  @Input() allowGalleryUploads = true;

  @Input() allowBulkFyle = true;

  @Input() lastCapturedReceipt: string;

  @Input() noOfReceipts = 0;

  @Output() galleryUpload = new EventEmitter();

  @Output() switchMode = new EventEmitter();

  @Output() captureReceipt = new EventEmitter();

  @Output() receiptPreview = new EventEmitter();

  @Output() toggleFlashMode = new EventEmitter();

  @Output() dismissCameraPreview = new EventEmitter();

  isCameraPreviewInitiated = false;

  isCameraPreviewStarted = false;

  flashMode: string;

  hasModeChanged = false;

  constructor(private loaderService: LoaderService) {}

  setUpAndStartCamera() {
    if (!this.isCameraPreviewInitiated) {
      this.isCameraPreviewInitiated = true;
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        toBack: true,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'cameraPreview',
        disableAudio: true,
      };

      this.loaderService.showLoader();
      CameraPreview.start(cameraPreviewOptions).then((res) => {
        this.isCameraPreviewStarted = true;
        this.getFlashModes();
        this.loaderService.hideLoader();
      });
    }
  }

  async stopCamera() {
    if (this.isCameraPreviewInitiated) {
      this.isCameraPreviewInitiated = false;
      await CameraPreview.stop();
      this.isCameraPreviewStarted = false;
    }
  }

  getFlashModes() {
    if (Capacitor.getPlatform() !== 'web') {
      CameraPreview.getSupportedFlashModes().then((flashModes) => {
        if (flashModes.result && flashModes.result.includes('on') && flashModes.result.includes('off')) {
          this.flashMode = this.flashMode || 'off';
          CameraPreview.setFlashMode({ flashMode: this.flashMode });
        }
      });
    }
  }

  onToggleFlashMode() {
    if (Capacitor.getPlatform() !== 'web') {
      let nextActiveFlashMode = 'on';
      if (this.flashMode === 'on') {
        nextActiveFlashMode = 'off';
      }

      CameraPreview.setFlashMode({ flashMode: nextActiveFlashMode });
      this.flashMode = nextActiveFlashMode;
    }
    this.toggleFlashMode.emit();
  }

  onGalleryUpload() {
    this.stopCamera();
    this.galleryUpload.emit();
  }

  onSwitchMode() {
    this.switchMode.emit();
  }

  openReceiptPreview() {
    this.stopCamera();
    this.receiptPreview.emit();
  }

  onDismissCameraPreview() {
    this.stopCamera();
    this.dismissCameraPreview.emit();
  }

  onCaptureReceipt() {
    this.captureReceipt.emit();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isBulkMode) {
      this.hasModeChanged = true;
      setTimeout(() => {
        this.hasModeChanged = false;
      }, 1000);
    }
  }
}
