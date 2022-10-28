import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Platform, PopoverController } from '@ionic/angular';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopupAlertComponentComponent } from '../../popup-alert-component/popup-alert-component.component';

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

  flashMode: 'on' | 'off';

  showModeChangedMessage = false;

  constructor(
    private loaderService: LoaderService,
    private popoverController: PopoverController,
    private platform: Platform
  ) {}

  setUpAndStartCamera() {
    if (Capacitor.getPlatform() === 'web') {
      this.startCameraPreview();
      return;
    }

    from(Camera.requestPermissions()).subscribe((permissions) => {
      if (permissions?.camera === 'denied') {
        return this.showPermissionDeniedPopover('CAMERA');
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

  setupPermissionDeniedPopover(permissionType: 'CAMERA' | 'GALLERY') {
    const isIos = this.platform.is('ios');

    const galleryPermissionName = isIos ? 'Photos' : 'Storage';
    let title = 'Camera Permission';
    if (permissionType === 'GALLERY') {
      title = galleryPermissionName + ' Permission';
    }

    const cameraPermissionMessage = `To capture photos, please allow Fyle to access your camera. Click Settings and allow access to Camera and ${galleryPermissionName}`;
    const galleryPermissionMessage = `Please allow Fyle to access device photos. Click Settings and allow ${galleryPermissionName} access`;

    const message = permissionType === 'CAMERA' ? cameraPermissionMessage : galleryPermissionMessage;

    return this.popoverController.create({
      component: PopupAlertComponentComponent,
      componentProps: {
        title,
        message,
        primaryCta: {
          text: 'Open Settings',
          action: 'OPEN_SETTINGS',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'CANCEL',
        },
      },
      cssClass: 'pop-up-in-center',
      backdropDismiss: false,
    });
  }

  showPermissionDeniedPopover(permissionType: 'CAMERA' | 'GALLERY') {
    from(this.setupPermissionDeniedPopover(permissionType))
      .pipe(
        tap((permissionDeniedPopover) => permissionDeniedPopover.present()),
        switchMap((permissionDeniedPopover) => permissionDeniedPopover.onWillDismiss())
      )
      .subscribe(({ data }) => {
        if (data?.action === 'OPEN_SETTINGS') {
          NativeSettings.open({
            optionAndroid: AndroidSettings.ApplicationDetails,
            optionIOS: IOSSettings.App,
          });
        }
        this.onDismissCameraPreview();
      });
  }
}
