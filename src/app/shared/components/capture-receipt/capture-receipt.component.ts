import { Component, EventEmitter, OnDestroy, OnInit, Input, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { concat, forkJoin, from, noop, Observable } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { concatMap, filter, finalize, map, reduce, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PerfTrackers } from 'src/app/core/models/perf-trackers.enum';
import { OrgService } from 'src/app/core/services/org.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { CameraPreviewComponent } from './camera-preview/camera-preview.component';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { DEVICE_PLATFORM } from 'src/app/constants';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CameraService } from 'src/app/core/services/camera.service';
import { CameraPreviewService } from 'src/app/core/services/camera-preview.service';
import { StorageService } from 'src/app/core/services/storage.service';

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

  isOffline$: Observable<boolean>;

  isBulkModePromptShown = false;

  bulkModeToastMessageRef: MatSnackBarRef<ToastMessageComponent>;

  nativeSettings = NativeSettings;

  constructor(
    private modalController: ModalController,
    private trackingService: TrackingService,
    private router: Router,
    private navController: NavController,
    private transactionsOutboxService: TransactionsOutboxService,
    private imagePicker: ImagePicker,
    private networkService: NetworkService,
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private orgService: OrgService,
    private orgUserSettingsService: OrgUserSettingsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private authService: AuthService,
    private cameraService: CameraService,
    private cameraPreviewService: CameraPreviewService,
    private storageService: StorageService,
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
  }

  addMultipleExpensesToQueue(base64ImagesWithSource: Image[]) {
    return from(base64ImagesWithSource).pipe(
      concatMap((res: Image) => this.addExpenseToQueue(res)),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  addExpenseToQueue(base64ImagesWithSource: Image) {
    let source = base64ImagesWithSource.source;

    return forkJoin({
      isOffline: this.isOffline$.pipe(take(1)),
      eou: this.authService.getEou(),
    }).pipe(
      switchMap(({ eou, isOffline }) => {
        if (isOffline) {
          source += '_OFFLINE';
        }
        const transaction = {
          source,
          txn_dt: new Date(),
          currency: eou?.org?.currency,
        };

        const attachmentUrls = [
          {
            thumbnail: base64ImagesWithSource.base64Image,
            type: 'image',
            url: base64ImagesWithSource.base64Image,
          },
        ];
        return this.transactionsOutboxService.addEntry(transaction, attachmentUrls, null, null, true);
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

  showBulkModeToastMessage() {
    const message =
      'If you have multiple receipts to upload, please use <b>BULK MODE</b> to upload all the receipts at once.';
    this.bulkModeToastMessageRef = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('information', { message }),
      panelClass: ['msb-bulkfyle-prompt'],
      duration: 10000,
    });
    this.bulkModeToastMessageRef.afterDismissed().subscribe(() => (this.isBulkModePromptShown = false));
    this.trackingService.showToastMessage({ ToastContent: message });
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
    const isInstafyleEnabled$ = this.orgUserSettingsService
      .get()
      .pipe(
        map(
          (orgUserSettings) =>
            orgUserSettings.insta_fyle_settings.allowed && orgUserSettings.insta_fyle_settings.enabled
        )
      );

    isInstafyleEnabled$.subscribe((isInstafyleEnabled) => {
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
    this.isOffline$.pipe(take(1)).subscribe((isOffline) => {
      if (isOffline) {
        this.onSingleCaptureOffline();
      } else {
        this.navigateToExpenseForm();
      }
    });
    this.transactionsOutboxService.incrementSingleCaptureCount();
  }

  onSingleCapture() {
    const receiptPreviewModal = this.createReceiptPreviewModal('single');

    const receiptPreviewDetails$ = from(receiptPreviewModal).pipe(
      shareReplay(1),
      tap((receiptPreviewModal) => receiptPreviewModal.present()),
      switchMap((receiptPreviewModal) => receiptPreviewModal.onWillDismiss()),
      map((receiptPreviewData) => receiptPreviewData?.data),
      filter((receiptPreviewDetails) => !!receiptPreviewDetails)
    );

    receiptPreviewDetails$
      .pipe(filter((receiptPreviewDetails) => !receiptPreviewDetails.base64ImagesWithSource.length))
      .subscribe(() => {
        this.base64ImagesWithSource = [];
        this.setUpAndStartCamera();
      });

    const saveReceipt$ = receiptPreviewDetails$.pipe(
      filter((receiptPreviewDetails) => !!receiptPreviewDetails.base64ImagesWithSource.length),
      switchMap(() => this.isOffline$.pipe(take(1))),
      map((isOffline) => {
        if (!isOffline) {
          this.addPerformanceTrackers();
        }
        this.loaderService.showLoader();
        return this.isModal;
      }),
      shareReplay(1)
    );

    saveReceipt$
      .pipe(
        filter((isModal) => !!isModal),
        switchMap(() => from(receiptPreviewModal)),
        switchMap((receiptPreviewModal) => receiptPreviewModal.onDidDismiss())
      )
      .subscribe(() => {
        setTimeout(() => {
          this.modalController.dismiss({
            dataUrl: this.base64ImagesWithSource[0]?.base64Image,
          });
        }, 0);
      });

    saveReceipt$.pipe(filter((isModal) => !isModal)).subscribe(() => this.saveSingleCapture());
  }

  addPerformanceTrackers() {
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
  }

  openReceiptPreviewModal() {
    const receiptPreviewDetails$ = this.showReceiptPreview().pipe(filter((data) => !!data));

    receiptPreviewDetails$
      .pipe(
        filter(
          (receiptPreviewDetails) =>
            receiptPreviewDetails.continueCaptureReceipt || receiptPreviewDetails.base64ImagesWithSource.length === 0
        )
      )
      .subscribe((receiptPreviewDetails) => {
        this.isBulkMode = true;
        this.base64ImagesWithSource = receiptPreviewDetails.base64ImagesWithSource;
        this.noOfReceipts = receiptPreviewDetails.base64ImagesWithSource.length;
        this.lastCapturedReceipt = this.noOfReceipts
          ? this.base64ImagesWithSource[this.noOfReceipts - 1]?.base64Image
          : null;
        this.setUpAndStartCamera();
      });

    receiptPreviewDetails$
      .pipe(
        filter(
          (receiptPreviewDetails) =>
            !receiptPreviewDetails.continueCaptureReceipt && receiptPreviewDetails.base64ImagesWithSource.length
        ),
        switchMap(() => {
          this.loaderService.showLoader('Please wait...', 10000);
          return this.addMultipleExpensesToQueue(this.base64ImagesWithSource);
        }),
        finalize(() => this.loaderService.hideLoader())
      )
      .subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      });
  }

  createReceiptPreviewModal(mode: 'single' | 'bulk') {
    return this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64ImagesWithSource: this.base64ImagesWithSource,
        mode,
      },
    });
  }

  showReceiptPreview() {
    return from(this.createReceiptPreviewModal('bulk')).pipe(
      tap((receiptPreviewModal) => receiptPreviewModal.present()),
      switchMap((receiptPreviewModal) => receiptPreviewModal.onWillDismiss()),
      map((receiptPreviewDetails) => receiptPreviewDetails?.data)
    );
  }

  onBulkCapture() {
    this.noOfReceipts += 1;
  }

  showLimitReachedPopover() {
    const limitReachedPopover = this.popoverController.create({
      component: PopupAlertComponent,
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

    return from(limitReachedPopover).pipe(tap((limitReachedPopover) => limitReachedPopover.present()));
  }

  onCaptureReceipt() {
    if (this.noOfReceipts >= 20) {
      this.storageService.get('receiptLimitReachedCount').then((count) => {
        let receiptLimitReachedCount = count || 0;
        receiptLimitReachedCount++;

        this.storageService.set('receiptLimitReachedCount', receiptLimitReachedCount);

        const receiptLimitReachedLastTimestamp = new Date();
        this.storageService.set('receiptLimitReachedLastTimestamp', receiptLimitReachedLastTimestamp.toISOString());

        // Track the event with the count and timestamp as properties
        const properties = {
          Action: 'ReceiptLimitReached',
          Description: 'The limit of 20 receipts has been reached',
          Count: receiptLimitReachedCount,
          LastTimestamp: receiptLimitReachedLastTimestamp.toISOString(),
        };
        this.trackingService.receiptLimitReached(properties);
      });

      this.showLimitReachedPopover().subscribe(noop);
    } else {
      const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
        quality: 70,
      };

      from(this.cameraPreviewService.capture(cameraPreviewPictureOptions)).subscribe((receiptData) => {
        const base64PictureData = 'data:image/jpeg;base64,' + receiptData.value;
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
      });
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
      component: PopupAlertComponent,
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
          this.nativeSettings.open({
            optionAndroid: AndroidSettings.ApplicationDetails,
            optionIOS: IOSSettings.App,
          });
        }
        this.onDismissCameraPreview();
      });
  }

  onGalleryUpload() {
    this.trackingService.instafyleGalleryUploadOpened({});

    const checkPermission$ = from(this.imagePicker.hasReadPermission()).pipe(shareReplay(1));

    const receiptsFromGallery$ = checkPermission$.pipe(
      filter((permission) => !!permission),
      switchMap(() => {
        const galleryUploadOptions = {
          maximumImagesCount: 10,
          outputType: 1,
          quality: 70,
        };
        return from(this.imagePicker.getPictures(galleryUploadOptions));
      }),
      shareReplay(1)
    );

    checkPermission$
      .pipe(
        filter((permission) => !permission),
        switchMap(() => from(this.cameraService.requestCameraPermissions(['photos'])))
      )
      .subscribe((permissions) => {
        if (permissions?.photos === 'denied') {
          return this.showPermissionDeniedPopover('GALLERY');
        }
        this.onGalleryUpload();
      });

    receiptsFromGallery$
      .pipe(filter((receiptsFromGallery) => receiptsFromGallery.length > 0))
      .subscribe((receiptsFromGallery) => {
        receiptsFromGallery.forEach((receiptBase64) => {
          const receiptBase64Data = 'data:image/jpeg;base64,' + receiptBase64;
          this.base64ImagesWithSource.push({
            source: 'MOBILE_DASHCAM_GALLERY',
            base64Image: receiptBase64Data,
          });
        });
        this.openReceiptPreviewModal();
      });

    receiptsFromGallery$
      .pipe(filter((receiptsFromGallery) => !receiptsFromGallery.length))
      .subscribe(() => this.setUpAndStartCamera());
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
    this.bulkModeToastMessageRef?.dismiss?.();
  }

  setUpAndStartCamera() {
    this.cameraPreview.setUpAndStartCamera();
    if (this.transactionsOutboxService.singleCaptureCount === 3) {
      this.showBulkModeToastMessage();
      this.isBulkModePromptShown = true;
    }
  }

  stopCamera() {
    this.cameraPreview.stopCamera();
  }
}
