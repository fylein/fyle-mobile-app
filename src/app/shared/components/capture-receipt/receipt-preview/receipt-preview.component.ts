import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ImagePicker } from '@jonz94/capacitor-image-picker';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { from, Subscription } from 'rxjs';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { AddMorePopupComponent } from '../add-more-popup/add-more-popup.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { CropReceiptComponent } from '../crop-receipt/crop-receipt.component';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';

// install Swiper modules
SwiperCore.use([Pagination]);

type Image = Partial<{
  source: string;
  base64Image: string;
}>;
@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.scss'],
})
export class ReceiptPreviewComponent implements OnInit {
  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  @Input() base64ImagesWithSource: Image[];

  @Input() mode: string;

  sliderOptions: { zoom: { maxRatio: number } };

  activeIndex: number;

  hardwareBackButtonAction: Subscription;

  isCropModalOpen = false;

  constructor(
    private platform: Platform,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private matBottomSheet: MatBottomSheet,
    private trackingService: TrackingService,
  ) {}

  async openCropReceiptModal() {
    const cropReceiptModal = await this.modalController.create({
      component: CropReceiptComponent,
      componentProps: {
        base64ImageWithSource: this.base64ImagesWithSource[this.activeIndex],
      },
    });
    await cropReceiptModal.present();
    this.isCropModalOpen = true;
    const { data } = await cropReceiptModal.onWillDismiss();
    this.isCropModalOpen = false;

    if (data && data.base64ImageWithSource) {
      this.base64ImagesWithSource[this.activeIndex] = data.base64ImageWithSource;
      await this.swiper.swiperRef.update();
      this.trackingService.cropReceipt();
    }
  }

  ngOnInit() {
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
    this.activeIndex = 0;
  }

  ionViewWillEnter() {
    this.hardwareBackButtonAction = this.platform.backButton.subscribeWithPriority(
      BackButtonActionPriority.HIGH,
      () => {
        this.closeModal();
      },
    );
    this.swiper.swiperRef.update();
  }

  ionViewWillLeave() {
    this.hardwareBackButtonAction.unsubscribe();
  }

  saveReceipt() {
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
    });
  }

  async closeModal() {
    let message;
    if (this.base64ImagesWithSource.length > 1) {
      message = `Are you sure you want to discard the ${this.base64ImagesWithSource.length} receipts you just captured?`;
    } else {
      message = 'Not a good picture? No worries. Discard and click again.';
    }
    const closePopOver = await this.popoverController.create({
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

    await closePopOver.present();

    const { data } = await closePopOver.onWillDismiss();

    if (data && data.action) {
      if (data.action === 'discard') {
        this.retake();
      }
    }
  }

  async addMore() {
    const addMoreDialog = this.matBottomSheet.open(AddMorePopupComponent, {
      data: {},
      panelClass: ['mat-bottom-sheet-2'],
    });

    const data = await addMoreDialog.afterDismissed().toPromise();
    if (data) {
      if (data.mode === 'camera') {
        this.captureReceipts();
      } else {
        this.galleryUpload();
      }
    }
  }

  galleryUpload() {
    from(
      ImagePicker.present({
        limit: 10,
        surpassLimitMessage: 'You cannot select more than %d images.',
        titleText: 'Pick a image',
        albumsTitleText: 'Chose an album',
        libraryTitleText: 'Click here to change library',
        cancelText: 'Go Back',
        doneText: 'OK',
      }),
    ).subscribe(async ({ images }) => {
      if (images.length > 0) {
        for (const image of images) {
          // Fetch the image using its webPath (the URL of the image).
          const response = await fetch(image.webPath);
          // Convert the fetched response to a Blob (binary large object).
          const blob = await response.blob();
          // Convert the Blob to a base64-encoded string using the blobToBase64 helper function.
          const receiptBase64Data = await this.blobToBase64(blob);
          this.base64ImagesWithSource.push({
            source: 'MOBILE_DASHCAM_GALLERY',
            base64Image: receiptBase64Data,
          });
        }
      }
    });
  }

  // Helper function to convert a Blob to a base64-encoded string.
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create a new FileReader object.
      const reader = new FileReader();
      // Define an event handler for when the file reading process ends.
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      // Define an event handler for potential errors during the file reading process.
      reader.onerror = reject;
      // Initiate the reading of the Blob as a data URL.
      reader.readAsDataURL(blob);
    });
  }

  captureReceipts() {
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
      continueCaptureReceipt: true,
    });
  }

  async deleteReceipt() {
    const activeIndex = await this.swiper.swiperRef.activeIndex;
    const deletePopOver = await this.popoverController.create({
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

    await deletePopOver.present();

    const { data } = await deletePopOver.onWillDismiss();

    if (data && data.action) {
      if (data.action === 'remove') {
        this.base64ImagesWithSource.splice(activeIndex, 1);
        if (this.base64ImagesWithSource.length === 0) {
          this.retake();
        } else {
          await this.swiper.swiperRef.update();
          this.activeIndex = await this.swiper.swiperRef.activeIndex;
        }
      }
    }
  }

  retake() {
    this.base64ImagesWithSource = [];
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
    });
  }

  async goToNextSlide() {
    await this.swiper.swiperRef.slideNext();
    await this.swiper.swiperRef.update();
  }

  async goToPrevSlide() {
    await this.swiper.swiperRef.slidePrev();
    await this.swiper.swiperRef.update();
  }

  async ionSlideDidChange() {
    const activeIndex = await this.swiper.swiperRef.activeIndex;
    this.activeIndex = activeIndex;
  }
}
