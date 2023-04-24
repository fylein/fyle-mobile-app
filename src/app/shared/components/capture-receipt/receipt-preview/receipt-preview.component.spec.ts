import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ReceiptPreviewComponent } from './receipt-preview.component';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { PinchZoomModule } from 'ngx13-pinch-zoom';
import { CropReceiptComponent } from '../crop-receipt/crop-receipt.component';
import { PopupAlertComponent } from '../../popup-alert/popup-alert.component';
import { SwiperComponent } from 'swiper/angular';
import { Component, Input } from '@angular/core';

fdescribe('ReceiptPreviewComponent', () => {
  let component: ReceiptPreviewComponent;
  let fixture: ComponentFixture<ReceiptPreviewComponent>;
  let platform: jasmine.SpyObj<Platform>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let matBottomSheet: jasmine.SpyObj<MatBottomSheet>;
  let imagePicker: jasmine.SpyObj<ImagePicker>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  @Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'swiper',
    template: '',
    providers: [{ provide: SwiperComponent, useClass: SwiperStubComponent }],
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
    const platformSpy = jasmine.createSpyObj('Platform', ['subscribeWithPriority']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const matBottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);
    const imagePickerSpy = jasmine.createSpyObj('ImagePicker', [
      'hasReadPermission',
      'getPictures',
      'requestReadPermission',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['cropReceipt']);
    const swiperSpy = jasmine.createSpyObj('SwiperStubComponent', ['update', 'slidePrev', 'slideNext']);

    TestBed.configureTestingModule({
      declarations: [ReceiptPreviewComponent, SwiperStubComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, PinchZoomModule],
      providers: [
        {
          provide: Platform,
          useValue: platformSpy,
        },
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptPreviewComponent);
    component = fixture.componentInstance;

    platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    matBottomSheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
    imagePicker = TestBed.inject(ImagePicker) as jasmine.SpyObj<ImagePicker>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;

    component.base64ImagesWithSource = images;
    component.swiper = swiperSpy;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openCropReceiptModal(): should open the crop receipt modal', async () => {
    modalController.create.and.returnValue(
      new Promise((resolve) => {
        const cropReceiptModalSpy = jasmine.createSpyObj('cropReceiptModal', ['present', 'onWillDismiss']) as any;
        cropReceiptModalSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({
              data: {
                base64ImageWithSource: images[0],
              },
            });
            resolve(cropReceiptModalSpy);
          })
        );
      })
    );
    trackingService.cropReceipt.and.returnValue(null);

    component.openCropReceiptModal();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: CropReceiptComponent,
      componentProps: {
        base64ImageWithSource: component.base64ImagesWithSource[component.activeIndex],
      },
    });
  });

  xit('ionViewWillEnter', () => {});

  xit('ionViewWillLeave', () => {});

  it('saveReceipt(): should save receipt', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(null));

    component.saveReceipt();
    expect(modalController.dismiss).toHaveBeenCalledWith({
      base64ImagesWithSource: component.base64ImagesWithSource,
    });
  });

  describe('closeModal():', () => {
    it('should close modal and retake image if discard is selected on existing image', () => {
      spyOn(component, 'retake').and.callThrough();
      popoverController.create.and.returnValue(
        new Promise((resolve) => {
          const closePopOverSpy = jasmine.createSpyObj('closePopOver', ['present', 'onWillDismiss']);
          closePopOverSpy.onWillDismiss.and.returnValue(
            new Promise((resIn) => {
              resIn({
                data: {
                  action: 'discard',
                },
              });
            })
          );
          resolve(closePopOverSpy);
        })
      );

      const message = `Are you sure you want to discard the ${component.base64ImagesWithSource.length} receipts you just captured?`;

      component.closeModal();
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Discard Receipt',
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

    it('should close modal and retake image if discard if no previous image exist', () => {
      spyOn(component, 'retake').and.callThrough();
      component.base64ImagesWithSource = [];
      popoverController.create.and.returnValue(
        new Promise((resolve) => {
          const closePopOverSpy = jasmine.createSpyObj('closePopOver', ['present', 'onWillDismiss']);
          closePopOverSpy.onWillDismiss.and.returnValue(
            new Promise((resIn) => {
              resIn({
                data: {},
              });
            })
          );
          resolve(closePopOverSpy);
        })
      );

      const message = 'Not a good picture? No worries. Discard and click again.';

      component.closeModal();
      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Discard Receipt',
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
    it('should update the images list if upload from gallery is successful', (done) => {
      imagePicker.hasReadPermission.and.returnValue(Promise.resolve(true));
      imagePicker.getPictures.and.returnValue(Promise.resolve(['encodedcontent1']));

      component.galleryUpload();
      expect(imagePicker.hasReadPermission).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('captureReceipts(): should close the modal and save the captured receipts', async () => {
    modalController.dismiss.and.returnValue(Promise.resolve(null));

    component.captureReceipts();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      base64ImagesWithSource: component.base64ImagesWithSource,
      continueCaptureReceipt: true,
    });
  });

  it('deleteReceipt(): should delete receipt', () => {
    component.base64ImagesWithSource = images;
    fixture.detectChanges();
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
        const closePopOverSpy = jasmine.createSpyObj('deletePopOver', ['present', 'onWillDismiss']);
        closePopOverSpy.onWillDismiss.and.returnValue(
          new Promise((resIn) => {
            resIn({
              data: {
                action: 'remove',
              },
            });
          })
        );
        resolve(closePopOverSpy);
      })
    );

    component.deleteReceipt();
    // expect(popoverController.create).toHaveBeenCalledOnceWith({
    //   component: PopupAlertComponent,
    //   componentProps: {
    //     title: 'Remove Receipt',
    //     message: 'Are you sure you want to remove this receipt?',
    //     primaryCta: {
    //       text: 'Remove',
    //       action: 'remove',
    //       type: 'alert',
    //     },
    //     secondaryCta: {
    //       text: 'Cancel',
    //       action: 'cancel',
    //     },
    //   },
    //   cssClass: 'pop-up-in-center',
    // });
  });

  it('retake(): should clear the images taken and dismiss the modal', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(null));

    component.retake();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      base64ImagesWithSource: component.base64ImagesWithSource,
    });
  });

  it('goToNextSlide(): should go to the next slide', async () => {
    spyOn(component.swiper.swiperRef, 'slideNext').and.callThrough();
    spyOn(component.swiper.swiperRef, 'update').and.callThrough();

    component.goToNextSlide();
    expect(component.swiper.swiperRef.slideNext).toHaveBeenCalledTimes(1);
  });

  it('goToPrevSlide(): should to the to previous slide', async () => {
    spyOn(component.swiper.swiperRef, 'slidePrev').and.callThrough();
    spyOn(component.swiper.swiperRef, 'update').and.callThrough();

    component.goToPrevSlide();
    expect(component.swiper.swiperRef.slidePrev).toHaveBeenCalledTimes(1);
  });

  it('ionSlideDidChange(): should detect slide change and update active index', () => {
    component.ionSlideDidChange();
    expect(component.activeIndex).toEqual(0);
  });
});
