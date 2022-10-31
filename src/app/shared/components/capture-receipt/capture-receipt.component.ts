import { Component, EventEmitter, OnDestroy, OnInit, Input, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { CameraPreview, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { concat, forkJoin, from, noop, Observable } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { concatMap, finalize, map, reduce, shareReplay, switchMap, tap } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OrgService } from 'src/app/core/services/org.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CameraPreviewComponent } from './camera-preview/camera-preview.component';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { DEVICE_PLATFORM } from 'src/app/constants';

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
  @ViewChild('cameraPreview') cameraPreview: CameraPreviewComponent;

  @Input() isModal = false;

  @Input() allowGalleryUploads = true;

  @Input() allowBulkFyle = true;

  isBulkMode: boolean;

  noOfReceipts = 0;

  base64ImagesWithSource: Image[];

  lastCapturedReceipt: string;

  isInstafyleEnabled$: Observable<boolean>;

  isOffline$: Observable<boolean>;

  constructor(
    private modalController: ModalController,
    private trackingService: TrackingService,
    private router: Router,
    private navController: NavController,
    private transactionsOutboxService: TransactionsOutboxService,
    private imagePicker: ImagePicker,
    private networkService: NetworkService,
    private currencyService: CurrencyService,
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private orgService: OrgService,
    private orgUserSettingsService: OrgUserSettingsService,
    @Inject(DEVICE_PLATFORM) private devicePlatform: 'android' | 'ios' | 'web'
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
    this.isBulkMode = false;
    this.base64ImagesWithSource = [];
    this.noOfReceipts = 0;
    this.isInstafyleEnabled$ = this.orgUserSettingsService
      .get()
      .pipe(
        map(
          (orgUserSettings) =>
            orgUserSettings.insta_fyle_settings.allowed && orgUserSettings.insta_fyle_settings.enabled
        )
      );
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
      isOffline: this.isOffline$,
      homeCurrency: this.currencyService.getHomeCurrency(),
      isInstafyleEnabled: this.isInstafyleEnabled$,
    }).pipe(
      switchMap(({ homeCurrency, isOffline, isInstafyleEnabled }) => {
        if (isOffline) {
          source += '_OFFLINE';
        }
        const transaction = {
          source,
          txn_dt: new Date(),
          currency: homeCurrency,
        };

        const attachmentUrls = [
          {
            thumbnail: base64ImagesWithSource.base64Image,
            type: 'image',
            url: base64ImagesWithSource.base64Image,
          },
        ];
        if (!syncImmediately) {
          return this.transactionsOutboxService.addEntry(transaction, attachmentUrls, null, null, isInstafyleEnabled);
        } else {
          return this.transactionsOutboxService.addEntryAndSync(transaction, attachmentUrls, null, null);
        }
      })
    );
  }

  onDismissCameraPreview() {
    if (this.isModal) {
      this.modalController.dismiss();
    } else {
      this.navController.back();
    }
  }

  onToggleFlashMode(flashMode: 'on' | 'off') {
    this.trackingService.flashModeSet({
      FlashMode: flashMode,
    });
  }

  onSwitchMode() {
    this.isBulkMode = !this.isBulkMode;

    if (this.isBulkMode) {
      this.trackingService.switchedToInstafyleBulkMode({});
    } else {
      this.trackingService.switchedToInstafyleSingleMode({});
    }
  }

  onSingleCaptureOffline() {
    this.loaderService.showLoader();
    this.addMultipleExpensesToQueue(this.base64ImagesWithSource)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      });
  }

  navigateToExpenseForm() {
    this.isInstafyleEnabled$.subscribe((isInstafyleEnabled) => {
      this.router.navigate([
        '/',
        'enterprise',
        'add_edit_expense',
        {
          dataUrl: this.base64ImagesWithSource[0]?.base64Image,
          canExtractData: isInstafyleEnabled,
        },
      ]);
    });
  }

  saveSingleCapture() {
    this.isOffline$.subscribe((isOffline) => {
      if (isOffline) {
        this.onSingleCaptureOffline();
      } else {
        this.navigateToExpenseForm();
      }
    });
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
          this.noOfReceipts = 0;
          this.lastCapturedReceipt = null;
          this.isBulkMode = false;
          this.setUpAndStartCamera();
        } else {
          this.orgService.getOrgs().subscribe((orgs) => {
            const isMultiOrg = orgs.length > 1;

            if (
              performance.getEntriesByName(PerfTrackers.captureSingleReceiptTime).length < 1 &&
              performance.getEntriesByName(PerfTrackers.appLaunchTime).length < 2
            ) {
              // Time taken for capturing single receipt for the first time
              performance.mark(PerfTrackers.captureSingleReceiptTime);

              // Measure total time taken from launching the app to capturing first single receipt
              performance.measure(PerfTrackers.captureSingleReceiptTime, PerfTrackers.appLaunchStartTime);

              const measureLaunchTime = performance.getEntriesByName(PerfTrackers.appLaunchTime);

              // eslint-disable-next-line @typescript-eslint/dot-notation
              const isLoggedIn = performance.getEntriesByName(PerfTrackers.appLaunchStartTime)[0]['detail'];

              // Converting the duration to seconds and fix it to 3 decimal places
              const launchTimeDuration = (measureLaunchTime[0]?.duration / 1000)?.toFixed(3);

              this.trackingService.captureSingleReceiptTime({
                'Capture receipt time': launchTimeDuration,
                'Is logged in': isLoggedIn,
                'Is multi org': isMultiOrg,
              });
            }
          });
          this.loaderService.showLoader();
          if (this.isModal) {
            await modal.onDidDismiss();
            setTimeout(() => {
              this.modalController.dismiss({
                dataUrl: this.base64ImagesWithSource[0]?.base64Image,
              });
            }, 0);
          } else {
            this.saveSingleCapture();
          }
          this.loaderService.hideLoader();
        }
      }
    }
  }

  async openReceiptPreviewModal() {
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
        this.noOfReceipts = 0;
        this.lastCapturedReceipt = null;
        this.setUpAndStartCamera();
      } else {
        if (data.continueCaptureReceipt) {
          this.base64ImagesWithSource = data.base64ImagesWithSource;
          this.noOfReceipts = data.base64ImagesWithSource.length;
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
    this.noOfReceipts += 1;
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

  async onCaptureReceipt() {
    if (this.noOfReceipts >= 20) {
      await this.showLimitMessage();
    } else {
      const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
        quality: 70,
      };

      const result = await CameraPreview.capture(cameraPreviewPictureOptions);
      const base64PictureData = 'data:image/jpeg;base64,' + result.value;
      this.lastCapturedReceipt = base64PictureData;
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

  setupPermissionDeniedPopover(permissionType: 'CAMERA' | 'GALLERY') {
    const isIos = this.devicePlatform === 'ios';

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

  onGalleryUpload() {
    this.trackingService.instafyleGalleryUploadOpened({});

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
        from(Camera.requestPermissions({ permissions: ['photos'] })).subscribe((permissions) => {
          if (permissions?.photos === 'denied') {
            return this.showPermissionDeniedPopover('GALLERY');
          }
          this.onGalleryUpload();
        });
      }
    });
  }

  ngAfterViewInit() {
    if (this.isModal) {
      this.setUpAndStartCamera();
    }
  }

  ngOnDestroy() {
    if (this.isModal) {
      this.stopCamera();
    }
  }

  setUpAndStartCamera() {
    this.cameraPreview.setUpAndStartCamera();
  }

  stopCamera() {
    this.cameraPreview.stopCamera();
  }
}
