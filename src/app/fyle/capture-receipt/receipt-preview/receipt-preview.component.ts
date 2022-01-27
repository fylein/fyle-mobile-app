import { Component, ElementRef, Input, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ModalController, Platform, PopoverController, IonSlides, LoadingController } from '@ionic/angular';
import { from } from 'rxjs';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { AddMorePopupComponent } from '../add-more-popup/add-more-popup.component';
import { TrackingService } from '../../../core/services/tracking.service';
import { CropReceiptComponent } from 'src/app/fyle/capture-receipt/crop-receipt/crop-receipt.component';
import { LoaderService } from 'src/app/core/services/loader.service';

type Image = Partial<{
  source: string;
  base64Image: string;
  rotate: number;
}>;
@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.scss'],
})
export class ReceiptPreviewComponent implements OnInit {
  @ViewChild('slides') imageSlides: IonSlides;

  @ViewChildren('imageRef') imageRefs: QueryList<ElementRef>;

  @Input() base64ImagesWithSource: Image[];

  @Input() mode: string;

  sliderOptions: { zoom: { maxRatio: number } };

  activeIndex: number;

  constructor(
    private platform: Platform,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private matBottomSheet: MatBottomSheet,
    private imagePicker: ImagePicker,
    private trackingService: TrackingService,
    private loaderService: LoaderService,
    private loadingController: LoadingController
  ) {
    this.registerBackButtonAction();
  }

  registerBackButtonAction() {
    this.platform.backButton.subscribe(async () => {
      this.retake();
    });
  }

  async openCropReceiptModal() {
    const cropReceiptModal = await this.modalController.create({
      component: CropReceiptComponent,
      componentProps: {
        base64ImageWithSource: this.base64ImagesWithSource[this.activeIndex],
      },
    });
    await cropReceiptModal.present();
    const { data } = await cropReceiptModal.onWillDismiss();

    if (data && data.base64ImageWithSource) {
      this.base64ImagesWithSource[this.activeIndex] = {
        ...data.base64ImageWithSource,
        rotate: 0,
      };
      await this.imageSlides.update();
      this.trackingService.cropReceipt({ action: 'crop' });
    }
  }

  ngOnInit() {
    this.sliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
    this.activeIndex = 0;
    this.base64ImagesWithSource.map((img) => (img.rotate = img.rotate || 0));
  }

  ionViewWillEnter() {
    this.imageRefs.map((image, index) =>
      image.nativeElement.classList.add(
        'receipt-preview__image-container__image--rotate-' + this.base64ImagesWithSource[index].rotate.toString()
      )
    );
    this.imageSlides.update();
  }

  async saveReceipt() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();
    const count = this.base64ImagesWithSource.length;

    const rotatedBase64Images = this.base64ImagesWithSource.map((el, i) => {
      console.log('Rotated', i + 1, 'of', count);
      return el.rotate
        ? {
            source: el.source,
            base64Image: this.updateImageBase64(el),
          }
        : el;
    });

    // this.base64ImagesWithSource.forEach((base64ImageWithSource, i) => {
    //   if (base64ImageWithSource.rotate) {
    //     base64ImageWithSource.base64Image = this.updateImageBase64(base64ImageWithSource);
    //   }
    //   console.log('Rotated', i+1, 'of', count);
    // });
    this.loadingController.dismiss();
    console.log('Loader dismiss');
    this.modalController.dismiss({
      base64ImagesWithSource: rotatedBase64Images,
    });
    console.log('Modal dismiss');
  }

  async closeModal() {
    let message;
    if (this.base64ImagesWithSource.length > 1) {
      message = `Are you sure you want to discard the ${this.base64ImagesWithSource.length} receipts you just captured?`;
    } else {
      message = 'Not a good picture? No worries. Discard and click again.';
    }
    const closePopOver = await this.popoverController.create({
      component: PopupAlertComponentComponent,
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
          }
        });
      } else {
        this.imagePicker.requestReadPermission();
        this.galleryUpload();
      }
    });
  }

  captureReceipts() {
    this.modalController.dismiss({
      base64ImagesWithSource: this.base64ImagesWithSource,
      continueCaptureReceipt: true,
    });
  }

  async deleteReceipt() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    const deletePopOver = await this.popoverController.create({
      component: PopupAlertComponentComponent,
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
          await this.imageSlides.update();
          this.activeIndex = await this.imageSlides.getActiveIndex();
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
    await this.imageSlides.slideNext();
    await this.imageSlides.update();
  }

  async goToPrevSlide() {
    await this.imageSlides.slidePrev();
    await this.imageSlides.update();
  }

  async ionSlideDidChange() {
    const activeIndex = await this.imageSlides.getActiveIndex();
    this.activeIndex = activeIndex;
  }

  rotate() {
    // this.base64ImagesWithSource[this.activeIndex].rotate += 90;
    // const angle = this.base64ImagesWithSource[this.activeIndex].rotate;
    // const imageRef = this.imageRefs.get(this.activeIndex).nativeElement;
    // imageRef.style.transform = `rotate(${angle}deg)`;

    const prevAngle = this.base64ImagesWithSource[this.activeIndex].rotate;
    const angle = (prevAngle + 90) % 360;
    this.base64ImagesWithSource[this.activeIndex].rotate = angle;
    const imageRef = this.imageRefs.get(this.activeIndex).nativeElement;
    imageRef.classList.add('receipt-preview__image-container__image--rotate-' + angle.toString());
    imageRef.classList.remove('receipt-preview__image-container__image--rotate-' + prevAngle.toString());
  }

  updateImageBase64(base64ImageWithSource: Image) {
    const img = new Image();
    img.src = base64ImageWithSource.base64Image;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (base64ImageWithSource.rotate % 180) {
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((base64ImageWithSource.rotate / 180) * Math.PI);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    return canvas.toDataURL('image/jpeg');
  }
}
