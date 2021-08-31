import { Component, OnDestroy, OnInit } from '@angular/core';
import { Capacitor, Plugins } from '@capacitor/core';
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
import { TrackingService } from '../../core/services/tracking.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-camera-overlay',
  templateUrl: './camera-overlay.page.html',
  styleUrls: ['./camera-overlay.page.scss'],
})
export class CameraOverlayPage implements OnInit, OnDestroy {
  isCameraShown: boolean;

  recentImage: string;

  isBulkMode: boolean;

  lastImage: string;

  captureCount: number;

  homeCurrency: string;

  activeFlashMode: string;

  showInstaFyleIntro: boolean;

  modeChanged: boolean;

  isInstafyleEnabled: boolean;

  navigateBack = false;

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
    private navController: NavController
  ) {}

  setUpAndStartCamera() {
    if (this.isCameraShown === false) {
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        x: 0,
        y: 0,
        toBack: true,
        width: window.screen.width,
        height: window.innerHeight - 120,
        parent: 'cameraPreview',
      };

      CameraPreview.start(cameraPreviewOptions).then((res) => {
        this.isCameraShown = true;
        this.getFlashModes();
      });
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

    if (this.isBulkMode) {
      this.trackingService.switchedToInstafyleBulkMode({
        Asset: 'Mobile',
      });
    } else {
      this.trackingService.switchedToInstafyleSingleMode({
        Asset: 'Mobile',
      });
    }
  }

  uploadFiles() {
    this.trackingService.instafyleGalleryUploadOpened({
      Asset: 'Mobile',
    });

    this.stopCamera();
    this.imagePicker.hasReadPermission().then((permission) => {
      if (permission) {
        const options = {
          maximumImagesCount: 10,
          outputType: 1,
          quality: 50,
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
        this.imagePicker.requestReadPermission();
        this.uploadFiles();
      }
    });
  }

  async showGalleryUploadSuccessPopup(count) {
    const uploadedTitle = count === 1 ? 'Uploaded ' + count + ' receipt' : 'Uploaded ' + count + ' receipts';
    const galleryUploadSuccessPopup = await this.popoverController.create({
      component: GalleryUploadSuccessPopupComponent,
      componentProps: {
        uploadedTitle,
      },
      cssClass: 'gallery-upload-success-popover',
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
      currency: this.homeCurrency,
    };

    const attachmentUrls = [];
    const attachment = {
      thumbnail: imageBase64String,
      type: 'image',
      url: imageBase64String,
    };

    attachmentUrls.push(attachment);

    this.transactionsOutboxService.addEntry(transaction, attachmentUrls, null, null, this.isInstafyleEnabled);
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
      Type: 'Upload Receipts',
    };

    return this.trackingService.bulkUploadReceipts(properties);
  }

  finishProcess() {
    this.stopCamera();
    if (this.isBulkMode && this.captureCount > 0) {
      this.trackBulkUpload(this.captureCount);
      this.showGalleryUploadSuccessPopup(this.captureCount);
    } else if (this.navigateBack) {
      this.navController.back();
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
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_expense',
        {
          dataUrl: this.recentImage,
          canExtractData: this.isInstafyleEnabled,
        },
      ]);
    }
  }

  async onCapture() {
    this.loaderService.showLoader('Hold Still...');
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 50,
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

    CameraPreview.setFlashMode({ flashMode: nextActiveFlashMode });
    this.activeFlashMode = nextActiveFlashMode;

    this.trackingService.flashModeSet({
      Asset: 'Mobile',
      FlashMode: this.activeFlashMode,
    });
  }

  getFlashModes() {
    CameraPreview.getSupportedFlashModes().then((flashModes) => {
      if (flashModes.result && flashModes.result.includes('on') && flashModes.result.includes('off')) {
        this.activeFlashMode = this.activeFlashMode || 'off';
        CameraPreview.setFlashMode({ flashMode: this.activeFlashMode });
      }
    });
  }

  disableInstaFyleIntro() {
    this.storageService.set('hideInstaFyleIntroGif', true);
    this.showInstaFyleIntro = false;
    this.trackingService.instafyleIntroDisabled({
      Asset: 'Mobile',
    });
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
    this.navigateBack = this.activatedRoute.snapshot.params.navigate_back;

    this.offlineService.getHomeCurrency().subscribe((res) => {
      this.homeCurrency = res;
    });

    this.showInstaFyleIntroImage();
    this.offlineService.getOrgUserSettings().subscribe((orgUserSettings) => {
      this.isInstafyleEnabled =
        orgUserSettings.insta_fyle_settings.allowed && orgUserSettings.insta_fyle_settings.enabled;
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.stopCamera();
  }
}
