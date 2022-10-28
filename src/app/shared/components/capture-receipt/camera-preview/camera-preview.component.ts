import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { from } from 'rxjs';
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

  @Output() permissionDenied = new EventEmitter<'CAMERA' | 'GALLERY'>();

  isCameraPreviewInitiated = false;

  isCameraPreviewStarted = false;

  flashMode: 'on' | 'off';

  showModeChangedMessage = false;

  constructor(private loaderService: LoaderService) {}

  setUpAndStartCamera() {
    if (Capacitor.getPlatform() === 'web') {
      this.startCameraPreview();
      return;
    }

    from(Camera.requestPermissions()).subscribe((permissions) => {
      if (permissions?.camera === 'denied') {
        return this.permissionDenied.emit('CAMERA');
      }

      /*
       * 'prompt-with-rationale' means that the user has denied permission, but has not disabled the permission prompt.
       * So, we can use the native dialog to ask the user for camera permission.
       */
      if (permissions?.camera === 'prompt-with-rationale') {
        return this.setUpAndStartCamera();
      }

      this.startCameraPreview();
    });
  }

  startCameraPreview() {
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
      from(CameraPreview.start(cameraPreviewOptions)).subscribe((_) => {
        this.isCameraPreviewStarted = true;
        this.getFlashModes();
        this.loaderService.hideLoader();
      });
    }
  }

  stopCamera() {
    if (this.isCameraPreviewInitiated) {
      this.isCameraPreviewInitiated = false;
      from(CameraPreview.stop()).subscribe((_) => (this.isCameraPreviewStarted = false));
    }
  }

  getFlashModes() {
    if (Capacitor.getPlatform() !== 'web') {
      from(CameraPreview.getSupportedFlashModes()).subscribe((flashModes) => {
        const requiredFlashModesPresent = flashModes.result?.includes('on') && flashModes.result?.includes('off');
        if (requiredFlashModesPresent) {
          this.flashMode = this.flashMode || 'off';
          CameraPreview.setFlashMode({ flashMode: this.flashMode });
        }
      });
    }
  }

  onToggleFlashMode() {
    if (Capacitor.getPlatform() !== 'web') {
      let nextActiveFlashMode: 'on' | 'off' = 'on';
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
    if (changes.isBulkMode?.previousValue !== undefined) {
      this.showModeChangedMessage = true;
      setTimeout(() => {
        this.showModeChangedMessage = false;
      }, 1000);
    }
  }
}
