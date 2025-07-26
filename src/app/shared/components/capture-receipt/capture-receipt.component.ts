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
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { CameraPreviewComponent } from './camera-preview/camera-preview.component';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { DEVICE_PLATFORM } from 'src/app/constants';
import {
  MatSnackBar,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CameraService } from 'src/app/core/services/camera.service';
import { CameraPreviewService } from 'src/app/core/services/camera-preview.service';
import { ReceiptPreviewData } from 'src/app/core/models/receipt-preview-data.model';
import { TranslocoService } from '@jsverse/transloco';
import { CustomGalleryPickerComponent } from '../custom-gallery-picker/custom-gallery-picker.component';

// eslint-disable-next-line custom-rules/prefer-semantic-extension-name
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

  isSaveReceiptForLater = false;

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
    private platformEmployeeSettingsService: PlatformEmployeeSettingsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private authService: AuthService,
    private cameraService: CameraService,
    private cameraPreviewService: CameraPreviewService,
    @Inject(DEVICE_PLATFORM) private devicePlatform: 'android' | 'ios' | 'web',
    private translocoService: TranslocoService
  ) {}

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isOffline$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      map((connected) => !connected),
      shareReplay(1)
    );
  }

  ngOnInit(): void {
    this.setupNetworkWatcher();
    this.isBulkMode = false;
    this.base64ImagesWithSource = [];
    this.noOfReceipts = 0;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  addMultipleExpensesToQueue(base64ImagesWithSource: Image[]) {
    return from(base64ImagesWithSource).pipe(
      concatMap((res: Image) => this.addExpenseToQueue(res)),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  addExpenseToQueue(base64ImagesWithSource: Image): Observable<void> {
    let source = base64ImagesWithSource.source;

    return forkJoin({
      isOffline: this.isOffline$.pipe(take(1)),
    }).pipe(
      switchMap(({ isOffline }) => {
        if (isOffline) {
          source += '_OFFLINE';
        }
        const transaction = {
          source,
        };

        const attachmentUrls = [
          {
            thumbnail: base64ImagesWithSource.base64Image,
            type: 'image',
            url: base64ImagesWithSource.base64Image,
          },
        ];
        return this.transactionsOutboxService.addEntry(transaction, attachmentUrls, null);
      })
    );
  }

  onDismissCameraPreview(): void {
    if (this.isModal) {
      this.modalController.dismiss();
    } else {
      this.navController.back();
    }
  }

  onToggleFlashMode(flashMode: 'on' | 'off'): void {
    this.trackingService.flashModeSet({
      FlashMode: flashMode,
    });
  }

  showBulkModeToastMessage(): void {
    const message = this.translocoService.translate('captureReceipt.bulkModeInfo');
    this.bulkModeToastMessageRef = this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties('information', { message }),
      panelClass: ['msb-bulkfyle-prompt'],
      duration: 10000,
    });
    this.bulkModeToastMessageRef.afterDismissed().subscribe(() => (this.isBulkModePromptShown = false));
    this.trackingService.showToastMessage({ ToastContent: message });
  }

  onSwitchMode(): void {
    this.isBulkMode = !this.isBulkMode;

    if (this.isBulkMode) {
      this.trackingService.switchedToInstafyleBulkMode({});
    } else {
      this.trackingService.switchedToInstafyleSingleMode({});
    }
  }

  onSingleCaptureOffline(): void {
    this.loaderService.showLoader();
    this.addMultipleExpensesToQueue(this.base64ImagesWithSource)
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      });
  }

  navigateToExpenseForm(): void {
    const isInstafyleEnabled$ = this.platformEmployeeSettingsService
      .get()
      .pipe(
        map(
          (employeeSettings) =>
            employeeSettings.insta_fyle_settings.allowed && employeeSettings.insta_fyle_settings.enabled
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

  saveSingleCapture(isSaveReceiptForLater: boolean): void {
    this.isOffline$.pipe(take(1)).subscribe((isOffline) => {
      if (isOffline || isSaveReceiptForLater) {
        this.onSingleCaptureOffline();
      } else {
        this.navigateToExpenseForm();
      }
    });
    this.transactionsOutboxService.incrementSingleCaptureCount();
  }

  onSingleCapture(): void {
    const receiptPreviewModal = this.createReceiptPreviewModal('single');

    const receiptPreviewDetails$ = from(receiptPreviewModal).pipe(
      shareReplay(1),
      tap((receiptPreviewModal) => receiptPreviewModal.present()),
      switchMap((receiptPreviewModal) => receiptPreviewModal.onWillDismiss<ReceiptPreviewData>()),
      map((receiptPreviewData) => {
        this.isSaveReceiptForLater = receiptPreviewData?.data?.isSaveReceiptForLater;
        return receiptPreviewData?.data;
      }),
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

    saveReceipt$
      .pipe(filter((isModal) => !isModal))
      .subscribe(() => this.saveSingleCapture(this.isSaveReceiptForLater));
  }

  addPerformanceTrackers(): void {
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
        const isLoggedIn = performance.getEntriesByName(PerfTrackers.appLaunchStartTime)[0]['detail'] as boolean;

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

  openReceiptPreviewModal(): void {
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
            !receiptPreviewDetails.continueCaptureReceipt && !!receiptPreviewDetails.base64ImagesWithSource.length
        ),
        switchMap(() => {
          this.loaderService.showLoader(this.translocoService.translate('captureReceipt.pleaseWait'), 10000);
          return this.addMultipleExpensesToQueue(this.base64ImagesWithSource);
        }),
        finalize(() => this.loaderService.hideLoader())
      )
      .subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      });
  }

  createReceiptPreviewModal(mode: 'single' | 'bulk'): Promise<HTMLIonModalElement> {
    return this.modalController.create({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64ImagesWithSource: this.base64ImagesWithSource,
        mode,
      },
    });
  }

  showReceiptPreview(): Observable<ReceiptPreviewData> {
    return from(this.createReceiptPreviewModal('bulk')).pipe(
      tap((receiptPreviewModal) => receiptPreviewModal.present()),
      switchMap((receiptPreviewModal) => receiptPreviewModal.onWillDismiss<ReceiptPreviewData>()),
      map((receiptPreviewDetails) => receiptPreviewDetails?.data)
    );
  }

  onBulkCapture(): void {
    this.noOfReceipts += 1;
  }

  showLimitReachedPopover(): Observable<HTMLIonPopoverElement> {
    const title = this.translocoService.translate('captureReceipt.limitReachedTitle');
    const message = this.translocoService.translate('captureReceipt.limitReachedMessage');
    const primaryCta = {
      text: this.translocoService.translate('captureReceipt.ok'),
    };

    const limitReachedPopover = this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta,
      },
      cssClass: 'pop-up-in-center',
    });

    return from(limitReachedPopover).pipe(tap((limitReachedPopover) => limitReachedPopover.present()));
  }

  onCaptureReceipt(): void {
    if (this.noOfReceipts >= 20) {
      this.trackingService.receiptLimitReached();
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

  setupPermissionDeniedPopover(permissionType: 'CAMERA' | 'GALLERY'): Promise<HTMLIonPopoverElement> {
    const isIos = this.devicePlatform === 'ios';

    const galleryPermissionName = isIos ? 'Photos' : 'Storage';
    let title = this.translocoService.translate('captureReceipt.cameraPermissionTitle');
    if (permissionType === 'GALLERY') {
      title = isIos
        ? this.translocoService.translate('captureReceipt.photosPermissionTitle')
        : this.translocoService.translate('captureReceipt.storagePermissionTitle');
    }

    const message =
      permissionType === 'CAMERA'
        ? this.translocoService.translate('captureReceipt.cameraPermissionMessage', { galleryPermissionName })
        : this.translocoService.translate('captureReceipt.galleryPermissionMessage', { galleryPermissionName });

    return this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta: {
          text: this.translocoService.translate('captureReceipt.openSettings'),
          action: 'OPEN_SETTINGS',
        },
        secondaryCta: {
          text: this.translocoService.translate('captureReceipt.cancel'),
          action: 'CANCEL',
        },
      },
      cssClass: 'pop-up-in-center',
      backdropDismiss: false,
    });
  }

  showPermissionDeniedPopover(permissionType: 'CAMERA' | 'GALLERY'): void {
    from(this.setupPermissionDeniedPopover(permissionType))
      .pipe(
        tap((permissionDeniedPopover) => permissionDeniedPopover.present()),
        switchMap((permissionDeniedPopover) => permissionDeniedPopover.onWillDismiss<{ action: string }>())
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

  onGalleryUpload(): void {
    this.trackingService.instafyleGalleryUploadOpened({});
    this.openCustomGalleryPicker();
  }

  private async openCustomGalleryPicker(): Promise<void> {
    const customGalleryModal = await this.modalController.create({
      component: CustomGalleryPickerComponent,
      cssClass: 'custom-gallery-modal',
      backdropDismiss: false,
    });

    await customGalleryModal.present();

    const { data } = await customGalleryModal.onWillDismiss();
    
    if (data && data.base64ImagesWithSource) {
      this.base64ImagesWithSource.push(...data.base64ImagesWithSource);
      this.openReceiptPreviewModal();
    } else {
      this.setUpAndStartCamera();
    }
  }

  ngAfterViewInit(): void {
    if (this.isModal) {
      this.setUpAndStartCamera();
    }
  }

  ngOnDestroy(): void {
    if (this.isModal) {
      this.stopCamera();
    }
    this.bulkModeToastMessageRef?.dismiss?.();
  }

  setUpAndStartCamera(): void {
    this.cameraPreview.setUpAndStartCamera();
    if (this.transactionsOutboxService.singleCaptureCount === 3) {
      this.showBulkModeToastMessage();
      this.isBulkModePromptShown = true;
    }
  }

  stopCamera(): void {
    this.cameraPreview.stopCamera();
  }
}
