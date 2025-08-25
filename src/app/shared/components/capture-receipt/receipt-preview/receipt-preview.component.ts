import { Component, Input, OnInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { from, Subscription } from 'rxjs';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { AddMorePopupComponent } from '../add-more-popup/add-more-popup.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { CropReceiptComponent } from '../crop-receipt/crop-receipt.component';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { Image } from 'src/app/core/models/image-type.model';
import { RotationDirection } from 'src/app/core/enums/rotation-direction.enum';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

// install Swiper modules
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.scss'],
  standalone: false,
})
export class ReceiptPreviewComponent implements OnInit, OnDestroy {
  private platform = inject(Platform);

  private modalController = inject(ModalController);

  private popoverController = inject(PopoverController);

  private matBottomSheet = inject(MatBottomSheet);

  private imagePicker = inject(ImagePicker);

  private trackingService = inject(TrackingService);

  private router = inject(Router);

  private translocoService = inject(TranslocoService);

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  @Input() base64ImagesWithSource: Image[];

  @Input() mode: string;

  sliderOptions: { zoom: { maxRatio: number } };

  activeIndex: number;

  hardwareBackButtonAction: Subscription;

  isCropModalOpen = false;

  rotatingDirection: RotationDirection;

  RotationDirection = RotationDirection;

  isSmallScreen: boolean;

  async openCropReceiptModal(): Promise<void> {
    const cropReceiptModal = await this.modalController.create({
      component: CropReceiptComponent,
      componentProps: {
        base64ImageWithSource: this.base64ImagesWithSource[this.activeIndex],
      },
    });
    await cropReceiptModal.present();
    this.isCropModalOpen = true;
    const { data }: { data?: { base64ImageWithSource: Image } } = await cropReceiptModal.onWillDismiss();
    this.isCropModalOpen = false;

    if (data && data.base64ImageWithSource) {
      this.base64ImagesWithSource[this.activeIndex] = data.base64ImageWithSource;
      await this.swiper?.swiperRef.update();
      this.trackingService.cropReceipt();
    }
  }

  /**
   * Rotates the current image by 90 degrees in the specified direction.
   *
   * The rotation happens in two steps:
   * 1. Visual rotation: Applies CSS transform immediately for smooth animation.
   * 2. Data rotation: After a 400ms animation, the actual image data is rotated using canvas.
   *
   * @param direction - Direction to rotate the image (LEFT = -90°, RIGHT = 90°).
   */

  rotateImage(direction: RotationDirection): void {
    if (this.rotatingDirection) {
      return;
    }
    this.rotatingDirection = direction;

    this.trackingService.eventTrack('Rotated receipt', {
      Index: this.activeIndex,
      Direction: direction,
      Source: this.router.url,
    });

    setTimeout(() => {
      const currentImage = this.base64ImagesWithSource[this.activeIndex];
      if (!currentImage?.base64Image) {
        this.rotatingDirection = null;
        return;
      }
      this.rotateImageData(currentImage, direction);
    }, 400);
  }

  checkScreenSize = (): void => {
    this.isSmallScreen = window.innerWidth < 400;
  };

