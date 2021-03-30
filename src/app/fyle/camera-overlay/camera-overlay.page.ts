import { Component, OnInit } from '@angular/core';
import { Capacitor, Device, Plugins } from '@capacitor/core';
import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

const { CameraPreview } = Plugins;
import '@capacitor-community/camera-preview';
import { CurrencyService } from 'src/app/core/services/currency.service';

import { from } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { NavController, PopoverController } from '@ionic/angular';
import { GalleryUploadSuccessPopupComponent } from './gallery-upload-success-popup/gallery-upload-success-popup.component';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { StorageService } from 'src/app/core/services/storage.service';
import {TrackingService} from '../../core/services/tracking.service';
import {AuthService} from '../../core/services/auth.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';

@Component({
  selector: 'app-camera-overlay',
  templateUrl: './camera-overlay.page.html',
  styleUrls: ['./camera-overlay.page.scss'],
})
export class CameraOverlayPage implements OnInit {
  isCameraShown: boolean;
  recentImage: string;
  isBulkMode: boolean;
  isCameraOpenedInOneClick = false;
  lastImage: string;
  captureCount: number;
  homeCurrency: string;
  activeFlashMode: string;
  showInstaFyleIntro: boolean;
  modeChanged: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionsOutboxService: TransactionsOutboxService,
    private loaderService: LoaderService,
    private router: Router,
    private imagePicker: ImagePicker,
    private popoverController: PopoverController,
    private offlineService: OfflineService,
    private storageService: StorageService,
    private trackingService: TrackingService,
    private authService: AuthService,
    private navController: NavController,
    private popupService: PopupService,
    private openNativeSettings: OpenNativeSettings
  ) { }

  setUpAndStartCamera() {
    if (this.isCameraShown === false) {
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        x: 0,
        y: 0,
        toBack: true,
        width: window.screen.width,
        height: window.innerHeight - 120,
        parent: 'cameraPreview'
      };

      CameraPreview.start(cameraPreviewOptions).then(res => {
        this.isCameraShown = true;
        this.getFlashModes();
      }).catch((error) => {
        this.requestCameraAndPhotosPermission('camera');
      });

    }
  }

  async requestCameraAndPhotosPermission(actions?: string) {
    const deviceInfo = await Device.getInfo();

    let header = '';
    let message = '';

    if (deviceInfo.operatingSystem.toLowerCase() === 'ios') {
      if (actions.toLowerCase() === 'camera') {
        header = 'Allow Fyle to access your camera';
        message = 'You can use your camera to scan receipts. We\'ll auto-extract the receipt details and turn them into expenses.';
      } else if (actions.toLowerCase() === 'photos') {
        header = 'Allow Fyle to access your Photos';
        message = 'Fyle needs photo library access to upload receipts that you choose.';
      }
    } else if (deviceInfo.operatingSystem.toLowerCase() === 'android') {
      header = 'Allow Fyle to access camera, Files and media';
      message = 'To capture photos, allow Fyle access to your camera and your device\'s photos, media, and files.\n Tap Settings > Permissions, and turn Camera and "Files and Media" on.'
    }

    const permissionPopup = await this.popupService.showPopup({
      header,
      message,
      secondaryCta: {
        text: 'Not Now'
      },
      primaryCta: {
        text: 'Allow Access'
      },
      showCancelButton: false
    });
    if (permissionPopup === 'primary') {
      this.setUpAndStartCamera();
      this.openNativeSettings.open('application_details');
    } else {
      this.navController.back();
    }
  }

  async stopCamera() {
    if (this.isCameraShown === true) {
      await CameraPreview.stop();
      this.isCameraShown = false;
    }
  }

  switchMode() {
    this.isBulkMode = !this.isBulkMode;
    this.modeChanged = true;
    setTimeout(() => {
      this.modeChanged = false;
    }, 1000);
  }

  uploadFiles() {
    this.stopCamera();
    this.imagePicker.hasReadPermission().then((permission) => {
      if (permission) {
        const options = {
          maximumImagesCount: 10,
          outputType: 1,
          quality: 50
        };
        // If android app start crashing then convert outputType to 0 to get file path and then convert it to base64 before upload to s3.

        from(this.imagePicker.getPictures(options)).subscribe((imageBase64Strings) => {

          if (imageBase64Strings.length > 0) {
            this.loaderService.showLoader('Processing....', 2000);
            imageBase64Strings.forEach((base64String, key) => {
              const base64PictureData = 'data:image/jpeg;base64,' + base64String;
              this.addExpenseToQueue('GALLERY_UPLOAD', base64PictureData);
              if (key === imageBase64Strings.length - 1) {
                this.transactionsOutboxService.sync().then((res) => {
                  this.showGalleryUploadSuccessPopup(imageBase64Strings.length);
                });
              }
            });
            this.loaderService.hideLoader();
          } else {
            this.setUpAndStartCamera();
          }

        });

      } else {
        this.imagePicker.requestReadPermission().then(() => {
          this.uploadFiles()
        }).catch(() => {
          this.requestCameraAndPhotosPermission('photos');
        });
      }
    });
  }


  async showGalleryUploadSuccessPopup(count) {
    const uploadedTitle = count === 1 ? 'Uploaded ' + count + ' receipt' : 'Uploaded ' + count + ' receipts';
    const galleryUploadSuccessPopup = await this.popoverController.create({
      component: GalleryUploadSuccessPopupComponent,
      componentProps: {
        uploadedTitle
      },
      cssClass: 'gallery-upload-success-popover'
    });

    await galleryUploadSuccessPopup.present();

    const { data } = await galleryUploadSuccessPopup.onWillDismiss();
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
  }

  addExpenseToQueue(source, imageBase64String) {
    const transaction = {
      billable: false,
      skip_reimbursement: false,
      source,
      txn_dt: new Date(),
      amount: null,
      currency: this.homeCurrency
    };

    const attachmentUrls = [];
    const attachment = {
      thumbnail: imageBase64String,
      type: 'image',
      url: imageBase64String
    };

    attachmentUrls.push(attachment);

    this.transactionsOutboxService.addEntry(transaction, attachmentUrls);
  }

  closeImagePreview() {
    this.recentImage = '';
  }

  syncExpenseAndFinishProcess() {
    this.finishProcess();
  }

  async trackBulkUpload(captureCount) {
    const eou = await this.authService.getEou();

    const properties = {
      Asset: 'Mobile',
      Page: this.activatedRoute.snapshot.params.from || 'Receipts',
      NumberOfReceipts: captureCount,
      Source: eou.ou.id,
      Type: 'Upload Receipts'
    };

    return this.trackingService.bulkUploadReceipts(properties);
  }

  finishProcess() {
    this.stopCamera();
    if (this.isBulkMode && this.captureCount > 0) {
      this.trackBulkUpload(this.captureCount);
      this.showGalleryUploadSuccessPopup(this.captureCount);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    }
  }

  retake() {
    this.recentImage = '';
    this.setUpAndStartCamera();
  }

  save() {
    this.captureCount++;
    if (this.isBulkMode) {
      // Bulk mode
      this.lastImage = this.recentImage;
      this.closeImagePreview();
      this.setUpAndStartCamera();
      this.addExpenseToQueue('BULK_INSTA', this.lastImage);

    } else {
      // Single mode
      this.router.navigate(['/', 'enterprise', 'add_edit_expense', {dataUrl: this.recentImage}]);    }
  }

  async onCapture() {
    this.loaderService.showLoader('Hold Still...');
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 50
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    this.stopCamera();
    const base64PictureData = 'data:image/jpeg;base64,' + result.value;
    this.recentImage = base64PictureData;
    this.loaderService.hideLoader();
  }

  toggleFlashMode() {
    let nextActiveFlashMode = 'on';
    if (this.activeFlashMode === 'on') {
      nextActiveFlashMode = 'off';
    }

    CameraPreview.setFlashMode({flashMode: nextActiveFlashMode});
    this.activeFlashMode = nextActiveFlashMode;
  }

  getFlashModes() {
    CameraPreview.getSupportedFlashModes().then(flashModes => {
      if (flashModes.result && flashModes.result.includes('on') && flashModes.result.includes('off')) {
        this.activeFlashMode = this.activeFlashMode || 'off';
        CameraPreview.setFlashMode({flashMode: this.activeFlashMode});
      }
    });
  }

  disableInstaFyleIntro() {
    this.storageService.set('hideInstaFyleIntroGif', true);
    this.showInstaFyleIntro = false;
  }

  async showInstaFyleIntroImage() {
    const hideInstaFyleIntroGif = await this.storageService.get('hideInstaFyleIntroGif');

    if (!hideInstaFyleIntroGif) {
      this.showInstaFyleIntro = true;
      setTimeout(() => {
        this.showInstaFyleIntro = false;
      }, 2800);
    } else {
      this.showInstaFyleIntro = false;
    }
  }

  ionViewWillEnter() {
    this.captureCount = 0;
    this.isBulkMode = false;
    this.isCameraShown = false;
    this.setUpAndStartCamera();
    this.activeFlashMode = null;

    this.offlineService.getHomeCurrency().subscribe(res => {
      this.homeCurrency = res;
    });

    this.showInstaFyleIntroImage();
  }

  ngOnInit() {

  }


}
