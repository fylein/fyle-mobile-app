//@ts-nocheck
import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ReceiptPreviewComponent } from './receipt-preview.component';
import { ModalController, Platform, PopoverController } from '@ionic/angular/standalone';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom';
import { CropReceiptComponent } from '../crop-receipt/crop-receipt.component';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';
import { SwiperComponent } from 'swiper/angular';
import { Component, input } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { UtilityService } from 'src/app/core/services/utility.service';
import { CameraService } from 'src/app/core/services/camera.service';
import { DEVICE_PLATFORM } from 'src/app/constants';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';

describe('ReceiptPreviewComponent', () => {
  let component: ReceiptPreviewComponent;
  let fixture: ComponentFixture<ReceiptPreviewComponent>;
  let platform: Platform;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let matBottomSheet: jasmine.SpyObj<MatBottomSheet>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let cameraService: jasmine.SpyObj<CameraService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  @Component({
    selector: 'swiper',
    template: '',
    providers: [{ provide: SwiperComponent, useClass: SwiperStubComponent }],
    imports: [MatIconModule, MatIconTestingModule, PinchZoomComponent],
  })
  class SwiperStubComponent {
    readonly pagination = input(undefined);

    readonly centeredSlides = input(undefined);

    swiperRef = {
      update: () => {},
      activeIndex: 0,
      slideNext: () => {},
      slidePrev: () => {},
    };
  }

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

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const matBottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['webPathToBase64']);
    const cameraServiceSpy = jasmine.createSpyObj('CameraService', ['pickImages', 'checkPermissions']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['cropReceipt', 'eventTrack', 'discardReceipt']);
    const swiperSpy = jasmine.createSpyObj('SwiperStubComponent', ['update', 'slidePrev', 'slideNext']);
    TestBed.configureTestingModule({
      imports: [
        
        MatIconModule,
        MatIconTestingModule,
        getTranslocoTestingModule(),
        PinchZoomComponent,
        ReceiptPreviewComponent,
        SwiperStubComponent,
      ],
      providers: [
        Platform,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: MatBottomSheet,
          useValue: matBottomSheetSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: CameraService,
          useValue: cameraServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: DEVICE_PLATFORM,
          useValue: 'android',
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptPreviewComponent);
    component = fixture.componentInstance;

    platform = TestBed.inject(Platform);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    matBottomSheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    cameraService = TestBed.inject(CameraService) as jasmine.SpyObj<CameraService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    component.base64ImagesWithSource = images;
    component.swiper = swiperSpy;
    
    // Mock CameraService.pickImages
    cameraService.pickImages.and.resolveTo({
      photos: [
        { webPath: 'photo1.webp', format: 'jpeg' },
      ],
    });
    
    // Mock webPathToBase64
    utilityService.webPathToBase64.and.resolveTo('base64encodedcontent1');
    
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openCropReceiptModal(): should open the crop receipt modal', async () => {
    const cropReceiptModalSpy = jasmine.createSpyObj('cropReceiptModal', ['present', 'onWillDismiss']);
    cropReceiptModalSpy.onWillDismiss.and.resolveTo({
      data: {
        base64ImageWithSource: images[0],
      },
    });
    modalController.create.and.resolveTo(cropReceiptModalSpy);
    trackingService.cropReceipt.and.returnValue(null);

    component.openCropReceiptModal();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: CropReceiptComponent,
      componentProps: {
        base64ImageWithSource: component.base64ImagesWithSource[component.activeIndex],
      },
    });
  });

  it('ionViewWillEnter(): should detet back button click', () => {
    spyOn(platform.backButton, 'subscribeWithPriority').and.callThrough();
    spyOn(component.swiper.swiperRef, 'update').and.callThrough();

    component.ionViewWillEnter();
    expect(component.swiper.swiperRef.update).toHaveBeenCalledTimes(1);
  });

  it('ionViewWillLeave(): should unsubscribe when component is destroyed', () => {
    component.hardwareBackButtonAction = new Subscription();
    spyOn(component.hardwareBackButtonAction, 'unsubscribe');

    component.ionViewWillLeave();
    expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('saveReceipt(): should save receipt', () => {
    modalController.dismiss.and.resolveTo(null);

    component.saveReceipt();
    expect(modalController.dismiss).toHaveBeenCalledWith({
      base64ImagesWithSource: component.base64ImagesWithSource,
    });
  });

  describe('closeModal():', () => {
    it('should close modal and retake image if discard is selected on existing image', async () => {
      spyOn(component, 'retake').and.returnValue(null);
      component.base64ImagesWithSource = [
        {
          source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.001.jpeg',
          base64Image: 'base64encodedcontent1',
        },
        {
          source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.002.jpeg',
          base64Image: 'base64encodedcontent2',
        },
        {
          source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.003.jpeg',
          base64Image: 'base64encodedcontent3',
        },
      ];
      const closePopOverSpy = jasmine.createSpyObj('closePopOver', ['present', 'onWillDismiss']);
      closePopOverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'discard',
        },
      });
      popoverController.create.and.resolveTo(closePopOverSpy);
      fixture.detectChanges();

      const message = `Are you sure you want to discard the ${component.base64ImagesWithSource.length} receipts you just captured?`;

      await component.closeModal();
      expect(component.retake).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Discard receipt',
          message,
          primaryCta: {
            text: 'Discard',
            action: 'discard',
            type: 'alert',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });
    });

    it('should close modal and retake image if discard if no previous image exist', async () => {
      component.base64ImagesWithSource = [];
      const closePopOverSpy = jasmine.createSpyObj('closePopOver', ['present', 'onWillDismiss']);
      closePopOverSpy.onWillDismiss.and.resolveTo({
        data: {},
      });
      popoverController.create.and.resolveTo(closePopOverSpy);

      fixture.detectChanges();

      const message = 'Not a good picture? No worries. Discard and click again.';

      await component.closeModal();
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Discard receipt',
          message,
          primaryCta: {
            text: 'Discard',
            action: 'discard',
            type: 'alert',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });
    });
  });

  describe('galleryUpload(): ', () => {
    it('should update the images list if upload from gallery is successful', fakeAsync(() => {
      const initialLength = component.base64ImagesWithSource.length;
      
      cameraService.checkPermissions.and.resolveTo({ photos: 'granted', camera: 'granted' });
      cameraService.pickImages.and.resolveTo({
        photos: [
          { webPath: 'photo1.webp', format: 'jpeg' },
        ],
      });
      
      utilityService.webPathToBase64.and.resolveTo('base64encodedcontent1');
      
      component.galleryUpload();
      
      // Wait for checkPermissions to resolve
      tick();
      
      // Wait for pickImages to resolve
      tick();
      
      // Wait for webPathToBase64 to resolve and for the for...of loop to complete
      tick();
      
      // Flush any remaining async operations
      tick(100);
      
      expect(cameraService.checkPermissions).toHaveBeenCalledTimes(1);
      expect(cameraService.pickImages).toHaveBeenCalledWith({
        limit: 10,
        quality: 70,
      });
      expect(utilityService.webPathToBase64).toHaveBeenCalledWith('photo1.webp');
      expect(component.base64ImagesWithSource.length).toBe(initialLength + 1);
      expect(component.base64ImagesWithSource[component.base64ImagesWithSource.length - 1].source).toBe('MOBILE_DASHCAM_GALLERY');
      expect(component.base64ImagesWithSource[component.base64ImagesWithSource.length - 1].base64Image).toBe('base64encodedcontent1');
    }));
  });

  it('captureReceipts(): should close the modal and save the captured receipts', async () => {
    modalController.dismiss.and.resolveTo(null);

    component.captureReceipts();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      base64ImagesWithSource: component.base64ImagesWithSource,
      continueCaptureReceipt: true,
    });
  });

  describe('deleteReceipt():', () => {
    it('should delete receipt', async () => {
      component.base64ImagesWithSource = images;
      const closePopOverSpy = jasmine.createSpyObj('deletePopOver', ['present', 'onWillDismiss']);
      closePopOverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'remove',
        },
      });
      popoverController.create.and.resolveTo(closePopOverSpy);
      fixture.detectChanges();

      await component.deleteReceipt();
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Remove receipt',
          message: 'Are you sure you want to remove this receipt?',
          primaryCta: {
            text: 'Remove',
            action: 'remove',
            type: 'alert',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });
    });

    it('should retake images if there are no existing images to delete', async () => {
      component.base64ImagesWithSource = [];
      spyOn(component, 'retake').and.returnValue(null);
      const closePopOverSpy = jasmine.createSpyObj('deletePopOver', ['present', 'onWillDismiss']);
      closePopOverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'remove',
        },
      });
      popoverController.create.and.resolveTo(closePopOverSpy);
      fixture.detectChanges();

      await component.deleteReceipt();
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Remove receipt',
          message: 'Are you sure you want to remove this receipt?',
          primaryCta: {
            text: 'Remove',
            action: 'remove',
            type: 'alert',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
        },
        cssClass: 'pop-up-in-center',
      });
      expect(component.retake).toHaveBeenCalledTimes(1);
    });

    it('should set activeIndex to 0 if swiperRef.activeIndex is null in deleteReceipt', async () => {
      component.swiper = { swiperRef: { activeIndex: null, update: async () => {} } } as any;
      component.base64ImagesWithSource = [{ base64Image: 'img1' }, { base64Image: 'img2' }];
      component.activeIndex = 0;
      component.popoverController = {
        create: () =>
          Promise.resolve({
            present: () => Promise.resolve(),
            onWillDismiss: () => Promise.resolve({ data: { action: 'remove' } }),
          }),
      } as any;
      await component.deleteReceipt();
      expect(component.activeIndex).toBe(0);
    });
  });

  it('retake(): should clear the images taken and dismiss the modal', () => {
    modalController.dismiss.and.resolveTo(null);

    component.retake();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      base64ImagesWithSource: component.base64ImagesWithSource,
    });
  });

  it('goToNextSlide(): should go to the next slide', async () => {
    spyOn(component.swiper.swiperRef, 'slideNext').and.callThrough();
    spyOn(component.swiper.swiperRef, 'update').and.callThrough();

    await component.goToNextSlide();
    expect(component.swiper.swiperRef.slideNext).toHaveBeenCalledTimes(1);
    expect(component.swiper.swiperRef.update).toHaveBeenCalledTimes(1);
  });

  it('goToPrevSlide(): should to the to previous slide', async () => {
    spyOn(component.swiper.swiperRef, 'slidePrev').and.callThrough();
    spyOn(component.swiper.swiperRef, 'update').and.callThrough();

    await component.goToPrevSlide();
    expect(component.swiper.swiperRef.slidePrev).toHaveBeenCalledTimes(1);
    expect(component.swiper.swiperRef.update).toHaveBeenCalledTimes(1);
  });

  it('ionSlideDidChange(): should detect slide change and update active index', () => {
    component.ionSlideDidChange();
    expect(component.activeIndex).toEqual(0);
  });

  describe('addMore(): ', () => {
    it('should add more receipts if the mode is camera', async () => {
      matBottomSheet.open.and.returnValue({
        afterDismissed: () =>
          of({
            mode: 'camera',
          }),
      });
      spyOn(component, 'captureReceipts').and.returnValue(null);

      await component.addMore();
      expect(component.captureReceipts).toHaveBeenCalledTimes(1);
    });

    it('should open gallery if the mode is not specified', async () => {
      matBottomSheet.open.and.returnValue({
        afterDismissed: () => of({}),
      });
      spyOn(component, 'galleryUpload').and.returnValue(null);

      await component.addMore();
      expect(component.galleryUpload).toHaveBeenCalledTimes(1);
    });
  });

  describe('rotateImage and rotateImageData coverage', () => {
    beforeEach(() => {
      component.base64ImagesWithSource = [{ base64Image: 'data:image/jpeg;base64,original' }];
      component.activeIndex = 0;
      component.rotatingDirection = null;
      component.swiper = { swiperRef: { update: jasmine.createSpy() } } as any;
    });

    it('should return early if already rotating', () => {
      component.rotatingDirection = 1;
      component.rotateImage(1);
      expect(component.rotatingDirection).toBe(1);
    });

    it('should return early if current image is missing or has no base64Image', fakeAsync(() => {
      component.base64ImagesWithSource = [{} as any];
      component.activeIndex = 0;
      component.rotatingDirection = null;
      component.rotateImage(1);
      tick(500);
      expect(component.rotatingDirection).toBeNull();
    }));

    it('should rotate the image and update the base64ImagesWithSource', fakeAsync(() => {
      // Mock image and canvas
      const mockImage = {
        set onload(fn) {
          // Use tick(0) to simulate immediate callback
          fn();
        },
        set src(val) {},
        get src() {
          return '';
        },
      };
      spyOn(window as any, 'Image').and.returnValue(mockImage);
      const mockCtx = {
        translate: jasmine.createSpy(),
        rotate: jasmine.createSpy(),
        drawImage: jasmine.createSpy(),
      };
      const mockCanvas = {
        getContext: () => mockCtx,
        toDataURL: () => 'data:image/jpeg;base64,rotated',
        width: 0,
        height: 0,
      };
      spyOn(document, 'createElement').and.returnValue(mockCanvas as any);
      component.base64ImagesWithSource = [{ base64Image: 'data:image/jpeg;base64,original' }];
      component.activeIndex = 0;
      component.rotatingDirection = null;
      component.swiper = { swiperRef: { update: jasmine.createSpy() } } as any;
      component.rotateImage(1);
      tick(500);
      expect(component.base64ImagesWithSource[0].base64Image).toBe('data:image/jpeg;base64,rotated');
      expect(component.rotatingDirection).toBeNull();
    }));

    it('should return early if canvas context is null', fakeAsync(() => {
      const mockImage = {
        set onload(fn) {
          fn();
        },
        set src(val) {},
        get src() {
          return '';
        },
      };
      spyOn(window as any, 'Image').and.returnValue(mockImage);
      const mockCanvas = {
        getContext: () => null,
        width: 0,
        height: 0,
      };
      spyOn(document, 'createElement').and.returnValue(mockCanvas as any);
      component.base64ImagesWithSource = [{ base64Image: 'data:image/jpeg;base64,original' }];
      component.activeIndex = 0;
      component.rotatingDirection = null;
      component.rotateImage(1);
      tick(500);
      expect(component.rotatingDirection).toBeNull();
    }));

    it('should set activeIndex to 0 if swiperRef.activeIndex is null in deleteReceipt', async () => {
      component.swiper = { swiperRef: { activeIndex: null, update: async () => {} } } as any;
      component.base64ImagesWithSource = [{ base64Image: 'img1' }, { base64Image: 'img2' }];
      component.activeIndex = 0;
      component.popoverController = {
        create: () =>
          Promise.resolve({
            present: () => Promise.resolve(),
            onWillDismiss: () => Promise.resolve({ data: { action: 'remove' } }),
          }),
      } as any;
      await component.deleteReceipt();
      expect(component.activeIndex).toBe(0);
    });

    it('should set activeIndex to 0 if swiperRef.activeIndex is null in ionSlideDidChange', async () => {
      component.swiper = { swiperRef: { activeIndex: null } } as any;
      component.activeIndex = 1;
      await component.ionSlideDidChange();
      expect(component.activeIndex).toBe(0);
    });

    it('should rotate -90 degrees if direction is LEFT', fakeAsync(() => {
      const mockImage = {
        set onload(fn) {
          fn();
        },
        set src(val) {},
        get src() {
          return '';
        },
      };
      spyOn(window as any, 'Image').and.returnValue(mockImage);
      const mockCtx = {
        translate: jasmine.createSpy(),
        rotate: jasmine.createSpy(),
        drawImage: jasmine.createSpy(),
      };
      const mockCanvas = {
        getContext: () => mockCtx,
        toDataURL: () => 'data:image/jpeg;base64,rotated',
        width: 0,
        height: 0,
      };
      spyOn(document, 'createElement').and.returnValue(mockCanvas as any);
      component.base64ImagesWithSource = [{ base64Image: 'data:image/jpeg;base64,original' }];
      component.activeIndex = 0;
      component.rotatingDirection = null;
      component.swiper = { swiperRef: { update: jasmine.createSpy() } } as any;
      // Call with LEFT
      component.rotateImageData({ base64Image: 'data:image/jpeg;base64,original' }, component.RotationDirection.LEFT);
      tick(10);
      expect(mockCtx.rotate).toHaveBeenCalledWith((-90 * Math.PI) / 180);
    }));

    it('should rotate 90 degrees if direction is not LEFT', fakeAsync(() => {
      const mockImage = {
        set onload(fn) {
          fn();
        },
        set src(val) {},
        get src() {
          return '';
        },
      };
      spyOn(window as any, 'Image').and.returnValue(mockImage);
      const mockCtx = {
        translate: jasmine.createSpy(),
        rotate: jasmine.createSpy(),
        drawImage: jasmine.createSpy(),
      };
      const mockCanvas = {
        getContext: () => mockCtx,
        toDataURL: () => 'data:image/jpeg;base64,rotated',
        width: 0,
        height: 0,
      };
      spyOn(document, 'createElement').and.returnValue(mockCanvas as any);
      component.base64ImagesWithSource = [{ base64Image: 'data:image/jpeg;base64,original' }];
      component.activeIndex = 0;
      component.rotatingDirection = null;
      component.swiper = { swiperRef: { update: jasmine.createSpy() } } as any;
      // Call with RIGHT
      component.rotateImageData({ base64Image: 'data:image/jpeg;base64,original' }, component.RotationDirection.RIGHT);
      tick(10);
      expect(mockCtx.rotate).toHaveBeenCalledWith((90 * Math.PI) / 180);
    }));
  });

  it('should call closeModal when back button is pressed in ionViewWillEnter', () => {
    spyOn(component, 'closeModal');
    component.platform = {
      backButton: {
        subscribeWithPriority: (priority, fn) => {
          fn(); // Call the callback immediately
          return { unsubscribe: () => {} };
        },
      },
    } as any;
    component.ionViewWillEnter();
    expect(component.closeModal).toHaveBeenCalled();
  });

  describe('setupPermissionDeniedPopover():', () => {
    it('should setup permission denied popover for camera', () => {
      popoverController.create.and.returnValue(null);

      component.setupPermissionDeniedPopover('CAMERA');
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Camera permission',
          message:
            'To capture photos, please allow Sage Expense Management to access your camera. Click Open Settings and allow access to Camera and Storage',
          primaryCta: {
            text: 'Open settings',
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
          title: 'Storage permission',
          message: 'Please allow Sage Expense Management to access device photos. Click Settings and allow Storage access',
          primaryCta: {
            text: 'Open settings',
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

    it('should set galleryPermissionName as Photos if device is ios', () => {
      popoverController.create.and.callThrough();
      Object.defineProperty(component, 'devicePlatform', { value: 'ios' });

      component.setupPermissionDeniedPopover('GALLERY');
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Photos permission',
          message: 'Please allow Sage Expense Management to access device photos. Click Settings and allow Photos access',
          primaryCta: {
            text: 'Open settings',
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

  describe('showPermissionDeniedPopover():', () => {
    let popoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;
    beforeEach(() => {
      component.nativeSettings = jasmine.createSpyObj('NativeSettings', ['open']);
      popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'OPEN_SETTINGS',
        },
      });
    });

    it('should show permission denied popover', fakeAsync(() => {
      spyOn(component, 'setupPermissionDeniedPopover').and.resolveTo(popoverSpy);
      component.showPermissionDeniedPopover('CAMERA');
      tick(1000);
      expect(component.setupPermissionDeniedPopover).toHaveBeenCalledOnceWith('CAMERA');
      expect(component.nativeSettings.open).toHaveBeenCalledTimes(1);
    }));

    it('should not call "nativeSettings.open" if data is undefined', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({
        data: undefined,
      });
      spyOn(component, 'setupPermissionDeniedPopover').and.resolveTo(popoverSpy);
      component.showPermissionDeniedPopover('CAMERA');
      tick(100);
      expect(component.setupPermissionDeniedPopover).toHaveBeenCalledOnceWith('CAMERA');
      expect(component.nativeSettings.open).not.toHaveBeenCalled();
    }));
  });

});
