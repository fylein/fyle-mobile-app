import { Component, EventEmitter, OnDestroy, OnInit, Input, AfterViewInit } from '@angular/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { Capacitor } from '@capacitor/core';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';
import { OfflineService } from 'src/app/core/services/offline.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { concat, forkJoin, from, noop, Observable } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { concatMap, finalize, map, reduce, shareReplay, switchMap, take } from 'rxjs/operators';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { LoaderService } from 'src/app/core/services/loader.service';

type Image = Partial<{
  source: string;
  base64Image: string;
}>;

@Component({
  selector: 'app-capture-receipt',
  templateUrl: './capture-receipt.component.html',
  styleUrls: ['./capture-receipt.component.scss'],
})
export class CaptureReceiptComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isModal = false;

  @Input() allowGalleryUploads = true;

  @Input() allowBulkFyle = true;

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
    private loaderService: LoaderService
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

  addMultipleExpensesToQueue(base64ImagesWithSource: Image[]) {
    return from(base64ImagesWithSource).pipe(
      concatMap((res: Image) => this.addExpenseToQueue(res)),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  addExpenseToQueue(base64ImagesWithSource: Image, syncImmediately = false) {
    let source = base64ImagesWithSource.source;

    return forkJoin({
      isConnected: this.networkService.isOnline(),
      orgUserSettings: this.offlineService.getOrgUserSettings(),
      accounts: this.offlineService.getAccounts(),
      orgSettings: this.offlineService.getOrgSettings(),
    }).pipe(
      switchMap(({ isConnected, orgUserSettings, accounts, orgSettings }) => {
        const account = this.getAccount(orgSettings, accounts, orgUserSettings);

        if (!isConnected) {
          source += '_OFFLINE';
        }
        const transaction = {
          source_account_id: account.acc.id,
          skip_reimbursement: !account.acc.isReimbursable || false,
          source,
          txn_dt: new Date(),
          currency: this.homeCurrency,
        };

        const attachmentUrls = [
          {
            thumbnail: base64ImagesWithSource.base64Image,
            type: 'image',
            url: base64ImagesWithSource.base64Image,
          },
        ];
        if (!syncImmediately) {
          return this.transactionsOutboxService.addEntry(
            transaction,
            attachmentUrls,
            null,
            null,
            this.isInstafyleEnabled
          );
        } else {
          return this.transactionsOutboxService.addEntryAndSync(transaction, attachmentUrls, null, null);
        }
      })
    );
  }

  getAccount(orgSettings: any, accounts: any, orgUserSettings: OrgUserSettings) {
    const isAdvanceEnabled =
      (orgSettings.advances && orgSettings.advances.enabled) ||
      (orgSettings.advance_requests && orgSettings.advance_requests.enabled);

    const userAccounts = this.accountsService.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);
    const isMultipleAdvanceEnabled =
      orgSettings && orgSettings.advance_account_settings && orgSettings.advance_account_settings.multiple_accounts;
    const paymentModes = this.accountsService.constructPaymentModes(userAccounts, isMultipleAdvanceEnabled);
    const isCCCEnabled =
      orgSettings.corporate_credit_card_settings.allowed && orgSettings.corporate_credit_card_settings.enabled;

    let account;

    if (orgUserSettings.preferences?.default_payment_mode === 'COMPANY_ACCOUNT') {
      account = paymentModes.find((res) => res.acc.displayName === 'Paid by Company');
    } else if (
      isCCCEnabled &&
      orgUserSettings.preferences?.default_payment_mode === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT'
    ) {
      account = paymentModes.find((res) => res.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
    } else {
      account = paymentModes.find((res) => res.acc.displayName === 'Personal Card/Cash');
    }
    return account;
  }

  async stopCamera() {
    if (this.isCameraShown === true) {
      await CameraPreview.stop();
      this.isCameraShown = false;
    }
  }

  close() {
    this.stopCamera();
    if (this.isModal) {
      this.modalController.dismiss();
    } else {
      this.navController.back();
    }
  }

  toggleFlashMode() {
    if (Capacitor.getPlatform() !== 'web') {
      let nextActiveFlashMode = 'on';
      if (this.flashMode === 'on') {
        nextActiveFlashMode = 'off';
      }

      CameraPreview.setFlashMode({ flashMode: nextActiveFlashMode });
      this.flashMode = nextActiveFlashMode;

      this.trackingService.flashModeSet({
        FlashMode: this.flashMode,
      });
    }
  }

  async getFlashModes() {
    if (Capacitor.getPlatform() !== 'web') {
      CameraPreview.getSupportedFlashModes().then((flashModes) => {
        if (flashModes.result && flashModes.result.includes('on') && flashModes.result.includes('off')) {
          this.flashMode = this.flashMode || 'off';
          CameraPreview.setFlashMode({ flashMode: this.flashMode });
        }
      });
    }
  }

  async setUpAndStartCamera() {
    if (!this.isCameraShown) {
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        toBack: true,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'cameraPreview',
      };

      await this.loaderService.showLoader('Please wait...', 5000);
      CameraPreview.start(cameraPreviewOptions).then(async (res) => {
        this.isCameraShown = true;
        this.getFlashModes();
        await this.loaderService.hideLoader();
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
        mode: 'single',
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
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
          this.loaderService.showLoader();
          if (this.isModal) {
            await modal.onDidDismiss();
            setTimeout(() => {
              this.modalController.dismiss({
                dataUrl: this.base64ImagesWithSource[0].base64Image,
              });
            }, 0);
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
          this.loaderService.hideLoader();
        }
      }
    }
  }

  async review() {
    this.stopCamera();
    const modal = await this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64ImagesWithSource: this.base64ImagesWithSource,
        mode: 'bulk',
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
        if (data.continueCaptureReceipt) {
          this.base64ImagesWithSource = data.base64ImagesWithSource;
          this.captureCount = data.base64ImagesWithSource.length;
          this.isBulkMode = true;
          this.setUpAndStartCamera();
        } else {
          this.loaderService.showLoader('Please wait...', 10000);
          this.addMultipleExpensesToQueue(this.base64ImagesWithSource)
            .pipe(finalize(() => this.loaderService.hideLoader()))
            .subscribe(() => {
              this.router.navigate(['/', 'enterprise', 'my_expenses']);
            });
        }
      }
    }
  }

  onBulkCapture() {
    this.captureCount += 1;
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
      const base64PictureData = 'data:image/jpeg;base64,' + result.value;
      this.lastImage = base64PictureData;
      if (!this.isBulkMode) {
        this.stopCamera();
        this.base64ImagesWithSource.push({
          source: 'MOBILE_DASHCAM_SINGLE',
          base64Image: base64PictureData,
        });
        this.onSingleCapture();
      } else {
        this.base64ImagesWithSource.push({
          source: 'MOBILE_DASHCAM_BULK',
          base64Image: base64PictureData,
        });
        this.onBulkCapture();
      }
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
          quality: 70,
        };
        // If android app start crashing then convert outputType to 0 to get file path and then convert it to base64 before upload to s3.
        from(this.imagePicker.getPictures(options)).subscribe(async (imageBase64Strings) => {
          if (imageBase64Strings.length > 0) {
            imageBase64Strings.forEach((base64String, key) => {
              const base64PictureData = 'data:image/jpeg;base64,' + base64String;
              this.base64ImagesWithSource.push({
                source: 'MOBILE_DASHCAM_GALLERY',
                base64Image: base64PictureData,
              });
            });

            const modal = await this.modalController.create({
              component: ReceiptPreviewComponent,
              componentProps: {
                base64ImagesWithSource: this.base64ImagesWithSource,
                mode: 'bulk',
              },
            });
            await modal.present();

            const { data } = await modal.onWillDismiss();
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
        });
      } else {
        this.imagePicker.requestReadPermission();
        this.galleryUpload();
      }
    });
  }

  ngAfterViewInit() {
    this.setUpAndStartCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