  ngOnInit(): void {
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
    this.activeIndex = 0;
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkScreenSize);
  }

  ionViewWillEnter(): void {
    this.hardwareBackButtonAction = this.platform.backButton.subscribeWithPriority(
      BackButtonActionPriority.HIGH,
      () => {
        this.closeModal();
      },
    );
    this.swiper?.swiperRef.update();
  }

  ionViewWillLeave(): void {
    this.hardwareBackButtonAction.unsubscribe();
  }

  saveReceipt(): void {
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
    });
  }

  saveReceiptForLater(): void {
    this.trackingService.saveReceiptForLater();
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
      isSaveReceiptForLater: true,
    });
  }

  async closeModal(): Promise<void> {
    let message: string;
    if (this.base64ImagesWithSource.length > 1) {
      message = this.translocoService.translate('receiptPreview.discardMultipleReceiptsMessage', {
        count: this.base64ImagesWithSource.length,
      });
    } else {
      message = this.translocoService.translate('receiptPreview.discardSingleReceiptMessage');
    }
    const title = this.translocoService.translate('receiptPreview.discardReceiptTitle');
    const primaryCta = {
      text: this.translocoService.translate('receiptPreview.discard'),
      action: 'discard',
      type: 'alert',
    };
    const secondaryCta = {
      text: this.translocoService.translate('receiptPreview.cancel'),
      action: 'cancel',
    };
    const closePopOver = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta,
        secondaryCta,
      },
      cssClass: 'pop-up-in-center',
    });
    await closePopOver.present();
    const { data }: { data?: { action?: string } } = await closePopOver.onWillDismiss();
    if (data && data.action) {
      if (data.action === 'discard') {
        this.trackingService.discardReceipt();
        this.retake();
      }
    }
  }

  async addMore(): Promise<void> {
    const addMoreDialog = this.matBottomSheet.open(AddMorePopupComponent, {
      data: {},
      panelClass: ['mat-bottom-sheet-2'],
    });
    const data = (await addMoreDialog.afterDismissed().toPromise()) as { mode?: string };
    if (data) {
      if (data.mode === 'camera') {
        this.captureReceipts();
      } else {
        this.galleryUpload();
      }
    }
  }

  galleryUpload(): void {
    this.imagePicker.hasReadPermission().then((permission: boolean) => {
      if (permission) {
        const options = {
          maximumImagesCount: 10,
          outputType: 1,
          quality: 70,
        };
        from(this.imagePicker.getPictures(options)).subscribe((imageBase64Strings: string[]) => {
          if (Array.isArray(imageBase64Strings) && imageBase64Strings.length > 0) {
            imageBase64Strings.forEach((base64String: string) => {
              const base64PictureData = 'data:image/jpeg;base64,' + base64String;
              this.base64ImagesWithSource.push({
                source: 'MOBILE_DASHCAM_GALLERY',
                base64Image: base64PictureData,
              });
            });
          }
        });
      } else {
        this.imagePicker.requestReadPermission();
        this.galleryUpload();
      }
    });
  }

  captureReceipts(): void {
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
      continueCaptureReceipt: true,
    });
  }

  async deleteReceipt(): Promise<void> {
    const activeIndex = await this.swiper?.swiperRef.activeIndex;
    const title = this.translocoService.translate('receiptPreview.removeReceiptTitle');
    const message = this.translocoService.translate('receiptPreview.removeReceiptMessage');
    const deletePopOver = await this.popoverController.create({
      component: PopupAlertComponent,
      componentProps: {
        title,
        message,
        primaryCta: {
          text: this.translocoService.translate('receiptPreview.remove'),
          action: 'remove',
          type: 'alert',
        },
        secondaryCta: {
          text: this.translocoService.translate('receiptPreview.cancel'),
          action: 'cancel',
        },
      },
      cssClass: 'pop-up-in-center',
    });
    await deletePopOver.present();
    const { data }: { data?: { action?: string } } = await deletePopOver.onWillDismiss();
    if (data && data.action) {
      if (data.action === 'remove') {
        this.base64ImagesWithSource.splice(activeIndex ?? 0, 1);
        if (this.base64ImagesWithSource.length === 0) {
          this.retake();
        } else {
          await this.swiper?.swiperRef.update();
          this.activeIndex = (await this.swiper?.swiperRef.activeIndex) ?? 0;
        }
      }
    }
  }

  retake(): void {
    this.base64ImagesWithSource = [];
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
    });
  }

  async goToNextSlide(): Promise<void> {
    await this.swiper?.swiperRef.slideNext();
    await this.swiper?.swiperRef.update();
  }

  async goToPrevSlide(): Promise<void> {
    await this.swiper?.swiperRef.slidePrev();
    await this.swiper?.swiperRef.update();
  }

  async ionSlideDidChange(): Promise<void> {
    this.activeIndex = (await this.swiper?.swiperRef.activeIndex) ?? 0;
  }

  private rotateImageData(currentImage: Image, direction: RotationDirection): void {
    const imageToBeRotated = new window.Image();
    imageToBeRotated.src = currentImage.base64Image;
    imageToBeRotated.onload = (): void => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.rotatingDirection = null;
        return;
      }
      canvas.width = imageToBeRotated.height;
      canvas.height = imageToBeRotated.width;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(((direction === RotationDirection.LEFT ? -90 : 90) * Math.PI) / 180);
      ctx.drawImage(imageToBeRotated, -imageToBeRotated.width / 2, -imageToBeRotated.height / 2);
      this.base64ImagesWithSource[this.activeIndex] = {
        ...currentImage,
        base64Image: canvas.toDataURL('image/jpeg', 0.9),
      };
      this.swiper?.swiperRef.update();
      this.rotatingDirection = null;
    };
  }
}
