import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { Capacitor, Plugins } from '@capacitor/core';
import '@capacitor-community/camera-preview';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';
import { OfflineService } from 'src/app/core/services/offline.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { concat, forkJoin, from, noop, Observable } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { concatMap, finalize, map, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { TransactionService } from 'src/app/core/services/transaction.service';

const { CameraPreview } = Plugins;

type Image = Partial<{
  source: string;
  base64Image: string;
}>;

type receiptTransaction = {
  transaction: { id: string };
  dataUrls: { url: string }[];
};
@Component({
  selector: 'app-capture-receipt',
  templateUrl: './capture-receipt.page.html',
  styleUrls: ['./capture-receipt.page.scss'],
})
export class CaptureReceiptPage implements OnInit, OnDestroy {
  isCameraShown: boolean;

  isBulkMode: boolean;

  hasModeChanged = false;

  captureCount = 0;

  base64ImagesWithSource: Image[];

  lastImage: string;

  flashMode: string;

  homeCurrency: string;

  isInstafyleEnabled: boolean;

  isOffline$: Observable<boolean>;

  constructor(
    private modalController: ModalController,
    private trackingService: TrackingService,
    private router: Router,
    private navController: NavController,
    private offlineService: OfflineService,
    private transactionsOutboxService: TransactionsOutboxService,
    private imagePicker: ImagePicker,
    private networkService: NetworkService,
    private accountsService: AccountsService,
    private popoverController: PopoverController,
    private transactionService: TransactionService
  ) {}

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isOffline$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      map((connected) => !connected),
      shareReplay(1)
    );
  }

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  addMultipleExpensesToQueue(base64ImagesWithSource: Image[]) {
    return from(base64ImagesWithSource).pipe(
      concatMap((res: Image) => this.addExpenseToQueue(res)),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  getAttachmentUrlsFromImageSource(base64ImagesWithSource: Image) {
    return [
      {
        thumbnail: base64ImagesWithSource.base64Image,
        type: 'image',
        url: base64ImagesWithSource.base64Image,
      },
    ];
  }

  addExpenseToQueue(base64ImagesWithSource: Image) {
    let source = base64ImagesWithSource.source;

    return forkJoin({
      isConnected: this.networkService.isOnline(),
      orgUserSettings: this.offlineService.getOrgUserSettings(),
      accounts: this.offlineService.getAccounts(),
      orgSettings: this.offlineService.getOrgSettings(),
    }).pipe(
      switchMap(({ isConnected, orgUserSettings, accounts, orgSettings }) => {
        const account = this.accountsService.getAccount(orgSettings, accounts, orgUserSettings);
        source = this.transactionService.addMobileSourceConnectionStatus(source, isConnected);
        const transaction = this.transactionService.getCameraBaseTransaction(account, source, this.homeCurrency);
        const attachmentUrls = this.getAttachmentUrlsFromImageSource(base64ImagesWithSource);

        return this.transactionsOutboxService.addEntry(
          transaction,
          attachmentUrls,
          null,
          null,
          this.isInstafyleEnabled
        );
      })
    );
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

  getNextActiveFlashMode(flashMode: string) {
    let nextActiveFlashMode = 'on';
    if (flashMode === 'on') {
      nextActiveFlashMode = 'off';
    }

    return nextActiveFlashMode;
  }

  setFlashMode(flashMode = 'off') {
    CameraPreview.setFlashMode({ flashMode });
    this.flashMode = flashMode;
  }

  toggleFlashMode() {
    if (Capacitor.platform !== 'web') {
      this.setFlashMode(this.getNextActiveFlashMode(this.flashMode));
      this.trackingService.flashModeSet({
        FlashMode: this.flashMode,
      });
    }
  }

  async getFlashModes() {
    if (Capacitor.platform !== 'web') {
      CameraPreview.getSupportedFlashModes().then((flashModes) => {
        if (flashModes.result && flashModes.result.includes('on') && flashModes.result.includes('off')) {
          this.setFlashMode();
        }
      });
    }
  }

  getCameraPreivewOptions(window) {
    return {
      position: 'rear',
      toBack: true,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'cameraPreview',
    };
  }

  setUpAndStartCamera() {
    if (!this.isCameraShown) {
      CameraPreview.start(this.getCameraPreivewOptions(window)).then((res) => {
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
    const { data } = await this.showReceiptPreviewModal(this.base64ImagesWithSource, 'single');
    if (data) {
      if (data.base64ImagesWithSource.length === 0) {
        this.base64ImagesWithSource = [];
        this.setUpAndStartCamera();
      } else {
        if (data.continueCaptureReceipt) {
          this.captureCount = 0;
          this.lastImage = null;
          this.isBulkMode = false;
          this.setUpAndStartCamera();
        } else {
          this.router.navigate([
            '/',
            'enterprise',
            'add_edit_expense',
            {
              dataUrl: this.base64ImagesWithSource[0].base64Image,
              canExtractData: this.isInstafyleEnabled,
            },
          ]);
        }
      }
    }
  }

  async review() {
    await this.stopCamera();

    const { data } = await this.showReceiptPreviewModal(this.base64ImagesWithSource, 'bulk');

    if (data) {
      if (data.base64ImagesWithSource.length === 0) {
        this.base64ImagesWithSource = [];
        this.captureCount = 0;
        this.lastImage = null;
        this.setUpAndStartCamera();
      } else {
        if (data.continueCaptureReceipt) {
          this.base64ImagesWithSource = data.base64ImagesWithSource;
          this.captureCount = data.base64ImagesWithSource.length;
          this.isBulkMode = true;
          this.setUpAndStartCamera();
        } else {
          this.addMultipleExpensesToQueue(this.base64ImagesWithSource).subscribe(() => {
            this.router.navigate(['/', 'enterprise', 'my_expenses']);
          });
        }
      }
    }
  }

  onBulkCapture() {
    this.captureCount += 1;
    this.setUpAndStartCamera();
  }

  async showLimitMessage() {
    const limitPopover = await this.popoverController.create({
      component: PopupAlertComponentComponent,
      componentProps: {
        title: 'Limit Reached',
        message:
          'You’ve added the maximum limit of 20 receipts. Please review and save these as expenses before adding more.',
        primaryCta: {
          text: 'Ok',
        },
      },
      cssClass: 'pop-up-in-center',
    });

    await limitPopover.present();
  }

  async onCapture() {
    if (this.captureCount >= 20) {
      await this.showLimitMessage();
    } else {
      const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
        quality: 70,
      };

      const result = await CameraPreview.capture(cameraPreviewPictureOptions);
      await this.stopCamera();
      const base64PictureData = this.getImageItem(
        result.value,
        !this.isBulkMode ? 'MOBILE_DASHCAM_SINGLE' : 'MOBILE_DASHCAM_BULK'
      );
      this.lastImage = base64PictureData.base64Image;
      this.base64ImagesWithSource.push(base64PictureData);
      if (!this.isBulkMode) {
        this.onSingleCapture();
      } else {
        this.onBulkCapture();
      }
    }
  }

  getGalleryDefaultOptions() {
    return {
      maximumImagesCount: 10,
      outputType: 1,
      quality: 70,
    };
  }

  convertB64DataToImageString(base64String) {
    return 'data:image/jpeg;base64,' + base64String;
  }

  getImageItem(base64String, source: 'MOBILE_DASHCAM_GALLERY' | 'MOBILE_DASHCAM_SINGLE' | 'MOBILE_DASHCAM_BULK') {
    const base64PictureData = this.convertB64DataToImageString(base64String);

    return {
      source,
      base64Image: base64PictureData,
    };
  }

  async showReceiptPreviewModal(base64ImagesWithSource, mode: 'bulk' | 'single') {
    const modal = await this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64ImagesWithSource,
        mode,
      },
    });
    await modal.present();

    return await modal.onWillDismiss();
  }

  async processSelectedImagesFromGalleryUpload(imageBase64Strings) {
    if (imageBase64Strings.length > 0) {
      this.base64ImagesWithSource = this.base64ImagesWithSource.concat(
        imageBase64Strings.map((b64String) => this.getImageItem(b64String, 'MOBILE_DASHCAM_GALLERY'))
      );

      const { data } = await this.showReceiptPreviewModal(this.base64ImagesWithSource, 'bulk');

      if (data) {
        if (data.base64ImagesWithSource.length === 0) {
          this.base64ImagesWithSource = [];
          this.setUpAndStartCamera();
        } else {
          this.addMultipleExpensesToQueue(this.base64ImagesWithSource)
            .pipe(finalize(() => this.router.navigate(['/', 'enterprise', 'my_expenses'])))
            .subscribe(noop);
        }
      }
    } else {
      this.setUpAndStartCamera();
    }
  }

  galleryUpload() {
    this.trackingService.instafyleGalleryUploadOpened({});

    this.stopCamera();
    this.imagePicker.hasReadPermission().then((permission) => {
      if (permission) {
        const options = this.getGalleryDefaultOptions();
        // If android app start crashing then convert outputType to 0 to get file path and then convert it to base64 before upload to s3.
        from(this.imagePicker.getPictures(options)).subscribe(async (imageBase64Strings) => {
          await this.processSelectedImagesFromGalleryUpload(imageBase64Strings);
        });
      } else {
        this.imagePicker.requestReadPermission();
        this.galleryUpload();
      }
    });
  }

  ionViewDidEnter() {
    this.setUpAndStartCamera();
  }

  ionViewWillEnter() {
    this.isCameraShown = false;
    this.isBulkMode = false;
    this.base64ImagesWithSource = [];
    this.flashMode = null;
    this.offlineService.getHomeCurrency().subscribe((res) => {
      this.homeCurrency = res;
    });
    this.captureCount = 0;

    this.offlineService.getOrgUserSettings().subscribe((orgUserSettings) => {
      this.isInstafyleEnabled =
        orgUserSettings.insta_fyle_settings.allowed && orgUserSettings.insta_fyle_settings.enabled;
    });
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
