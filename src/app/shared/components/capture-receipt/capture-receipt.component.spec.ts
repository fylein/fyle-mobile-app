import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgService } from 'src/app/core/services/org.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CaptureReceiptComponent } from './capture-receipt.component';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEVICE_PLATFORM } from 'src/app/constants';
import { RouterTestingModule } from '@angular/router/testing';
import { CameraPreviewComponent } from './camera-preview/camera-preview.component';
import { of } from 'rxjs';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';
import { PopupAlertComponent } from '../popup-alert/popup-alert.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { orgData1 } from '../../../core/mock-data/org.data';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, NO_ERRORS_SCHEMA } from '@angular/core';

class MatSnackBarStub {
  openFromComponent(props: any) {
    return {
      afterDismissed: () => of(true),
    };
  }
}

describe('CaptureReceiptComponent', () => {
  let component: CaptureReceiptComponent;
  let fixture: ComponentFixture<CaptureReceiptComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let router: jasmine.SpyObj<Router>;
  let navController: jasmine.SpyObj<NavController>;
  let transactionsOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let imagePicker: jasmine.SpyObj<ImagePicker>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let authService: jasmine.SpyObj<AuthService>;

  const images = [
    {
      source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
      base64Image: 'base64encodedcontent1',
    },
    {
      source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
      base64Image: 'base64encodedcontent2',
    },
  ];

  @Component({
    selector: 'app-camera-preview',
    template: '',
    providers: [{ provide: CameraPreviewComponent, useClass: CameraPreviewStubComponent }],
  })
  class CameraPreviewStubComponent {
    setUpAndStartCamera() {
      return of(null);
    }

    stopCamera() {
      return of(null);
    }
  }

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'flashModeSet',
      'showToastMessage',
      'switchedToInstafyleBulkMode',
      'switchedToInstafyleSingleMode',
      'captureSingleReceiptTime',
      'instafyleGalleryUploadOpened',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    const transactionsOutboxServiceSpy = jasmine.createSpyObj('TransactionOutboxService', [
      'addEntry',
      'incrementSingleCaptureCount',
      'singleCaptureCount',
    ]);
    const imagePickerSpy = jasmine.createSpyObj('ImagePicker', ['hasReadPermission', 'getPictures']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getOrgs']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const performanceSpy = jasmine.createSpyObj('peformance', ['getEntriesByName', 'mark', 'measure']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    const cameraPreviewSpy = jasmine.createSpyObj('CameraPreviewComponent', ['setUpAndStartCamera', 'stopCamera']);

    TestBed.configureTestingModule({
      declarations: [CaptureReceiptComponent, CameraPreviewStubComponent],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        {
          provide: TransactionsOutboxService,
          useValue: transactionsOutboxServiceSpy,
        },
        {
          provide: ImagePicker,
          useValue: imagePickerSpy,
        },
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: OrgService,
          useValue: orgServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: MatSnackBar,
          useClass: MatSnackBarStub,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: DEVICE_PLATFORM,
          useValue: 'android',
        },
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(CaptureReceiptComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    transactionsOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    imagePicker = TestBed.inject(ImagePicker) as jasmine.SpyObj<ImagePicker>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    component.cameraPreview = cameraPreviewSpy;
    networkService.isOnline.and.returnValue(of(true));
    orgService.getOrgs.and.returnValue(of(orgData1));
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('addMultipleExpensesToQueue', (done) => {
    const addExpenseToQueueSpy = spyOn(component, 'addExpenseToQueue');
    addExpenseToQueueSpy
      .withArgs({
        source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
        base64Image: 'base64encodedcontent1',
      })
      .and.returnValue(of(null));
    addExpenseToQueueSpy
      .withArgs({
        source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
        base64Image: 'base64encodedcontent2',
      })
      .and.returnValue(of(null));

    component.addMultipleExpensesToQueue(images).subscribe(() => {
      expect(addExpenseToQueueSpy).toHaveBeenCalledTimes(2);
      expect(addExpenseToQueueSpy).toHaveBeenCalledWith({
        source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
        base64Image: 'base64encodedcontent1',
      });
      expect(addExpenseToQueueSpy).toHaveBeenCalledWith({
        source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
        base64Image: 'base64encodedcontent2',
      });
      done();
    });
  });

  describe('addExpenseToQueue():', () => {
    it('should add entry to expense queue', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      transactionsOutboxService.addEntry.and.returnValue(Promise.resolve(null));
      fixture.detectChanges();

      component
        .addExpenseToQueue({
          source: 'MOBILE',
          base64Image: 'base64encodedcontent',
        })
        .subscribe(() => {
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionsOutboxService.addEntry).toHaveBeenCalledTimes(1);
          done();
        });
    });

    it('should add entry to expense queue if offline', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(null));
      transactionsOutboxService.addEntry.and.returnValue(Promise.resolve(null));
      component.isOffline$ = of(true);
      fixture.detectChanges();

      component
        .addExpenseToQueue({
          source: 'MOBILE',
          base64Image: 'base64encodedcontent',
        })
        .subscribe(() => {
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionsOutboxService.addEntry).toHaveBeenCalledTimes(1);
          done();
        });
    });
  });

  describe('onDismissCameraPreview():', () => {
    it('should dismiss camera preview if modal is open', () => {
      modalController.dismiss.and.callThrough();
      component.isModal = true;
      fixture.detectChanges();

      component.onDismissCameraPreview();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });

    it('should go to previous page if modal is not open', () => {
      navController.back.and.callThrough();
      component.isModal = false;
      fixture.detectChanges();

      component.onDismissCameraPreview();
      expect(navController.back).toHaveBeenCalledTimes(1);
    });
  });

  it('onToggleFlashMode(): should toggle flash light', () => {
    component.onToggleFlashMode('on');
    expect(trackingService.flashModeSet).toHaveBeenCalledOnceWith({
      FlashMode: 'on',
    });
  });

  it('showBulkModeToastMessage(): should show toast to use bulk mode', () => {
    const message =
      'If you have multiple receipts to upload, please use <b>BULK MODE</b> to upload all the receipts at once.';
    trackingService.showToastMessage.and.callThrough();
    spyOn(matSnackBar, 'openFromComponent').and.callThrough();
    snackbarProperties.setSnackbarProperties.and.callThrough();

    component.showBulkModeToastMessage();
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      panelClass: ['msb-bulkfyle-prompt'],
      duration: 10000,
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
  });

  describe('onSwitchMode():', () => {
    it('should switch to bulk fyle mode if bulk mode is false', () => {
      component.isBulkMode = false;
      fixture.detectChanges();

      component.onSwitchMode();
      expect(trackingService.switchedToInstafyleBulkMode).toHaveBeenCalledOnceWith({});
    });

    it('should switch to single fyle mode if bulk mode is true', () => {
      component.isBulkMode = true;
      fixture.detectChanges();

      component.onSwitchMode();
      expect(trackingService.switchedToInstafyleSingleMode).toHaveBeenCalledOnceWith({});
    });
  });

  it('onSingleCaptureOffline(): should capture single receipt offline', () => {
    loaderService.showLoader.and.callThrough();
    loaderService.hideLoader.and.callThrough();
    spyOn(component, 'addMultipleExpensesToQueue').and.returnValue(of(null));
    fixture.detectChanges();

    component.onSingleCaptureOffline();
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
    expect(component.addMultipleExpensesToQueue).toHaveBeenCalledOnceWith(component.base64ImagesWithSource);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
  });

  it('navigateToExpenseForm(): should navigate to expense form', () => {
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
    component.base64ImagesWithSource = [
      {
        source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
        base64Image: 'base64encodedcontent',
      },
    ];

    fixture.detectChanges();

    component.navigateToExpenseForm();
    expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_expense',
      {
        dataUrl: component.base64ImagesWithSource[0]?.base64Image,
        canExtractData: true,
      },
    ]);
  });

  describe('saveSingleCapture():', () => {
    it('should save a single receipt if offline', async () => {
      component.isOffline$ = of(true);
      transactionsOutboxService.incrementSingleCaptureCount.and.callThrough();
      spyOn(component, 'onSingleCaptureOffline').and.returnValue(null);
      fixture.detectChanges();

      component.saveSingleCapture();
      expect(component.onSingleCaptureOffline).toHaveBeenCalledTimes(1);
      expect(transactionsOutboxService.incrementSingleCaptureCount).toHaveBeenCalledTimes(1);
    });

    it('should navigate to expense form if online', async () => {
      networkService.isOnline.and.returnValue(of(true));
      transactionsOutboxService.incrementSingleCaptureCount.and.callThrough();
      spyOn(component, 'navigateToExpenseForm').and.returnValue(null);
      fixture.detectChanges();

      component.saveSingleCapture();
      expect(component.navigateToExpenseForm).toHaveBeenCalledTimes(1);
      expect(transactionsOutboxService.incrementSingleCaptureCount).toHaveBeenCalledTimes(1);
    });
  });

  xit('addPerformanceTrackers(): should add performance tracker', () => {
    orgService.getOrgs.and.returnValue(of(orgData1));

    component.addPerformanceTrackers();
  });

  describe('openReceiptPreviewModal():', async () => {
    it('should navigate to expenses page if images clicked and saved succesfully ', () => {
      spyOn(component, 'addMultipleExpensesToQueue').and.callThrough();
      spyOn(component, 'showReceiptPreview').and.returnValue(
        of({
          base64ImagesWithSource: images,
        })
      );

      component.openReceiptPreviewModal();
      expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait...', 10000);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
      expect(component.addMultipleExpensesToQueue).toHaveBeenCalledOnceWith(component.base64ImagesWithSource);
      expect(component.showReceiptPreview).toHaveBeenCalledTimes(1);
    });

    it('should open receipt modal if number of images is 0', async () => {
      spyOn(component, 'showReceiptPreview').and.returnValue(
        of({
          base64ImagesWithSource: [],
        })
      );
      spyOn(component, 'setUpAndStartCamera').and.returnValue(null);

      component.openReceiptPreviewModal();
      expect(component.showReceiptPreview).toHaveBeenCalledTimes(1);
      expect(component.setUpAndStartCamera).toHaveBeenCalledTimes(1);
    });
  });

  it('createReceiptPreviewModal(): should create receipt preview modal', () => {
    modalController.create.and.returnValue(Promise.resolve(null));

    component.createReceiptPreviewModal('bulk');
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: ReceiptPreviewComponent,
      componentProps: {
        base64ImagesWithSource: component.base64ImagesWithSource,
        mode: 'bulk',
      },
    });
  });

  it('showReceiptPreview(): should show receipt preview', (done) => {
    spyOn(component, 'createReceiptPreviewModal').and.returnValue(
      Promise.resolve({
        data: {
          base64ImagesWithSource: images,
        },
        onWillDismiss: () => Promise.resolve(),
        present: () => {},
      } as any)
    );

    component.showReceiptPreview().subscribe(() => {
      expect(component.createReceiptPreviewModal).toHaveBeenCalledOnceWith('bulk');
      done();
    });
  });

  it('onBulkCapture(): should increment the number of receipts if in bulk mode', () => {
    component.noOfReceipts = 1;
    fixture.detectChanges();

    component.onBulkCapture();
    expect(component.noOfReceipts).toEqual(2);
  });

  it('showLimitReachedPopover(): should show limit reached popover', (done) => {
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
        const limitReachedPopoverSpy = jasmine.createSpyObj('limitReachedPopover', ['present']);
        resolve(limitReachedPopoverSpy);
      })
    );
    component.showLimitReachedPopover().subscribe(() => {
      expect(popoverController.create).toHaveBeenCalledOnceWith({
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
      done();
    });
  });

  xit('onCaptureReceipt', () => {
    component.onCaptureReceipt();
  });

  describe('setupPermissionDeniedPopover():', () => {
    it('should setup permission denied popover for camera', () => {
      popoverController.create.and.callThrough();

      component.setupPermissionDeniedPopover('CAMERA');
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Camera Permission',
          message:
            'To capture photos, please allow Fyle to access your camera. Click Settings and allow access to Camera and Storage',
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
    });

    it('should setup permission denied popover for gallery', () => {
      popoverController.create.and.callThrough();

      component.setupPermissionDeniedPopover('GALLERY');
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Storage Permission',
          message: 'Please allow Fyle to access device photos. Click Settings and allow Storage access',
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
    });
  });

  xit('showPermissionDeniedPopover(): should show permission denied popvoer', () => {
    spyOn(component, 'onDismissCameraPreview').and.returnValue(null);
    spyOn(component, 'setupPermissionDeniedPopover').and.returnValue(
      new Promise((resolve) => {
        const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
        popoverSpy.onWillDismiss.and.returnValue(
          new Promise((resIn) => {
            resIn({
              data: {
                action: 'OPEN_SETTINGS',
              },
            });
          })
        );
        resolve(popoverSpy);
      })
    );

    component.showPermissionDeniedPopover('CAMERA');
    expect(component.setupPermissionDeniedPopover).toHaveBeenCalledOnceWith('CAMERA');
  });

  describe('onGalleryUpload():', () => {
    it('should upload images to gallery if permission graneted', async () => {
      imagePicker.hasReadPermission.and.returnValue(Promise.resolve(true));
      imagePicker.getPictures.and.returnValue(Promise.resolve(['encodedcontent1', 'encodedcontent2']));

      component.onGalleryUpload();
      expect(trackingService.instafyleGalleryUploadOpened).toHaveBeenCalledOnceWith({});
      expect(imagePicker.hasReadPermission).toHaveBeenCalledTimes(1);
    });
  });

  xit('setUpAndStartCamera(): should setup and start camera', () => {
    spyOn(component.cameraPreview, 'setUpAndStartCamera').and.returnValue(null);

    component.setUpAndStartCamera();
    expect(component.cameraPreview.setUpAndStartCamera).toHaveBeenCalledTimes(1);
  });

  describe('onSingleCapture(): ', () => {
    it('should show preview and save a single captured image if online', () => {
      spyOn(component, 'setUpAndStartCamera').and.returnValue(null);
      spyOn(component, 'createReceiptPreviewModal').and.returnValue(
        new Promise((resolve) => {
          const popOverSpy = jasmine.createSpyObj('receiptPreviewModal', ['present', 'onWillDismiss']);
          popOverSpy.onWillDismiss.and.returnValue(
            new Promise((resInt) => {
              resInt({
                data: {
                  base64ImagesWithSource: images,
                },
              });
            })
          );
          resolve(popOverSpy);
        })
      );

      component.onSingleCapture();
      expect(component.createReceiptPreviewModal).toHaveBeenCalledOnceWith('single');
    });

    it('should start camera if there is no image data', async () => {
      spyOn(component, 'setUpAndStartCamera').and.returnValue(null);
      spyOn(component, 'createReceiptPreviewModal').and.returnValue(
        new Promise((resolve) => {
          const popOverSpy = jasmine.createSpyObj('receiptPreviewModal', ['present', 'onWillDismiss']);
          popOverSpy.onWillDismiss.and.returnValue(
            new Promise((resInt) => {
              resInt({
                data: {
                  base64ImagesWithSource: [],
                },
              });
            })
          );
          resolve(popOverSpy);
        })
      );
      component.isOffline$ = of(false);
      fixture.detectChanges();

      component.onSingleCapture();
      expect(component.createReceiptPreviewModal).toHaveBeenCalledOnceWith('single');
    });
  });

  it('should setup and start camera if the component is opened in modal', () => {
    component.isModal = true;
    spyOn(component, 'setUpAndStartCamera').and.returnValue(null);
    component.ngAfterViewInit();

    expect(component.setUpAndStartCamera).toHaveBeenCalledTimes(1);
  });
});
