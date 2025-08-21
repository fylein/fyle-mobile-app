import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { from } from 'rxjs';
import { DEVICE_PLATFORM } from 'src/app/constants';
import { CameraState } from 'src/app/core/enums/camera-state.enum';
import { CameraPreviewService } from 'src/app/core/services/camera-preview.service';
import { CameraService } from 'src/app/core/services/camera.service';
import * as Sentry from '@sentry/angular';

@Component({
  selector: 'app-camera-preview',
  templateUrl: './camera-preview.component.html',
  styleUrls: ['./camera-preview.component.scss'],
  standalone: false,
})
export class CameraPreviewComponent implements OnInit, OnChanges {
  private devicePlatform = inject(DEVICE_PLATFORM);

  private cameraService = inject(CameraService);

  private cameraPreviewService = inject(CameraPreviewService);

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

  get CameraState(): typeof CameraState {
    return CameraState;
  }

  setUpAndStartCamera(): void {
    this.isIos = this.devicePlatform === 'ios';
    if (this.devicePlatform === 'web') {
      this.startCameraPreview();
    } else {
      from(this.cameraService.requestCameraPermissions()).subscribe((permissions) => {
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

  startCameraPreview(): void {
    if (![CameraState.STARTING, CameraState.RUNNING].includes(this.cameraState)) {
      const currentCameraState = this.cameraState;
      this.cameraState = CameraState.STARTING;
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        toBack: true,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'cameraPreview',
        disableAudio: true,
      };

      from(this.cameraPreviewService.start(cameraPreviewOptions)).subscribe({
        next: () => {
          this.cameraState = CameraState.RUNNING;
          this.getFlashModes();
        },
        error: (error) => {
          Sentry.captureException(error, {
            extra: {
              errorResponse: error,
              currentCameraState,
              cameraState: this.cameraState,
              navigationState: window.location.href,
              options: cameraPreviewOptions,
              platform: this.devicePlatform,
              timestamp: new Date().toISOString(),
            },
          });
        },
      });
    }
  }

  stopCamera(): void {
    //Stop camera only if it is in RUNNING state
    if (this.cameraState === CameraState.RUNNING) {
      this.cameraState = CameraState.STOPPING;
      from(this.cameraPreviewService.stop()).subscribe(() => (this.cameraState = CameraState.STOPPED));
    }
  }

  getFlashModes(): void {
    if (this.devicePlatform !== 'web') {
      from(this.cameraPreviewService.getSupportedFlashModes()).subscribe((flashModes) => {
        const requiredFlashModesPresent = flashModes.result?.includes('on') && flashModes.result?.includes('off');
        if (requiredFlashModesPresent) {
          this.flashMode = this.flashMode || 'off';
          this.cameraPreviewService.setFlashMode({ flashMode: this.flashMode });
        }
      });
    }
  }

  onToggleFlashMode(): void {
    if (this.devicePlatform !== 'web') {
      let nextActiveFlashMode: 'on' | 'off' = 'on';
      if (this.flashMode === 'on') {
        nextActiveFlashMode = 'off';
      }

      this.cameraPreviewService.setFlashMode({ flashMode: nextActiveFlashMode });
      this.flashMode = nextActiveFlashMode;
      this.toggleFlashMode.emit(this.flashMode);
    }
  }

  onGalleryUpload(): void {
    this.stopCamera();
    this.galleryUpload.emit();
  }

  onSwitchMode(): void {
    this.switchMode.emit();
  }

  openReceiptPreview(): void {
    this.stopCamera();
    this.receiptPreview.emit();
  }

  onDismissCameraPreview(): void {
    this.stopCamera();
    this.dismissCameraPreview.emit();
  }

  onCaptureReceipt(): void {
    if (this.cameraState === CameraState.RUNNING) {
      this.captureReceipt.emit();
    }
  }

  ngOnInit(): void {
    //Component is initialized with camera in STOPPED state
    this.cameraState = CameraState.STOPPED;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isBulkMode?.previousValue !== undefined) {
      this.showModeChangedMessage = true;
      setTimeout(() => {
        this.showModeChangedMessage = false;
      }, 1000);
    }
  }
}
