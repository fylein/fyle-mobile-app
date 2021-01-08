import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
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
import { PopoverController } from '@ionic/angular';
import { GalleryUploadSuccessPopupComponent } from './gallery-upload-success-popup/gallery-upload-success-popup.component';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { StorageService } from 'src/app/core/services/storage.service';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private transactionsOutboxService: TransactionsOutboxService,
    private loaderService: LoaderService,
    private router: Router,
    private imagePicker: ImagePicker,
    private popoverController: PopoverController,
    private offlineService: OfflineService,
    private storageService: StorageService
  ) { }

  setUpAndStartCamera() {
    if (this.isCameraShown === false) {
      this.isCameraShown = true;
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        x: 0,
        y: 0,
        width: window.screen.width,
        height: window.innerHeight - 120,
        parent: 'cameraPreview'
      };

      CameraPreview.start(cameraPreviewOptions);
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
            this.loaderService.showLoader('Processing....');
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
        uploadedTitle
      },
      cssClass: 'gallery-upload-success-popover'
    });

    await galleryUploadSuccessPopup.present();

    const { data } = await galleryUploadSuccessPopup.onWillDismiss();
    this.router.navigate(['/', 'enterprise', 'my_dashboard']);
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
    if (this.isCameraOpenedInOneClick) {
      // Todo: Sync expense and redirect to close_app page
    } else {
      this.finishProcess();
    }
  }

  finishProcess() {
    this.stopCamera();
    if (this.isBulkMode && this.captureCount > 0) {
      this.showGalleryUploadSuccessPopup(this.captureCount);
    } else {
      this.router.navigate(['/', 'enterprise', 'my_dashboard']);
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
      if (this.isCameraOpenedInOneClick) {
        // Todo: Add expense to queue
        // this.syncExpenseAndFinishProcess()
      } else {
        this.router.navigate(['/', 'enterprise', 'add_edit_expense', {dataUrl: this.recentImage}]);
      }
    }
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
        this.activeFlashMode = 'off';
        CameraPreview.setFlashMode({flashMode: this.activeFlashMode});
      }
    })
  }

  disableInstaFyleIntro() {
    this.storageService.set('hideInstaFyleIntroGif', true);
    this.showInstaFyleIntro = false;
  };

  async showInstaFyleIntroImage() {
    const hideInstaFyleIntroGif = await this.storageService.get('hideInstaFyleIntroGif');

    if (!hideInstaFyleIntroGif) {
      this.showInstaFyleIntro = true;
      setTimeout(() => {
        this.showInstaFyleIntro = false;
      }, 2800)
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
    this.isCameraOpenedInOneClick = this.activatedRoute.snapshot.params.isOneClick;

    this.offlineService.getHomeCurrency().subscribe(res => {
      this.homeCurrency = res;
    });

    this.showInstaFyleIntroImage();

    setTimeout(() => {
      this.getFlashModes();
    }, 500);
  }

  ngOnInit() {

  }


}
