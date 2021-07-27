import { Component, OnInit } from '@angular/core';
import {CameraPreviewOptions, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';
import { Capacitor, Plugins } from '@capacitor/core';

import '@capacitor-community/camera-preview';
import { ModalController, NavController } from '@ionic/angular';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';
import { OfflineService } from 'src/app/core/services/offline.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { from, noop } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';

const {CameraPreview} = Plugins;

type Image = Partial<{
  source: string;
  base64Image: string;
}>;
@Component({
  selector: 'app-capture-receipt',
  templateUrl: './capture-receipt.page.html',
  styleUrls: ['./capture-receipt.page.scss'],
})
export class CaptureReceiptPage implements OnInit {
  isCameraShown: boolean;

  isBulkMode: boolean;

  hasModeChanged = false;

  captureCount = 0;

  base64ImagesWithSource: Image[];

  lastImage: string;

  flashMode: string;

  homeCurrency: string;

  isInstafyleEnabled: boolean;


  constructor(
    private modalController: ModalController,
    private trackingService: TrackingService,
    private router: Router,
    private navController: NavController,
    private offlineService: OfflineService,
    private transactionsOutboxService: TransactionsOutboxService,
    private imagePicker: ImagePicker,
    private networkService: NetworkService
  ) { }

  ngOnInit() {}

  addExpenseToQueue(base64ImagesWithSource: Image) {
    let source = base64ImagesWithSource.source;

    return this.networkService.isOnline().subscribe((isConnected) => {
      if (!isConnected) {
        source += '_OFFLINE';
      }
      const transaction = {
        skip_reimbursement: false,
        source,
        txn_dt: new Date(),
        currency: this.homeCurrency
      };

      const attachmentUrls = [
        {
          thumbnail: base64ImagesWithSource.base64Image,
          type: 'image',
          url: base64ImagesWithSource.base64Image
        }
      ];

      this.transactionsOutboxService.addEntry(transaction, attachmentUrls, null, null, this.isInstafyleEnabled);
    });
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

  toggleFlashMode() {
    if (Capacitor.platform !== 'web') {
      let nextActiveFlashMode = 'on';
      if (this.flashMode === 'on') {
        nextActiveFlashMode = 'off';
      }

      CameraPreview.setFlashMode({flashMode: nextActiveFlashMode});
      this.flashMode = nextActiveFlashMode;

      this.trackingService.flashModeSet({
        FlashMode: this.flashMode
      });
    }
  }

  async getFlashModes() {
    if (Capacitor.platform !== 'web') {
      CameraPreview.getSupportedFlashModes().then(flashModes => {
        if (flashModes.result && flashModes.result.includes('on') && flashModes.result.includes('off')) {
          this.flashMode = this.flashMode || 'off';
          CameraPreview.setFlashMode({flashMode: this.flashMode});
        }
      });
    }
  }

  setUpAndStartCamera() {
    if (!this.isCameraShown) {
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        toBack: true,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'cameraPreview',
      };

      CameraPreview.start(cameraPreviewOptions).then(res => {
        this.isCameraShown = true;
        this.getFlashModes();
      });
    }
  }

  switchMode() {
    this.isBulkMode = !this.isBulkMode;
    this.hasModeChanged = true;
    setTimeout(() => {
      this.hasModeChanged = false;
    }, 1000);

    if (this.isBulkMode) {
      this.trackingService.switchedToInstafyleBulkMode({});
    } else {
      this.trackingService.switchedToInstafyleSingleMode({});
    }
  }

  async onSingleCapture() {
    const modal = await this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64ImagesWithSource: this.base64ImagesWithSource,
        mode: 'single'
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      if (data.base64ImagesWithSource.length === 0) {
        this.base64ImagesWithSource = [];
        this.setUpAndStartCamera();
      } else {
        this.addExpenseToQueue(this.base64ImagesWithSource[0]);
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    }
  }

  async review() {
    await this.stopCamera();
    const modal = await this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64ImagesWithSource: this.base64ImagesWithSource,
        mode: 'bulk'
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      if (data.base64ImagesWithSource.length === 0) {
        this.base64ImagesWithSource = [];
        this.captureCount = 0;
        this.lastImage = null;
        this.setUpAndStartCamera();
      } else {
        this.base64ImagesWithSource.forEach((base64ImageWithSource) => {
          this.addExpenseToQueue(base64ImageWithSource);
        });
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    }

  }

  onBulkCapture() {
    this.captureCount += 1;
    this.setUpAndStartCamera();
  }

  async onCapture() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 85,
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    await this.stopCamera();
    const base64PictureData = 'data:image/jpeg;base64,' + result.value;
    this.lastImage = base64PictureData;
    if (!this.isBulkMode) {
      this.base64ImagesWithSource.push({
        source: 'MOBILE_SINGLE',
        base64Image: base64PictureData
      });
      this.onSingleCapture();
    } else {
      this.base64ImagesWithSource.push({
        source: 'MOBILE_BULK',
        base64Image: base64PictureData
      });
      this.onBulkCapture();
    }
  }

  galleryUpload() {
    this.trackingService.instafyleGalleryUploadOpened({});

    this.stopCamera();
    this.imagePicker.hasReadPermission().then((permission) => {
      if (permission) {
        const options = {
          maximumImagesCount: 10,
          outputType: 1,
          quality: 50
        };
        // If android app start crashing then convert outputType to 0 to get file path and then convert it to base64 before upload to s3.
        from(this.imagePicker.getPictures(options)).subscribe(async (imageBase64Strings) => {

          if (imageBase64Strings.length > 0) {
            imageBase64Strings.forEach((base64String, key) => {
              const base64PictureData = 'data:image/jpeg;base64,' + base64String;
              this.base64ImagesWithSource.push({
                source: 'MOBILE_GALLERY',
                base64Image: base64PictureData
              });

            });

            const modal = await this.modalController.create({
              component: ReceiptPreviewComponent,
              componentProps: {
                base64ImagesWithSource: this.base64ImagesWithSource,
                mode: 'bulk'
              },
            });
            await modal.present();

            const { data } = await modal.onWillDismiss();
            if (data) {
              if (data.base64ImagesWithSource.length === 0) {
                this.base64ImagesWithSource = [];
                this.setUpAndStartCamera();
              } else {
                this.base64ImagesWithSource.forEach((base64ImageWithSource) => {
                  this.addExpenseToQueue(base64ImageWithSource);
                });
                this.router.navigate(['/', 'enterprise', 'my_expenses']);
              }
            }
          } else {
            this.setUpAndStartCamera();
          }
        });
      } else {
        this.imagePicker.requestReadPermission();
        this.galleryUpload();
      }
    });
  }



  ionViewWillEnter() {
    this.isCameraShown = false;
    this.isBulkMode = false;
    this.base64ImagesWithSource = [];
    this.setUpAndStartCamera();
    this.flashMode = null;
    this.offlineService.getHomeCurrency().subscribe(res => {
      this.homeCurrency = res;
    });

    this.offlineService.getOrgUserSettings().subscribe(orgUserSettings => {
      this.isInstafyleEnabled = orgUserSettings.insta_fyle_settings.allowed && orgUserSettings.insta_fyle_settings.enabled;
    });
  }
}
