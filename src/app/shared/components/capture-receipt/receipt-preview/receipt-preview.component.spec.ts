//@ts-nocheck
import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ReceiptPreviewComponent } from './receipt-preview.component';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom';
import { CropReceiptComponent } from '../crop-receipt/crop-receipt.component';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';
import { SwiperComponent } from 'swiper/angular';
import { Component, Input } from '@angular/core';
import { Subscription, of } from 'rxjs';

describe('ReceiptPreviewComponent', () => {
  let component: ReceiptPreviewComponent;
  let fixture: ComponentFixture<ReceiptPreviewComponent>;
  let platform: Platform;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let matBottomSheet: jasmine.SpyObj<MatBottomSheet>;
  let imagePicker: jasmine.SpyObj<ImagePicker>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  @Component({
    selector: 'swiper',
    template: '',
    providers: [{ provide: SwiperComponent, useClass: SwiperStubComponent }],
    standalone: false,
  })
  class SwiperStubComponent {
    @Input() pagination;

    @Input() centeredSlides;

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
    const imagePickerSpy = jasmine.createSpyObj('ImagePicker', [
      'hasReadPermission',
      'getPictures',
      'requestReadPermission',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['cropReceipt', 'eventTrack', 'discardReceipt']);
    const swiperSpy = jasmine.createSpyObj('SwiperStubComponent', ['update', 'slidePrev', 'slideNext']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [ReceiptPreviewComponent, SwiperStubComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, TranslocoModule, PinchZoomComponent],
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
          provide: ImagePicker,
          useValue: imagePickerSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptPreviewComponent);
    component = fixture.componentInstance;

    platform = TestBed.inject(Platform);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    matBottomSheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
    imagePicker = TestBed.inject(ImagePicker) as jasmine.SpyObj<ImagePicker>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'receiptPreview.receiptPreviews': 'Receipt previews',
        'receiptPreview.retake': 'Retake',
        'receiptPreview.addMore': 'Add more',
        'receiptPreview.finish': 'Finish',
        'receiptPreview.discardReceiptTitle': 'Discard receipt',
        'receiptPreview.discardMultipleReceiptsMessage':
          'Are you sure you want to discard the {{count}} receipts you just captured?',
        'receiptPreview.discardSingleReceiptMessage': 'Not a good picture? No worries. Discard and click again.',
        'receiptPreview.discard': 'Discard',
        'receiptPreview.cancel': 'Cancel',
        'receiptPreview.removeReceiptTitle': 'Remove Receipt',
        'receiptPreview.removeReceiptMessage': 'Are you sure you want to remove this receipt?',
        'receiptPreview.remove': 'Remove',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    component.base64ImagesWithSource = images;
    component.swiper = swiperSpy;
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
    it('should update the images list if upload from gallery is successful', async () => {
      imagePicker.hasReadPermission.and.resolveTo(true);
      imagePicker.getPictures.and.resolveTo(['encodedcontent1']);

      const options = {
        maximumImagesCount: 10,
        outputType: 1,
        quality: 70,
      };

      await component.galleryUpload();
      expect(imagePicker.hasReadPermission).toHaveBeenCalledTimes(1);
      expect(imagePicker.getPictures).toHaveBeenCalledOnceWith(options);
    });
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
          title: 'Remove Receipt',
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
          title: 'Remove Receipt',
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

  it('should request permission and call galleryUpload again if permission is denied', fakeAsync(() => {
    let callCount = 0;
    const requestReadPermissionSpy = jasmine.createSpy('requestReadPermission');
    component.imagePicker = {
      hasReadPermission: () => Promise.resolve(false),
      requestReadPermission: requestReadPermissionSpy,
    } as any;

    // Patch galleryUpload to only allow one recursion
    const originalGalleryUpload = component.galleryUpload.bind(component);
    spyOn(component, 'galleryUpload').and.callFake(function () {
      callCount++;
      if (callCount < 2) {
        // Call the original method only once to avoid infinite recursion
        return originalGalleryUpload();
      }
    });

    component.galleryUpload();

    tick(10);
    expect(requestReadPermissionSpy).toHaveBeenCalled();
  }));
});
