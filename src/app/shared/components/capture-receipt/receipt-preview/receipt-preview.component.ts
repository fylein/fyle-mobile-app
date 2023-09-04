import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { filter, from, Subscription } from 'rxjs';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { AddMorePopupComponent } from '../add-more-popup/add-more-popup.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { CropReceiptComponent } from '../crop-receipt/crop-receipt.component';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination } from 'swiper';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { NgxOpenCVService, OpenCVState } from 'ngx-opencv';
import { C } from '@angular/cdk/keycodes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const cv: any;

function distance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

class jscanify {
  constructor() {}

  /**
   * Finds the contour of the paper within the image
   * @param {*} img image to process (cv.Mat)
   * @returns the biggest contour inside the image
   */
  findPaperContour(img) {
    const imgGray = new cv.Mat();
    cv.cvtColor(img, imgGray, cv.COLOR_RGBA2GRAY);

    const imgBlur = new cv.Mat();
    cv.GaussianBlur(imgGray, imgBlur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

    const imgThresh = new cv.Mat();
    cv.threshold(imgBlur, imgThresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    cv.findContours(imgThresh, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let maxArea = 0;
    let maxContourIndex = -1;
    for (let i = 0; i < contours.size(); ++i) {
      let contourArea = cv.contourArea(contours.get(i));
      if (contourArea > maxArea) {
        maxArea = contourArea;
        maxContourIndex = i;
      }
    }

    const maxContour = contours.get(maxContourIndex);

    imgGray.delete();
    imgBlur.delete();
    imgThresh.delete();
    contours.delete();
    hierarchy.delete();
    return maxContour;
  }

  /**
   * Highlights the paper detected inside the image.
   * @param {*} image image to process
   * @param {*} options options for highlighting. Accepts `color` and `thickness` parameter
   * @returns `HTMLCanvasElement` with original image and paper highlighted
   */
  highlightPaper(
    image,
    options = {
      thickness: 10,
      color: 'orange',
    },
  ) {
    console.log(image);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = cv.imread(image);

    const maxContour = this.findPaperContour(img);
    cv.imshow(canvas, img);
    if (maxContour) {
      const { topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner } = this.getCornerPoints(maxContour);
      console.log(topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner);
      if (topLeftCorner && topRightCorner && bottomLeftCorner && bottomRightCorner) {
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.thickness;
        console.log(ctx);
        console.log(topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner);
        ctx.beginPath();
        ctx.moveTo(topLeftCorner.x, topLeftCorner.y);
        ctx.lineTo(topRightCorner.x, topRightCorner.y);
        ctx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
        ctx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
        ctx.lineTo(topLeftCorner.x, topLeftCorner.y);

        ctx.stroke();
        console.log(ctx);
      }
    }

    img.delete();
    return canvas;
  }

  /**
   * Extracts and undistorts the image detected within the frame.
   * @param {*} image image to process
   * @param {*} resultWidth desired result paper width
   * @param {*} resultHeight desired result paper height
   * @returns `HTMLCanvasElement` containing undistorted image
   */
  extractPaper(image, resultWidth, resultHeight, buffer) {
    const canvas = document.createElement('canvas');

    const img = cv.imread(image);

    const maxContour = this.findPaperContour(img);

    const { topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner } = this.getCornerPoints(maxContour);
    let warpedDst = new cv.Mat();

    let dsize = new cv.Size(resultWidth, resultHeight);
    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      topLeftCorner.x,
      topLeftCorner.y,
      topRightCorner.x,
      topRightCorner.y,
      bottomLeftCorner.x,
      bottomLeftCorner.y,
      bottomRightCorner.x,
      bottomRightCorner.y,
    ]);

    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, resultWidth, 0, 0, resultHeight, resultWidth, resultHeight]);

    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(img, warpedDst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

    cv.imshow(canvas, warpedDst);

    img.delete();
    warpedDst.delete();
    return canvas;
  }

