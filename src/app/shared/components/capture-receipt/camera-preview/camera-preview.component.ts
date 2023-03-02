import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import { from } from 'rxjs';
import { DEVICE_PLATFORM } from 'src/app/constants';

enum CameraState {
  STARTING,
  RUNNING,
  STOPPING,
  STOPPED,
}

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

  @Input() isBulkModePromptShown = false;

  @Output() galleryUpload = new EventEmitter();

  @Output() switchMode = new EventEmitter();

  @Output() captureReceipt = new EventEmitter();

  @Output() receiptPreview = new EventEmitter();

  @Output() toggleFlashMode = new EventEmitter();

  @Output() dismissCameraPreview = new EventEmitter();

  @Output() permissionDenied = new EventEmitter<'CAMERA' | 'GALLERY'>();

  cameraState: CameraState = CameraState.STOPPED;

  flashMode: 'on' | 'off';

  showModeChangedMessage = false;

  isIos = true;

  constructor(@Inject(DEVICE_PLATFORM) private devicePlatform: 'android' | 'ios' | 'web') {}

  get CameraState() {
    return CameraState;
  }

  setUpAndStartCamera() {
    this.isIos = this.devicePlatform === 'ios';
    if (this.devicePlatform === 'web') {
      this.startCameraPreview();
    } else {
      from(Camera.requestPermissions()).subscribe((permissions) => {
        if (permissions?.camera === 'denied') {
          this.permissionDenied.emit('CAMERA');
        } else if (permissions?.camera === 'prompt-with-rationale') {
          /*
           * 'prompt-with-rationale' means that the user has denied permission, but has not disabled the permission prompt.
           * So, we can use the native dialog to ask the user for camera permission.
           */
          this.setUpAndStartCamera();
        } else {
          this.startCameraPreview();
        }
      });
    }
  }

  startCameraPreview() {
    if (![CameraState.STARTING, CameraState.RUNNING].includes(this.cameraState)) {
      this.cameraState = CameraState.STARTING;
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        toBack: true,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'cameraPreview',
        disableAudio: true,
      };

      from(CameraPreview.start(cameraPreviewOptions)).subscribe((_) => {
        this.cameraState = CameraState.RUNNING;
        this.getFlashModes();
      });
    }
  }

  stopCamera() {
    //Stop camera only if it is in RUNNING state
    if (this.cameraState === CameraState.RUNNING) {
      this.cameraState = CameraState.STOPPING;
      from(CameraPreview.stop()).subscribe((_) => (this.cameraState = CameraState.STOPPED));
    }
  }

  getFlashModes() {
    if (this.devicePlatform !== 'web') {
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
    if (this.devicePlatform !== 'web') {
      let nextActiveFlashMode: 'on' | 'off' = 'on';
      if (this.flashMode === 'on') {
        nextActiveFlashMode = 'off';
      }

      CameraPreview.setFlashMode({ flashMode: nextActiveFlashMode });
      this.flashMode = nextActiveFlashMode;
      this.toggleFlashMode.emit(this.flashMode);
    }
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
    if (this.cameraState === CameraState.RUNNING) {
      this.captureReceipt.emit();
    }
  }

  ngOnInit() {
    //Component is initialized with camera in STOPPED state
    this.cameraState = CameraState.STOPPED;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isBulkMode?.previousValue !== undefined) {
      this.showModeChangedMessage = true;
      setTimeout(() => {
        this.showModeChangedMessage = false;
      }, 1000);
    }
  }
}