  /**
   * Calculates the corner points of a contour.
   * @param {*} contour contour from {@link findPaperContour}
   * @returns object with properties `topLeftCorner`, `topRightCorner`, `bottomLeftCorner`, `bottomRightCorner`, each with `x` and `y` property
   */
  getCornerPoints(contour) {
    let rect = cv.minAreaRect(contour);
    const center = rect.center;

    let topLeftCorner;
    let topLeftCornerDist = 0;

    let topRightCorner;
    let topRightCornerDist = 0;

    let bottomLeftCorner;
    let bottomLeftCornerDist = 0;

    let bottomRightCorner;
    let bottomRightCornerDist = 0;

    for (let i = 0; i < contour.data32S.length; i += 2) {
      const point = { x: contour.data32S[i], y: contour.data32S[i + 1] };
      const dist = distance(point, center);
      if (point.x < center.x && point.y < center.y) {
        // top left
        if (dist > topLeftCornerDist) {
          topLeftCorner = point;
          topLeftCornerDist = dist;
        }
      } else if (point.x > center.x && point.y < center.y) {
        // top right
        if (dist > topRightCornerDist) {
          topRightCorner = point;
          topRightCornerDist = dist;
        }
      } else if (point.x < center.x && point.y > center.y) {
        // bottom left
        if (dist > bottomLeftCornerDist) {
          bottomLeftCorner = point;
          bottomLeftCornerDist = dist;
        }
      } else if (point.x > center.x && point.y > center.y) {
        // bottom right
        if (dist > bottomRightCornerDist) {
          bottomRightCorner = point;
          bottomRightCornerDist = dist;
        }
      }
    }

    return {
      topLeftCorner,
      topRightCorner,
      bottomLeftCorner,
      bottomRightCorner,
    };
  }
}

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

  @ViewChild('imgElement') currentImage: ElementRef<HTMLImageElement>;

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
    private imagePicker: ImagePicker,
    private trackingService: TrackingService,
    private ngxOpenCv: NgxOpenCVService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  onImageLoad(event) {
    console.log(event);
    console.log();
    this.ngxOpenCv.cvState.pipe(filter((state) => state.ready)).subscribe(() => {
      const scan = new jscanify();
      // const highlightedImage = scan.extractPaper(this.currentImage.nativeElement, this.currentImage.nativeElement.width, this.currentImage.nativeElement.height, undefined);
      const highlightedImage = scan.highlightPaper(this.currentImage.nativeElement);
      this.currentImage.nativeElement.style.display = 'none';
      this.currentImage.nativeElement.parentElement.appendChild(highlightedImage);
    });
  }

  async openCropReceiptModal() {
    // const cropReceiptModal = await this.modalController.create({
    //   component: CropReceiptComponent,
    //   componentProps: {
    //     base64ImageWithSource: this.base64ImagesWithSource[this.activeIndex],
    //   },
    // });
    // await cropReceiptModal.present();
    // this.isCropModalOpen = true;
    // const { data } = await cropReceiptModal.onWillDismiss();
    // this.isCropModalOpen = false;

    // if (data && data.base64ImageWithSource) {
    //
    //   await this.swiper.swiperRef.update();
    //   this.trackingService.cropReceipt();
    // }
    try {
      const scan = new jscanify();
      // const highlightedImage = scan.extractPaper(this.currentImage.nativeElement, this.currentImage.nativeElement.width, this.currentImage.nativeElement.height, undefined);
      const extractedImage = scan.extractPaper(this.currentImage.nativeElement, 467, 622, undefined);
      // const childNodes = this.currentImage.nativeElement.parentElement.childNodes;
      for (let index = 0; index < this.currentImage.nativeElement.parentNode.childElementCount; index++) {
        const childNode = this.currentImage.nativeElement.parentNode.children.item(index) as HTMLElement;
        // console.log(childNode);
        childNode.style.display = 'none';
      }
      this.currentImage.nativeElement.parentElement.appendChild(extractedImage);
      this.base64ImagesWithSource[this.activeIndex] = {
        ...this.base64ImagesWithSource[this.activeIndex],
        base64Image: extractedImage.toDataURL('image/jpeg').split(';base64,')[1],
      };
    } catch (error) {
      console.log(error);
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
